var crypto = require('crypto');
const config = require('./config.js')

const algorithm = 'aes-256-ctr';
const password  = config.encryptionPassword;

function encryption(){

    if(!password || password.trim()== '')
        throw 'Encryption not configured.'

    this.encrypt = function(text){
        var cipher = crypto.createCipher(algorithm, password)
        var crypted = cipher.update(text,'utf8','hex')
        crypted += cipher.final('hex');
        return crypted;
    }

    this.decrypt = function(text){
        var decipher = crypto.createDecipher(algorithm, password)
        var dec = decipher.update(text,'hex','utf8')
        dec += decipher.final('utf8');
        return dec;
    }
}

module.exports = new encryption();
