'use strict';
var Generators = require('yeoman-generator');
var Parser = require('swagger-parser');
var Fs = require('fs');
var Path = require('path');
var _ = require('underscore.string');

var Frameworks = require('../../lib/util').Frameworks;

module.exports = Generators.Base.extend({
    constructor: function () {
        Generators.Base.apply(this, arguments);
        /*
         * Options :
         *  --framework
         *  --apiPath
         *  --handlerPath
         */
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
                this._validateSpec(done);
            } else {
                done();
            }
        },
        sefDefaults: function () {
            var self = this;
            /**
             * Assume that this.destinationRoot() is the base path and direcory name is the appname default.
             */
            var basePath = this.destinationRoot();
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
            this.framework = this.options.framework || this.framework;
            this.handlerPath = this.options.handlerPath || '.' + Path.sep + 'handlers';
            this.testPath = this.options.testPath || '.' + Path.sep + 'tests';
            this.dataPath = this.options.dataPath || '.' + Path.sep + 'data';
        }
    },
    _validateSpec: function (done) {
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
        this.prompt([{
            name: 'appName',
            message: 'What would you like to call this project:',
            default: this.appName, // Default to current folder name
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
        },
        //Following are required props
        {
            name: 'apiPath',
            message: 'Path (or URL) to swagger document:',
            required: true,
            when: function () {
                return !self.apiPath;
            },
            default: this.apiPath,
            validate: validate
        },
        {
            type: 'list',
            name: 'framework',
            message: 'Framework:',
            default: this.framework,
            when: function () {
                return !self.framework;
            },
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

            //parse and validate the Swagger API entered by the user.
            if (answers.apiPath) {
                this._validateSpec(done);
            } else {
                done();
            }

        }.bind(this));
    },
    configuring: function () {
        var oldRoot = this.destinationRoot();
        //Set the destination root based on appname.
        if (this.appName && Path.basename(oldRoot) !== this.appName) {
            this.destinationRoot(Path.join(oldRoot, this.appName));
        }

        this.apiPathRel = '.' + Path.sep + 'config' + Path.sep + 'swagger.json';
        this.apiConfigPath = Path.join(this.destinationPath(), this.apiPathRel);
        this.slugAppName = _.slugify(this.appName);
    },
    writing: {
        app: function () {
            var self = this;
            this.fs.copy(
                this.templatePath('.*'),
                this.destinationPath()
            );
            //Templates
            ['package.json', 'README.md'].forEach(function (file) {
                self.fs.copyTpl(
                    self.templatePath(file),
                    self.destinationPath(file),
                    self
                );
            });
            this.fs.copyTpl(
                this.templatePath(Path.join(this.framework, 'server.js')),
                this.destinationPath('server.js'),
                this
            );
        },
        tests: function () {
            this.composeWith('swaggerize:test', {
                options: {
                    api: this.api,
                    apiPath: this.apiPath,
                    apiConfigPath: this.apiConfigPath,
                    handlerPath: this.handlerPath,
                    testPath: this.testPath,
                    dataPath: this.dataPath,
                    framework: this.framework
                }
            }, {
                local: require.resolve('../test')
            });
        }
    },
    install: function () {
        if (this.options['skip-npm-install']) {
            return;
        }
        this.npmInstall();
    }
});
