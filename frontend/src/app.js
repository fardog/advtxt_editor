;'use strict';

var $prefix = "http://advtxt.dev:1337/";

$(document).ready(function() {

	// initialize Foundation
	$(document).foundation();


  /**
   * Creates a new representation of a Room in the editor.
   *
   * @param {int} x - Room's "x" coordinate
   * @param {int} y - Room's "y" coordinate
   * @param {string} name - Room's name
   * @param {string} map - The string representing the map this room is 
   *  associated with. Will default to "default" if not provided.
   * @param {array} attributes - The list of attributes attached to the room.
   */
  var Room = function(x, y, name, map, attributes) {
    this.name = ko.observable(name);
    this.x = ko.observable(x);
    this.y = ko.observable(y);
    this.map = ko.observable(map);

    if (typeof map === 'undefined') {
      this.map("default");
    }

    this.attributes = ko.observableArray(attributes);

    this.addAttributes = function(attribute) {
      this.attributes.push(attribute);
    }.bind(this);

    this.removeAttribute = function(attribute) {
      this.attributes.remove(attribute);
    }.bind(this);

    this.toJSON = function() {
      var json = {
        x: this.x(),
        y: this.y(),
        name: this.name(),
        map: this.map(),
        attributes: []
      };

      this.attributes().forEach(function (attribute) {
        json.attributes.push(attribute.toJSON());
      });

      return json;
    }.bind(this);

    this.fromJSON = function(json) {
      var self = this;

      self.x(json.x);
      self.y(json.y);
      self.name(json.name);
      self.map(json.map);

      json.attributes.forEach(function (attribute) {
        self.attributes.push(new Attributes().fromJSON(attribute));
      });

      return self;
    }.bind(this);
  };

  var Attributes = function(type, name, move, item, availability) {
    this.type = ko.observable(type);
    this.name = ko.observable(name);
    this.move = ko.observable(move);
    this.item = ko.observable(item);

    this.availability = ko.observableArray(availability);

    this.addAvailability = function(availability) {
      this.availability.push(availability);
    }.bind(this);

    this.addAvailabilityRow = function() {
      this.addAvailability(new Availability());
    }.bind(this);

    this.removeAvailability = function(availability) {
      this.availability.remove(availability);
    }.bind(this);

    this.toJSON = function() {
      var json = {
        type: this.type(),
        name: this.name(),
        move: this.move(),
        item: this.item(),
        availability: []
      };

      this.availability().forEach(function (availability) {
        json.availability.push(availability.toJSON());
      });

      return json;
    }.bind(this);

    this.fromJSON = function(json) {
      var self = this;

      self.type(json.type);
      self.name(json.name);
      self.move(json.move);
      self.item(json.item);

      json.availability.forEach(function (availability) {
        self.availability.push(new Availability().fromJSON(availability));
      });

      return self;
    }.bind(this);
  };

  var Availability = function(items, message, available) {
    this.items = ko.observable(items);
    this.message = ko.observable(message);
    this.available = ko.observable(available);

    this.toJSON = function() {
      var json = {
        items: this.items(),
        message: this.message(),
        available: this.available()
      };

      return json;
    }.bind(this);

    this.fromJSON = function(json) {
      this.items(json.items);
      this.message(json.message);
      this.available(json.available);

      return this;
    }.bind(this);
  };

  var roomModel = function(room, raw, save) {
    var self = this;
    self.save = save;

    // representation of our room as is sent to/from the server
		self.room = {
      data: room,
      raw_data: raw
    };

    self.addAttributeRow = function() {
      self.room.data.addAttributes(new Attributes());
    };

    self.saveRoom = function() {
      var json = self.room.data.toJSON();
      json.raw_data = self.room.raw_data;
      self.save(json);
    };
  };


	/***
	 * viewModel: a Knockout view model for our page.
	 */
	var viewModel = function() {
		var self = this;

		self.room = null; 

		// the currently selected room, so we can update its status on the grid
		self.selectedRoom = null;

		// observables for constructing our grid and maintaining visibility of
		// a number of objects
		self.rooms = ko.observableArray();
		self.editing = ko.observable(false);
		self.error = ko.observable(false);


		/***
		 * loadData: makes a call to a server, and retrieves data
		 *
		 * urlFragment - the path on the server to be called
		 *  will prefix the $prefix variable to any url it's passed, so you can
		 *  use relative urls
		 * params - an object representing the GET variables that should be passed
		 * next - the callback function to be executed after getting data
		 *
		 * returns nothing
		 */
		self.loadData = function(urlFragment, params, next) {
			if (typeof params === 'undefined') params = {};

			// perform a call with jQuery
			$.get($prefix + urlFragment, params, function(data, ts, jqXHR) {
				next(data);
			}).fail(function(data) {
				// set an error message if we didn't get data for any reason
				if (data.status !== 200) self.error("Failed to get data!");
				next(null);
			});
		};


		/***
		 * getOccupationStatus: gets the occupation status of all the rooms, and
		 *  builds out the grid
		 *
		 * rooms - the list of rooms returned from the server
		 *
		 * returns nothing
		 */
		self.getOccupationStatus = function(rooms) {
			// create a 2D matrix of all the occupied rooms
			var occupationMatrix = [[]];
			for (var i = 0; i < rooms.length; i++) {
				if (typeof occupationMatrix[rooms[i].x] === 'undefined')
					occupationMatrix[rooms[i].x] = [];
				occupationMatrix[rooms[i].x][rooms[i].y] = true;
			}

			// create a 1D array of rooms, and push them into our observableArray
			for (var y = -10; y <= 10; y++) {
				for (var x = -10; x <= 10; x++) {
					var occupied = false;
					var origin = false;
					if (typeof occupationMatrix[x] !== 'undefined'
							&& typeof occupationMatrix[x][y] !== 'undefined')
						occupied = true;

					if (x === 0 && y === 0) origin = true;

					self.rooms.push({
						'x': x,
						'y': y,
						'data': null,
						'selected': ko.observable(false),
						'occupied': ko.observable(occupied),
						'origin': ko.observable(origin)
					});
				}
			}
		};


		/***
		 * selectRoom: function called when a room in the grid is clicked. gets the 
		 *  room information, and populates the editor
		 *
		 * location - the knockout-provided object on which the click occurred
		 *
		 * returns nothing
		 */
		self.selectRoom = function (location) {
			// deselect any selected rooms, since we're selecting a new one
			for (var i = 0; i < self.rooms().length; i++) {
				self.rooms()[i].selected(false);
			}
			
			// mark the location as selected, and show the editor
			location.selected(true);
			self.editing(true);
      // show the edit area, since it's in an area with no view model attached 
      // yet.
      $("#editarea").show();
			self.selectedRoom = location;

			// load the room
			self.loadData('room/locate', 
					{x: location.x, y: location.y}, 
					self.populateRoom);
		};

		/***
		 * populateRoom: fills our observables with room data, for the editor
		 *
		 * room - the room data from the server
		 *
		 * returns nothing
		 */
		self.populateRoom = function (room) {
      if (typeof room !== 'undefined' && room) {
        self.room = new roomModel(new Room().fromJSON(room), room, self.updateRoom.bind(self));
      }
      else {
        self.room = new roomModel(new Room(self.selectedRoom.x, self.selectedRoom.y), room, self.updateRoom.bind(self));
      }

      // clear knockout bindings from the node, and reapply
      var element = $('#editarea')[0];
      ko.cleanNode(element);
      ko.applyBindings(self.room, element);
		};

		
		/***
		 * Saves the room data to the server, and reloads the room.
		 *
     * @param {object} room - The object representing the room to be saved.
		 */
		self.updateRoom = function(room) {
			// if we have raw_data, we're updating a room, not creating it
			var url = 'room/create';
			if (typeof room.raw_data !== 'undefined' && room.raw_data) {
        url = 'room/update/' + room.raw_data.id;
        room.raw_data = undefined;
      }

			// set the current room as occupied, since we won't be checking 
			// occupation to update the grid unless we reload the whole page
			self.selectedRoom.occupied(true);

			// send the data to the server
			self.loadData(url, room, self.populateRoom);
		};

		// get the occupation status for all rooms, and populate the room grid
		self.loadData('room/occupation', {}, self.getOccupationStatus);
	}; /* end viewModel */


  // adds a sortableList binding handler, which provides drag/drop reordering 
  // on an observableArray that's foreach'd on the frontend
  // http://www.knockmeout.net/2011/05/dragging-dropping-and-sorting-with.html
  ko.bindingHandlers.sortableList = {
    init: function(element, valueAccessor) {
      var list = valueAccessor();
      $(element).sortable({
        update: function(event, ui) {
          //retrieve our actual data item
          var item = ko.dataFor(ui.item.get(0));
          //figure out its new position
          var position = ko.utils.arrayIndexOf(ui.item.parent().children(), ui.item[0]);
          //remove the item and add it back in the right spot
          if (position >= 0) {
            list.remove(item);
            list.splice(position, 0, item);
          }
          ui.item.remove();
        }
      });
    }
  };


	// Apply our Knockout bindings
	var view = new viewModel();
	ko.applyBindings(view, $('#roomarea')[0]);
});
