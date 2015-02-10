'use strict';

var Hapi = require('hapi');
var Swaggerize = require('swaggerize-hapi');
var Path = require('path');

var server = new Hapi.Server();

server.connection({
    port: 8000
});

server.register({
    register: Swaggerize,
    options: {
        api: Path.resolve('./<%=apiPath%>'),
        handlers: Path.resolve('./handlers')
    }
}, function (error) {
    server.start(function () {
        server.plugins.swagger.setHost(server.info.host + ':' + server.info.port);
    });
});
