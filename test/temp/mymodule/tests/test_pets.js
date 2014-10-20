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


    t.test('test get /pets', function (t) {
        t.plan(1);

        var options = {
            method: 'get',
            url: '/pets'
        };

        server.inject(options, function (res) {
            t.strictEqual(res.statusCode, 200, 'get /pets 200 status.');
        });
    });

    t.test('test post /pets', function (t) {
        t.plan(1);

        var body = {
            'id': 1,
            'name': "helloworld"
        };

        var options = {
            method: 'post',
            url: '/pets'
        };

        options.payload = body;

        server.inject(options, function (res) {
            t.strictEqual(res.statusCode, 200, 'post /pets 200 status.');
        });
    });


});
x
