'use strict';

/**
 * Operations on /pets
 */
module.exports = {
    
    /**
     * Returns all pets from the system that the user has access to
     * parameters: tags, limit
     * produces: application/json, application/xml, text/xml, text/html
     */
    get: function findPets(req, reply) {
        reply().code(500);
    }, 
    
    /**
     * Creates a new pet in the store.  Duplicates are allowed
     * parameters: pet
     * produces: application/json
     */
    post: function addPet(req, reply) {
        reply().code(500);
    }
    
};
