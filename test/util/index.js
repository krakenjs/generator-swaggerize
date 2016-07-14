'use strict';
var Path = require('path');

var dotFiles = [
    '.eslintrc',
    '.gitignore',
    '.npmignore'
];
var projectFiles = [
    'package.json',
    'README.md'
];

module.exports = {
    prompt: mockPrompt,
    options: mockOptions,
    dotFiles: dotFiles,
    projectFiles: projectFiles,
    routeFiles: buildRouteFiles,
    securityFiles: buildSecurityFiles
};

function mockPrompt (name) {
    var mockPrompts = {
        app : {
            appName: 'mockapp',
            creatorName: 'lorem ipsum',
            githubUser: 'loremipsum',
            email: 'loremipsum@awesome.com',
            framework: 'express',
            apiPath: Path.join(__dirname, '../fixture/petstore_no_security.json'),
            'skip-npm-install': true
        },
        data: {
            apiPath: Path.join(__dirname, '../fixture/petstore_no_security.json')
        },
        handler: {
            framework: 'hapi',
            apiPath: Path.join(__dirname, '../fixture/petstore_no_security.json')
        },
        test: {
            framework: 'restify',
            apiPath: Path.join(__dirname, '../fixture/petstore_no_security.json')
        }
    };
    return mockPrompts[name];
}

function mockOptions() {
    return {
        framework: 'express',
        apiPath: Path.join(__dirname, '../fixture/petstore_no_security.json'),
        apiRelPath: './config/swagger.json',
        dataPath: './data',
        handlerPath: './handlers',
        testPath: './tests'
    };
}

function buildRouteFiles (prefix, api) {
    api = api || Path.join(__dirname, '../fixture/petstore_no_security.json');
    var apiObj = require(api);
    var routes = [];
    if (apiObj.paths) {
        routes = Object.keys(apiObj.paths).map(function (pathStr) {
            return Path.join(prefix, pathStr.replace(/^\/|\/$/g, '') + '.js');
        });
    }
    return routes;
}

function buildSecurityFiles (prefix, api) {
    api = api || Path.join(__dirname, '../fixture/petstore_no_security.json');
    var apiObj = require(api);
    var routes = [];
    if (apiObj.securityDefinitions) {
        routes = Object.keys(apiObj.securityDefinitions).map(function (pathStr) {
            return Path.join(prefix, pathStr + '.js');
        });
    }
    return routes;
}
