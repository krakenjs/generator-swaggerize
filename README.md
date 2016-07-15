generator-swaggerize
====================

Lead Maintainer: [Trevor Livingston](https://github.com/tlivings/)  

[![Build Status](https://travis-ci.org/krakenjs/generator-swaggerize.svg?branch=master)](https://travis-ci.org/krakenjs/generator-swaggerize)  
[![NPM version](https://badge.fury.io/js/generator-swaggerize.png)](http://badge.fury.io/js/generator-swaggerize)  


Yeoman generator for swagger application with `swaggerize` tools.

Generates projects for:
- Express
- Hapi
- Restify

See also:
- [swaggerize-express](https://github.com/krakenjs/swaggerize-express)
- [swaggerize-hapi](https://github.com/krakenjs/swaggerize-hapi)

### Usage

Install yeoman's `yo` if you haven't already:

```
$ npm install -g yo
```

Install `generator-swaggerize`:

```
$ npm install -g generator-swaggerize
```

Create a project:

```
$ yo swaggerize
```

### Generators

- `yo swaggerize`

Generates a new swaggerize application

```

    $ yo swaggerize

    Swaggerize Generator
    Tell us a bit about your application
    ? Path (or URL) to swagger document: http://petstore.swagger.io/v2/swagger.json
    ? Framework: express
    ? What would you like to call this project: myapp
    ? Your name: Lorem Ipsum
    ? Your github user name: loremipsum
    ? Your email: loremipsum@awesome.com
       create .eslintrc
       create .gitignore
       create .npmignore
       create package.json
       create README.md
       .
       .
       .
```

If you want to generate (or regenerate) only a specific component, you can use `swaggerize` sub generators.

- `yo swaggerize:data`

Generates `data` providers based on `paths` and `responses` in swagger api document.
This also generates the `config/swagger.json` (A copy of the swagger api document file input) and `security` authorize handlers based on `securityDefinitions`.

- `yo swaggerize:handler`

Generates `handlers` based on `paths` in swagger api document. (`data` providers are also generated as a pre step)

- `yo swaggerize:test`

Generates unit `tests` based on `paths`, `parameters` and `responses` in swagger api document. (`handlers` and `data` providers are also generated as a pre step)

#### Project structure

- `/config` - A copy of the swagger api document file input, will be generated at `/config/swagger.json`.
- `/data` - Data providers for paths(routes).
- `/security` - Authorize handlers for security schemes declared by `securityDefinitions`.
- `/handlers` - Application paths (routes) based on swagger api `paths`.
- `/tests` - Unit tests for paths(routes).

Example:

```
    ├── README.md
    ├── .eslintrc
    ├── .gitignore
    ├── .npmignore
    ├── config
    │   └── swagger.json
    ├── data
    │   ├── mockgen.js
    │   └── hellopath
    │       └── {id}.js
    ├── handlers
    │   └── hellopath
    │       └── {id}.js
    ├── package.json
    ├── security
    │   ├── hello_Oauth2.js
    │   └── hello_api_key.js
    ├── server.js
    └── tests
        └── hellopath
            └── {id}.js
```

##### Handlers

A handler file will be generated corresponding to every a `path` definition of the swagger api (`paths`).

More details or handlers and routing:

[swaggerize-express handlers](https://github.com/krakenjs/swaggerize-express#handlers-directory)

[swaggerize-hapi handlers](https://github.com/krakenjs/swaggerize-hapi#handlers-directory)

##### Data providers

A data file will be generated corresponding to every a `path` definition of the swagger api (`paths`).

By default [Response Mock generator](https://github.com/subeeshcbabu/swagmock#responses) is used to provide the data based on the `responses` definition of swagger api.
Developers should replace these default mock data generators with actual data feeds, based on the functionality.

##### Security authorize handlers

A security authorize handler file will be generated corresponding to the declaration of the security schemes `securityDefinitions`.

##### Unit tests

A unit test file will be generated corresponding to every a `path` definition of the swagger api (`paths`).

By default [Request Mock generator](https://github.com/subeeshcbabu/swagmock#requests) is used to generator api requests based on the `parameters` definition of swagger api.

#### CLI Options

- `--framework` - specify the framework (`hapi`, `express`, or `restify`).
- `--apiPath` - specify the path to the swagger document.
- `--handlerPath` - specify the path to generate the handler files. By default `handlers` directory.
- `--dataPath` - specify the path to generate the data files. By default `data` directory.
- `--securityPath` - specify the path to generate the security authorize files. By default `security` directory.
- `--testPath` - specify the path to generate the unit test files. By default `tests` directory.
- `--skip-npm-install` - To skip the default `npm install` on the generated project.

#### Prompts

- `apiPath` - Path (or URL) to swagger document

The path to the swagger api document. This path could be a local or remote URL.

If there is no CLI option `--apiPath` specified, the generator will prompt for `apiPath`. The swagger api will be validated against the swagger schema and spec before proceeding with scaffolding process.

- `framework` - The choice of framework to generate the application.

There are three options - `express`, `hapi` and `restify`. If there is no CLI option `--framework` specified, the generator will prompt for `framework`.

Also, generator checks the working directory for `package.json` dependencies, to find out whether the application already depends on, one of the framework options. If a match is found, that framework will be used as an option without prompting for the value.

- `appName` - The name of the application

By default the yeoman project root will be used as the name of the application, however, the prompt lets developers change this default.

- `creatorName`, `githubUser` and `email` - Creator details to build the `package.json`.
