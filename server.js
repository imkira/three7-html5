var express = require('express');
var path = require('path');
var gzippo = require('gzippo');
var api = require('./lib/server/api');
var app = express.createServer();

api.initialize(app);

/**
 * Configure express
 */
app.configure(function() {
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(gzippo.staticGzip(__dirname + '/public/', { contentType : /image/ }));
});

app.get('/', function(req, res) {
  res.contentType('text/html');
  res.sendfile(path.normalize(__dirname + '/public/index.html'));
});

// listen server on specified address
app.listen(8080, function() {
  console.log('Open your browser at http://127.0.0.1:%d', app.address().port);
});
