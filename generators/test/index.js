'use strict';
var Generators = require('yeoman-generator');
var Parser = require('swagger-parser');
var Path = require('path');
var Util = require('../../lib/util');
var Frameworks = Util.Frameworks;
var RouteGen = require('../../lib/routegen');
var Prompt = require('../prompt');

module.exports = Generators.Base.extend({
    constructor: function () {
        Generators.Base.apply(this, arguments);
        /*
         * Options :
         *  --framework
         *  --apiPath
         *  --handlerPath
         *  --testPath
         */
        this.option('framework');
        this.option('apiPath');
        this.option('handlerPath');
        this.option('testPath');
    },
    initializing: {
        //Validate the apiPath option in the beginning itself. Prompt for user input if the option is an invalid path.
        apiPath: function () {
            var done = this.async();
            this.apiPath = this.options.apiPath;
            this.api = this.options.api;
            if (!this.api && this.apiPath) {
                //If API is not passed as an option and the apiPath is valid, then, validate the api Spec.
                this._validateSpec(done);
                return;
            }
            done();
        },
        sefDefaults: function () {
            Util.sefDefaults(this);
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
        this.prompt(Prompt('test', this), function (answers) {
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
        var done = this.async();
        if (Frameworks.indexOf(this.framework) === -1) {
            done(new Error('Invalid framework ' + this.framework + '. Framework should be one of these : ' + Frameworks));
        } else {
            done();
        }
    },
    writing: {
        data: function () {
            this.composeWith('swaggerize:handler', {
                options: {
                    api: this.api,
                    apiPath: this.apiPath,
                    handlerPath: this.handlerPath,
                    dataPath: this.dataPath,
                    apiConfigPath: this.apiConfigPath,
                    framework: this.framework
                }
            }, {
                local: require.resolve('../handler')
            });
        },
        tests: function () {
            var self = this;
            var paths = this.api.paths;
            if (paths) {
                Object.keys(paths).forEach(function (path) {
                    var pathStr = path.replace(/^\/|\/$/g, '');
                    var testPath = Path.join(self.testPath, pathStr + '.js');
                    var pathObj = paths[path];
                    var route;
                    //Set the genFilePath path
                    self.genFilePath = self.destinationPath(testPath);
                    //Generate the route template obj.
                    route = RouteGen(self, path, pathObj);
                    if (route.operations && route.operations.length > 0) {
                        self.fs.copyTpl(
                            self.templatePath(Path.join(self.framework, 'test.js')),
                            self.genFilePath,
                            route
                        );
                    }
                });
            }
        }
    }
});
