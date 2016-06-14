'use strict';

/**
 * Operations on <%=path%>
 */
module.exports = {
    <%operations.forEach(function (operation, i) {%>
    /**
     * summary: <%=operation.summary%>
     * description: <%=operation.description%>
     * parameters: <%=operation.parameters%>
     * produces: <%=operation.produces%>
     * responses: <%=operation.responses%>
     */
    <%=operation.method%>: function <%=operation.name%>(req, res) {
        res.send(501);
    }<%if (i < operations.length - 1) {%>, <%}%>
    <%})%>
};
