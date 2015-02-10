/*global describe, beforeEach, it */
'use strict';

var fs = require('fs');
var path = require('path');
var helpers = require('yeoman-generator').test;
var test = require('tape');

test('swagger-express generator', function (t) {
    var app, testDir;

    testDir = path.join(__dirname, 'temp');

    function setup (done) {
        helpers.testDirectory(testDir, function (err) {
            if (err) {
                return done(err);
            }

            app = helpers.createGenerator('swaggerize:app', [
                '../../app'
            ]);

            done();
        });
    }

    t.test('yaml api', function (t) {

        setup(function () {
            var expected = [
                '.jshintrc',
                '.gitignore',
                '.npmignore',
                'README.md',
                'server.js',
                'package.json',
                'tests',
                'tests/test_pets_{id}.js',
                'tests/test_pets.js',
                'config',
                'config/pets.yaml',
                'handlers',
                'handlers/pets',
                'handlers/pets/{id}.js',
                'handlers/pets.js',
                'models',
                'models/error.js',
                'models/pet.js'
            ];

            helpers.mockPrompt(app, {
                'appname' : 'temp',
                'apiPath' : path.join(__dirname, 'fixtures/pets.yaml')
            });

            app.options['skip-install'] = true;

            app.run({}, function () {
                expected.forEach(function (file) {
                    t.ok(fs.existsSync(path.join(testDir, file)), 'file exists.');
                });
                t.end();
            });
        });
    });

    t.test('creates expected files (default express)', function (t) {

        setup(function () {
            var expected = [
                '.jshintrc',
                '.gitignore',
                '.npmignore',
                'README.md',
                'server.js',
                'package.json',
                'tests',
                'tests/test_pets_{id}.js',
                'tests/test_pets.js',
                'config',
                'config/pets.json',
                'handlers',
                'handlers/pets',
                'handlers/pets/{id}.js',
                'handlers/pets.js',
                'models',
                'models/error.js',
                'models/pet.js'
            ];

            helpers.mockPrompt(app, {
                'appname' : 'temp',
                'apiPath' : path.join(__dirname, 'fixtures/pets.json')
            });

            app.options['skip-install'] = true;

            app.run({}, function () {
                expected.forEach(function (file) {
                    t.ok(fs.existsSync(path.join(testDir, file)), 'file exists.');
                });
                t.end();
            });
        });
    });

    t.test('creates expected files (hapi)', function (t) {

        setup(function () {
            var expected = [
                '.jshintrc',
                '.gitignore',
                '.npmignore',
                'README.md',
                'server.js',
                'package.json',
                'tests',
                'tests/test_pets_{id}.js',
                'tests/test_pets.js',
                'config',
                'config/pets.json',
                'handlers',
                'handlers/pets',
                'handlers/pets/{id}.js',
                'handlers/pets.js',
                'models',
                'models/error.js',
                'models/pet.js'
            ];

            helpers.mockPrompt(app, {
                'appname' : 'temp',
                'apiPath' : path.join(__dirname, 'fixtures/pets.json'),
                'framework': 'hapi'
            });

            app.options['skip-install'] = true;

            app.run({}, function () {
                expected.forEach(function (file) {
                    t.ok(fs.existsSync(path.join(testDir, file)), 'file exists.');
                });
                t.end();
            });
        });
    });

    t.test('supports url', function (t) {

        setup(function () {
            var expected = [
                '.jshintrc',
                '.gitignore',
                '.npmignore',
                'README.md',
                'server.js',
                'package.json',
                'tests',
                'tests/test_pets.js',
                'config',
                'config/petstore.json',
                'handlers',
                'handlers/pets.js',
                'models',
                'models/error.js',
                'models/pet.js'
            ];

            helpers.mockPrompt(app, {
                'appname' : 'temp',
                'apiPath' : 'https://raw.githubusercontent.com/wordnik/swagger-spec/master/examples/v2.0/json/petstore.json',
                'framework': 'hapi'
            });

            app.options['skip-install'] = true;

            app.run({}, function () {
                expected.forEach(function (file) {
                    t.ok(fs.existsSync(path.join(testDir, file)), 'file exists.');
                });
                t.end();
            });
        });
    });


    t.test('bad framework', function (t) {
        t.plan(1);

        setup(function () {
            helpers.mockPrompt(app, {
                'appname' : 'temp',
                'apiPath' : path.join(__dirname, 'fixtures/pets.json'),
                'framework': 'foobar'
            });

            app.options['skip-install'] = true;

            t.throws(function () {
                app.run({}, function () {
                });
            }, 'throws error.');
        });
    });

    t.test('bad api', function (t) {
        t.plan(1);

        setup(function () {
            helpers.mockPrompt(app, {
                'appname' : 'temp',
                'apiPath' : path.join(__dirname, 'fixtures/badapi.json'),
            });

            app.options['skip-install'] = true;

            t.throws(function () {
                app.run({}, function () {
                });
            }, 'throws error.');
        });
    });

    t.test('supports --only', function (t) {
        t.plan(1);

        setup(function () {
            helpers.mockPrompt(app, {
                'appname': 'temp',
                'apiPath' : 'https://raw.githubusercontent.com/wordnik/swagger-spec/master/examples/v2.0/json/petstore.json'
            });

            app.options['skip-install'] = true;
            app.options['only'] = 'tests,handlers,models';

            t.doesNotThrow(function () {
                app.run({}, function () {
                });
            }, 'does not throw.');
        });
    });
});
