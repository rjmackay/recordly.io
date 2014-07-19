var fs = require('fs'),
	uuid = require('node-uuid'),
	config = require('./config');

var writeToDisk = function(dataURL, fileName) {
		var fileExtension = fileName.split('.').pop(),
				fileRootNameWithBase = './uploads/' + fileName,
				filePath = fileRootNameWithBase,
				fileID = 2,
				fileBuffer;

		while (fs.existsSync(filePath)) {
				filePath = fileRootNameWithBase + '(' + fileID + ').' + fileExtension;
				fileID += 1;
		}

		dataURL = dataURL.split(',').pop();
		fileBuffer = new Buffer(dataURL, 'base64');
		fs.writeFileSync(filePath, fileBuffer);

		console.log('filePath', filePath);
};

var s3upload = function(file, callback) {
	var knox = require('knox');
	var client = knox.createClient({
		key: config.s3.key,
		secret: config.s3.secret,
		bucket: config.s3.bucket
	});

	client.putFile(__dirname + '/uploads/' + file, '/' + file, function (error, response) {
		if (error) {
			console.log('S3 Upload error: '+ error);
		}

		console.log('Uploaded to: ' + response.req.url);
		callback(response.req.url);
	});
};

var merge = function(socket, fileName) {
	var FFmpeg = require('fluent-ffmpeg');

	var audioFile = __dirname + '/uploads/' + fileName + '.wav',
		videoFile = __dirname + '/uploads/' + fileName + '.webm',
		mergedFile = __dirname + '/uploads/' + fileName + '-merged.webm';

	new FFmpeg({ source: videoFile })
		.addInput(audioFile)
		.on('error', function(err) {
			socket.emit('ffmpeg-error', 'ffmpeg : An error occurred: ' + err.message);
		})
		.on('progress', function(progress) {
			socket.emit('ffmpeg-output', Math.round(progress.percent));
		})
		.on('end', function() {
			if (config.s3_enabled)
			{
				s3upload(fileName + '-merged.webm', function (url) {
					socket.emit('merged', url);
				});
			}
			else {
				socket.emit('merged', '/uploads/' + fileName + '-merged.webm');
			}
			console.log('Merging finished !');
		})
		.saveToFile(mergedFile);
};

module.exports = function (io) {
	io.sockets.on('connection', function (socket) {
		socket.on('message', function (data) {
			var fileName = uuid.v4();

			socket.emit('ffmpeg-output', 0);
			writeToDisk(data.audio.dataURL, fileName + '.wav');

			// if it is chrome
			if(data.video) {
				writeToDisk(data.video.dataURL, fileName + '.webm');
				merge(socket, fileName);
			}

			// if it is firefox or if user is recording only audio
			else {
				socket.emit('merged', '/uploads/' + fileName + '.wav');
			}
		});
	});
};