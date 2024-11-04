import simpleGit          from 'simple-git';
import path         from 'path';
import _            from 'lodash';
import fs           from 'fs/promises';
import { EasyZip}   from 'easy-zip';
import util         from 'util';
import authenticate from './authentication.js';
import express      from 'express';
import config       from './config.js';
import signedUrl    from './signed-url.js';
import winston      from './logger.js';
import crypto       from 'crypto';

import * as url from 'url';
import { sleep } from './utils.js';
import { ROLES } from '../utils/constants.js';
const __dirname = url.fileURLToPath(new url.URL('.', import.meta.url));

const basePath     = __dirname + 'repositories/';
const exportDir    = __dirname + 'repositories/export';
const git          = simpleGit();

function gitQuery(options){
    
    let router = express.Router({mergeParams:true});

    router.get   ('/',             authenticate, authorized, get); 
    router.get   ('/signed-url',   authenticate, authorized, signedUrl.get);
    router.get   ('/download',     signedUrl.isValid, download);

    return router;

    async function get(req, res){
        try{
            let q = req.query;
            
            let repositoryName = req.params.repository;
            let files = await getUpdatesFiles(repositoryName, q.branch, q.date, q.ignoreFiles, q.allowedExtensions, q.ignoreFolders, q.includeFolders);

            res.status(200).send(files);
        }
        catch(err) {
            winston.error(err);
            res.status(500).send('Unknown error occurred');
        };
    }

    async function download(req, res){
        let newDestination;
        try{
            
            let q = req.decryptedInfo;
            
            let repositoryName = req.params.repository;
            let files = await getUpdatesFiles(repositoryName, q.branch, q.date, q.ignoreFiles, q.allowedExtensions, q.ignoreFolders, q.includeFolders);

            if(files && files.length > 0){
                
                newDestination  = await hashJsonKeys(repositoryName, files, q.branch);
                let compressedFiles = await zipFile(repositoryName, files, q.branch, newDestination);
                let zip4 = new EasyZip();
                return zip4.batchAdd(compressedFiles, function(){
                    return zip4.writeToResponse(res,`${q.branch}`);
                });  
            }
            res.status(200).send('No files found for download');
        }
        catch(err) {
            winston.error(err)
            res.status(500).send('Unknown error occurred');
        }
        finally{
            if(newDestination)
                deleteDirectory(newDestination);
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

    async function getUpdatesFiles(repositoryName, baseBranch, date, 
        ignoreFiles, allowedExtensions, ignoreFolders, includeFolders) {

        // try{
            
            let  dateFrom;
            let gitUrl = 'https://github.com/scbd/';
            
            let baseDir;
            try {
                baseDir = await fs.stat(basePath);
            } catch (e) {}
            if (!baseDir || baseDir && !baseDir.isDirectory()) {
                await fs.mkdir(basePath)
            }

            let statsLang;
            try {
                statsLang = await fs.stat(basePath + repositoryName);
            } catch (e) {}

            let gitObject;

            if (!statsLang || statsLang && !statsLang.isDirectory()) {
                await fs.mkdir(basePath + repositoryName)
                gitObject = git.cwd(basePath);
                try {
                    await (gitObject.clone(gitUrl + repositoryName + '.git', basePath + repositoryName, []));
                } catch (err) {
                    winston.error(err);
                }
            } else {
                gitObject = git.cwd(basePath + repositoryName);
                await gitObject.checkout('master')
                let r = await(gitObject.pull('origin'));
            }


            await gitObject.checkout('tags/'+baseBranch)

            let modifiedFiles;
            
            if(date ==undefined || _.isEmpty(date))
                modifiedFiles = await gitObject.raw(['ls-files']);
            else 
                modifiedFiles = await gitObject.log(['--after='+new Date(date).toUTCString(), "--name-only"]);

            let modifiedFileInBranch = [];

            allowedExtensions   = (allowedExtensions||".html,.json").replace(/\s/g, '').split(',');
            ignoreFiles         = (ignoreFiles || "bower.json, package.json,.bower.json,.awsbox.json").replace(/\s/g, '').split(',');
            ignoreFolders       = (ignoreFolders || 'i18n').replace(/\s/g, '').split(',');
            includeFolders      = (includeFolders|| 'i18n').replace(/\s/g, '').split(',');
            
            if(modifiedFiles?.all){
                _.each(modifiedFiles.all, function(file){
                    if(file.diff){                                
                        modifiedFileInBranch.push(getFilesFromString(file.diff, allowedExtensions, ignoreFiles, ignoreFolders, includeFolders));
                    }
                })
            }
            else if(_.isString(modifiedFiles)){                
                const files = modifiedFiles.split('\n').map(e=>{return {file:e}})
                modifiedFileInBranch.push(getFilesFromString({files}, allowedExtensions, ignoreFiles, ignoreFolders, includeFolders));
            }            

            return _.map(_.uniq(_.flatten(modifiedFileInBranch)), function(file){
                return {name : path.basename(file), path: file}
            });

        // }
        // catch(err) {
        //     winston.error(err);
        //     thr
        // };



    }

    async function zipFile(repositoryName, translationFiles, branch, exportPath){

        let files = []
        for (let i = 0; i < translationFiles.length; i++) {
            let file = translationFiles[i];
            let fileExists
            let filePath = repositoryName + "/" + file.path
            const sourceFilePath = exportPath + "/"  + filePath
            try {
                fileExists = await fs.stat(sourceFilePath);
            } catch (e) {}
            if (fileExists && fileExists.isFile()) {
                files.push({source:sourceFilePath, target : branch+'/'+filePath});
            } else {
                console.error(`File does not exists`, file);
            }
        }
        return files;
    }

    async function hashJsonKeys(repositoryName, files, branch){
        
        const destinationDir = `${exportDir}/${new Date().getTime()}`
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let fileExists
            let filePath = repositoryName + "/" + file.path
            try {
                fileExists = await fs.stat(basePath + filePath);
            } catch (e) {}
            if (fileExists && fileExists.isFile()) {
                const sourceFile     = basePath + filePath;
                const destinationFle = `${destinationDir}/${filePath}`
                
                await confirmDir(path.dirname(destinationFle));

                if(path.extname(filePath) == '.json'){
                    
                    const jsonFileKeys = (await import(sourceFile, { assert: { type: 'json' }})).default;
                    delete jsonFileKeys['#meta']
                    const hashedKeys   = buildKeyHashes(jsonFileKeys);
                    jsonFileKeys['#meta'] = {
                        hashedOn : new Date(),
                        algorithm:'md5',
                        branch,
                        hashes : hashedKeys
                    }

                    await fs.writeFile(`${destinationFle}`, JSON.stringify(jsonFileKeys, undefined, 2));
                }
                else{
                    await fs.copyFile(sourceFile, `${destinationFle}`);
                }

            } else {
                console.log(file);
            }
        }

        return destinationDir;
    }

    function buildKeyHashes(jsonFileKeys){
        const keyHashes = {};
        for (const key in jsonFileKeys) {
            if (Object.hasOwnProperty.call(jsonFileKeys, key)) {
                const element = jsonFileKeys[key];
                if(_.isString(element))
                    keyHashes[key] = crypto.createHash('md5').update(element).digest("hex");
                else{
                    keyHashes[key] = buildKeyHashes(element);
                }
            }
        }
        return keyHashes;
    }

    async function confirmDir(basePath){
        let baseDir;
        try {
            baseDir = await fs.stat(basePath);
        } catch (e) {}
        if (!baseDir || baseDir && !baseDir.isDirectory()) {
            await fs.mkdir(basePath, {recursive:true})
        }
    }

    function getFilesFromString(fileDiff, allowedExtensions, ignoreFiles, ignoreFolders, includeFolders){
        // let r = hash.replace(/\'/g, '')
        //     .replace(/\n/g, ';')
        //     .split(';');
        return _.uniq(fileDiff.files).filter(function ({file}) {
            let ext = path.extname(file);
            const dirPath = path.dirname(file).replace(/\//g, '_',)
            return _.indexOf(allowedExtensions, ext) >= 0 
                   && _.indexOf(ignoreFiles, path.basename(file)) < 0                   
                   && includeFolders.filter(e=> compareFolder(e, dirPath)).length
                   && !ignoreFolders.filter(e=> compareFolder(e, dirPath)).length;
        }).map(e=>e.file);
    }
    
    async function deleteDirectory(dir){
        await sleep(15*1000);
        await fs.rm(dir, {recursive:true, force:true});
    }

    function compareFolder(userPath, dirPath){
        const replaceFolderPath = dirPath.replace(userPath.replace(/\/$/, '').replace(/\//g, '_'), '_');
        return replaceFolderPath == '_' || /__(.*)?/.test(replaceFolderPath);
    }
}

export default gitQuery;
