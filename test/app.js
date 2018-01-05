'use strict';
var Test = require('tape');
var Helpers = require('yeoman-test');
var Path = require('path');
var Util = require('./util');
var TestSuite = require('./util/testsuite');

Test('** app generator **', function (t) {
    t.comment('\n');
    t.test('scaffold app (with no options)', function (t) {
        Helpers.run(Path.join( __dirname, '../generators/app'))
            .withPrompts(Util.prompt('app'))
            .on('error', function (error) {
                t.error(error);
                t.end();
            })
            .on('end', function () {
                TestSuite('app')(t, Util.options());
                t.pass();
                t.end();
            });
    });

    t.test('scaffold app with options', function (t) {
        var options = {
            framework: 'hapi',
            apiPath: Path.join(__dirname, './fixture/petstore.json')
        };
        Helpers.run(Path.join( __dirname, '../generators/app'))
            .withOptions(options)
            .withPrompts(Util.prompt('app'))
            .on('error', function (error) {
                t.error(error);
                t.end();
            })
            .on('end', function () {
                TestSuite('app')(t, Util.options(options), true);
                t.pass();
                t.end();
            });
    });

    t.test('scaffold app yml file', function (t) {
        var options = {
            framework: 'hapi',
            apiPath: Path.join(__dirname, './fixture/uber.yaml')
        };
        Helpers.run(Path.join( __dirname, '../generators/app'))
            .withOptions(options)
            .withPrompts(Util.prompt('app'))
            .on('error', function (error) {
                t.error(error);
                t.end();
            })
            .on('end', function () {
                TestSuite('app')(t, Util.options(options));
                t.pass();
                t.end();
            });
    });
});
