
import config from './app/api/config.js';
import express from 'express';
import httpProxy   from 'http-proxy';
import { bundleUrls, cdnHost } from './app/boot.js';
import gitQuery from './app/api/git-query.js'
import translation from './app/api/database-table.js'
import * as url from 'url';
const __dirname = url.fileURLToPath(new url.URL('.', import.meta.url));


process.on('SIGTERM', ()=>process.exit());

// CREATE HTTP SERVER AND PROXY
const app = express();
const proxy = httpProxy.createProxyServer({});

app.set('views', __dirname + '/app');
app.set('view engine', 'ejs');

// app.use(require('morgan')('dev'));

// LOAD CONFIGURATION

app.set('port', process.env.PORT || 2012);

// CONFIGURE /APP/* ROUTES
if(!process.env.API_HOST) {
    console.warn('warning: evironment API_HOST not set. USING default (https://api.cbddev.xyz)');
}

var gitVersion = (process.env.VERSION || 'UNKNOWN').substr(0, 7);
let appVersion = process.env.TAG      || gitVersion;

console.info(`info: www.cbd.int/management`);
console.info(`info: Git commit:  ${gitVersion}`);
console.info(`info: App version: ${appVersion}`);
console.info(`info: API address: ${config.api.host}`);

app.use('/app',           express.static(__dirname + '/dist/app', { setHeaders: setCustomCacheControl }));
app.use('/app',           express.static(__dirname + '/app', { setHeaders: setCustomCacheControl }));


app.use('/translation-api/git/:repository',          gitQuery());
app.use('/translation-api/database-table/:table',    translation());

app.all('/api/*', (req, res) => proxy.web(req, res, { target: config.api.host, changeOrigin: true, secure:false }));
app.all('/app/*', function(req, res) { res.status(404).send(); } );

// CONFIGURE TEMPLATE
app.get('/*',            function(req, res) { 
    res.render('template', {
        baseUrl: req.headers.base_url || '/',
        appVersion: appVersion,

        cdnHost            : cdnHost,
        angularBundle      : bundleUrls.angularBundle,
        initialCss         : bundleUrls.initialCss,
        apiHost            : config.api.host
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
