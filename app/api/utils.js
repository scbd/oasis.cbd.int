
import { stat } from 'fs/promises';
import path from 'path';
import unzip   from 'unzipper';

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


export async function extractZipFile(zipFilePath, extractionLocation){

    const fileBaseName       = path.basename(zipFilePath, path.extname(zipFilePath));

    const zipBuffer = await unzip.Open.file(zipFilePath)
                      await zipBuffer.extract({path: extractionLocation, concurrency: 5});

    return `${extractionLocation}/${fileBaseName}`;
}
