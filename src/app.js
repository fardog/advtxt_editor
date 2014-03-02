;

var $prefix = "http://advtxt.dev:1337/";

$(document).ready(function() {

	// initialize Foundation
	$(document).foundation();


	
	/***
	 * viewModel: a Knockout view model for our page.
	 */
	var viewModel = function() {
		var self = this;

		// our ace editors for the javascript data wells
		self.exitsEditor = null;
		self.commandsEditor = null;
		self.itemsEditor = null;

		// representation of our room as is sent to/from the server
		self.room = {
			data: {
				x: ko.observable(),
				y: ko.observable(),
				name: ko.observable(),
				description: ko.observable(),
				map: ko.observable("default"),
				exits: ko.observable(),
				commands: ko.observable(),
				items: ko.observable()
			},
			raw_data: null
		} 
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
			self.selectedRoom = location;

			// load the room
			self.loadData('room/locate', 
					{x: location.x, y: location.y}, 
					self.populateRoom);

			// set the room's X and Y coordinates
			self.room.data.x(location.x);
			self.room.data.y(location.y);
		};

		/***
		 * populateRoom: fills our observables with room data, for the editor
		 *
		 * room - the room data from the server
		 *
		 * returns nothing
		 */
		self.populateRoom = function (room) {
			// if what we got was empty, we're creating a new one. blank everything
			if (!room || room.length < 1) {
				self.room.raw_data = null;

				self.room.data.name("");
				self.room.data.description("");
				self.room.data.map("default");
				self.room.data.exits("");
				self.room.data.commands("");
				self.room.data.items("");

				self.exitsEditor.setValue("");
				self.commandsEditor.setValue("");
				self.itemsEditor.setValue("");
			}
			// otherwise we're editing an existing room
			else {
				// save the raw server data, so we have the ID later
				self.room.raw_data = room;

				self.room.data.name(room.name);
				self.room.data.description(room.description);
				self.room.data.map(room.map);
				self.room.data.exits(room.exits);
				self.room.data.commands(room.commands);
				self.room.data.items(room.items);

				self.exitsEditor.setValue(room.exits);
				self.commandsEditor.setValue(room.commands);
				self.itemsEditor.setValue(room.items);
			}
		};

		
		/***
		 * updateRoom: save the room data to the server
		 *
		 * returns nothing
		 */
		self.updateRoom = function() {
			// if we have raw_data, we're updating a room, not creating it
			var url = 'room/create';
			if (self.room.raw_data) url = 'room/update/' + self.room.raw_data.id;

			// the data array that will be sent to the server
			var data = {
				x: self.room.data.x(),
				y: self.room.data.y(),
				name: self.room.data.name(),
				description: self.room.data.description(),
				map: self.room.data.map(),
				exits: self.exitsEditor.getValue(),
				commands: self.commandsEditor.getValue(),
				items: self.itemsEditor.getValue()
			}

			// set the current room as occupied, since we won't be checking 
			// occupation to update the grid unless we reload the whole page
			self.selectedRoom.occupied(true);

			// send the data to the server
			self.loadData(url, data, self.populateRoom);
		};

		// get the occupation status for all rooms, and populate the room grid
		self.loadData('room/occupation', {}, self.getOccupationStatus);
	}; /* end viewModel */


	// Apply our Knockout bindings
	var view = new viewModel();
	ko.applyBindings(view);

	// Initialize the editors
	view.exitsEditor = ace.edit("exitsEditor");
	view.exitsEditor.setTheme("ace/theme/github");
	view.exitsEditor.getSession().setMode("ace/mode/javascript");

	view.commandsEditor = ace.edit("commandsEditor");
	view.commandsEditor.setTheme("ace/theme/github");
	view.commandsEditor.getSession().setMode("ace/mode/javascript");

	view.itemsEditor = ace.edit("itemsEditor");
	view.itemsEditor.setTheme("ace/theme/github");
	view.itemsEditor.getSession().setMode("ace/mode/javascript");

});
