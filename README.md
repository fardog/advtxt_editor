AdvTxt Editor
=============

The AdvTxt Editor is a quickly-assembed app for editing [AdvTxt][advtxt] rooms.

What follows is an off-the-cuff explanation of how to get things running, but 
it's probably incomplete. I'll fill this out more when the time comes.

Get the Editor Running
----------------------

### Backend

The backend app is a [Sails.js][sailsjs] application that simply shuffles data 
to/from a MongoDB database; it exists to provide a cheap and easy REST API for 
the frontend to consume.

**Warning:** There is absolutely no security; this is meant to be run on a 
local machine only. If you run this in production you are a fool.

To get up and running:

1. Read the [Sails.js MongoDB Docs][sailsmongo] on how to create a 
`config/adapter.js` for your Mongo database.
2. Install Sails with `npm install -g sails`.
3. Install the local modules by changing to the `backend` directory, and run 
`npm install`
3. Start the local server by running `sails lift` in that directory.

Then, it's time to start the frontend.

[advtxt]: https://github.com/fardog/advtxt/
[sailsmongo]: https://github.com/balderdashy/sails-mongo
[sailsjs]: http://sailsjs.org/


### Frontend

The frontend is a [KnockoutJS][knockout] app that consumes the REST API from 
the Sails backend app. It's based on my [Static Template][static] so all of its 
rules apply there.

To get it running:

1. Install [Grunt CLI][grunt] with `npm install -g grunt-cli`.
2. Install [Bower][bower] with `npm install -g bower`.
3. Change to the `frontend` directory, and install the local modules necessary 
with: `npm install && bower install`
4. From that directory, run `grunt dev` which will build the project's dev 
version, and start a local webserver on port `8002`.

Visit http://localhost:8002 and you'll see the interface.

[knockout]: http://knockoutjs.com/
[static]: https://github.com/fardog/static_template/
[grunt]: http://gruntjs.com/
[bower]: http://bower.io/

How it all Works
----------------

Once you start up the editor, you'll notice a 21&times;21 grid is displayed. 
The grid size is hard coded, but there's no reason it couldn't be bigger. The 
middle square is `(0, 0)`.

Right now, the way rooms work is somewhat in flux, but it's pretty 
straightforward. The *Exits*, *Commands*, and *Items* fields are Javascript, 
which is directly `eval`'d by the [advtxt][advtxt] client. The local variables 
available at that time include `player`, where you should be expecting your 
code to land. So an example *Commands* blob might be:

```
player.room.commands = {
    look: function(player) {
        if (player.items.key) {
            return "It looks like your key might open the northern door…";
        }
        return "It looks like the northern door is locked.";
    }
};
```

This will make the "look" command available to this room, returning the message 
to the player when they issue it. If they have a key in hand, they'll see a 
different message.

Exits work much the same. A more advanced example:

```
player.room.exits = {
    north: {
        available: function(player) {
            if (player.items.key) return true;
            return "You need a key to open this door.";
        },
        go: function(player) {
            return "You use your key to open the lock, and continue onward.";
        },
        name: 'north',
        short_name: 'n'
    },
    south: {
        available: function(player) { return true;},
        go: function(player) {
            return "You head south…";
        },
        name: 'south',
        short_name: 's'
    },
    west: {
        available: function(player) { return true;},
        go: function(player) {
            return "You head west…";
        },
        name: 'west',
        short_name: 'w'
    }
};
```

Here we see where a player can go *south*, or *west*, but if they have a key 
they can also go *north*. Right now, only Cardinal directions are supported, 
although it's only because the command interpreter is extremely simplistic.

Now *Items*:

```
player.room.items = {
    key: {
        available: function(player) { 
            if (player.items.key) return false;
            return true; 
        },
        name: 'key',
        short_name: 'key',
        get: function(player) {
            return "You pick up the key…";
        }
    }
};
```

This should be straightforward at this point.

The only other thing to mention is setting the player's status. This is if you 
need to kill them, or set them as winners, such as:

```
player.status = "win"; // player wins
player.status = "dead"; // player dies
```

Since the stuff in these fields is just eval'd by the client, obviously no 
client process should **ever** have access to modify the database. This was a 
convenient way to build the game, but isn't meant for users to edit their own 
maps.

The other items available in the editor:

- Name: The room's name. Not used in the client currently.
- Description: Read to the player whenever they enter the room.
- Map: Right now, only `default` is by the client, but later this could support 
multiple maps.


The MIT License (MIT)
---------------------

Copyright (c) 2014 Nathan Wittstock

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
