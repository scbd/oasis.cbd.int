import { recordApiEndpoint, importWorkingFolder } from './import-translation.js';
import { httpStatusCodes } from './utils.js';
import multer from 'multer';

import _              from 'lodash';
import fs             from 'fs';
import { EasyZip}     from 'easy-zip';
import util           from 'util';
import path           from 'path';
import request        from 'superagent';
import winston        from 'winston';
import crypto         from 'crypto';
import express        from 'express';
import databaseTables from '../views/translation/database-tables.json' assert { type: 'json'}
import authenticate   from './authentication.js';
import config         from './config.js';
import signedUrl      from './signed-url.js';
import * as url from 'url';
const __dirname = url.fileURLToPath(new url.URL('.', import.meta.url));

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
    
    /**********************
        :table : Name of the database table to import into
        :from  : type of data to import (.zip|.json|data)
    *********************/
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, importWorkingFolder)
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, file.fieldname + '-' + uniqueSuffix)
        }
    })
    const upload = multer({
        storage
    })
    router.post  ('/import/:from/?:lang', authenticate, authorized, upload.array('translationFiles'), importTranslation);

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
            if(q){
                if(typeof q.ids == 'string')
                    q.ids = [q.ids];
            }
            let now = new Date().getTime();
            if(!(await fileExists(`${basePath}`)))
                await mkdir(`${basePath}`);

            await mkdir(`${basePath}${now}`);
            
            var ag = [];
            ag.push({"$match": {'_id' : {$in : q.ids.map(e=> { return { "$oid" : e }})}}});
            let nr6Request = await request
                                .get(`${config.api.host}${databaseTable.api}`)
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
                let title = ((document.title||{}).en||'').replace(/[^-a-z0-9]/gi, '_').substr(0,200); //max filename 255
                let filePath = `${now}/${title}#${document._id}.json`
                
                await writeFile(`${basePath}${filePath}`,  JSON.stringify(article));
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

    async function importTranslation(req, res){

        const supportedFormats = ['zip', 'json', 'data'];
        const supportedTables  = recordApiEndpoint.keys();
        
        if(!supportedFormats.includes(req.from)){
            return req.status(httpStatusCodes.invalidParameter).send(`Invalid table (${req.from}), supported tables are ${supportedTables.join('|')}`)
        }

        if(!supportedFormats.includes(req.from)){
            return req.status(httpStatusCodes.invalidParameter).send(`Invalid format (${req.from}), supported formats are ${supportedFormats.join('|')}`);
        }
        if((req.from == 'data' || req.from == 'json') && !req.params.lang){
            return req.status(httpStatusCodes.invalidParameter).send(`Language of translation is mandatory`);
        }
        
        console.log(req);


        const importLogs = [];
    
        const errors= Object.keys(importLogs).filter(e=>importLogs[e].error).map(e=>{return {error:importLogs[e].error, id:e}})
        if(errors.length)
            console.log(`Errors in articles : `, errors);
    }
}

export default databaseTable
