'use strict';
var Util = require('./util');
var Path = require('path');
var operationType = Util.operationType;

module.exports = function routegen (generator, path, pathObj) {

    var pathStr = path.replace(/^\/|\/$/g, '');
    var mockgenPath = Path.join(generator.dataPath, 'mockgen.js');
    var dataPath = Path.join(generator.dataPath, pathStr + '.js');
    var route = {
        basePath: (generator.api.basePath && generator.api.basePath !== '/') ? generator.api.basePath : '',
        path: path,
        apiPathRel: Util.relative(generator.genFilePath, generator.apiConfigPath),
        mockgenPath: Util.relative(generator.genFilePath, generator.destinationPath(mockgenPath)),
        dataPath: Util.relative(generator.genFilePath, generator.destinationPath(dataPath)),
        handlerDir: Util.relative(generator.genFilePath, generator.destinationPath(generator.handlerPath)),
        operations: []
    };

    Object.keys(pathObj).forEach(function (method) {
        var commonParams = [];
        var operationObj = pathObj[method];
        method = method.toLowerCase();
        if (method === 'parameters') {
            /*
             * A list of parameters that are applicable for all the operations described under this path.
             * These parameters can be overridden at the operation level, but cannot be removed there.
             * The list MUST NOT include duplicated parameters
             */
            commonParams = operationObj;
        } else if (operationType.indexOf(method) !== -1) {
            /*
             * The operation for the Path. get, post. put etc.
             */
            var parameters = commonParams;
            var validateResp = false;
            var response;
            var responses = operationObj.responses;
            var respArr = responses ? Object.keys(responses): [];
            if (respArr.length > 0 ) {
                //Sort the array to maintain the order of keys.
                //Use the first response as the default response
                response = respArr.sort()[0];
                if(responses[response] && responses[response].schema) {
                    validateResp = true;
                }
            }
            if (operationObj.parameters) {
                parameters = commonParams.concat(operationObj.parameters);
            }

            route.operations.push({
                name: operationObj.operationId,
                description: operationObj.description,
                summary: operationObj.summary,
                method: method,
                parameters: parameters && parameters.map(function (p) { return p.name; }).join(', '),
                produces: operationObj.produces && operationObj.produces.join(', '),
                responses:  respArr,
                response: response,
                validateResp: validateResp
            });
        }
    });

    return route;
};
