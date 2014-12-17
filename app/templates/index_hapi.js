'use strict';

var Hapi = require('hapi'),
    Swaggerize = require('swaggerize-hapi');

var server = new Hapi.Server();

server.connection({
    port: 8000
});

server.register({
    register: Swaggerize,
    options: {
        api: require('./<%=apiPath%>'),
        handlers: './handlers'
    }
}, function (error) {
    server.start(function () {
        server.plugins.swagger.setHost(server.info.host + ':' + server.info.port);
    });
});
