'use strict';

const Hapi = require('hapi');
const HapiOpenAPI = require('hapi-openapi');
const Path = require('path');

const init = async function() {
    const server = new Hapi.Server();

    await server.register({
        plugin: HapiOpenAPI,
        options: {
            api: Path.resolve('<%=apiPathRel.replace(/\\/g,'/')%>'),
            handlers: Path.resolve('<%=handlerPath.replace(/\\/g,'/')%>')
        }
    });

    await server.start();

    return server;
};

init().then((server) => {
    server.plugins.openapi.setHost(server.info.host + ':' + server.info.port);

    server.log(['info'], `Server running on ${server.info.host}:${server.info.port}`);
});
