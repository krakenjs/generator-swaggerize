'use strict';

var Hapi = require('hapi'),
    Swaggerize = require('swaggerize-hapi');

var server = new Hapi.Server();

server.pack.register({
    plugin: Swaggerize,
    options: {
        api: require('./config/pets.json'),
        handlers: './handlers'
    }
}, function (error) {
    server.start(function () {
        server.plugins.swaggerize.setUrl(server.info.host + ':' + server.info.port);
    });
});
