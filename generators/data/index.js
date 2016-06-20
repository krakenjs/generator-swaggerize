'use strict';
var Generators = require('yeoman-generator');
var Parser = require('swagger-parser');
var Fs = require('fs');
var Path = require('path');
var _ = require('underscore.string');
var Util = require('../../lib/util');

var operationType = require('../../lib/util').operationType;

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
            if (this.api) {
                //API available. Swagger parser already validated the API and the local copy got generated.
                this.configGenerated = true;
            } else if (this.apiPath) {
                //If API is not passed as an option and the apiPath is valid, then, validate the api Spec.
                this._validateSpec(done);
                return;
            }
            done();
        },
        sefDefaults: function () {
            var apiPathRel = '.' + Path.sep + 'config' + Path.sep + 'swagger.json';
            this.apiConfigPath = this.options.apiConfigPath || Path.join(this.destinationPath(), apiPathRel);
            this.dataPath = this.options.dataPath || '.' + Path.sep + 'data';
            this.mockgenPath = Path.join(this.dataPath, 'mockgen.js');
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
        this.prompt([
        {
            name: 'apiPath',
            message: 'Path (or URL) to swagger document:',
            required: true,
            when: function () {
                return !self.apiPath;
            },
            default: this.apiPath,
            validate: validate
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
    writing: {
        config: function () {
            var self = this;
            var done = this.async();
            //Write to local config file only if the API is already validated
            //Dereferenced and resolved $ref objects cannot be used in the local copy.
            //So use `parse` API and then stringify the Objects to json format.
            if(this.api && !this.configGenerated) {
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
            var paths = this.api.paths
            if (paths) {
                Object.keys(paths).forEach(function (path) {
                    var pathStr = path.replace(/^\/|\/$/g, '');
                    var dataPath = Path.join(self.dataPath, pathStr + '.js');
                    var pathObj = paths[path];
                    var route = {
                        path: path,
                        operations: []
                    };
                    Object.keys(pathObj).forEach(function (method) {
                        var commonParams = [];
                        var operationObj = pathObj[method];
                        method = method.toLowerCase();
                        if (method === 'parameters') {
                            /*
                             * A list of parameters that are applicable for all the operations described under this path.
                             * These parameters can be overridden at the operation level, but cannot be removed there.
                             * The list MUST NOT include duplicated parameters
                             */
                            commonParams = operationObj;
                        } else if (operationType.indexOf(method) !== -1) {
                            /*
                             * The operation for the Path. get, post. put etc.
                             */
                            var parameters = commonParams;
                            var responses = operationObj.responses;
                            if (operationObj.parameters) {
                                parameters = commonParams.concat(operationObj.parameters);
                            }
                            route.operations.push({
                                name: operationObj.operationId,
                                description: operationObj.description,
                                summary: operationObj.summary,
                                method: method,
                                parameters: parameters && parameters.map(function (p) { return p.name }).join(', '),
                                responses:  responses ? Object.keys(responses) : []
                            });
                        }
                    });
                    //Set the mockgen module relative path
                    route.mockgenPath = Util.relative(self.destinationPath(dataPath), self.destinationPath(self.mockgenPath));
                    //Generate the data files.
                    self.fs.copyTpl(
                        self.templatePath('data.js'),
                        self.destinationPath(dataPath),
                        route
                    );
                });
            }
        }
    }
});
