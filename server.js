'use strict';

var express = require('express');
var httpProxy = require('http-proxy');
var router = express.Router();


var app = express();
var proxy = httpProxy.createProxyServer({});

// app.use(require('morgan')('dev'));

app.use(router);
// Configure routes

app.use('/favicon.ico', express.static(__dirname + '/favicon.ico'));
app.use('/app', express.static(__dirname + '/app'));

app.all('/app/*', (req, res) => res.status(404).send());


// router.post('/api/v2017/articles/tags', async(req, res) => {
//     let data = await getCalaisTagging(req, res);

//     return res.status(200).send(data.data);
// });

// app.all('/api/v2015/temporary-files', (req, res) => proxy.web(req, res, {target: 'http://localhost:8000', changeOrigin: true, secure:false }));

// app.all('/api/v2017/*', (req, res) => {
//     console.log(req.url)
//     proxy.web(req, res, {
//         target: 'http://localhost:8000',
//         changeOrigin: true, secure:false 
//     })
// });

app.all('/api/*', (req, res) => proxy.web(req, res, {
    target: 'https://api.cbddev.xyz',
    changeOrigin: true, secure:false 
}));
// Configure template

app.get('/*', function (req, res) {
    res.cookie('VERSION', process.env.COMMIT || '');
    res.sendFile(__dirname + '/app/template.html');
});

// Start HTTP server

app.listen(process.env.PORT || 2012, '0.0.0.0', function () {
    console.log('Server listening on %j', this.address());
});

// Handle proxy errors ignore

proxy.on('error', function (error, req, res) {
    console.error('proxy error:', error);
    res.status(502).send();
});

process.on('SIGTERM', () => process.exit());
