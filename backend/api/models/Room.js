/**
 * Room
 *
 * @module      :: Model
 * @description :: A representation of an in-game room
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
		name: 'STRING',
		description: 'TEXT',
		x: 'INTEGER',
		y: 'INTEGER',
		map: 'STRING',
		exits: 'TEXT',
		commands: 'TEXT',
		items: 'TEXT'
  }

};
