'use strict';
var Path = require('path');
var Fs = require('fs');
var JsYaml = require('js-yaml');

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

function mockOptions(options) {
    var apiRelPath = './config/swagger.json';
    options = options || {};
    if ('.yml' === Path.extname(options.apiPath) || '.yaml' === Path.extname(options.apiPath)) {
        apiRelPath = './config/swagger.yaml';
    }
    return {
        framework: options.framework || 'express',
        apiPath: options.apiPath || Path.join(__dirname, '../fixture/petstore_no_security.json'),
        apiRelPath: apiRelPath,
        dataPath: options.dataPath || './data',
        handlerPath: options.handlerPath || './handlers',
        testPath: options.testPath || './tests',
        securityPath: options.securityPath || './security'
    };
}

function buildRouteFiles (prefix, api) {
    var apiObj = loadApi(api);
    var routes = [];
    if (apiObj.paths) {
        routes = Object.keys(apiObj.paths).map(function (pathStr) {
            return Path.join(prefix, pathStr.replace(/^\/|\/$/g, '') + '.js');
        });
    }
    return routes;
}

function buildSecurityFiles (prefix, api) {
    var apiObj = loadApi(api);
    var routes = [];
    if (apiObj.securityDefinitions) {
        routes = Object.keys(apiObj.securityDefinitions).map(function (pathStr) {
            return Path.join(prefix, pathStr + '.js');
        });
    }
    return routes;
}

function loadApi (api) {
    api = api || Path.join(__dirname, '../fixture/petstore_no_security.json');
    if ('.yml' === Path.extname(api) || '.yaml' === Path.extname(api)) {
        return JsYaml.load(Fs.readFileSync(api));
    } else {
        return require(api);
    }
}
