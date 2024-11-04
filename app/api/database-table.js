import { recordApiEndpoint, importWorkingFolder, createDir,
         importTranslationFromZip, deleteFromDisk, importFromFile } from './import-translation.js';
import { httpStatusCodes, importLogType, logStep } from './utils.js';
import multer from 'multer';
import { randomUUID } from 'crypto';

import _              from 'lodash';
import fs             from 'fs';
import { EasyZip}     from 'easy-zip';
import util           from 'util';
import path           from 'path';
import request        from 'superagent';
import winston        from './logger.js';
import crypto         from 'crypto';
import express        from 'express';
import databaseTables from '../views/translation/database-tables.json' assert { type: 'json'}
import authenticate   from './authentication.js';
import config         from './config.js';
import signedUrl      from './signed-url.js';
import * as url from 'url';
import { ROLES } from '../utils/constants.js';
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
    
    router.post  ('/import/:from/:lang?', authenticate, authorized, fileUpload, importTranslation);

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

            if(!req.user || !authenticate.isInRole(req.user, [ROLES.ADMINISTRATOR, ROLES.OASIS_ARTICLE_EDITOR])){
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
            let articleRequest = await request
                                .get(`${config.api.host}${databaseTable.api}`)
                                .query({"ag" : JSON.stringify(ag)})
                                .set({accept:'application/json'});

            const documents =  articleRequest.body;
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

        let logs     = [];
        try{
            const supportedFormats = ['zip', 'json', 'data'];
            const supportedTables  = Object.keys(recordApiEndpoint);
            
            if(!supportedFormats.includes(req.params.from)){
                return res.status(httpStatusCodes.invalidParameter).send(`Invalid table (${req.from}), supported tables are ${supportedTables.join('|')}`)
            }

            if(!supportedFormats.includes(req.params.from)){
                return res.status(httpStatusCodes.invalidParameter).send(`Invalid format (${req.from}), supported formats are ${supportedFormats.join('|')}`);
            }
            if((req.params.from == 'data' || req.params.from == 'json') && !req.params.lang){
                return res.status(httpStatusCodes.invalidParameter).send(`Language of translation is mandatory`);
            }
            
            const files = req.files;

            const user = { ...req.user };
            user.token = req.headers['authorization'];

            for (const index in files) {

                if (Object.hasOwnProperty.call(files, index)) {
                    const file = files[index];
                    let importLogs = {};
                    try{

                        if(file.mimetype == 'application/zip'){
                            await importTranslationFromZip(file.path, req.params.table.toLowerCase(), importLogs, user, req.guid, req.params.lang);
                        }
                        else if(file.mimetype == 'application/json'){
                            await importFromFile(file.path, req.params.lang, req.params.table.toLowerCase(), importLogs, user);
                        }
                    }
                    catch(e){
                        winston.error(e);

                        logStep({error:e.message||e}, importLogs, importLogType.error);
                    }
                    finally{

                        for (const log in importLogs) {
                            if (Object.hasOwnProperty.call(importLogs, log)) {
                                const element = importLogs[log];
                                if(element.error){
                                    element.error = element.error.message||element.error
                                    if(_.isObject(element.error))
                                        element.error = JSON.stringify(element.error)
                                }                            
                            }
                        }
                        logs.push({ 
                            fileName : file.originalname, 
                            ...importLogs
                        })
                    }
                }
            }

            // if(errors?.length){
            //     console.log(`Errors in import : `, errors);
            //     return res.status(httpStatusCodes.badRequest).send(errors)
            // }
        
            res.send(logs).status(200)
        }
        catch(err) {
            winston.error(err);

            logs.push({ 
                errors:[err?.message||err]
            })

            return res.status(500).send(logs);
            
        }
        finally{
            await deleteFromDisk(req.importDir);
        };
    }

    async function fileUpload(req, res, next){

        req.guid = randomUUID();
        req.importDir = `${importWorkingFolder}/${req.guid}`;

        const storage = multer.diskStorage({
            destination: async function (req, file, cb) {
                await createDir(req.importDir);
                cb(null, req.importDir )
            },
            filename: function (req, file, cb) {
                // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
                cb(null, `${file.originalname}`);// + '-' + uniqueSuffix)
            }
        })
        const upload = multer({ storage }).array('file')

        upload(req, res, function(err){
            if(err){
                winston.error(err);
                let { field, message, name} = err
                if(err.message != 'Unexpected field'){
                    message = 'Unknown error in file upload'
                }
                return res.status(httpStatusCodes.internalServerError).send({ field, message, name});
            }
            next();
        });
        
    }
}

export default databaseTable
