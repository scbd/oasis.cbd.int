const request = require('superagent');
var path = require('path');
let _ = require('lodash');
let fs = require('fs').promises;
var crypto = require('crypto');
const cheerio  = require('cheerio');

const unzip = require('unzipper');

const basePath       = __dirname + '/db-translation-files';

let importLogs = {};
let articles = {};

var headers = { 
    'Accept': 'application/json', 'Content-Type': 'application/json;Charset=utf-8',
    'Authorization': 'Ticket ' 
};

const apiUrl = process.env.API_URL;

// /translation-files
async function importArticlesForTranslation(){

    let now = new Date().getTime();
    
     fs.mkdirSync(`${__dirname}/translation-files/${now}`);
    
     var ag = [];
     ag.push({"$match": {'adminTags.title.en' : {$in : ['ABSCH-About']}}});
    let nr6Request = await request
                        .get(apiUrl+'/api/v2017/articles')
                        .query({"ag" : JSON.stringify(ag)})
                        .set({accept:'application/json'});

    documents =  nr6Request.body;
    console.log(`Total records for translation ${documents.length}`)
    for (let i = 0; i < documents.length; i++) {
        let document = documents[i];
        
        let article     = {};
        let titleHash   = crypto.createHash('md5').update(document.title.en).digest("hex");
        let contentHash = crypto.createHash('md5').update(document.content.en).digest("hex");
        
        article[`title_${titleHash}`]   = document.title.en
        article[`content_${contentHash}`] = document.content.en 
         fs.writeFileSync(`${__dirname}/translation-files/${now}/${document._id}.json`, 
            JSON.stringify(article))

    }
    console.log('Finish Import')
}
// importArticlesForTranslation();

async function ImportTranslatedArticles(path, lang){
        let basepath = path + '/'+ lang;
        await readFolders(basepath, lang);

        let articlesA = _.map(articles, (a)=>a);
        // console.log(articlesA)
       for(const article of articlesA){           
            try{
                let articleRequest =  await request.get(apiUrl+'/api/v2017/articles/' + article._id)                
                                            .set(headers)
                                            .send();

                let article     = articleRequest.body || {};
                let titleHash   = crypto.createHash('md5').update(document.title.en).digest("hex");
                let contentHash = crypto.createHash('md5').update(document.content.en).digest("hex");
                
                article[`title_${titleHash}`]   = document.title.en
                article[`content_${contentHash}`] = document.content.en 
                console.log(articleRequest.body);
            }
            catch(err){
                console.log(err)
            }
        }
}

async function updateRecords(){

    for (const element in articles) {
        if (Object.hasOwnProperty.call(articles, element)) {
            const article = articles[element];
            try{
                let articleUpdate = await request.put(apiUrl+'/api/v2017/articles/'+element)
                                    .set(headers).send(article);
            }
            catch(e){
                importLogs[element].error = (e.response||{}).body||e;
                delete articles[element];
            }
        }
    }
}

async function readFolders(basepath, lang){
    let dirs = await fs.readdir(basepath)
    for (let index = 0; index < dirs.length; index++) {
        var folder = dirs[index]            
        await extractFiles(`${basepath}/${folder}`, lang)
    }

}

async function extractFiles(filePath, lang){
    
    const stats=  await fs.lstat(filePath);
    const ext = path.extname(filePath);
    // console.log(`File: ${name}, Is file: ${stats.isFile()}, Is directory: ${stats.isDirectory()}`);

    if(stats.isFile() && ext == '.json'){
        await importFile(filePath, lang)
    }
    else if(stats.isDirectory()){
        await readFolders(filePath, lang)
    }
    
}

