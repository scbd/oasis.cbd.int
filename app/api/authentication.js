import requestq from 'superagent';
import _        from 'lodash';
import winston  from './logger.js';
import config from './config.js'
import {httpStatusCodes} from './utils.js';
//============================================================
//
//
//============================================================
async function authenticate (req, res, next) {

    try {
        let ANONYMOUS = { id: 1, anonymous: true, roles: [ 'Everyone' ], scopes: [] };

        if(!req.headers.authorization)
            return res.status(httpStatusCodes.unauthorized).send();
    
        let user = await getUser(req.headers.authorization);

        req.user =  { 
              id: user.userID, anonymous: user.anonymous, email: user.email, name: user.name, roles: user.roles,
              userGroups: user.userGroups||user.usergroups
        };

        next();
    }
    catch(error){
        winston.error(error);

        if(error && error.statusCode)
            return res.status(error.statusCode).send(error);

        res.status(500).send('UnKnown error occurred');        
    }
}

//============================================================
//
//
//============================================================
async function getUser(token) {


    let response = await requestq.get(config.api.host+'/api/v2013/authentication/user')
                                 .accept('application/json')
                                 .set('Authorization', token)
    return response.body;

}

//============================================================
//
//
//============================================================
function isInRole(user, roles) {

    let userRoles = user.roles.concat(["U"+user.id]);

    return _.intersection(roles||[], userRoles).length>0;

    
}
authenticate.isInRole = isInRole;

export default authenticate;
