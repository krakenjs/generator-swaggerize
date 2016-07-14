'use strict';
var Assert = require('yeoman-assert');
var Util = require('./index');

module.exports = function (generator) {
    var testSuite = {
        data : function (t, options) {
            /**
             * Test the generated `data` files
             */
            dataTest(t, options);
        },
        handler : function (t, options) {
            /**
             * Test the generated `handler` and `data` files
             */
            dataTest(t, options);
            handlerTest(t, options);
        },
        test : function (t, options) {
            /**
             * Test the generated `test`, `handler` and `data` files
             */
            dataTest(t, options);
            handlerTest(t, options);
            testTest(t, options);
        },
        app : function (t, options) {
            /**
             * Test the generated `app`, `test`, `handler` and `data` files
             */
            appTest(t, options);
            dataTest(t, options);
            handlerTest(t, options);
            testTest(t, options);
        }
    };
    return testSuite[generator];
};
/**
 * Test the generated `data` files
 */
function dataTest(tester, options) {
    //Data files
    var routeFiles = Util.routeFiles(options.dataPath);
    tester.test('scaffold data files', function(t) {
        Assert.file(routeFiles);
        t.end();
    });
    //Mock gen file
    tester.test('scaffold mockgen files', function(t) {
        Assert.file([ options.dataPath + '/mockgen.js' ]);
        t.end();
    });
    //Config file
    tester.test('scaffold api file', function(t) {
        Assert.file([ options.apiRelPath ]);
        t.end();
    });
    //Secuirty files
    tester.test('scaffold data files', function(t) {
        Assert.file(Util.securityFiles(options.securityPath));
        t.end();
    });
}
/**
 * Test the generated `handler` files
 */
function handlerTest(tester, options) {
    //Data files
    tester.test('scaffold handler files', function(t) {
        Assert.file(Util.routeFiles(options.handlerPath));
        t.end();
    });
}
/**
 * Test the generated `test` files
 */
function testTest(tester, options) {
    //Data files
    tester.test('scaffold test files', function(t) {
        Assert.file(Util.routeFiles(options.testPath));
        t.end();
    });
}
/**
 * Test the generated `app` files - `package.json`, `README.md` etc
 */
function appTest(tester, options) {
    //Dot files
    tester.test('scaffold dot files', function(t) {
        Assert.file(Util.dotFiles);
        t.end();
    });
    //Project files
    tester.test('scaffold project files', function(t) {
        Assert.file(Util.projectFiles);
        t.end();
    });
    //Package content
    tester.test('test package file content', function(t) {
        Assert.fileContent([
           ['package.json', new RegExp(/\"name\"\: \"mockapp\"/)],
           ['package.json', new RegExp(/\"author\"\: \"lorem ipsum <loremipsum@awesome\.com>\"/)],
           ['package.json', new RegExp(/\"url\"\: \"git\:\/\/github\.com\/loremipsum\/mockapp\.git\"/)],
           ['package.json', new RegExp('\"' + options.framework + '\"\:')],
           ['package.json', new RegExp('--framework ' + options.framework+ ' --apiPath \'' + options.apiRelPath.replace(/\\/g,'/') + '\'')],
           ['README.md', new RegExp(/# mockapp/)]
        ]);
        t.end();
    });
}
