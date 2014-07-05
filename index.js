var config = require('./config'),
	util = require('./util');

var express = require('express'),
	serveStatic = require('serve-static'),
	compression = require('compression'),
	logger = require('morgan');

var path = require('path'),
	http = require('http');

var app = express(),
	server = http.Server(app),
	io = require('socket.io')(server);

/*app.get('/', function(req, res){
	//res.send('<h1>Hello world</h1>');
	res.sendfile('static/index.html');
});*/

app.use(logger('dev'));
app.use(compression());
app.use(serveStatic(path.join(__dirname, 'public')));
// Serve uploads dir too
app.use('/uploads', serveStatic(path.join(__dirname, 'uploads')));

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

server.listen(config.port, function(){
	console.log('listening on *:' + config.port);
});


io.sockets.on('connection', function (socket) {
	socket.on('message', function (data) {
		// ffmpeg_finished = false;

		var fileName = Math.round(Math.random() * 99999999) + 99999999;

		util.writeToDisk(data.audio.dataURL, fileName + '.wav');

		// if it is chrome
		if(data.video) {
			util.writeToDisk(data.video.dataURL, fileName + '.webm');
			util.merge(socket, fileName);
		}

		// if it is firefox or if user is recording only audio
		else {
			socket.emit('merged', fileName);
		}
	});
});

