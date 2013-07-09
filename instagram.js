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
