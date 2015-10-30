'use strict';

var Test = require('tape'),
    Path = require('path'),
    Hapi = require('hapi'),
    Enjoi = require('enjoi'),
    Swaggerize = require('swaggerize-hapi');

Test('api', function (t) {
    var server;

    t.test('server', function (t) {
        t.plan(1);

        server = new Hapi.Server();

        server.connection({});

        server.register({
            register: Swaggerize,
            options: {
                api: require('./<%=apiPath%>'),
                handlers: Path.join(__dirname, '<%=handlers%>')
            }
        }, function (err) {
            t.error(err, 'No error.');
        });
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
        var responseSchema = Enjoi({<%_.forEach(Object.keys(responseSchema), function (k, i) {%>
            '<%=k%>': <%=JSON.stringify(responseSchema[k])%><%if (i < Object.keys(responseSchema).length - 1) {%>, <%}%><%})%>
        }, {
            '#': require('<%=apiPath%>')
        });
        <%}%>
        var options = {
            method: '<%=operation.method.toLowerCase()%>',
            url: '<%=resourcePath%><%=path%>'
        };
        <%if (body && (operation.method.toLowerCase() === 'post' || operation.method.toLowerCase() === 'put')){%>
        options.payload = body;
        <%}%>
        server.inject(options, function (res) {
            t.strictEqual(res.statusCode, <%=responseCode%>, '<%=operation.method.toLowerCase()%> <%=operation.path%> <%=responseCode%> status.');<%if (responseSchema) {%>
            responseSchema.validate(res.payload, function (error) {
                t.ok(!error, 'Response schema valid.');
            });<%}%>
            t.end();
        });
    });
    <%});%>

});
