var streaming = false,
		video        = document.querySelector('#camera-preview'),
		startbutton  = document.querySelector('#start-recording'),
		stopbutton   = document.querySelector('#stop-recording'),
		progressDiv  = document.querySelector('.progress'),
		progressBar  = document.querySelector('.progress-bar'),
		percentage   = document.querySelector('.progress-percentage'),
		videoLink    = document.querySelector('#video-link'),
		width = 320,
		height = 0,
		mediaStream;

// Normalize prefix'd getMedia calls
navigator.getMedia = ( navigator.getUserMedia ||
											 navigator.webkitGetUserMedia ||
											 navigator.mozGetUserMedia ||
											 navigator.msGetUserMedia);

// Listen for a click on 'start'
startbutton.addEventListener('click', function(ev) {
	ev.preventDefault();
	// Trigger UI changes
	// Disable the start button
	startbutton.disabled = true;
	// Remove the 'init' class
	startbutton.parentNode.classList.remove('init');
	// Remove the 'hide' class
	video.classList.remove('hide');
	// We get a media stream ..
	navigator.getMedia(
		{
			// .. of both audio and video
			video: true,
			audio: true
		},
		function(stream) {
			// save the mediam stream for later
			mediaStream = stream;
			// and display it in our <video> element
			if (navigator.mozGetUserMedia) {
				// Mozilla can pass the stream directly
				video.mozSrcObject = stream;
			} else {
				// other browsers require us to create an object URL first
				var vendorURL = window.URL || window.webkitURL;
				video.src = vendorURL.createObjectURL(stream);
			}
			// mute the video to avoid feedback
			video.muted = true;
			// and hide controls
			video.controls = false;
			// Play the output in the <video> element
			video.play();
		},
		function(err) {
			// Just in case, log any errors
			console.log('An error occured! ' + err);
		}
	);
});

video.addEventListener('canplay', function(ev){
	if (!streaming) {
		// Normalize the video height
		height = video.videoHeight / (video.videoWidth/width);
		video.setAttribute('width', width);
		video.setAttribute('height', height);
		streaming = true;
	}
}, false);

stopbutton.addEventListener('click', function(ev){
	ev.preventDefault();
	stopbutton.disabled = true;


}, false);
