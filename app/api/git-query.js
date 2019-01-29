
let git = require('simple-git/promise');
let path = require('path');
let _ = require('lodash');
let fs = require('fs');
let EasyZip = require('easy-zip').EasyZip;
const util = require('util');

const stat = util.promisify(fs.stat);
const mkdir = util.promisify(fs.mkdir);

let basePath = __dirname + '/repositories/';


module.exports = function gitQuery(options){

    return async function get(req, res, next){

        let q = req.query;
        
        let repositoryName = req.params.repository;
        let files = await getUpdatesFiles(repositoryName, q.branch, q.date, q.ignoreFiles, q.allowedExtenstions);

        if(q.zip){
            let compressedFiles = await zipFile(repositoryName, files, q.branch);
            let zip4 = new EasyZip();
            return zip4.batchAdd(compressedFiles, function(){
                return zip4.writeToResponse(res,`${q.branch}`);
            });
        }
        res.status(200).send(files);
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



