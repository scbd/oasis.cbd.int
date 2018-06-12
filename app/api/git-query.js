
var git = require('simple-git/promise');
var path = require('path');
var _ = require('lodash');
var fs = require('fs');
var zip = require('express-zip');
const util = require('util');

const stat = util.promisify(fs.stat);
const mkdir = util.promisify(fs.mkdir);

var basePath = __dirname + '/repositories/';


module.exports = function gitQuery(options){

    return async function get(req, res, next){

        var q = req.query;
        
        var repositoryName = req.params.repository;
        var files = await getUpdatesFiles(repositoryName, q.branch, q.date);

        if(q.zip){
            let compressedFile = await zipFile(repositoryName, files)

            res.zip(compressedFile, `${q.branch}.zip`);
            return;
        }
        res.status(200).send(files);
    }


    async function getUpdatesFiles(repositoryName, baseBranch, date) {

        try{
            
            var  dateFrom;
            var gitUrl = 'https://github.com/scbd/';
            
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
                var r = await(gitObject.pull('origin'));
                console.log(r);
            }

            // gitObject.log({'--after':"2017-02-13T16:36:00-02:00"}, function(a, b){
            //     console.log(a,b);
            // });

            await gitObject.checkout('tags/'+baseBranch)

            var modifieldfiles;
            modifieldfiles = await gitObject.log(['--after='+new Date(date).toUTCString(), "--name-only"]);
            // , function (a, b) {
            //     modifieldfiles = b;
            // });
            //     var repoExists = await (gitObject.listRemote(['--after'])); '--name-only':" | sed '/^\s*$/d' | sort | uniq -u"
            // console.log(r);
            var modifiedFileInBranch = [];

            var allowedExtenstion = [".html", ".json"];
            var ignoreFiles = ["bower.json", "packages.json"];

            _.each(modifieldfiles.all, function(file){
                if(file.hash){
                    // if(/(\.html|\.json)/.test(file.hash)){
                    //         modifiedFileInBranch.push(_.filter(file.hash.split('\n'), function(ext){
                    //             return /(\.html|\.json)$/.test(ext)
                    //         }));
                    // }
        
                    var r = file.hash.replace(/\'/g, '')
                        .replace(/\n/g, ';')
                        .split(';');
                    modifiedFileInBranch.push( _.uniq(r).filter(function (name) {
                        var ext = path.extname(name);
                        return _.indexOf(allowedExtenstion, ext) >= 0 && _.indexOf(ignoreFiles, path.basename(name)) < 0;
                    }));
                }
            })
            
            console.log(_.uniq(_.flatten(modifiedFileInBranch)));
            // console.log(modifieldfiles);

            return _.map(_.uniq(_.flatten(modifiedFileInBranch)), function(file){
                return {name : path.basename(file), path: file}
            });

        }
        catch(err) {
            console.log(err);
        };



    }

    async function zipFile(repositoryName, translationFiles){

        var files = []
        for (var i = 0; i < translationFiles.length; i++) {
            var file = translationFiles[i];
            let fileExists
            try {
                fileExists = await stat(basePath + repositoryName + "/" + file.path);
            } catch (e) {}
            if (fileExists && fileExists.isFile()) {
                files.push({path:basePath + repositoryName + "/" + file.path, name : file.name});
            } else {
                console.log(file);
            }
        }
        return files;
    }
}



