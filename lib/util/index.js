'use strict';
var Path = require('path');

var Frameworks = [
    'express',
    'hapi',
    'restify'
];

var operationType = [
    'get',
    'post',
    'put',
    'delete',
    'head',
    'options',
    'patch'
];

module.exports = {
    Frameworks: Frameworks,
    relative: findRelative,
    operationType: operationType
};

function findRelative (from, to) {
    var dirname = Path.dirname(from);
    var relative = Path.relative(dirname, to);
    if (startsWith(relative, './') || startsWith(relative, '../')) {
        //Path is not originating from dirname
        return relative;
    } else {
        //Path is originating from dirname. Prefix `./` for dirname
        return './' + relative;
    }
}

function startsWith(str, substr) {
    if (str.substr(0, substr.length) === substr) {
        return true;
    }
    return false;
}
