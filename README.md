generator-swaggerize
====================

Lead Maintainer: [Trevor Livingston](https://github.com/tlivings/)  

[![Build Status](https://travis-ci.org/krakenjs/generator-swaggerize.svg?branch=master)](https://travis-ci.org/krakenjs/generator-swaggerize)  
[![NPM version](https://badge.fury.io/js/generator-swaggerize.png)](http://badge.fury.io/js/generator-swaggerize)  


Yeoman generator for swagger application with krakenjs/swaggerize tools.

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

### Other CLI Options

- `--framework` - specify the framework (`hapi` or `express`).
- `--apiPath` - specify the path to the swagger document.
