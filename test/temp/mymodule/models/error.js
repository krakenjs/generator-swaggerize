'use strict';

function Error(options) {
    if (!options) {
        options = {};
    }
    
    this.code = options.code;
    this.message = options.message;
}

module.exports = Error;