var
	express = require('express'),
	serveStatic = require('serve-static'),
	compression = require('compression'),
	logger = require('morgan'),
	path = require('path'),
	config = require('./config');

var app = express();

app.use(logger('dev'));
app.use(compression());
app.use(serveStatic(path.join(__dirname, '..', 'public')));
// Serve uploads dir too
app.use('/uploads', serveStatic(config.upload_dir));

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

module.exports = app;

