'use strict';

const Test = require('tape');
const Hapi = require('hapi');
const Swaggerize = require('swaggerize-hapi');
const Path = require('path');
const Mockgen = require('<%=mockgenPath.replace(/\\/g,'/')%>');

/**
 * Test for <%=path%>
 */
Test('<%=path%>', function (t) {
    
    <%operations.forEach(function (operation, i) {
        const mt = operation.method.toLowerCase();
    %>/**
     * summary: <%=operation.summary%>
     * description: <%=operation.description%>
     * parameters: <%=operation.parameters%>
     * produces: <%=operation.produces%>
     * responses: <%=operation.responses.join(', ')%>
     */
    t.test('test <%=operation.name%> <%=operation.method%> operation', async function (t) {

        const server = new Hapi.Server();

        await server.register({
            plugin: Swaggerize,
            options: {
                api: Path.resolve(__dirname, '<%=apiPathRel.replace(/\\/g,'/')%>'),
                handlers: Path.join(__dirname, '<%=handlerDir.replace(/\\/g,'/')%>'),
                outputvalidation: true
            }
        });

        const requests = new Promise((resolve, reject) => {
            Mockgen().requests({
                path: '<%=path%>',
                operation: '<%=operation.method%>'
            }, function (error, mock) {
                return error ? reject(error) : resolve(mock);
            });
        });

        const mock = await requests;

        t.ok(mock);
        t.ok(mock.request);
        //Get the resolved path from mock request
        //Mock request Path templates({}) are resolved using path parameters
        const options = {
            method: '<%=mt%>',
            url: '<%=basePath%>' + mock.request.path
        };
        if (mock.request.body) {
            //Send the request body
            options.payload = mock.request.body;
        } else if (mock.request.formData) {
            //Send the request form data
            options.payload = mock.request.formData;
            //Set the Content-Type as application/x-www-form-urlencoded
            options.headers = options.headers || {};
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        // If headers are present, set the headers.
        if (mock.request.headers && mock.request.headers.length > 0) {
            options.headers = mock.request.headers;
        }
        
        const response = await server.inject(options);

        t.equal(response.statusCode, <%=(operation.response === 'default') ? 200 : operation.response%>, 'Ok response status');
        t.end();

    });
    <%})%>
});
