'use strict';

const Hapi = require('hapi');
const Swaggerize = require('swaggerize-hapi');
const Path = require('path');

const init = async function() {
    const server = new Hapi.Server();

    await server.register({
        plugin: Swaggerize,
        options: {
            api: Path.resolve('<%=apiPathRel.replace(/\\/g,'/')%>'),
            handlers: Path.resolve('<%=handlerPath.replace(/\\/g,'/')%>')
        }
    });

    await server.start();

    return server;
};

init().then((server) => {
    server.plugins.swagger.setHost(server.info.host + ':' + server.info.port);

    server.log(['info'], `Server running on ${server.info.host}:${server.info.port}`);
});
