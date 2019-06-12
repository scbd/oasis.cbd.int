const _              = require('lodash');
const fs             = require('fs');
const EasyZip        = require('easy-zip').EasyZip;
const util           = require('util');
const path           = require('path');
const request        = require('superagent');
const databaseTables = require('../views/translation/database-tables.json')
const winston        = require('winston');
const authenticate   = require('./authentication.js');
const crypto         = require('crypto');
const express        = require('express');
const config         = require('./config.js');
const signedUrl      = require('./signed-url.js');
const stat           = util.promisify(fs.stat);
const basePath       = __dirname + '/db-translation-files/';


const mkdir         = util.promisify(fs.mkdir);
const fileExists    = util.promisify(fs.exists);
const writeFile     = util.promisify(fs.writeFile);

function databaseTable(options){

    let router = express.Router({mergeParams:true});

    router.get   ('/',             authenticate, authorized, get); 
    router.get   ('/signed-url',   authenticate, authorized, signedUrl.get);
    router.get   ('/download',     signedUrl.isValid, download);

    return router;

    async function get(req, res){
        try{
            
            let q = req.query;
            
            let databaseTable = _.find(databaseTables, {name:req.params.table})
            let files = await getUpdatesFiles(databaseTable, q);

            res.status(200).send(files);
        }
        catch(err) {
            winston.error(err);
            res.status(500).send('Unknown error occurred');
        };
    }
    async function download(req, res){
        try{
            
            let q = req.decryptedInfo;
            
            let databaseTable = _.find(databaseTables, {name:req.params.table})
            let files = await getUpdatesFiles(databaseTable, q);

            if(files && files.length > 0){
                let compressedFiles = await zipFile(req.params.table, files);
                let zip4 = new EasyZip();
                return zip4.batchAdd(compressedFiles, function(){
                    return zip4.writeToResponse(res,`${req.params.table}`);
                });
            }
            res.status(200).send('No files found for download');
        }
        catch(err) {
            winston.error(err)
            res.status(500).send('Unknown error occurred');
        };
    }

    function authorized(req, res, next){
        try{

            if(!req.user || !authenticate.isInRole(req.user, ['Administrator', 'oasisArticleEditor'])){
                return res.status(403).send('You are not authorized to access this resource');
            }
            
            next();
        }
        catch(err) {
            winston.error(err);
            res.status(500).send('Unknown error occurred');
        };
    }

    async function getUpdatesFiles(databaseTable, q) {
            
            let now = new Date().getTime();
            if(!fileExists(`${basePath}`))
                mkdir(`${basePath}`);

            mkdir(`${basePath}${now}`);
            
            var ag = [];
            ag.push({"$match": {'_id' : {$in : q.ids.map(e=> { return { "$oid" : e }})}}});
            let nr6Request = await request
                                .get(`${config.api.url}${databaseTable.api}`)
                                .query({"ag" : JSON.stringify(ag)})
                                .set({accept:'application/json'});

            documents =  nr6Request.body;
            let translationFiles = [];
           
            for (let i = 0; i < documents.length; i++) {
                let document = documents[i];
                
                let article     = {};
                let titleHash   = crypto.createHash('md5').update((document.title||{}).en||'').digest("hex");
                let contentHash = crypto.createHash('md5').update((document.content||{}).en||'').digest("hex");
                
                article[`title_${titleHash}`]   = (document.title||{}).en
                article[`content_${contentHash}`] = (document.content||{}).en 
                let title = ((document.title||{}).en||'').replace(/\s|\//g, '_')
                let filePath = `${now}/${title}#${document._id}.json`
                
                writeFile(`${basePath}${filePath}`,  JSON.stringify(article));
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

module.exports = databaseTable
