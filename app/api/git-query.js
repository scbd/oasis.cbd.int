
const git = require('simple-git/promise');
const path = require('path');
const _ = require('lodash');
const fs = require('fs');
const EasyZip = require('easy-zip').EasyZip;
const util = require('util');
const stat = util.promisify(fs.stat);
const mkdir = util.promisify(fs.mkdir);

const authenticate      = require('./authentication.js');
const express           = require('express');
const config            = require('./config.js');
const signedUrl         = require('./signed-url.js');

const basePath = __dirname + '/repositories/';


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
            let files = await getUpdatesFiles(repositoryName, q.branch, q.date, q.ignoreFiles, q.allowedExtenstions);

            res.status(200).send(files);
        }
        catch(err) {
            res.status(500).send('Unknown error occurred');
        };
    }

    async function download(req, res){
        try{
            
            let q = req.decryptedInfo;
            
            let repositoryName = req.params.repository;
            let files = await getUpdatesFiles(repositoryName, q.branch, q.date, q.ignoreFiles, q.allowedExtenstions);

            if(files && files.length > 0){
                let compressedFiles = await zipFile(repositoryName, files, q.branch);
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
        };
    }

    async function authorized(req, res, next){
        try{

            if(!req.user || !authenticate.isInRole(req.user, ['Administrator', 'oasisArticleEditor'])){
                return res.status(401).send('You are not authorized to access this resource');
            }
            
            next();
        }
        catch(err) {
            res.status(500).send('Unknown error occurred');
        };
    }

    async function getUpdatesFiles(repositoryName, baseBranch, date, ignoreFiles, allowedExtenstions) {

        try{
            
            let  dateFrom;
            let gitUrl = 'https://github.com/scbd/';
            
            let baseDir;
            try {
                baseDir = await stat(basePath);
            } catch (e) {}
            if (!baseDir || baseDir && !baseDir.isDirectory()) {
                await mkdir(basePath)
            }

            let statsLang;
            try {
                statsLang = await stat(basePath + repositoryName);
            } catch (e) {}

            let gitObject;

            if (!statsLang || statsLang && !statsLang.isDirectory()) {
                await mkdir(basePath + repositoryName)
                gitObject = git(basePath);
                try {
                    await (gitObject.clone(gitUrl + repositoryName + '.git', basePath + repositoryName, []));
                } catch (err) {
                    console.log(err);
                }
            } else {
                gitObject = git(basePath + repositoryName);
                await gitObject.checkout('master')
                let r = await(gitObject.pull('origin'));
            }


            await gitObject.checkout('tags/'+baseBranch)

            let modifieldfiles;
            
            if(date ==undefined || _.isEmpty(date))
                modifieldfiles = await gitObject.raw(['ls-files']);
            else 
                modifieldfiles = await gitObject.log(['--after='+new Date(date).toUTCString(), "--name-only"]);

            let modifiedFileInBranch = [];

            allowedExtenstions   = (allowedExtenstions||".html,.json").replace(/\s/g, '').split(',');
            ignoreFiles         = (ignoreFiles || "bower.json, package.json,.bower.json,.awsbox.json").replace(/\s/g, '').split(',');

            if(modifieldfiles.all){
                _.each(modifieldfiles.all, function(file){
                    if(file.hash){
                                
                        let r = file.hash.replace(/\'/g, '')
                            .replace(/\n/g, ';')
                            .split(';');
                        modifiedFileInBranch.push( _.uniq(r).filter(function (name) {
                            let ext = path.extname(name);
                            return _.indexOf(allowedExtenstions, ext) >= 0 && _.indexOf(ignoreFiles, path.basename(name)) < 0;
                        }));
                    }
                })
            }
            else if(_.isString(modifieldfiles)){
                let r = modifieldfiles.replace(/\'/g, '')
                    .replace(/\n/g, ';')
                    .split(';');
                modifiedFileInBranch.push( _.uniq(r).filter(function (name) {
                    let ext = path.extname(name);
                    return _.indexOf(allowedExtenstions, ext) >= 0 && _.indexOf(ignoreFiles, path.basename(name)) < 0;
                }));
            }
            

            return _.map(_.uniq(_.flatten(modifiedFileInBranch)), function(file){
                return {name : path.basename(file), path: file}
            });

        }
        catch(err) {
            console.log(err);
        };



    }

    async function zipFile(repositoryName, translationFiles, branch){

        let files = []
        for (let i = 0; i < translationFiles.length; i++) {
            let file = translationFiles[i];
            let fileExists
            let filePath = repositoryName + "/" + file.path
            try {
                fileExists = await stat(basePath + filePath);
            } catch (e) {}
            if (fileExists && fileExists.isFile()) {
                files.push({source:basePath + filePath, target : branch+'/'+filePath});
            } else {
                console.log(file);
            }
        }
        return files;
    }
}

module.exports = gitQuery
