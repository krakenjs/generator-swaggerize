'use strict';
var Path = require('path');
var Fs = require('fs');
var Parser = require('swagger-parser');
var Pkg = require('../../package.json');
/**
 * List of supported frameworks
 */
var Frameworks = [
    'express',
    'hapi',
    'restify'
];

/**
 * List of supported operations
 */
var operationType = [
    'get',
    'post',
    'put',
    'delete',
    'head',
    'options',
    'patch'
];

module.exports = {
    Frameworks: Frameworks,
    relative: buildRelativePath,
    operationType: operationType,
    appFramework: appFramework,
    setDefaults: setDefaults,
    validateApi: validateApi,
    updateConfigPath: updateConfigPath
};
/**
 * Build relative path for module import.
 */
function buildRelativePath (from, to) {
    var dirname = Path.dirname(from);
    var relative = Path.relative(dirname, to);
    if (startsWith(relative, '.' + Path.sep) || startsWith(relative, '..' + Path.sep)) {
        //Path is not originating from dirname
        return relative;
    } else {
        //Path is originating from dirname. Prefix `./` for dirname
        return '.' + Path.sep + relative;
    }
}
/**
 * Find the existing framework dependency of the application
 */
function appFramework (basePath) {
    var pkgPath = Path.resolve(basePath, 'package.json');
    var appPkg;
    var appFramework;
    var framework;
    if (Fs.existsSync(pkgPath)) {
        appPkg = require(pkgPath);
        for (var i in Frameworks) {
            framework = Frameworks[i];
            if (appPkg.dependencies && Object.keys(appPkg.dependencies).indexOf(framework) !== -1) {
                appFramework = framework;
                break;
            }
        }
    }
    return appFramework;
}

function setDefaults (generator) {
    /**
     * Assume that this.destinationRoot() is the base path and direcory name is the appname default.
     */
    var basePath = generator.destinationRoot();
    updateConfigPath(generator);
    generator.appName = Path.basename(basePath);
    generator.framework = generator.options.framework || generator.framework || appFramework(basePath);
    generator.handlerPath = generator.options.handlerPath || '.' + Path.sep + 'handlers';
    generator.testPath = generator.options.testPath || '.' + Path.sep + 'tests';
    generator.dataPath = generator.options.dataPath || '.' + Path.sep + 'data';
    generator.mockgenPath = Path.join(generator.dataPath, 'mockgen.js');
    generator.securityPath = generator.options.securityPath || '.' + Path.sep + 'security';
    generator.security = false;
    if (generator.api
        && generator.api.securityDefinitions
        && Object.keys(generator.api.securityDefinitions).length > 0) {
        generator.security = true;
    }
    generator.generatorVersion = Pkg.version;
}

/**
 * Update the apiConfigPath values based on options or user prompts
 */
function updateConfigPath (generator) {
    var ext = '.json';
    generator.ymlApi = false;
    if (generator.apiPath
        && ('.yml' === Path.extname(generator.apiPath) || '.yaml' === Path.extname(generator.apiPath))) {
        ext = Path.extname(generator.apiPath);
        generator.ymlApi = true;
    }
    generator.apiPathRel = '.' + Path.sep + 'config' + Path.sep + 'swagger' + ext;
    generator.apiConfigPath = generator.options.apiConfigPath || Path.join(generator.destinationPath(), generator.apiPathRel);
}

function startsWith(str, substr) {
    if (str.substr(0, substr.length) === substr) {
        return true;
    }
    return false;
}

function validateApi (generator, done) {
    //Validate the api and deference $ref schemas.
    Parser.validate(generator.apiPath, function (error, api) {
        if (error) {
            done(error);
            return;
        }
        generator.api = api;
        //Dereferenced and resolved $ref objects cannot be used in the local copy of the swagger api.
        //So use `parse` API to save the api with references.
        Parser.parse(generator.apiPath, function (error, refApi) {
            if (error) {
                done(error);
                return;
            }
            generator.refApi = refApi;
            done();
        });
    });
}
