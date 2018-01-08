'use strict';

const Boom = require('boom');

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
     */
    <%=operation.method%>: function <%=operation.name%>(request, h) {
        return Boom.notImplemented();
    }<%if (i < operations.length - 1) {%>,
    <%}%><%});%>
};
