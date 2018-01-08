'use strict';
var Test = require('tape');
var Helpers = require('yeoman-test');
var Path = require('path');
var Util = require('./util');
var TestSuite = require('./util/testsuite');

Test('** handler generator **', function (t) {
    t.comment('\n');
    t.test('scaffold handler (with no options)', function (t) {
        Helpers.run(Path.join( __dirname, '../generators/handler'))
            .withPrompts(Util.prompt('handler'))
            .on('error', function (error) {
                t.error(error);
                t.end();
            })
            .on('end', function () {
                TestSuite('handler')(t, Util.options());
                t.pass();
                t.end();
            });
    });
    
    t.test('scaffold handler with options', function (t) {
        var options = {
            handlerPath: 'myhandler',//Custom handler path
            apiPath: Path.join(__dirname, './fixture/petstore.json')
        };
        Helpers.run(Path.join( __dirname, '../generators/handler'))
            .withOptions(options)
            .withPrompts(Util.prompt('handler'))
            .on('error', function (error) {
                t.error(error);
                t.end();
            })
            .on('end', function () {
                TestSuite('handler')(t, Util.options(options));
                t.pass();
                t.end();
            });
    });
});
