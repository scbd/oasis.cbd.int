
'use strict';
require           = require("esm")(module)

process.on('SIGTERM', ()=>process.exit());

// CREATE HTTP SERVER AND PROXY
var express     = require('express');
var app = express();
var proxy   = require('http-proxy').createProxyServer({});
let config = require('./app/api/config.js');

const { bundleUrls, cdnHost } = require('./app/boot.js');

app.set('views', __dirname + '/app');
app.set('view engine', 'ejs');

// app.use(require('morgan')('dev'));

// LOAD CONFIGURATION

app.set('port', process.env.PORT || 2012);

// CONFIGURE /APP/* ROUTES
if(!process.env.API_URL) {
    console.warn('warning: evironment API_URL not set. USING default (https://api.cbddev.xyz)');
}

var gitVersion = (process.env.VERSION || 'UNKNOWN').substr(0, 7);
let appVersion = process.env.TAG      || gitVersion;

console.info(`info: www.cbd.int/management`);
console.info(`info: Git commit:  ${gitVersion}`);
console.info(`info: App version: ${appVersion}`);
console.info(`info: API address: ${config.api.url}`);

app.use('/app',           express.static(__dirname + '/dist/app', { setHeaders: setCustomCacheControl }));
app.use('/app',           express.static(__dirname + '/app', { setHeaders: setCustomCacheControl }));


app.use('/translation-api/git/:repository',          require('./app/api/git-query')  ());
app.use('/translation-api/database-table/:table',    require('./app/api/database-table')());

app.all('/api/*', (req, res) => proxy.web(req, res, { target: config.api.url, changeOrigin: true, secure:false }));
app.all('/app/*', function(req, res) { res.status(404).send(); } );

// CONFIGURE TEMPLATE
app.get('/*',            function(req, res) { 
    res.render('template', {
        baseUrl: req.headers.base_url || '/',
        appVersion: appVersion,

        cdnHost            : cdnHost,
        angularBundle      : bundleUrls.angularBundle,
        initialCss         : bundleUrls.initialCss,
        apiUrl             : config.api.url
    }); 
});



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

	if(res.req.query && res.req.query.v && res.req.query.v==appVersion && appVersion!='UNKNOWN')
        return res.setHeader('Cache-Control', 'public, max-age=86400000'); // one day

    res.setHeader('Cache-Control', 'public, max-age=0');
}
