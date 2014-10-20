/*global describe, beforeEach, it*/
'use strict';

var assert = require('assert');
var test = require('tape');

test('module generator', function (t) {

    t.test('can be imported without blowing up', function (t) {
        var app = require('../app');

        t.plan(1);

        t.ok(app, 'app is defined.');
    });
});
