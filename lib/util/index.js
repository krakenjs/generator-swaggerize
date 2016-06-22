'use strict';
var Path = require('path');
/**
 * List of supported frameworks
 */
var Frameworks = [
    'express',
    'hapi',
    'restify'
];

/**
 * List of supported operations
 */
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
    relative: buildRelativePath,
    operationType: operationType
};
/**
 * Build relative path for module import.
 */
function buildRelativePath (from, to) {
    var dirname = Path.dirname(from);
    var relative = Path.relative(dirname, to);
    if (startsWith(relative, '.' + Path.sep) || startsWith(relative, '..' + Path.sep)) {
        //Path is not originating from dirname
        return relative;
    } else {
        //Path is originating from dirname. Prefix `./` for dirname
        return '.' + Path.sep + relative;
    }
}

function startsWith(str, substr) {
    if (str.substr(0, substr.length) === substr) {
        return true;
    }
    return false;
}
