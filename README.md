AdvTxt Editor
=============

The AdvTxt Editor is a quickly-assembed app for editing [AdvTxt][advtxt] rooms.

What follows is an off-the-cuff explanation of how to get things running, but 
it's probably incomplete. This editor is sort of nasty and is only provided to 
get the job at hand done, not to be pretty or friendly while doing it.

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

The room grid which is first displayed is a 21&times;21 grid, with `[0,0]` at 
the center. The size of the grid is hard-coded, and can trivially be increased 
in size. 

Each room has attributes, with the following core types. Internally, everything 
is always lowercased before processing.

### Core Room Attributes

- Exit
- Command

Each of these has some common sub-attributes. There is a special command for 
each room that should be set, called "enter". This command is executed each 
time the user enters the room.

### Common Sub-Attributes

- Name — If it's an exit, this is the exit's name ("north", "door", etc…), if 
it's a command, this is the action word/words ("get", "jump", "push")
- Move — If passed, you move in the direction specified (8-way cardinal 
directions)
- Item — If passed, you get or lose these items. Gotten items are specified with 
a "+" in front, lost with a "-". Items are just string identifiers that are 
matched against with a Javascript `===` after being lowercased. For example: 
"+key" gives you an item called "key", "-key" takes that key away, if you have 
it.

### Availability Hierarchy

The availability hierarchy is how an exit, item, or command is determined to be 
available. You need at least one of these, or else your room attribute won't 
work.

The availability hierarchy is processed in order. The first one to pass is used 
and determines if the room attribute is available, and no further items in the 
hierarchy are processed. Each item in the hierarchy has the following 
attributes:

- Required Items — A comma-separated list of required items. All in the list 
are required.
- Messages — The message to be played on pass.
- Available — Boolean of whether this item makes the attribute available or not.

So you can build somewhat complex trees that flow down the line. Imagine a 
hierarchy list with these items:

| Required Items   | Message                                                           | Avl.  |
|:----------------:|:-----------------------------------------------------------------:|:-----:|
| `key,flashlight` | "You turn on your flashlight, and use your key to open the door." | true  |
| `key`            | "You unlock the door, but it's entirely too dark to continue."    | false |
| null             | "The door appears to be locked."                                  | false |

You can imagine some pretty complex systems, especially since an item can be 
anything ("sunny disposition", "the flu", etc…).

### Aliases

Aliases will be stored in the database, and are coming sometime soon.


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
