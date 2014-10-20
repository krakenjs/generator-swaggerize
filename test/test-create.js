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

    t.test('creates expected files', function (t) {

        setup(function () {
            var expected = [
                '.jshintrc',
                '.gitignore',
                '.npmignore',
                'README.md',
                'index.js',
                'package.json',
                'tests',
                'config',
                'config/pets.json',
                'handlers'
            ];

            helpers.mockPrompt(app, {
                'appname' : 'mymodule',
                'apiPath' : path.join(__dirname, 'fixtures/pets.json')
            });

            app.options['skip-install'] = true;

            app.run({}, function () {
                expected.forEach(function (file) {
                    t.ok(fs.existsSync(file), 'file exists.');
                });
                t.end();
            });
        })
    });

});
