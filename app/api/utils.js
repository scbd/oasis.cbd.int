
import { stat } from 'fs/promises';
import path from 'path';
import unzip   from 'unzipper';
import logger from './logger.js'

export const verifyFileExists = async function ({table, translationFiles, basePath}){

    if(!translationFiles?.length)
        return;

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


export async function extractZipFile(zipFilePath, extractionLocation, importLog){

    logStep(`Begin zip extraction ${zipFilePath} to ${extractionLocation}`, importLog, importLogType.console)
    const fileBaseName       = path.basename(zipFilePath, path.extname(zipFilePath));

    const zipBuffer = await unzip.Open.file(zipFilePath)
                      await zipBuffer.extract({path: extractionLocation, concurrency: 5});

    return `${extractionLocation}`;
}

export const httpStatusCodes = {
    badRequest         : 400,
    mandatory          : 400,
    invalidParameter   : 400,
    unauthorized       : 401,
    forbidden          : 403,
    notFound           : 404,
    internalServerError: 500,
    notImplemented     : 501,
    serviceUnavailable : 503,
}

export const importLogType = {
    console : 'console',
    error   : 'errors',
    success : 'success'
}
export function logStep(message, importLog, logType){
    if(importLog){
        importLog[logType||'console'] = importLog[logType||'console'] || [];
        importLog[logType||'console'].push(message);
    }
    if(logType!=importLogType.error)
        logger.debug(message)
}

export const sleep = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms));