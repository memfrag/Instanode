//
//  Copyright (c) 2013 Martin Johannesson
//
//  Permission is hereby granted, free of charge, to any person obtaining a
//  copy of this software and associated documentation files (the "Software"),
//  to deal in the Software without restriction, including without limitation
//  the rights to use, copy, modify, merge, publish, distribute, sublicense,
//  and/or sell copies of the Software, and to permit persons to whom the
//  Software is furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
//  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
//  DEALINGS IN THE SOFTWARE.
//
//  (MIT License)
//

var AppServer = require('./appserver.js');
var Instagram = require('./instagram.js');

var requestHandlers = {
	"/instagram/stockholm": instagramHandler,
};

var stockholmImages = null;

function instagramHandler(query, request, response) {
	console.log("*** Got a request for instagram images.");
	if (stockholmImages) {
		AppServer.writeJSON(request, response, stockholmImages);
	} else {
		AppServer.writeJSON(request, response, "[]");
	}
}

var server = AppServer.createAppServer(requestHandlers, __dirname + "/static");
server.startOnPort(13337);

Instagram.periodicallyGetImagesByLocation(59.3300, 18.0700, 5000, function (jsonOutput) {
	console.log("*** Got new images from Stockholm.");
	stockholmImages = jsonOutput;
});
