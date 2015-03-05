'use strict';

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var swaggerize = require('swaggerize-express');
var path = require('path');

var app = express();

var server = http.createServer(app);

app.use(bodyParser.json());

app.use(swaggerize({
    api: path.resolve('./<%=apiPath%>'),
    handlers: path.resolve('./handlers')
}));

server.listen(8000, function () {
    app.setHost(server.address().address + ':' + server.address().port);
});
