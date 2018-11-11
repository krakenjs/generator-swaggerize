'use strict';

var Http = require('http');
var Express = require('express');
var BodyParser = require('body-parser');
var Swaggerize = require('swaggerize-express');
var Path = require('path');

var App = Express();

var Server = Http.createServer(App);
App.use(cors())
App.use(BodyParser.json());
App.use(BodyParser.urlencoded({
    extended: true
}));

App.use(Swaggerize({
    api: Path.resolve('<%=apiPathRel.replace(/\\/g,'/')%>'),
    handlers: Path.resolve('<%=handlerPath.replace(/\\/g,'/')%>')<%if (security) {%>,
    security: Path.resolve('<%=securityPath.replace(/\\/g,'/')%>')<%}%>
}));

Server.listen(8000, function () {
    App.swagger.api.host = this.address().address + ':' + this.address().port;
    /* eslint-disable no-console */
    console.log('App running on %s:%d', this.address().address, this.address().port);
    /* eslint-disable no-console */
});
