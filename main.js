/* Copyright 2013 Chris Wilson
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
var audioRecorder = null, inputPoint = null, zeroGain = null;
var buff = null;

var p = navigator.mediaDevices.getUserMedia({audio: true, video: false});

p.then(function(mediaStream){
    var audio = document.getElementById('liveAudio');
    audio.src = window.URL.createObjectURL(mediaStream);
    audio.onloadedmetadata = function(e){
        //do something
        gotStream(mediaStream);
    }
});

p.catch(function(e) {alert("not working"); console.log(e.name); }); //check for errors at the end

//live streams voice!
function gotStream(stream){
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
    //updateAnalysers();
    //alert("poo");
}




function toggleRecording( e ){
    if (e.classList.contains("recording")) {
        // stop recording
        e.classList.remove("recording");
        this.audioRecorder.stop();
        this.audioRecorder.getBuffers( gotBuffers );
        buff = gotBuffers;
        alert("hello");
    } else {
        // start recording
        if (!audioRecorder){
            alert(audioRecorder);
            return;
        }
        e.classList.add("recording");
        audioRecorder.clear();
        audioRecorder.record();
    }
}



function play(){    
    alert("play");
    playSound(buff);
    //var audio = document.getElementById("recordedAudio");
    //audio.play(playSound());
}

var analyserNode = null;
function playSound(buffer) {  
    var newSource = audioContext.createBufferSource();
    var newBuffer = audioContext.createBuffer( 2, buffers[0].length, audioContext.sampleRate );
    newBuffer.getChannelData(0).set(buffers[0]);
    newBuffer.getChannelData(1).set(buffers[1]);
    newSource.buffer = newBuffer;

    newSource.connect( audioContext.destination );
    newSource.start(0);
}

function gotBuffers( buffers ) {
    var canvas = document.getElementById( "wavedisplay" );

    drawBuffer( canvas.width, canvas.height, canvas.getContext('2d'), buffers[0] );

    // the ONLY time gotBuffers is called is right after a new recording is completed - 
    // so here's where we should set up the download.
    audioRecorder.exportWAV( doneEncoding );
}

function drawBuffer( width, height, context, data ) {
    var step = Math.ceil( data.length / width );
    var amp = height / 2;
    context.fillStyle = "silver";
    context.clearRect(0,0,width,height);
    for(var i=0; i < width; i++){
        var min = 1.0;
        var max = -1.0;
        for (j=0; j<step; j++) {
            var datum = data[(i*step)+j]; 
            if (datum < min)
                min = datum;
            if (datum > max)
                max = datum;
        }
        context.fillRect(i,(1+min)*amp,1,Math.max(1,(max-min)*amp));
    }
}