/**
 * Player
 *
 * @module      :: Model
 * @description :: A representation of the player.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
		name: 'STRING',
		description: 'TEXT',
		location: 'ARRAY',
		map: 'STRING',
		items: 'ARRAY'
  }

};
