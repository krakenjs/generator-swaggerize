'use strict';

var test = require('tape'),
    path = require('path'),
    express = require('express'),
    swaggerize = require('swaggerize-express'),
    request = require('supertest');

test('api', function (t) {
    var app = express();

    
    app.use(require('body-parser')());

    app.use(swaggerize({
        api: require('../config/pets.json'),
        handlers: path.join(__dirname, '../handlers')
    }));

    
    t.test('test get /pets', function (t) {
        t.plan(2);
        

        request(app).get('/pets')
        .expect(200)
        .end(function (err, res) {
            t.ok(!err, 'get /pets no error.');
            t.strictEqual(res.statusCode, 200, 'get /pets 200 status.');
        });
    });
    
    t.test('test post /pets', function (t) {
        t.plan(2);
        
        var body = {
            'id': 1, 
            'name': "helloworld"
        };
        

        request(app).post('/pets')
        .expect(200).send(body)
        .end(function (err, res) {
            t.ok(!err, 'post /pets no error.');
            t.strictEqual(res.statusCode, 200, 'post /pets 200 status.');
        });
    });
    

});
