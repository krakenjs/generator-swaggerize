'use strict';
var Test = require('tape');
var Helpers = require('yeoman-test');
var Path = require('path');
var Util = require('./util');
var TestSuite = require('./util/testsuite');

Test('** data generator **', function (t) {
    t.comment('\n');
    t.test('scaffold data (with no options)', function (t) {
        Helpers.run(Path.join( __dirname, '../generators/data'))
            .withPrompts(Util.prompt('data'))
            .on('error', function (error) {
                t.error(error);
                t.end();
            })
            .on('end', function () {
                TestSuite('data')(t, Util.options());
                t.end();
            });
    });

    t.test('scaffold data with options', function (t) {
        var options = {
            dataPath: 'mydata',//Custom data path
            apiPath: Path.join(__dirname, './fixture/petstore.json'),
            securityPath: 'mysecurity'
        };
        Helpers.run(Path.join( __dirname, '../generators/data'))
            .withOptions(options)
            .withPrompts(Util.prompt('data'))
            .on('error', function (error) {
                t.error(error);
                t.end();
            })
            .on('end', function () {
                TestSuite('data')(t, Util.options(options));
                t.end();
            });
    });
});
