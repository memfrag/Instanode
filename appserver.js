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

var Http = require('http');
var Url = require('url');
var Path = require('path');
var Fs = require("fs");

exports.writeInternalErrorStatus = writeInternalErrorStatus;
exports.writeNotFoundStatus = writeNotFoundStatus;
exports.writeJSON = writeJSON;
exports.createAppServer = createAppServer;

var allowedFileTypes = {
	".html": {"Content-Type": "text/html", "encoding": "utf-8"},
	".json": {"Content-Type": "application/json", "encoding": "utf-8"},
	".js": {"Content-Type": "text/javascript", "encoding": "utf-8"},
	".xml": {"Content-Type": "text/xml", "encoding": "utf-8"},
	".gif": {"Content-Type": "image/gif", "encoding": "binary"},
	".png": {"Content-Type": "image/png", "encoding": "binary"},
	".jpg": {"Content-Type": "image/jpg", "encoding": "binary"},
	".jpeg": {"Content-Type": "image/jpg", "encoding": "binary"}
};

function isAllowedFileType(fileExtension) {
	var typeConfig = allowedFileTypes[fileExtension];
	if (typeConfig) {
		return true;
	} else {
		return false;
	}
}

function isStaticFile(normalizedPath, staticContentRoot) {
	// Make sure the path starts with "/".
	if (normalizedPath.indexOf("/") != 0) {
		return false;
	}
	
	// Make sure there is no attempt at trying to climb up the tree.
	if (normalizedPath.indexOf("..") != -1) {
		return false;
	}
	
	if (!isAllowedFileType(Path.extname(normalizedPath))) {
		return false;
	}
	
	if (!Fs.existsSync(staticContentRoot + normalizedPath)) {
		return false;
	}
	
	return true;
}

function writeInternalErrorStatus(request, response) {
	response.writeHead(500, "Internal Error", {'Content-Type': 'text/plain'});
	response.end("500 Internal Error");	
}

function writeNotFoundStatus(request, response) {
	response.writeHead(404, "Not found", {'Content-Type': 'text/plain'});
	response.end("404 Not found");	
}

function writeJSON(request, response, output) {	
	response.writeHead(200, {
		'Content-Type': 'application/json',
		'Cache-Control': 'no-cache',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Content-Length': output.length
	});
					
	response.end(output);	
}

function handleStaticFile(path, request, response, staticContentRoot) {	
	var typeConfig = allowedFileTypes[Path.extname(path)];
	
	Fs.readFile(staticContentRoot + path, typeConfig["encoding"], function (error, file) {
		if (error) {
			writeInternalErrorStatus(query, request, response);
		} else {
			response.writeHead(200, {
				'Content-Type': typeConfig["Content-Type"],
				'Content-Length': file.length,
				'Cache-Control': "max-age=3600", // Static files cached at most 1 hour.
			});
			response.write(file, typeConfig["encoding"]);
			response.end();
		}
	});
}

// Usage: createAppServer(requestHandlers, [staticContentRoot])
function createAppServer(requestHandlers, staticContentRoot) {
	return {		
		startOnPort: function (port) {
			this.server = Http.createServer(this.requestRouter);
			this.server.listen(port);
			console.log("*** App server running on port " + port);
		},
		
		requestRouter: function (request, response) {
			var query = Url.parse(request.url, true);
			
			// Is the request for a dynamic page?
			var handlerFunction = requestHandlers[query.pathname];
			if (handlerFunction) {
				handlerFunction(query, request, response);
				return;
			}
			
			// Guess not. Is the request for a static page?
			if (staticContentRoot) {
				var normalizedPath = Path.normalize(query.pathname);
				if (isStaticFile(normalizedPath, staticContentRoot)) {
					handleStaticFile(normalizedPath, request, response, staticContentRoot);
					return;
				}
			}
			
			// Nope. Can't find the page. This is a 404.
			writeNotFoundStatus(request, response);
		}
	}
}
