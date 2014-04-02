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
		x: 'INTEGER',
		y: 'INTEGER',
		map: 'STRING',
    attributes: 'ARRAY'
  }

};
