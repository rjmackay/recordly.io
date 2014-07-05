var
		fs = require('fs');

function writeToDisk(dataURL, fileName) {
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
}

function merge (socket, fileName) {
	var FFmpeg = require('fluent-ffmpeg');

	var audioFile = __dirname + '/uploads/' + fileName + '.wav',
		videoFile = __dirname + '/uploads/' + fileName + '.webm',
		mergedFile = __dirname + '/uploads/' + fileName + '-merged.webm';

	var command = new FFmpeg({ source: videoFile })
		.mergeAdd(audioFile)
		.on('error', function(err) {
			console.log('An error occurred: ' + err.message);
			socket.emit('ffmpeg-error', 'ffmpeg : Permission denied, either for ffmpeg or upload location ...');
		})
		.on('progress', function(progress) {
			socket.emit('ffmpeg-output', progress.percent);
		})
		.on('end', function() {
			socket.emit('merged', fileName + '-merged.webm');
			console.log('Merging finished !');
		})
		.mergeToFile(mergedFile);
}

module.exports = {
	merge : merge,
	writeToDisk : writeToDisk
};