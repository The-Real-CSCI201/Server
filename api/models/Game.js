/**
 * Game.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    attributes: {

        'players': {
            collection: 'player'
        },

        'map': {
            model: 'map'
        },

        'playerStates': 'json',

        'bullets': 'json'

    }
};

