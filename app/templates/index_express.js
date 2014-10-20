'use strict';

var http = require('http');
var express = require('express');
var swaggerize = require('swaggerize-express');

app = express();

var server = http.createServer(app);

app.use(swaggerize({
    api: require('./config/pets.json'),
    handlers: './handlers'
}));

server.listen(8000, 'localhost', function () {
    app.setHost(server.address().address + ':' + server.address().port);
});
