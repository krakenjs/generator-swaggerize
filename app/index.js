'use strict';

var util = require('util'),
    path = require('path'),
	fs = require('fs'),
    yeoman = require('yeoman-generator'),
    apischema = require('swaggerize-builder/lib/schema/swagger-spec/schemas/v2.0/schema.json'),
    builderUtils = require('swaggerize-builder/lib/utils'),
    wreck = require('wreck'),
    enjoi = require('enjoi');

var ModuleGenerator = yeoman.generators.Base.extend({
    init: function () {
        this.pkg = yeoman.file.readJSON(path.join(__dirname, '../package.json'));

        this.on('end', function () {
            if (!this.options['skip-install'] && this.only.length === 0) {
                this.npmInstall();
            }
        });
    },

    askFor: function () {
        var self, done;

        self = this;
        done = this.async();
        this.only = this.options.only;

        if (!this.only || this.only === true) {
            this.only = [];
        }
        else {
            this.only = this.only.split(',');
        }

        function all() {
            return self.only.length === 0;
        }

        console.log('Swaggerize Generator');

        var prompts = [
            {
                name: 'appname',
                message: 'What would you like to call this project:',
                default : this.appname,
                when: all
            },
            {
                name: 'creatorName',
                message: 'Your name:',
                when: all
            },
            {
                name: 'githubUser',
                message: 'Your github user name:',
                when: all
            },
            {
                name: 'email',
                message: 'Your email:',
                when: all
            },
            {
                name: 'apiPath',
                message: 'Path (or URL) to swagger document:'
            },
            {
                name: 'framework',
                message: 'Express or Hapi:',
                default: 'express',
                when: all
            }
        ];

        this.prompt(prompts, function (props) {
            var self, pkg;

            self = this;

            this.appname = props.appname || this.appname.replace(/\s+/g, '-');
            this.creatorName = props.creatorName;
            this.githubUser = props.githubUser;
            this.email = props.email;
            this.framework = props.framework || 'express';
            this.appRoot = path.basename(process.cwd()) === this.appname ? this.destinationRoot() : path.join(this.destinationRoot(), this.appname);

            if (this.only.length > 0) {
                if (fs.existsSync(path.join(this.appRoot, 'package.json'))) {
                    pkg = yeoman.file.readJSON(path.join(this.appRoot, 'package.json'));

                    if (pkg.dependencies.hapi) {
                        this.framework = 'hapi';
                    }
                }
            }

            if (this.framework !== 'express' && this.framework !== 'hapi') {
                done(new Error('Unrecognized framework: ' + this.framework));
                return;
            }

            if (props.apiPath.indexOf('http') === 0) {
                wreck.get(props.apiPath, function (err, res, body) {
                    var fp = props.apiPath.split('/');

                    if (err) {
                        done(err);
                        return;
                    }
                    if (res.statusCode !== 200) {
                        done(new Error('404: ' + props.apiPath));
                        return;
                    }
                    self.apiPath = path.join(self.appRoot, 'config/' + fp[fp.length - 1]);
                    self.api = JSON.parse(body);
                    done();
                });
            }
            else {
                this.apiPath = path.resolve(props.apiPath);
                done();
            }
        }.bind(this));
    },

    root: function () {
        if (process.cwd() !== this.appRoot) {
            this.mkdir(this.appRoot);
            process.chdir(this.appRoot);
        }
    },

    validate: function () {
        var done = this.async();

        this.api = this.api || yeoman.file.readJSON(this.apiPath);

        enjoi(apischema).validate(this.api, function (error) {
            done(error);
        });
    },

    app: function () {
        if (this.only.length === 0) {
            this.mkdir('config');

            this.copy('jshintrc', '.jshintrc');
            this.copy('gitignore', '.gitignore');
            this.copy('npmignore', '.npmignore');

            this.template('index_' + this.framework + '.js', 'index.js', {
                apiPath: path.relative(this.appRoot, path.join(this.appRoot, 'config/' + path.basename(this.apiPath)))
            });
            this.template('_package.json', 'package.json');
            this.template('_README.md', 'README.md');
        }

        //File
        if (fs.existsSync(this.apiPath)) {
            this.copy(this.apiPath, 'config/' + path.basename(this.apiPath));
        }
        //Url
        else {
            if (!fs.existsSync(this.apiPath)) {
                this.write(this.apiPath, JSON.stringify(this.api, null, 2));
            }
        }

    },

    handlers: function () {
        var routes, self;

        if (this.only.length > 0 && !~this.only.indexOf('handlers')) {
            return;
        }

        self = this;
        routes = {};

        this.mkdir('handlers');

        Object.keys(this.api.paths).forEach(function (path) {
            var pathnames, route;

            route = {
                path: path,
                pathname: undefined,
                methods: []
            };

            pathnames = [];

            path.split('/').forEach(function (element) {
                if (element) {
                    pathnames.push(element);
                }
            });

            route.pathname = pathnames.join('/');

            builderUtils.verbs.forEach(function (verb) {
                var operation = self.api.paths[path][verb];

                if (!operation) {
                    return;
                }

                route.methods.push({
                    method: verb,
                    name: operation.operationId || '',
                    description: operation.description || '',
                    parameters: operation.parameters || [],
                    produces: operation.produces || []
                });
            });

            if (routes[route.pathname]) {
                routes[route.pathname].methods.push.apply(routes[route.pathname].methods, route.methods);
                return;
            }

            routes[route.pathname] = route;
        });

        Object.keys(routes).forEach(function (routePath) {
            var pathnames, route, file;

            route = routes[routePath];
            pathnames = route.pathname.split('/');

            file = path.join(self.appRoot, 'handlers/' + pathnames.join('/') + '.js');

            self.template('_handler_' + self.framework + '.js', file, route);
        });
    },

    models: function () {
        var self = this;

        if (this.only.length > 0 && !~this.only.indexOf('models')) {
            return;
        }

        this.mkdir('models');

        Object.keys(this.api.definitions || {}).forEach(function (modelName) {
            var fileName, model;

            fileName = modelName.toLowerCase() + '.js';

            model = self.api.definitions[modelName];

            if (!model.id) {
                model.id = modelName;
            }

            self.template('_model.js', path.join(self.appRoot, 'models/' + fileName), model);
        });
    },

    tests: function () {
        var self, api, models, resourcePath, handlersPath, modelsPath, apiPath;

        if (this.only.length > 0 && !~this.only.indexOf('tests')) {
            return;
        }

        this.mkdir('tests');

        self = this;
        api = this.api;
        models = {};

        apiPath = path.relative(path.join(self.appRoot, 'tests'), path.join(self.appRoot, 'config/' + path.basename(this.apiPath)));
        modelsPath = path.join(self.appRoot, 'models');
        handlersPath = path.relative(path.join(self.appRoot, 'tests'), path.join(self.appRoot, 'handlers'));

        if (api.definitions && modelsPath) {

            Object.keys(api.definitions).forEach(function (key) {
                var modelSchema, ModelCtor, options;

                options = {};
                modelSchema = api.definitions[key];
                ModelCtor = require(path.join(self.appRoot, 'models/' + key.toLowerCase() + '.js'));

                Object.keys(modelSchema.properties).forEach(function (prop) {
                    var defaultValue;

                    switch (modelSchema.properties[prop].type) {
                        case 'integer':
                        case 'number':
                        case 'byte':
                            defaultValue = 1;
                            break;
                        case 'string':
                            defaultValue = 'helloworld';
                            break;
                        case 'boolean':
                            defaultValue = true;
                            break;
                        default:
                            break;
                    }

                    if (!!~modelSchema.required.indexOf(prop)) {
                        options[prop] = defaultValue;
                    }
                });

                models[key] = new ModelCtor(options);
            });

        }

        resourcePath = api.basePath;

        Object.keys(api.paths).forEach(function (opath) {
            var fileName, operations;

            operations = [];

            builderUtils.verbs.forEach(function (verb) {
                var operation = {};

                if (!api.paths[opath][verb]) {
                    return;
                }

                Object.keys(api.paths[opath][verb]).forEach(function (key) {
                    operation[key] = api.paths[opath][verb][key];
                });

                operation.path = opath;
                operation.method = verb;

                operations.push(operation);
            });

            fileName = path.join(self.appRoot, 'tests/test' + opath.replace(/\//g, '_') + '.js');

            self.template('_test_' + self.framework + '.js', fileName, {
                apiPath: apiPath,
                handlers: handlersPath,
                resourcePath: resourcePath,
                operations: operations,
                models: models
            });

        });
    }

});

module.exports = ModuleGenerator;
