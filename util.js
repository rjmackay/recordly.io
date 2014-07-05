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
	var exec = require('child_process').exec;

	// its probably *nix, assume ffmpeg is available
	var audioFile = __dirname + '/uploads/' + fileName + '.wav';
	var videoFile = __dirname + '/uploads/' + fileName + '.webm';
	var mergedFile = __dirname + '/uploads/' + fileName + '-merged.webm';
	//child_process = require('child_process');

	var command = 'ffmpeg -i ' + videoFile + ' -i ' + audioFile + ' -map 0:0 -map 1:0 ' + mergedFile + '  1> ffmpeg-output/' + fileName + '.txt 2>&1';

	/*var child = */exec(command, function (error) {
		if (error) {
			console.log(error.stack);
			console.log('Error code: ' + error.code);
			console.log('Signal received: ' + error.signal);

		} else {
			ffmpeg_finished = true;
			socket.emit('merged', fileName + '-merged.webm');

			// removing audio/video files
			fs.unlink(audioFile);
			fs.unlink(videoFile);

			// auto delete file after 1-minute
			setTimeout(function () {
					fs.unlink(mergedFile);
			}, 60 * 1000);
		}
	});

	readFfmpeOutput(fileName, socket);
}

var ffmpeg_finished = false;

function readFfmpeOutput(fileName, socket) {
	if (ffmpeg_finished) { return; }
	fs.readFile('ffmpeg-output/' + fileName + '.txt', 'utf8', function (err, content) {
		if (!err && content.match(/Duration: (.*?), start:/)) {
			var duration = 0,
				time = 0,
				progress = 0;

			var matches = (content) ? content.match(/Duration: (.*?), start:/) : [];
			if (matches.length > 0) {
				var rawDuration = matches[1];
				var ar = rawDuration.split(':').reverse();
				duration = parseFloat(ar[0]);
				if (ar[1]) { duration += parseInt(ar[1]) * 60; }
				if (ar[2]) { duration += parseInt(ar[2]) * 60 * 60; }
				matches = content.match(/time=(.*?) bitrate/g);
				if (content.match(/time=(.*?) bitrate/g) && matches.length > 0) {
					var rawTime = matches.pop();
					rawTime = rawTime.replace('time=', '').replace(' bitrate', '');
					ar = rawTime.split(':').reverse();
					time = parseFloat(ar[0]);
					if (ar[1]) { time += parseInt(ar[1]) * 60; }
					if (ar[2]) { time += parseInt(ar[2]) * 60 * 60; }
					progress = Math.round((time / duration) * 100);
				}

				socket.emit('ffmpeg-output', progress);
			} else if (content.indexOf('Permission denied') > -1) {
				socket.emit('ffmpeg-error', 'ffmpeg : Permission denied, either for ffmpeg or upload location ...');
			}

			readFfmpeOutput(fileName, socket);
		} else {
			setTimeout(function() {
				readFfmpeOutput(fileName, socket);
			}, 500);
		}
	});
}

module.exports = {
	merge : merge,
	writeToDisk : writeToDisk
};