
var requestq = require('superagent');
var _ = require('lodash');
var winston = require('winston');

const config = require('./config.js')
//============================================================
//
//
//============================================================
async function authenticate (req, res, next) {

    try {
        var ANONYMOUS = { id: 1, anonymous: true, roles: [ 'Everyone' ], scopes: [] };

        if(!req.headers.authorization)
            return ANONYMOUS;
    
        var user = await getUser(req.headers.authorization);

        req.user =  { 
              id: user.userID, anonymous: user.anonymous, email: user.email, name: user.name, roles: user.roles,
              userGroups: user.userGroups||user.usergroups
        };

        next();
    }
    catch(error){
        if(error && error.statusCode)
            return res.status(error.statusCode).send(error);

        res.status(500).send('UnKnown error occurred');

        winston.error(error);
    }
}

//============================================================
//
//
//============================================================
async function getUser(token) {


    var response = await requestq.get(config.api.url+'/api/v2013/authentication/user')
                                 .accept('application/json')
                                 .set('Authorization', token)
    return response.body;

}

//============================================================
//
//
//============================================================
function isInRole(user, roles) {

    var userRoles = user.roles.concat(["U"+user.id]);

    return _.intersection(roles||[], userRoles).length>0;

    
}
authenticate.isInRole = isInRole;

module.exports = exports = authenticate;
