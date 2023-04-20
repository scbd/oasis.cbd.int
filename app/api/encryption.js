import crypto from 'crypto';
import config from './config.js'

const algorithm = 'aes-256-ctr';
const password  = config.encryptionPassword;
const iv = crypto.randomBytes(16);

function encryption(){

    if(!password || password.trim()== '')
        throw 'Encryption not configured.'

    this.encrypt = function(text){
        var cipher = crypto.createCipheriv(algorithm, password, iv)
        var crypted = cipher.update(text,'utf8','hex')
        crypted += cipher.final('hex');
        return crypted;
    }

    this.decrypt = function(text){
        var decipher = crypto.createDecipheriv(algorithm, password, iv)
        var dec = decipher.update(text,'hex','utf8')
        dec += decipher.final('utf8');
        return dec;
    }
}

export default new encryption();