async function importFile(basepath, lang){
    
    let fileName = path.basename(basepath);
    let recordId = fileName.match(/.*#(.*)\.json/)[1]
    let article     = articles[recordId];
    
    importLogs[recordId] = importLogs[recordId] || { fields:[]};

    try{
        if(!article){

            let articleRequest =  await request.get(apiUrl + '/api/v2017/articles/' + recordId)
                                            .set({accept:'application/json'});

            articles[recordId] = article = articleRequest.body;
        }
                                
        let tranlsatedArticle = require(basepath)

        _.each(tranlsatedArticle, (field, key)=>{
            let splits = key.split('_')
            let fieldName = splits[0];
            let hash      = splits[1];
            //check for hash

            importLogs[recordId][`original${fieldName}Hash`]     = crypto.createHash('md5').update(article[fieldName].en).digest("hex")
            importLogs[recordId][`translation${fieldName}Hash`]  = hash;
            importLogs[recordId].fields.push(fieldName)

            if(importLogs[recordId][`original${fieldName}Hash`] != hash){           
                importLogs[recordId].error = `${fieldName} hash not matching for article: ${article[fieldName].en}(${recordId})`;
                throw new Error(importLogs[recordId].error)
            }

            article[fieldName][lang.toLowerCase()] = field

            if(fieldName == 'content'){

                article.summary = article.summary || {};
                if(!article.summary.en){
                    const enSummary = cheerio.load(article.content.en, { decodeEntities:false }).text();
                    if(enSummary.length)
                        article.summary['en'] = enSummary.substr(0, enSummary.length<100 ? enSummary.length : 100);    
                }
                const text = cheerio.load(field, { decodeEntities:false }).text();
                if(text.length)
                    article.summary[lang] = text.substr(0, text.length<100 ? text.length : 100);
            }
        });
    }
    catch(e){
        if(!importLogs[recordId].error)
            importLogs[recordId].error = (e.response||{}).body||e;
            
        delete articles[recordId];
    }

}

async function importTranslation(zipFileName){
    const langRegex = /#(ar|es|fr|ru|zh)/;

    if(!langRegex.test(zipFileName))
        throw new Error('Zip file is missing language name, format should `name#[ar|es|fr|ru|zh].zip`')

    const lang  = zipFileName.match(/#(ar|es|fr|ru|zh)/)[1]

    await createDir(`${basePath}/import`);
    const extractionLocation = await extractZipFile(`${basePath}/import/${zipFileName}`);

    await readFolders(extractionLocation, lang);

    await updateRecords();
    console.log('Finish importing')
    
    const errors= Object.keys(importLogs).filter(e=>importLogs[e].error).map(e=>{return {error:importLogs[e].error, id:e}})
    if(errors.length)
        console.log(`Errors in articles : `, errors);

}

async function extractZipFile(zipFilePath){

    importLogs = {};
    articles   = {};
    const fileBaseName       = path.basename(zipFilePath, path.extname(zipFilePath));
    const extractionLocation = `${basePath}/import/${fileBaseName}`;

    const zipBuffer = await unzip.Open.file(zipFilePath)
                      await zipBuffer.extract({path: extractionLocation, concurrency: 5});

    return extractionLocation;
}

async function createDir(dirname){
    let baseDir;
    try {
        baseDir = await fs.stat(dirname);
    } catch (e) {}
    if (!baseDir || baseDir && !baseDir.isDirectory()) {
        await fs.mkdir(dirname)
    }
}

(async function(){

    try{
        headers.Authorization += ' '
        
        await importTranslation('bch#ar.zip');
        await importTranslation('bch#es.zip');
        await importTranslation('bch#fr.zip');
        await importTranslation('bch#ru.zip');
        await importTranslation('bch#zh.zip');

        console.log('Finish Job')
        
    }
    catch(e){
        console.log(e)
    }
    // let langs = ['AR', 'ES', 'FR', 'RU', 'ZH' ]
    // for (var index = 0; index < langs.length; index++) {
    //     var element = langs[index];
    //     await ImportTranslatedArticles('/Users/blaisefonseca/Projects/pdftest/translation-files/ABS-Articles/HELP DESK',element);
    // }
})()


