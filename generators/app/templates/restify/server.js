'use strict';

var Restify = require('restify');
var Swaggerize = require('swaggerize-restify');
var Path = require('path');

var Server = Restify.createServer();

Server.use(Restify.bodyParser());
Server.use(Restify.queryParser());

Server.get('/api', function (req, res) {
    res.send(200);
});

Swaggerize(Server, {
    api: Path.resolve('<%=apiPathRel.replace(/\\/g,'/')%>'),
    handlers: Path.resolve('<%=handlerPath.replace(/\\/g,'/')%>')
});

Server.listen(8000, function () {
    Server.swagger.api.host = Server.address().address + ':' + Server.address().port;
    /* eslint-disable no-console */
    console.log('App running on %s:%d', Server.address().address, Server.address().port);
    /* eslint-disable no-console */
});
