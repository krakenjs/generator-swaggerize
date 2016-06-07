'use strict';
var Generators = require('yeoman-generator');
var Parser = require('swagger-parser');
var Fs = require('fs');
var Path = require('path');

var Frameworks = [
    'express',
    'hapi',
    'restify'
];

module.exports = Generators.Base.extend({
    constructor: function () {
        Generators.Base.apply(this, arguments);
        /*
         * Options :
         *  --only
         *  --framework
         *  --apiPath
         *  --handlerPath
         */
        this.option('only');
        this.option('framework');
        this.option('apiPath');
        this.option('handlerPath');
    },
    initializing: {
        helloMsg: function () {
            this.log('Swaggerize Generator');
            this.log('Tell us a bit about your application');
        },
        //Validate the apiPath option in the beginning itself. Prompt for user input if the option is an invalid path.
        apiPath: function () {
            var done = this.async();
            this.apiPath = this.options.apiPath;
            if (this.apiPath) {
                this._parse(done);
            } else {
                done();
            }
        },
        sefDefaults: function () {
            var self = this;
            var basePath = Path.resolve(process.cwd());
            var pkgPath = Path.resolve(basePath, 'package.json');
            var framework;
            this.appName = Path.basename(basePath);
            //If package.json exists, get the default framework details from package.json dependencies
            if (Fs.existsSync(pkgPath)) {
                this.appPkg = require(pkgPath);
                for (var i in Frameworks) {
                    framework = Frameworks[i];
                    if (this.appPkg.dependencies && Object.keys(this.appPkg.dependencies).indexOf(framework) !== -1) {
                        self.framework = framework;
                        break;
                    }
                }
            }
            this.only = this.options.only;
            this.only = this.only ? this.only.split(',') : [];
            this.framework = this.options.framework || this.framework || 'express';
            this.handlerPath = this.options.handlerPath || 'handlers';
        }
    },
    _parse: function (done) {
        var self = this;
        Parser.validate(this.apiPath, function (error, api) {
            if (error) {
                done(error);
                return;
            }
            self.api = api;
            done();
        });
    },
    prompting: function () {
        var done = this.async();
        var self = this;
        var validate = function (propName) {
            return !!propName;
        }
        var when = function () {
            return self.only.length === 0;
        };

        this.prompt([{
            name: 'appName',
            message: 'What would you like to call this project:',
            default: this.appName, // Default to current folder name
            when: when,
            validate: validate
        },
        {
            name: 'creatorName',
            message: 'Your name:',
            when: when,
            validate: validate
        },
        {
            name: 'githubUser',
            message: 'Your github user name:',
            when: when,
            validate: validate
        },
        {
            name: 'email',
            message: 'Your email:',
            when: when,
            validate: validate
        },
        //Following are required props
        {
            name: 'apiPath',
            message: 'Path (or URL) to swagger document:',
            required: true,
            when: function () {
                return !this.apiPath;
            },
            default: this.apiPath,
            validate: validate
        },
        {
            type: 'list',
            name: 'framework',
            message: 'Framework:',
            when: when,
            default: this.framework,
            choices: Frameworks.map(function (framework) {
                return {
                    name: framework,
                    value: framework
                };
            })
        }], function (answers) {
            var self = this;
            Object.keys(answers).forEach(function (prop) {
                if (answers[prop] !== null && answers[prop] !== undefined) {
                    self[prop] = answers[prop];
                }
            });
            //parse the API
            if (answers.apiPath) {
                this._parse(done);
            }
        }.bind(this));
    }
});
