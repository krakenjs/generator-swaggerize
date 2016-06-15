'use strict';
var Generators = require('yeoman-generator');
var Parser = require('swagger-parser');
var Fs = require('fs');
var Path = require('path');
var _ = require('underscore.string');

module.exports = Generators.Base.extend({
    constructor: function () {
        Generators.Base.apply(this, arguments);
        /*
         * Options :
         *  --apiPath
         *  --modelPath
         */
        this.option('apiPath');
        this.option('modelPath');
    },
    initializing: {
        //Validate the apiPath option in the beginning itself. Prompt for user input if the option is an invalid path.
        apiPath: function () {
            var done = this.async();
            this.apiPath = this.options.apiPath;
            this.api = this.options.api;
            //If API is not passed as an option and the apiPath is valid, then, validate the api Spec.
            if (!this.api && this.apiPath) {
                this._validateSpec(done);
            } else {
                done();
            }
        },
        sefDefaults: function () {
            this.modelPath = this.options.modelPath || '.' + Path.sep + 'models';
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
        models: function () {
            var self = this;
            var defs = this.api.definitions;

            Object.keys(defs).forEach(function (name) {

                var def = defs[name];
                var properties = [];
                var modelPath = Path.join(self.modelPath, name + '.js');
                //No need to generate model file for array type
                if (def.type === 'array') {
                    return;
                }
                /**
                 * Models with Composition
                 */
                if (def.allOf && def.allOf.length > 0) {
                    def.allOf.forEach(function (extraDef) {
                        if (extraDef.properties && Object.keys(extraDef.properties).length > 0) {
                            properties = properties.concat(Object.keys(extraDef.properties));
                        }
                    });
                }
                /**
                 * Properties
                 */
                if (def.properties && Object.keys(def.properties).length > 0) {
                    properties = properties.concat(Object.keys(def.properties));
                }
                if (properties.length > 0) {
                    self.fs.copyTpl(
                        self.templatePath('model.js'),
                        self.destinationPath(modelPath),
                        {
                            name: name,
                            properties: properties,
                            description: def.description
                        }
                    );
                }
            });
        }
    }
});
