'use strict';

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var swaggerize = require('swaggerize-express');

var app = express();

var server = http.createServer(app);

app.use(bodyParser.json());

app.get('/api', function (req, res) {
    res.send(200);
});

app.use(swaggerize({
    api: require('./<%=apiPath%>'),
    handlers: './handlers'
}));

server.listen(8000, function () {
    app.setHost(server.address().address + ':' + server.address().port);
});
