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

var Https = require('https');
var Fs = require('fs');

exports.getImagesByLocation = getImagesByLocation;
exports.periodicallyGetImagesByLocation = periodicallyGetImagesByLocation;

var instagramClientId = readInstagramClientId();

function readInstagramClientId() {
	var clientId = Fs.readFileSync(__dirname + "/instagram.txt", "utf8");
	if (clientId) {
		return clientId.trim();		
	} else {
		console.log("*** Error: Unable to read Instagram client ID from file instagram.txt");
		return null;
	}
}

function getImagesByLocation(latitude, longitude, distance, completionCallback, errorCallback) {
	Https.get('https://api.instagram.com/v1/media/search?client_id='
	 	+ instagramClientId
		+ '&lat=' + latitude
		+ '&lng=' + longitude
		+ '&distance=' + distance,
		function(res) {
		// FIXME: We should really check the res.statusCode here...
		if (res.statusCode != 200) {
			errorCallback("Unable to get images, HTTP status code " + res.statusCode);
			return;
		}		
		var data = new Buffer("", "utf8");
		
		res.on('data', function (moreData) {
			data = Buffer.concat([data, moreData]);
		});
		
		res.on('end', function (moreData) {
			if (moreData) {
				data = Buffer.concat([data, moreData]);
			}			
			completionCallback(data);
		});

	}).on('error', function(e) {
		errorCallback(e);
	});	
}


function periodicallyGetImagesByLocation(latitude, longitude, distance, imagesUpdatedCallback) {
	
	console.log("*** Periodically getting images from Stockholm every 60 seconds.");
	
	getImagesByLocation(latitude, longitude, distance, imagesUpdatedCallback, function (error) {
		console.log("*** Error: " + error);
	})
	
	setInterval(function () {
		getImagesByLocation(latitude, longitude, distance, imagesUpdatedCallback, function (error) {
			console.log("*** Error: " + error);
		})
	}, 60000);
}
