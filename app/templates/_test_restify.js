'use strict';

var test = require('tape'),
    path = require('path'),
    restify = require('restify'),
    enjoi = require('enjoi'),
    jsYaml = require('js-yaml'),
    fs = require('fs'),
    swaggerize = require('swaggerize-restify'),
    request = require('supertest');

test('api', function (t) {
    var server = restify.createServer();

    <%_.forEach(operations, function (operation) { if (operation.method.toLowerCase() === 'post' || operation.method.toLowerCase() === 'put') { %>
    server.use(restify.bodyParser());<%}});%>

    swaggerize(server, {
        api: path.join(__dirname, './<%=apiPath%>'),
        handlers: path.join(__dirname, '<%=handlers%>')
    });

    <%_.forEach(operations, function (operation) {%>
    t.test('test <%=operation.method%> <%=operation.path%>', function (t) {
        <%
        var path = operation.path;
        var body;
        var responseCode = operation.responses && Object.keys(operation.responses)[0];
        var response = responseCode && operation.responses[responseCode];
        var responseSchema = response && response.schema;
        if (operation.parameters && operation.parameters.length) {
            _.forEach(operation.parameters, function (param) {
                if (param.in === 'path') {
                    path = operation.path.replace(/{([^}]*)}*/, function (p1, p2) {
                        switch (param.type) {
                            case 'integer':
                            case 'number':
                            case 'byte':
                                return 1;
                            case 'string':
                                return 'helloworld';
                            case 'boolean':
                                return true;
                            default:
                                return '{' + p2 + '}';
                        }
                    });
                }
                if (param.in === 'body') {
                    body = models[param.schema.$ref.slice(param.schema.$ref.lastIndexOf('/') + 1)];
                }
            });
        }
        if (body && (operation.method.toLowerCase() === 'post' || operation.method.toLowerCase() === 'put')) {%>
        var body = {<%_.forEach(Object.keys(body).filter(function (k) { return !!body[k]; }), function (k, i) {%>
            '<%=k%>': <%=JSON.stringify(body[k])%><%if (i < Object.keys(body).filter(function (k) { return !!body[k]; }).length - 1) {%>, <%}%><%})%>
        };
        <%} if (responseSchema) {%>
        var responseSchema = enjoi({<%_.forEach(Object.keys(responseSchema), function (k, i) {%>
            '<%=k%>': <%=JSON.stringify(responseSchema[k])%><%if (i < Object.keys(responseSchema).length - 1) {%>, <%}%><%})%>
        }, {
          '#': <%if (apiPath.indexOf('.yaml') === apiPath.length - 5 || apiPath.indexOf('.yml') === apiPath.length - 4) {%> jsYaml.load(fs.readFileSync(path.join(__dirname, './<%=apiPath%>'))) <% }else{ %> require(path.join(__dirname, './<%=apiPath%>')) <% } %>
        });
        <%}%>

        request(server).<%=operation.method.toLowerCase()%>('<%=resourcePath%><%=path%>')
        .expect(200)<%if (body && (operation.method.toLowerCase() === 'post' || operation.method.toLowerCase() === 'put')){%>.send(body)<%}%>
        .end(function (err, res) {
            t.ok(!err, '<%=operation.method.toLowerCase()%> <%=operation.path%> no error.');
            t.strictEqual(res.statusCode, <%=responseCode%>, '<%=operation.method.toLowerCase()%> <%=operation.path%> <%=responseCode%> status.');<%if (responseSchema) {%>
            responseSchema.validate(res.body, function (error) {
                t.ok(!error, 'Response schema valid.');
            });<%}%>
            t.end();
        });
    });
    <%});%>

});
