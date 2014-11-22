/**
 * GameController
 *
 * @description :: Server-side logic for managing Games
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

    register: function (req, res) {
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

                game.save(function (err) {
                    if (err) {
                        res.status(500);
                        return res.json({status: 'err', message: 'failed to add player to game'});
                    }

                    return res.json(game);
                });
            });
        });
    }

};

