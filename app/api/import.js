import request from 'superagent';
import path    from 'path';
import _       from 'lodash';
import fs      from 'fs/promises';
import crypto  from 'crypto';
import cheerio from 'cheerio';
import unzip   from 'unzipper';
import { extractZipFile, verifyFileExists } from './utils.js';
import { randomUUID } from 'crypto';
import * as url from 'url';
const __dirname = url.fileURLToPath(new url.URL('.', import.meta.url));

const basePath            = __dirname + 'db-translation-files';
export const importWorkingFolder = `${basePath}/import`;

const apiHost = process.env.API_HOST;
export const recordApiEndpoint = {
    article : 'api/v2017/articles'
}

function getRecordTypeEndpoint(recordType){

    if(!recordApiEndpoint[recordType])
        throw new Error('Invalid record type');

    return recordApiEndpoint[recordType];
}
function getRecordIdFromFilePath(filePath){

    let fileName = path.basename(filePath);
    let recordId = fileName.match(/.*#(.*)\.json/)[1];

    return recordId;
}

export async function updateRecord(record, recordType, user){

    let articleUpdate = await request.put(`${apiHost}/${getRecordTypeEndpoint(recordType)}/${record._id}`)
                        .set({ 
                            'Accept': 'application/json', 'Content-Type': 'application/json;Charset=utf-8',
                            'Authorization': 'Ticket ' + user?.token
                        })
                        .send(record);

    return articleUpdate;
}

export async function importFromFolder(basePath, lang, recordType, importLogs, user){
    let dirs = await fs.readdir(basePath)
    for (let index = 0; index < dirs.length; index++) {

        const folder   = dirs[index]            
        const filePath = `${basePath}/${folder}`;

        const stats=  await fs.lstat(filePath);
        const ext = path.extname(filePath);

        if(stats.isFile() && ext == '.json'){
            const recordId = getRecordIdFromFilePath(filePath);
            try{
                await importFromFile(filePath, lang, importLogs, recordType, user)
            }
            catch(e){
                if(!importLogs[recordId].error)
                    importLogs[recordId].error = (e.response||{}).body||e;                
            }
        }
        else if(stats.isDirectory()){
            await importFromFolder(filePath, lang, user)
        }
    }

}

export async function importFromFile(basePath, lang, importLogs, recordType, user){
    
    let recordId = getRecordIdFromFilePath(basePath);
    let record;
    
    importLogs[recordId] = importLogs[recordId] || { fields:[]};

    if(!record){

        let articleRequest =  await request.get(`${apiHost}/${getRecordTypeEndpoint(recordType)}/${recordId}`)
                                        .set({accept:'application/json'});
        if(!articleRequest?.body)
            throw new Error('record has not body');

            record = articleRequest.body;
    }
    
    //read the json file from disk
    const translatedFile = await fs.readFile(basePath, {encoding:'utf-8'});
    const translatedRecord = JSON.parse(translatedFile);

    await importFromObject(translatedRecord, importLogs, recordId, record, lang, recordType, user);
    
}

export async function importFromObject(translatedRecord, importLogs, recordId, record, lang, recordType, user) {

    _.each(translatedRecord, (field, key) => {
        let splits = key.split('_');
        let fieldName = splits[0];
        let hash = splits[1];
        //check for hash
        importLogs[recordId][`original${fieldName}Hash`] = crypto.createHash('md5').update(record[fieldName].en).digest("hex");
        importLogs[recordId][`translation${fieldName}Hash`] = hash;
        importLogs[recordId].fields.push(fieldName);

        if (importLogs[recordId][`original${fieldName}Hash`] != hash) {
            importLogs[recordId].error = `${fieldName} hash not matching for record: ${record[fieldName].en}(${recordId})`;
            throw new Error(importLogs[recordId].error);
        }

        record[fieldName][lang.toLowerCase()] = field;

        if (recordType == 'article' && fieldName == 'content') {

            record.summary = record.summary || {};
            if (!record.summary.en) {
                const enSummary = cheerio.load(record.content.en, { decodeEntities: false }).text();
                if (enSummary.length)
                    record.summary['en'] = enSummary.substr(0, enSummary.length < 100 ? enSummary.length : 100);
            }
            const text = cheerio.load(field, { decodeEntities: false }).text();
            if (text.length)
                record.summary[lang] = text.substr(0, text.length < 100 ? text.length : 100);
        }
    });

    await updateRecord(translatedRecord, recordType, user);

}

//expected user : { Token : '' }
export async function importTranslationFromZip(zipFileName, recordType, user, taskId){

          taskId            = taskId || randomUUID();
    let   importLogs        = {};
    const taskWorkingFolder = `${importWorkingFolder}/${taskId}`;
    const langRegex         = /#(ar|es|fr|ru|zh)/;

    if(!langRegex.test(zipFileName))
        throw new Error('Zip file is missing language name, format should `name#[ar|es|fr|ru|zh].zip`')

    const lang  = zipFileName.match(langRegex)[1]

    await createDir(taskWorkingFolder);
    
    const extractionLocation = await extractZipFile(zipFileName, taskWorkingFolder);

    await importFromFolder(extractionLocation, lang, recordType, importLogs, user);
    await deleteFromDisk(taskWorkingFolder);

}


async function createDir(dirname){
    let baseDir;
    try {
        baseDir = await fs.stat(dirname);
    } catch (e) {}
    if (!baseDir || baseDir && !baseDir.isDirectory()) {
        await fs.mkdir(dirname, { recursive:true })
    }
}
async function deleteFromDisk(path){
    let pathStat;
    try {
        pathStat = await fs.stat(path);
        if (pathStat){
            if(pathStat.isDirectory()) {
                await fs.rmdir(path, { recursive:true })
            }
            else if(pathStat.isFile())
                await fs.rm(path)
        }        
    }
    catch (e) {

    }
    
}
await importTranslationFromZip('/Users/blaisefonseca/Projects/oasis.cbd.int/app/api/db-translation-files/BCH\#fr.zip', 'article');

    

