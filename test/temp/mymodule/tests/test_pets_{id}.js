'use strict';

var test = require('tape'),
    path = require('path'),
    express = require('express'),
    swaggerize = require('swaggerize-express'),
    request = require('supertest');

test('api', function (t) {
    var app = express();

    

    app.use(swaggerize({
        api: require('../config/pets.json'),
        handlers: path.join(__dirname, '../handlers')
    }));

    
    t.test('test get /pets/{id}', function (t) {
        t.plan(2);
        

        request(app).get('/pets/1')
        .expect(200)
        .end(function (err, res) {
            t.ok(!err, 'get /pets/{id} no error.');
            t.strictEqual(res.statusCode, 200, 'get /pets/{id} 200 status.');
        });
    });
    
    t.test('test delete /pets/{id}', function (t) {
        t.plan(2);
        

        request(app).delete('/pets/1')
        .expect(200)
        .end(function (err, res) {
            t.ok(!err, 'delete /pets/{id} no error.');
            t.strictEqual(res.statusCode, 200, 'delete /pets/{id} 200 status.');
        });
    });
    

});
