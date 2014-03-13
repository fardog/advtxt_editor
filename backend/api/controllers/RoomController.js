/**
 * RoomController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

	locate: function (req, res) {
		Room.findOne({x: parseInt(req.param('x')), y: parseInt(req.param('y'))}, function(err, room) {
			if(err) res.send(500);
			else {
				res.json(room);
			}
		});
	},

	occupation: function (req, res) {
		Room.find()
			.limit(441)
			.exec(function(err, rooms) {
				res.json(rooms);
			});
	},

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to RoomController)
   */
  _config: {}

  
};
