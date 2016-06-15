'use strict';
/**
 * Model for <%=name%> definition
 * description : <%=description>
 */
function <%=name%>(options) {
    if (!options) {
        options = {};
    }
    <%properties.forEach(function (prop) {%>
    this.<%=prop%> = options.<%=prop%>;<%})%>
}

module.exports = <%=name%>;
