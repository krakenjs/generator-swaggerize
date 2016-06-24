'use strict';
var Test = require('tape');
var Hapi = require('hapi');
var Swaggerize = require('swaggerize-hapi');
var Path = require('path');
var Mockgen = require('<%=mockgenPath%>');
var Parser = require('swagger-parser');
/**
 * Test for <%=path%>
 */
Test('<%=path%>', function (t) {
    var apiPath = Path.resolve(__dirname, '<%=apiPathRel%>');
    var server;

    Parser.validate(apiPath, function (err, api) {
        t.error(err, 'No parse error');
        t.ok(api, 'Valid swagger api');
        t.test('server', function (t) {
            t.plan(1);
            server = new Hapi.Server();
            server.connection({});
            server.register({
                register: Swaggerize,
                options: {
                    api: apiPath,
                    handlers: Path.join(__dirname, '<%=handlerDir%>')
                }
            }, function (err) {
                t.error(err, 'No error.');
            });
        });
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
                var options;
                t.error(err);
                t.ok(mock);
                t.ok(mock.request);
                //Get the resolved path from mock request
                //Mock request Path templates({}) are resolved using path parameters
                options = {
                    method: '<%=mt%>',
                    url: '<%=basePath%>' + mock.request.path
                };
                <%
                //Send the request body for `post` and `put` operations
                if (mt === 'post' || mt === 'put')
                {%>if (mock.request.body) {
                    //Send the request body
                    options.payload = mock.request.body;
                } else if (mock.request.formData) {
                    //Send the request form data
                    options.payload = mock.request.formData;
                    //Set the Content-Type as application/x-www-form-urlencoded
                    options.headers = options.headers || {};
                    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                }<%}%>
                // If headers are present, set the headers.
                if (mock.request.headers && mock.request.headers.length > 0) {
                    options.headers = mock.request.headers;
                }
                server.inject(options, function (res) {
                    <% if (operation.response) {
                    %>t.ok(res.statusCode === <%=(operation.response === 'default')?200:operation.response%>, 'Ok response status');<%}%>
                    <% if (operation.validateResp) {
                    %>var Validator = require('is-my-json-valid');
                    var validate = Validator(api.paths['<%=path%>']['<%=operation.method%>']['responses']['<%=operation.response%>']['schema']);
                    t.ok(validate(res.result || res.payload), 'Valid response');
                    <%}%>t.end();
                });
            });
        });<%})%>
    });
});
