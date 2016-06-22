'use strict';
var Mockgen = require('<%=mockgenPath%>');
/**
 * Operations on <%=path%>
 */
module.exports = {
    <%operations.forEach(function (operation, i)
    {%>/**
     * summary: <%=operation.summary%>
     * description: <%=operation.description%>
     * parameters: <%=operation.parameters%>
     * produces: <%=operation.produces%>
     * responses: <%=operation.responses.join(', ')%>
     * operationId: <%=operation.name%>
     */
    <%=operation.method%>: {
        <%operation.responses && operation.responses.forEach(function (response, i)
        {%><%=response%>: function (req, res, callback) {
            /**
             * Using mock data generator module.
             * Replace this by actual data for the api.
             */
            Mockgen.responses({
                path: '<%=path%>',
                operation: '<%=operation.method%>',
                response: '<%=response%>'
            }, callback);
        }<%if (i < operation.responses.length - 1) {%>,
        <%}%><%})%>
    }<%if (i < operations.length - 1) {%>,
    <%}%><%});%>
};
