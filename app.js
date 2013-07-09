
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
