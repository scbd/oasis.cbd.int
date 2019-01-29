let _ = require('lodash');
let fs = require('fs');
let EasyZip = require('easy-zip').EasyZip;
const util = require('util');
const path = require('path');
let request = require('superagent');
const stat = util.promisify(fs.stat);
const mkdir = util.promisify(fs.mkdir);
const databaseTables = require('../views/translation/database-tables.json')
let basePath = __dirname + '/db-translation-files/';
var crypto = require('crypto');

let apiBaseUrl = process.env.API_URL;

module.exports = function gitQuery(options){

    return async function get(req, res, next){
        try{

            let q = req.query;
            
            let databaseTable = _.find(databaseTables, {name:req.params.table})
            let files = await getUpdatesFiles(databaseTable, q);

            if(files && q.zip){
                let compressedFiles = await zipFile(req.params.table, files);
                let zip4 = new EasyZip();
                return zip4.batchAdd(compressedFiles, function(){
                    return zip4.writeToResponse(res,`${req.params.table}`);
                });
            }
            res.status(200).send(files);
        }
        catch(err) {
            res.status(500).send('Unknown error occurred');
        };
    }


    async function getUpdatesFiles(databaseTable, q) {

       
            
            let now = new Date().getTime();
            if(!fs.existsSync(`${basePath}`))
                fs.mkdirSync(`${basePath}`);
            fs.mkdirSync(`${basePath}${now}`);
            
            var ag = [];
            ag.push({"$match": {'_id' : {$in : q.ids.map(e=> { return { "$oid" : e }})}}});
            let nr6Request = await request
                                .get(`${apiBaseUrl}/${databaseTable.api}`)
                                .query({"ag" : JSON.stringify(ag)})
                                .set({accept:'application/json'});

            documents =  nr6Request.body;
            let translationFiles = [];
           
            for (let i = 0; i < documents.length; i++) {
                let document = documents[i];
                
                let article     = {};
                let titleHash   = crypto.createHash('md5').update(document.title.en).digest("hex");
                let contentHash = crypto.createHash('md5').update(document.content.en).digest("hex");
                
                article[`title_${titleHash}`]   = document.title.en
                article[`content_${contentHash}`] = document.content.en 
                let filePath = `${now}/${document.title.en.replace(/\s/g, '_')}#${document._id}.json`
                
                fs.writeFileSync(`${basePath}${filePath}`,  JSON.stringify(article));
                translationFiles.push({name : path.basename(filePath), path: filePath});

            }
            return translationFiles;
        


    }

    async function zipFile(table, translationFiles){

        let files = []
        for (let i = 0; i < translationFiles.length; i++) {
            let file = translationFiles[i];
            let fileExists
            let filePath = file.path
            try {
                fileExists = await stat(basePath + filePath);
            } catch (e) {}
            if (fileExists && fileExists.isFile()) {
                files.push({source:basePath + filePath, target : table+'/'+filePath});
            } else {
                console.log(file);
            }
        }
        return files;
    }
}



