var fs = require('fs');

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
			socket.emit('ffmpeg-output', progress.percent);
		})
		.on('end', function() {
			socket.emit('merged', fileName + '-merged.webm');
			console.log('Merging finished !');
		})
		.saveToFile(mergedFile);
};

module.exports = function (io) {
	io.sockets.on('connection', function (socket) {
		socket.on('message', function (data) {
			var fileName = Math.round(Math.random() * 99999999) + 99999999;

			writeToDisk(data.audio.dataURL, fileName + '.wav');

			// if it is chrome
			if(data.video) {
				writeToDisk(data.video.dataURL, fileName + '.webm');
				merge(socket, fileName);
			}

			// if it is firefox or if user is recording only audio
			else {
				socket.emit('merged', fileName + '.wav');
			}
		});
	});
};