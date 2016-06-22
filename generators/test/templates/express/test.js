'use strict';
var Test = require('tape');
var Express = require('express');
var BodyParser = require('body-parser');
var Swaggerize = require('swaggerize-express');
var Path = require('path');
var Request = require('supertest');
var Mockgen = require('<%=mockgenPath%>');
var Validator = require('is-my-json-valid');
var Parser = require('swagger-parser');
/**
 * Test for <%=path%>
 */
Test('<%=path%>', function (t) {
    var apiPath = Path.resolve(__dirname, '<%=apiPathRel%>');
    var App = Express();
    App.use(BodyParser.json());
    App.use(Swaggerize({
        api: apiPath,
        handlers: Path.resolve(__dirname, '<%=handlerPath%>')
    }));
    <%if (operations && operations.length > 0) {
    %>Parser.validate(apiPath, function (err, api) {
        t.ok(!err, 'No parse error');
        t.ok(api, 'Valid swagger api');
        <%operations.forEach(function (operation, i) {
            var mt = operation.method.toLowerCase();
        %>/**
         * summary: <%=operation.summary%>
         * description: <%=operation.description%>
         * parameters: <%=operation.parameters%>
         * produces: <%=operation.produces%>
         * responses: <%=operation.responses.join(', ')%>
         */
        t.test('test <%=operation.name%> <%=operation.method%> operation', function (t) {
            Mockgen().requests({
                path: '<%=path%>',
                operation: '<%=operation.method%>'
            }, function (err, mock) {
                var request;
                t.ok(!err);
                t.ok(mock);
                t.ok(mock.request);
                //Get the resolved path from mock request
                //Mock request Path templates({}) are resolved using path parameters
                request = Request(App)
                    .<%=mt%>('<%=basePath%>' + mock.request.path);
                <%
                //Send the request body for `post` and `put` operations
                if (mt === 'post' || mt === 'put') {%>
                if (mock.request.body) {
                    //Send the request body
                    request.send(mock.request.body);
                }<%}%>
                // If headers are present, set the headers.
                if (mock.request.headers && mock.request.headers.length > 0) {
                    Object.keys(mock.request.headers).forEach(function (headerName) {
                        request.set(headerName, mock.request.headers[headerName]);
                    });
                }
                request.end(function (err, res) {
                    t.ok(!err, 'No error');
                    <% if (operation.response) {
                    %>t.ok(res.statusCode === <%=(operation.response === 'default')?200:operation.response%>, 'Ok response status');<%}%>
                    <% if (operation.validateResp) {
                    %>var validate = Validator(api.paths['<%=path%>']['<%=operation.method%>']['responses']['<%=operation.response%>']['schema']);
                    t.ok(validate(res.body), 'Valid response');
                    <%}%>t.end();
                });
            });
        });<%})%>
    });<%}%>
});
