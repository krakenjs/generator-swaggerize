'use strict';

var Hapi = require('hapi');
var Swaggerize = require('swaggerize-hapi');
var Path = require('path');

var Server = new Hapi.Server();

Server.connection({
    port: 8000
});

Server.register({
    register: Swaggerize,
    options: {
        api: Path.resolve('<%=apiPathRel%>'),
        handlers: Path.resolve('<%=handlerPath%>')
    }
}, function () {
    Server.start(function () {
        Server.plugins.swagger.setHost(Server.info.host + ':' + Server.info.port);
        /* eslint-disable no-console */
        console.log('App running on %s:%d', Server.info.host, Server.info.port);
        /* eslint-disable no-console */
    });
});
