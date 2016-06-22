'use strict';
var Generators = require('yeoman-generator');
var Parser = require('swagger-parser');
var Path = require('path');
var Util = require('../../lib/util');
var RouteGen = require('../../lib/routegen');
var Prompt = require('../prompt');

module.exports = Generators.Base.extend({
    constructor: function () {
        Generators.Base.apply(this, arguments);
        /*
         * Options :
         *  --apiPath
         *  --modelPath
         */
        this.option('apiPath');
        this.option('dataPath');
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
        this.prompt(Prompt('data', this), function (answers) {
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
    writing: {
        config: function () {
            var self = this;
            var done = this.async();
            //Write to local config file only if the API is already validated
            //Dereferenced and resolved $ref objects cannot be used in the local copy.
            //So use `parse` API and then stringify the Objects to json format.
            if(this.api) {
                //Write the contents of the apiPath location to local config file.
                Parser.parse(this.apiPath, function (error, api) {
                    if (error) {
                        done(error);
                        return;
                    }
                    //Write as a JSON file.
                    //TODO handle the yml file usecase
                    self.write(self.apiConfigPath, JSON.stringify(api, null, 4));
                    done();
                });
            } else {
                done();
            }
        },
        mockgen: function () {
            var tmpl = {
                apiConfigPath: Util.relative(this.destinationPath(this.mockgenPath), this.apiConfigPath)
            };
            this.fs.copyTpl(
                this.templatePath('mockgen.js'),
                this.destinationPath(this.mockgenPath),
                tmpl
            );
        },
        data: function () {
            var self = this;
            var paths = this.api.paths;
            if (paths) {
                Object.keys(paths).forEach(function (path) {
                    var pathStr = path.replace(/^\/|\/$/g, '');
                    var dataPath = Path.join(self.dataPath, pathStr + '.js');
                    var pathObj = paths[path];
                    var route;
                    //Set the genFilePath path
                    self.genFilePath = self.destinationPath(dataPath);
                    //Generate the route template obj.
                    route = RouteGen(self, path, pathObj);
                    //Generate the data files.
                    if (route.operations && route.operations.length > 0) {
                        self.fs.copyTpl(
                            self.templatePath('data.js'),
                            self.genFilePath,
                            route
                        );
                    }
                });
            }
        }
    }
});
