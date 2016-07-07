'use strict';
var Util = require('../lib/util');
var Frameworks = Util.Frameworks;

module.exports = function prompt(name, generator) {

    var validate = function (propName) {
        return !!propName;
    };

    var apiPath = [{
        name: 'apiPath',
        message: 'Path (or URL) to swagger document:',
        required: true,
        when: function () {
            return !generator.apiPath;
        },
        default: generator.apiPath,
        validate: validate
    }];

    var framework = [{
        type: 'list',
        name: 'framework',
        message: 'Framework:',
        default: generator.framework,
        when: function () {
            return !generator.framework;
        },
        choices: Frameworks.map(function (framework) {
            return {
                name: framework,
                value: framework
            };
        })
    }];

    var app = [
        {
            name: 'appName',
            message: 'What would you like to call this project:',
            default: generator.appName, // Default to current folder name
            validate: validate
        },
        {
            name: 'creatorName',
            message: 'Your name:',
            validate: validate
        },
        {
            name: 'githubUser',
            message: 'Your github user name:',
            validate: validate
        },
        {
            name: 'email',
            message: 'Your email:',
            validate: validate
        }
    ];

    var propmts = {
        data : function () {
            return apiPath;
        },
        handler: function () {
            return apiPath.concat(framework);
        },
        test: function () {
            return apiPath.concat(framework);
        },
        app: function () {
            return apiPath.concat(framework).concat(app);
        }
    };

    return propmts[name]();
};
