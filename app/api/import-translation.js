import request from 'superagent';
import path    from 'path';
import _       from 'lodash';
import fs      from 'fs/promises';
import crypto  from 'crypto';
import cheerio from 'cheerio';
import unzip   from 'unzipper';
import { extractZipFile, logStep, importLogType } from './utils.js';
import { randomUUID } from 'crypto';
import logger from './logger.js';

import * as url from 'url';
const __dirname = url.fileURLToPath(new url.URL('.', import.meta.url));

const apiHost = process.env.API_HOST;
const basePath            = __dirname + 'db-translation-files';

export const importWorkingFolder = `${basePath}/import`;
export const recordApiEndpoint = {
    articles : 'api/v2017/articles'
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

export async function updateRecord(record, recordType, user, importLog){

    logStep(`Updating ${recordType}record with translation`, importLog, importLogType.console)
    let articleUpdate = await request.put(`${apiHost}/${getRecordTypeEndpoint(recordType)}/${record._id}`)
                        .set({ 
                            'Accept': 'application/json', 'Content-Type': 'application/json;Charset=utf-8',
                            'Authorization': user?.token
                        })
                        .send(record);

    return articleUpdate;
    
}

export async function importFromFolder(basePath, lang, recordType, importLog, user){

    logStep(`Importing from folder ${basePath.replace(importWorkingFolder, '')} ${recordType} in ${lang}`, importLog, importLogType.console)
    let dirs = await fs.readdir(basePath)
    for (let index = 0; index < dirs.length; index++) {

        const folder   = dirs[index]            
        const filePath = `${basePath}/${folder}`;

        const stats=  await fs.lstat(filePath);
        const ext = path.extname(filePath);

        if(stats.isDirectory()){
            await importFromFolder(filePath, lang, recordType, importLog, user)
        }
        else if(stats.isFile()){
            const recordId = getRecordIdFromFilePath(filePath);
            if( ext == '.json'){
                try{
                    await importFromFile(filePath, lang, recordType, importLog, user)
                }
                catch(e){
                    if(importLog[recordId].error){
                        logger.error((e.response||{}).body||e)
                        logStep({id:recordId, error:(e.response||{}).body||e}, importLog, importLogType.error);
                    }
                }
            }
            else {
                logStep(`File  ${filePath.replace(importWorkingFolder, '')} under folder ${basePath.replace(importWorkingFolder, '')} for ${recordType} in ${lang} is not supported`, importLog, importLogType.console)
            }
        }
    }

    return importLog;
}

export async function importFromFile(basePath, lang, recordType, importLog, user){

    logStep(`importing from file ${basePath.replace(importWorkingFolder, '')} ${recordType} for lang ${lang}`, importLog, importLogType.console)
    let recordId = getRecordIdFromFilePath(basePath);
    try{
        let record;
        
        importLog[recordId] = importLog[recordId] || { fields:[]};

        if(!record){

            logStep(`getting record from api ${recordId}`, importLog, importLogType.console)
            let articleRequest =  await request.get(`${apiHost}/${getRecordTypeEndpoint(recordType)}/${recordId}`)
                                            .set({accept:'application/json'});
            if(!articleRequest?.body)
                throw new Error('record has not body');

                record = articleRequest.body;
        }
        
        //read the json file from disk
        const translatedFile = await fs.readFile(basePath, {encoding:'utf-8'});
        const translatedRecord = JSON.parse(translatedFile);

        await importFromObject(translatedRecord, lang, recordType, importLog, user, recordId, record);
    }
    catch(e){
        logger.error(e);
        logStep({id:recordId, error:e.message||e}, importLog, importLogType.error)
    }
    return importLog;
}

export async function importFromObject(translatedRecord, lang, recordType, importLog, user, recordId, record) {

    logStep(`importing from object ${recordId} ${recordType} for lang ${lang}`, importLog, importLogType.console)
    _.each(translatedRecord, (field, key) => {
        let splits = key.split('_');
        let fieldName = splits[0];
        let hash = splits[1];
        //check for hash
        importLog[recordId][`original${fieldName}Hash`] = crypto.createHash('md5').update(record[fieldName].en).digest("hex");
        importLog[recordId][`translation${fieldName}Hash`] = hash;
        importLog[recordId].fields.push(fieldName);

        if (importLog[recordId][`original${fieldName}Hash`] != hash) {
            logStep({id:recordId, error:`${fieldName} hash not matching for record id ${recordId}`}, importLog, importLogType.error)
            return;
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

    await updateRecord(record, recordType, user, importLog);

    return importLog;
}

//expected user : { Token : '' }
export async function importTranslationFromZip(zipFileName, recordType, importLog, user, taskId, language){
    logStep(`Begin importing from zip ${zipFileName.replace(importWorkingFolder, '')} ${recordType} for task ${taskId}`, importLog, importLogType.console)
          taskId            = taskId || randomUUID();
          importLog        = importLog || {};
    const taskWorkingFolder = `${importWorkingFolder}/${taskId}`;
    const langRegex         = /#(ar|es|fr|ru|zh)/;
    const fileName          = path.basename(zipFileName);
    const extractionFolder  = fileName.replace(path.extname(fileName), '')
    if(!language && !langRegex.test(zipFileName))
        throw new Error(`Zip file is missing language name(${fileName}), format should 'name#[ar|es|fr|ru|zh].zip'`)

    const lang  = language || zipFileName.match(langRegex)[1]

    await createDir(taskWorkingFolder, importLog);
    
    const extractionLocation = await extractZipFile(zipFileName, `${taskWorkingFolder}/${extractionFolder}`, importLog);

    await importFromFolder(extractionLocation, lang, recordType, importLog, user);

    logStep(`Finish importing from zip ${zipFileName} ${recordType} for task ${taskId}`, importLog, importLogType.console);

    return importLog;

}


export async function createDir(dirname, importLog){
    let baseDir;
    try {
        baseDir = await fs.stat(dirname);
    } catch (e) {}
    if (!baseDir || baseDir && !baseDir.isDirectory()) {
        logStep(`creating dir ${dirname.replace(importWorkingFolder, '')}`, importLog, importLogType.console)
        await fs.mkdir(dirname, { recursive:true })
    }
}
export async function deleteFromDisk(path, importLog){
    let pathStat;
    try {
        pathStat = await fs.stat(path);
        if (pathStat){
            if(pathStat.isDirectory()) {
                logStep(`deleting dir ${path.replace(importWorkingFolder, '')}`, importLog, importLogType.console)
                await fs.rm(path, { recursive:true })
            }
            else if(pathStat.isFile()){
                logStep(`deleting file ${path.replace(importWorkingFolder, '')}`, importLog, importLogType.console)
                await fs.rm(path)
            }
        }        
    }
    catch (e) {

    }
    
}
