'use strict';
/**
 * Authorize function for securityDefinitions:<%=name%>
 * type : <%=type%>
 * description: <%=description%>
 */
module.exports = function authorize(req, res, next) {
    //The context('this') for authorize will be bound to the 'securityDefinition'
    <%if (type === 'oauth2') {
    %>//this.authorizationUrl - The authorization URL for securityDefinitions:<%=name%>
    //this.scopes - The available scopes for the securityDefinitions:<%=name%> security scheme
    //this.flow - The flow used by the securityDefinitions:<%=name%> OAuth2 security scheme

    //req.requiredScopes - list of scope names required for the execution (defined as part of security requirement object).
    <%} else if (type === 'apiKey') {
    %>//this.name - The name of the header or query parameter to be used for securityDefinitions:<%=name%> apiKey security scheme.
    //this.in - The location of the API key ("query" or "header") for securityDefinitions:<%=name%> apiKey security scheme.
    <%}%>

    //Perform auth here

    next();
};
