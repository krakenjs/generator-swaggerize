'use strict';

var Test = require('tape'),
    Path = require('path'),
    Hapi = require('hapi'),
    Swaggerize = require('swaggerize-hapi');

Test('api', function (t) {
    var server = new Hapi.Server();

    server.pack.register({
        plugin: Swaggerize,
        options: {
            api: require('<%=apiPath%>'),
            handlers: Path.join(__dirname, '<%=handlers%>')
        }
    });

    <%_.forEach(operations, function (operation) {%>
    t.test('test <%=operation.method%> <%=operation.path%>', function (t) {
        <%
        var path = operation.path;
        var body;
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
        }%>t.plan(1);
        <%if (operation.method.toLowerCase() === 'post' || operation.method.toLowerCase() === 'put'){%>
        var body = {<%_.forEach(Object.keys(body).filter(function (k) { return !!body[k]; }), function (k, i) {%>
            '<%=k%>': <%=JSON.stringify(body[k])%><%if (i < Object.keys(body).filter(function (k) { return !!body[k]; }).length - 1) {%>, <%}%><%})%>
        };
        <%}%>
        var options = {
            method: '<%=operation.method.toLowerCase()%>',
            url: '<%=resourcePath%><%=path%>'
        };
        <%if (operation.method.toLowerCase() === 'post' || operation.method.toLowerCase() === 'put'){%>
        options.payload = body;
        <%}%>
        server.inject(options, function (res) {
            t.strictEqual(res.statusCode, 200, '<%=operation.method.toLowerCase()%> <%=operation.path%> 200 status.');
        });
    });
    <%});%>

});
x
