'use strict';

var Test = require('tape'),
    Path = require('path'),
    Hapi = require('hapi'),
    Swaggerize = require('swaggerize-hapi');

Test('api', function (t) {
    var server = new Hapi.Server();

    server.pack.register({
        plugin: Swaggerize,
        options: {
            api: require('../config/pets.json'),
            handlers: Path.join(__dirname, '../handlers')
        }
    });

    
    t.test('test get /pets/{id}', function (t) {
        t.plan(1);
        
        var options = {
            method: 'get',
            url: '/pets/1'
        };
        
        server.inject(options, function (res) {
            t.strictEqual(res.statusCode, 200, 'get /pets/{id} 200 status.');
        });
    });
    
    t.test('test delete /pets/{id}', function (t) {
        t.plan(1);
        
        var options = {
            method: 'delete',
            url: '/pets/1'
        };
        
        server.inject(options, function (res) {
            t.strictEqual(res.statusCode, 200, 'delete /pets/{id} 200 status.');
        });
    });
    

});
x
