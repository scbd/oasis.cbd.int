
'use strict';

process.on('SIGTERM', ()=>process.exit());

// CREATE HTTP SERVER AND PROXY
var express     = require('express');
var app = express();
var proxy   = require('http-proxy').createProxyServer({});
var gitQuery =  require('./app/api/git-query.js')();
var databaseTable =  require('./app/api/database-table.js')();

app.set('views', __dirname + '/app');
app.set('view engine', 'ejs');

// app.use(require('morgan')('dev'));

// LOAD CONFIGURATION

app.set('port', process.env.PORT || 2012);

// CONFIGURE /APP/* ROUTES
if(!process.env.API_URL) {
    console.warn('warning: evironment API_URL not set. USING default (https://api.cbd.int:443)');
}

var apiUrl = process.env.API_URL || 'https://api.cbddev.xyz:443';
var gitVersion = (process.env.VERSION || 'UNKNOWN').substr(0, 7);

console.info(`info: www.cbd.int/management`);
console.info(`info: Git version: ${gitVersion}`);
console.info(`info: API address: ${apiUrl}`);


app.use('/app',           express.static(__dirname + '/app', { setHeaders: setCustomCacheControl }));
// app.all('/api/v2017/*', (req, res) =>{
//     console.log(req.url);
//      proxy.web(req, res, { target: 'http://localhost:8000', changeOrigin: true, secure:false })
//     });

app.get('/translation-api/git/:repository',         gitQuery);
app.get('/translation-api/database-table/:table',   databaseTable);

app.all('/api/*', (req, res) => proxy.web(req, res, { target: apiUrl, changeOrigin: true, secure:false }));
app.all('/app/*', function(req, res) { res.status(404).send(); } );

// CONFIGURE TEMPLATE
app.get('/*',            function(req, res) { res.render('template', { baseUrl: req.headers.base_url || '/',gitVersion: gitVersion }); });



// START SERVER

app.listen(app.get('port'), function () {
	console.log('Server listening on %j', this.address());
});

// Handle proxy errors ignore

proxy.on('error', function (e,req, res) {
    console.error('proxy error:', e);
    res.status(502).send();
});
process.on('SIGTERM', ()=>process.exit());
//============================================================
//
//
//============================================================
function setCustomCacheControl(res, path) {

	if(res.req.query && res.req.query.v && res.req.query.v==gitVersion && gitVersion!='UNKNOWN')
        return res.setHeader('Cache-Control', 'public, max-age=86400000'); // one day

    res.setHeader('Cache-Control', 'public, max-age=0');
}
