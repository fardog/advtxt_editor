/**
 * Item
 *
 * @module      :: Model
 * @description :: An obtainable item in the game.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
		name: 'STRING',
		description: 'TEXT',
		type: 'STRING',
		commands: 'TEXT'
  }

};
