var http = require('http'),
	app = require('./app'),
	config = require('./config');

var server = http.Server(app),
	io = require('socket.io')(server),
	iohandler = require('./iohandler')(io);

app.set('port', process.env.PORT || config.port || 3000);

module.exports = function () {
	server.listen(app.get('port'), function() {
	  console.log('Express server listening on port ' + server.address().port);
	});
	return server;
};

