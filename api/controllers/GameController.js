/**
 * GameController
 *
 * @description :: Server-side logic for managing Games
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

    /**
     * Create a new game.
     */
    create: function (req, res) {
        var gameData = {
            players: [],
            playerStates: {},
            bullets: [],
            pastStates: []
        };
        Game.create(gameData, function (err, game) {
            return res.json(game);
        });
    },

    /**
     * Controller method to join a player to a game.
     * Adds the player specified by request field 'playerId' to the game specified in the URL path.
     * Players have to join games so that they can receive push notifications and they will be represented as part of
     * the game's playerStates field
     *
     * URL: /game/join/{id}
     */
    join: function (req, res) {
        var gameId = req.params.id;
        var playerId = req.body.playerId;

        Game.findOne({id: gameId}, function (err, game) {
            if (err) {
                res.status(404);
                return res.json({status: 'err', message: 'failed to find game with id "' + gameId + '"'});
            }

            Player.findOne({id: playerId}, function (err, player) {
                if (err) {
                    res.status(404);
                    return res.json({status: 'err', message: 'failed to find player with id "' + playerId + '"'});
                }

                game.players.add(player);

                game.playerStates[player.id] = {
                    location: {
                        x: 0,
                        y: 0
                    },
                    health: 10
                };

                game.save(function (err) {
                    if (err) {
                        res.status(500);
                        return res.json({status: 'err', message: 'failed to add player to game'});
                    }

                    return res.json(game);
                });
            });
        });
    },

    /**
     * Controller method to make a move in the game.
     * Takes a 'playerId' as the player that is making the move.
     * Takes a 'move' where move is a JSON object containing the move data.
     *
     * URL: /game/move/{game-id}
     */
    move: function (req, res) {
        var gameId = req.params.id;
        var playerId = req.body.playerId;

        Game.findOne({id: gameId}, function (err, game) {
            if (err) {
                res.status(404);
                return res.json({status: 'err', message: 'failed to find game with id "' + gameId + '"'});
            }

            var playerState = game.playerStates[playerId];

            //allow setting 'override' header to skip some sanity checks
            if (!req.get('override')) {
                if (!playerState) {
                    res.status(401);
                    return res.json({status: 'err', message: 'player hasn\'t joined this game'});
                }

                if (playerState.moved) {
                    res.status(403);
                    return res.json({status: 'err', message: 'already moved this round'});
                }
            }

            var move = req.body.move;

            if (move.action == 'move') {
                switch (move.direction.toLowerCase()) {
                    case 'north':
                        playerState.location.y--;
                        break;
                    case 'south':
                        playerState.location.y++;
                        break;
                    case 'east':
                        playerState.location.x++;
                        break;
                    case 'west':
                        playerState.location.x--;
                        break;
                }
            }
            if (move.action == 'shoot') {
                game.bullets.push({
                    playerId: playerId,
                    direction: move.direction.toLowerCase(),
                    start: playerState.location
                });
            }

            playerState.moved = true;

            var allPlayersMoved = true;
            for (var player in game.playerStates) {
                if (game.playerStates.hasOwnProperty(player)) {
                    if (!game.playerStates[player].moved) {
                        allPlayersMoved = false;
                    }
                }
            }
            if (allPlayersMoved) {
                //move this turn's state to pastStates
                game.pastStates.unshift({
                    bullets: game.bullets
                });
                game.bullets = [];

                //reset move states so that a player is marked as having not moved in the next round
                for (var player in game.playerStates) {
                    if (game.playerStates.hasOwnProperty(player)) {
                        game.playerStates[player].moved = false;
                    }
                }

                //TODO: update player health here if a player was hit
                //TODO: push to all clients that everyone has moved
                console.log('this turn is over');
            }

            game.save(function (err) {
                if (err) {
                    res.status(500);
                    return res.json({status: 'err', message: 'failed to save updated game state'});
                }

                return res.json(game);
            });
        });
    }

};

