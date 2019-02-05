var winston = require('winston');
const encryption = require('./encryption.js');
//============================================================
//
//
//============================================================
function signedUrl (req, res) {

      this.get = function(req, res) {
        try {
           
            if(!req.user || req.user.anonymous)
                return res.status(401).send('You are not authorized to access this resource');
                
            let data = req.query;
            data.expiry = new Date();
            data.expiry.setMinutes(data.expiry.getMinutes() + 5);
            
            var hash = encryption.encrypt(JSON.stringify(data))

            res.status(200).send(hash);
        }
        catch(error){
            winston.error(error);
            
            if(error && error.statusCode)
                return res.status(error.statusCode).send(error);

            res.status(500).send('UnKnown error occurred');

        }
    }

    this.isValid = function(req, res, next) {
        try {
            if(!req.query || !req.query.hash)
                return res.status(403).send('Url not signed');
                       
            var details = encryption.decrypt(req.query.hash)
            details = JSON.parse (details);
            if(!details.expiry || details.expiry < new Date())
                return res.status(403).send('Invalid signed url hash');
            
            req.decryptedInfo = details;
            next();
        }
        catch(error){
            winston.error(error);
            
            if(error && error.statusCode)
                return res.status(error.statusCode).send(error);

            res.status(500).send('UnKnown error occurred');

        }
    }
}

module.exports = exports = new signedUrl();
