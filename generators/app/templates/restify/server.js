'use strict';

var Restify = require('restify');
var Swaggerize = require('swaggerize-restify');
var Path = require('path');

var Server = Restify.createServer();

Server.use(Restify.bodyParser());

Server.get('/api', function (req, res) {
    res.send(200);
});

Swaggerize(Server, {
    api: Path.resolve('<%=apiPathRel%>'),
    handlers: Path.resolve('<%=handlerPath%>')
});

Server.listen(8000, function () {
    Server.swagger.api.host = Server.address().address + ':' + Server.address().port;
});
