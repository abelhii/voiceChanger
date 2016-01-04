window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
var audioInput = null
var audioRecorder = null, realAudioInput = null, inputPoint = null, zeroGain = null;;
var rafID = null;
var analyserContext = null;
var canvasWidth, canvasHeight;
var recIndex = 0;
var sourcee;

//**************INIT AUDIO**********//
navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia || 
                         navigator.mediaDevices.getUserMedia
var p = navigator.mediaDevices.getUserMedia({audio: true, video: false});

p.then(function(mediaStream){
    var audio = document.getElementById('liveAudio');
    audio.src = window.URL.createObjectURL(mediaStream);
    audio.onloadedmetadata = function(e){
        //do something
        gotStream(mediaStream);
    }
});

p.catch(function(e) {alert("no mic detected"); console.log(e.name); }); //check for errors 
//**************INIT AUDIO************//


function saveAudio() {
    audioRecorder.exportWAV( doneEncoding );
    // could get mono instead by saying
    // audioRecorder.exportMonoWAV( doneEncoding );
}

function doneEncoding( blob ) {
    Recorder.setupDownload( blob, "myRecording" + ((recIndex<10)?"0":"") + recIndex + ".wav" );
    recIndex++;
}

function toggleRecording( e ){
    if (e.classList.contains("recording")) {
        // stop recording
        audioRecorder.stop();
        e.classList.remove("recording");
        audioRecorder.exportWAV( doneEncoding );
    } else {
        // start recording
        if (!audioRecorder){
            return;
        }
        e.classList.add("recording");
        //audioRecorder.clear();
        audioRecorder.record();
    }

}

function convertToMono( input ) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);

    input.connect( splitter );
    splitter.connect( merger, 0, 0 );
    splitter.connect( merger, 0, 1 );
    return merger;
}

function cancelAnalyserUpdates() {
    window.cancelAnimationFrame( rafID );
    rafID = null;
}

function toggleMono() {
    if (audioInput != realAudioInput) {
        audioInput.disconnect();
        realAudioInput.disconnect();
        audioInput = realAudioInput;
    } else {
        realAudioInput.disconnect();
        audioInput = convertToMono( realAudioInput );
    }

    audioInput.connect(inputPoint);
}


//live streams voice!
function gotStream(stream){
    if (!audioContext.createGain)
        audioContext.createGain = audioContext.createGainNode;
    inputPoint = audioContext.createGain();

    // Create an AudioNode from the stream.
    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);
    //audioInput = convertToMono( input );

    //analyserNode for visual representation
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    inputPoint.connect( analyserNode );

    audioRecorder = new Recorder(inputPoint);

    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect( zeroGain );
    zeroGain.connect( audioContext.destination );

    updateAnalysers();
    sourcee = stream;
}


//For the fancy graphics
function updateAnalysers(time) {
    if (!analyserContext) {
        var canvas = document.getElementById("analyser");
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        analyserContext = canvas.getContext('2d');
    }

    // analyzer draw code here
    {
        var SPACING = 3;
        var BAR_WIDTH = 1;
        var numBars = Math.round(canvasWidth / SPACING);
        var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

        analyserNode.getByteFrequencyData(freqByteData); 

        analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
        analyserContext.fillStyle = '#F6D565';
        analyserContext.lineCap = 'round';
        var multiplier = analyserNode.frequencyBinCount / numBars;

        // Draw rectangle for each frequency bin.
        for (var i = 0; i < numBars; ++i) {
            var magnitude = 0;
            var offset = Math.floor( i * multiplier );
            // gotta sum/average the block, or we miss narrow-bandwidth spikes
            for (var j = 0; j< multiplier; j++)
                magnitude += freqByteData[offset + j];
            magnitude = magnitude / multiplier;
            var magnitude2 = freqByteData[i * multiplier];
            analyserContext.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
            analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
        }
    }
    
    rafID = window.requestAnimationFrame( updateAnalysers );
}


//To play back
function getBufferCallback( buffers ) {
    var newSource = audioContext.createBufferSource();
    var newBuffer = audioContext.createBuffer( 2, buffers[0].length, audioContext.sampleRate );
    newBuffer.getChannelData(0).set(buffers[0]);
    newBuffer.getChannelData(1).set(buffers[1]);
    newSource.buffer = newBuffer;

    newSource.connect( audioContext.destination );
    newSource.start(0);
}

function playEncoding(blob){
    Recorder.forceDownload( blob, "play.wav" );
}


/*
function play(e){    
    if (e.classList.contains("playing")) {
        // stop playing
        e.classList.remove("playing");
        //this just changes the image:
        e.src="imgs/playBtn.png";
    } else {
        // start playing
        e.classList.add("playing");
        e.src="imgs/pause.png";
    }

    var audio = document.getElementById('playAudio');
    audio.src = getBufferCallback(audioRecorder.getBuffers);
    audio.play();
    audio.onloadedmetadata = function(e){
        //do something
    }
}*/