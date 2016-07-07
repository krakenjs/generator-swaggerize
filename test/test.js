'use strict';
var Test = require('tape');
var Helpers = require('yeoman-test');
var Path = require('path');
var Util = require('./util');
var TestSuite = require('./util/testsuite');

Test('** test generator **', function (t) {
    t.comment('\n');
    t.test('scaffold test files - (with no options)', function (t) {
        Helpers.run(Path.join( __dirname, '../generators/test'))
            .withPrompts(Util.prompt('test'))
            .on('error', function (error) {
                t.error(error);
                t.end();
            })
            .on('end', function () {
                TestSuite('test')(t, Util.options());
                t.end();
            });
    });

    t.test('scaffold test files - with options', function (t) {
        var options = {
            testPath: 'mytest',//Custom test path
            apiPath: Path.join(__dirname, './fixture/petstore.json')
        };
        Helpers.run(Path.join( __dirname, '../generators/test'))
            .withOptions(options)
            .withPrompts(Util.prompt('test'))
            .on('error', function (error) {
                t.error(error);
                t.end();
            })
            .on('end', function () {
                var ops = Util.options();
                //Use loadash merge or Object.assign()
                ops.testPath = options.testPath;
                ops.apiPath = options.apiPath;
                TestSuite('test')(t, ops);
                t.end();
            });
    });

});
