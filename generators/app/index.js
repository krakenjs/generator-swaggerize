'use strict';
var Generators = require('yeoman-generator');
var Path = require('path');
var _ = require('underscore.string');
var Util = require('../../lib/util');
var Prompt = require('../prompt');

module.exports = Generators.Base.extend({
    constructor: function () {
        Generators.Base.apply(this, arguments);
        this.option('framework');
        this.option('apiPath');
        this.option('handlerPath');
        this.option('testPath');
        this.option('dataPath');
        this.option('skip-npm-install');
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
                Util.validateApi(this, done);
            } else {
                done();
            }
        },
        setDefaults: function () {
            Util.setDefaults(this);
        }
    },
    prompting: function () {
        var done = this.async();
        this.prompt(Prompt('app', this), function (answers) {
            var self = this;
            Object.keys(answers).forEach(function (prop) {
                if (answers[prop] !== null && answers[prop] !== undefined) {
                    self[prop] = answers[prop];
                }
            });
            //parse and validate the Swagger API entered by the user.
            if (answers.apiPath) {
                Util.validateApi(self, done);
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
            //Reset the defaults
            Util.setDefaults(this);
        }
        this.slugAppName = _.slugify(this.appName);
    },
    writing: {
        app: function () {
            var self = this;
            //lint config and ignore files
            this.fs.copy(
                this.templatePath('.*'),
                this.destinationPath()
            );
            //Package and Docs
            ['package.json', 'README.md'].forEach(function (file) {
                self.fs.copyTpl(
                    self.templatePath(file),
                    self.destinationPath(file),
                    self
                );
            });
            //Server file
            this.fs.copyTpl(
                this.templatePath(Path.join(this.framework, 'server.js')),
                this.destinationPath('server.js'),
                this
            );
        },
        tests: function () {
            /**
             * Invoke the 'swaggerize:test' sub generator.
             * `test` will create `handlers`, `data` and `config`
             */
            this.composeWith('swaggerize:test', {
                options: {
                    api: this.api,
                    refApi: this.refApi,
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
