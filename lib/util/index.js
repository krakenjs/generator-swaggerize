'use strict';
var Path = require('path');
var Fs = require('fs');
var Parser = require('swagger-parser');
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
    sefDefaults: sefDefaults,
    validateApi: validateApi
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

function sefDefaults (generator) {
    /**
     * Assume that this.destinationRoot() is the base path and direcory name is the appname default.
     */
    var basePath = generator.destinationRoot();
    generator.apiPathRel = '.' + Path.sep + 'config' + Path.sep + 'swagger.json';
    generator.apiConfigPath = generator.options.apiConfigPath || Path.join(generator.destinationPath(), generator.apiPathRel);
    generator.appName = Path.basename(basePath);
    generator.framework = generator.options.framework || generator.framework || appFramework(basePath);
    generator.handlerPath = generator.options.handlerPath || '.' + Path.sep + 'handlers';
    generator.testPath = generator.options.testPath || '.' + Path.sep + 'tests';
    generator.dataPath = generator.options.dataPath || '.' + Path.sep + 'data';
    generator.mockgenPath = Path.join(generator.dataPath, 'mockgen.js');
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
