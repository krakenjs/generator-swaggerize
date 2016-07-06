'use strict';
var Swagmock = require('swagmock');
var Path = require('path');
var apiPath = Path.resolve(__dirname, '<%=apiConfigPath.replace(/\\/g,'/')%>');
var mockgen;

module.exports = function () {
    /**
     * Cached mock generator
     */
    mockgen = mockgen || Swagmock(apiPath);
    return mockgen;
};
