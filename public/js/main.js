/* global RecordRTC, io */

// you can set it equal to "false" to record only audio
var recordVideoSeparately = !!navigator.webkitGetUserMedia;

if(!!navigator.webkitGetUserMedia && !recordVideoSeparately) {
	var cameraPreview  = document.getElementById('camera-preview');
	cameraPreview.parentNode.innerHTML = '<audio id="camera-preview" controls style="border: 1px solid rgb(15, 158, 238); width: 94%;"></audio> ';
}

var socketio = io();
var mediaStream = false;

socketio.on('connect', function() {
	startRecording.disabled = false;
});

var startRecording = document.getElementById('start-recording');
var stopRecording  = document.getElementById('stop-recording');
var cameraPreview  = document.getElementById('camera-preview');

var progressDiv = document.querySelector('.progress');
var progressBar = document.querySelector('.progress-bar');
var percentage = document.querySelector('.progress-percentage');

var videoLink  = document.getElementById('video-link');

var recordAudio, recordVideo;
startRecording.onclick = function() {
	startRecording.disabled = true;
	startRecording.parentNode.className = 'recording-buttons';
	cameraPreview.className = 'camera-preview';
	navigator.getUserMedia({
			audio: true,
			video: true
		}, function(stream) {
			mediaStream = stream;
			recordAudio = new RecordRTC(stream, {
				onAudioProcessStarted: function() {
					recordVideoSeparately && recordVideo.startRecording();

					cameraPreview.src = window.URL.createObjectURL(stream);
					cameraPreview.muted = true;
					cameraPreview.controls = false;

					cameraPreview.play();
				}
			});

			recordVideo = new RecordRTC(stream, {
				type: 'video'
			});

			recordAudio.startRecording();

			stopRecording.disabled = false;
		}, function(error) {
			console.log( JSON.stringify( error ) );
		});
};

stopRecording.onclick = function() {
	//startRecording.disabled = false;
	stopRecording.disabled = true;

	// stop audio recorder
	recordVideoSeparately && recordAudio.stopRecording(function() {
		// stop video recorder
		recordVideo.stopRecording(function() {

			// get audio data-URL
			recordAudio.getDataURL(function(audioDataURL) {

				// get video data-URL
				recordVideo.getDataURL(function(videoDataURL) {
					var files = {
						audio: {
							type: recordAudio.getBlob().type || 'audio/wav',
							dataURL: audioDataURL
						},
						video: {
							type: recordVideo.getBlob().type || 'video/webm',
							dataURL: videoDataURL
						}
					};

					socketio.emit('message', files);

					mediaStream.stop();
				});

			});

			cameraPreview.src = '';
			cameraPreview.poster = 'ajax-loader.gif';
		});

	});

	// if firefox or if you want to record only audio
	// stop audio recorder
	!recordVideoSeparately && recordAudio.stopRecording(function() {
		// get audio data-URL
		recordAudio.getDataURL(function(audioDataURL) {
			var files = {
				audio: {
					type: recordAudio.getBlob().type || 'audio/wav',
					dataURL: audioDataURL
				}
			};

			socketio.emit('message', files);
			mediaStream.stop();
		 });

		cameraPreview.src = '';
		cameraPreview.poster = 'ajax-loader.gif';
	 });
};

var setProgress = function(result) {
	if(parseInt(result) >= 100) {
		progressDiv.className = 'progress hide';
		return;
	}
	progressDiv.className = 'progress';
	progressBar.value = result;
	percentage.innerHTML = 'Processing ' + result + '%';
};

socketio.on('merged', function(fileName) {
	var href = fileName;

	console.log('got file ' + href);

	setProgress(100);

	cameraPreview.src = href;
	cameraPreview.play();
	cameraPreview.muted = false;
	cameraPreview.controls = true;

	videoLink.className = '';
	videoLink.value = href;
});

socketio.on('ffmpeg-output', setProgress);

socketio.on('ffmpeg-error', function(error) {
	alert(error);
});