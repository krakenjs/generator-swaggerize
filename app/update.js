'use strict';

var esprima = require('esprima'),
    escodegen = require('escodegen'),
    fs = require('fs'),
    path = require('path'),
    assert = require('assert'),
    util = require('util');

module.exports = {

    handlers: function (file, framework, route) {
        var content, parsed, ast;

        parsed = require(file);
        content = fs.readFileSync(file);
        ast = esprima.parse(content, { tokens: true, range: true, comment: true });

        route.methods.forEach(function (method) {
            var handler, strfn, newast;

            if (parsed[method.method]) {
                return;
            }

            strfn =   '    /**\n' +
                      '     * %s\n' +
                      '     * parameters: %s\n' +
                      '     * produces: %s\n' +
                      '     */\n';

            strfn = util.format(strfn, method.description, method.parameters.map(function (p) { return p.name; }).join(', '), method.produces && method.produces.join(', '));

            if (framework === 'hapi') {
                strfn += 'function ' + method.name + '(req, reply) {\n    reply().code(501);\n}';

            }
            else if (framework === 'express') {
                strfn += 'function ' + method.name + '(req, res) {\n    res.send(501);\n}';
            }

            newast = esprima.parse(strfn, { tokens: true, range: true, comment: true });

            handler = esprima.parse(strfn).body[0];
            handler.type = 'FunctionExpression';

            ast.body.forEach(function (element) {
                var assigned;

                if (element.expression.type === 'AssignmentExpression' && element.expression.left.object.name === 'module') {
                    assigned = element.expression.right;

                    assert.strictEqual(assigned.type, 'ObjectExpression');

                    newast.comments[0].range[1] = newast.comments[0].range[1] - newast.comments[0].range[0];
                    newast.comments[0].range[0] = assigned.properties[assigned.properties.length - 1].range[1] + 1;
                    newast.comments[0].range[1] = newast.comments[0].range[0] + newast.comments[0].range[1];

                    handler.range = [];
                    handler.range[0] = newast.comments[0].range[1] + 1;
                    handler.range[1] = handler.range[0] + (newast.body[0].range[1] - newast.body[0].range[0]);

                    assigned.properties.push({
                        type: 'Property',
                        key: {
                            type: 'Identifier',
                            name: method.method,
                            range: [handler.range[0], handler.range[0] + method.method.length]
                        },
                        value: handler,
                        range: handler.range,
                        kind: 'init',
                        leadingComments: newast.comments
                    });
                }
            });

        });

        ast = escodegen.attachComments(ast, ast.comments, ast.tokens);

        return escodegen.generate(ast, { comment: true });
    }

};
