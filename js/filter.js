//***********Delay Filter******************//
//http://blog.chrislowis.co.uk/2014/07/23/dub-delay-web-audio-api.html
var delayFilter = {
  playingD: false
}


delayFilter.play = function(){
  inputt = audioContext.createMediaStreamSource(sourcee);

  delay = audioContext.createDelay();
  delay.delayTime.value = 0.5;

  feedback = audioContext.createGain();
  feedback.gain.value = 0.8;

  filter = audioContext.createBiquadFilter();
  filter.frequency.value = 1000;
  
  audioInput.connect(delay);
  audioInput.connect(audioContext.destination);
  inputt.connect(audioContext.destination);
  delay.connect(audioContext.destination);  

  // Save audioInput and filterNode for later access.
  this.inputt = inputt;
  this.delay = delay;
}

delayFilter.stop = function(){
  this.inputt.disconnect();
  this.delay.disconnect();
}

delayFilter.toggle = function(){
  var btn = document.getElementById("DelayBtn");
  if(this.playingD){
    this.stop();
    btn.value = "Turn Delay Filter On";
  }else{
    this.play();
    btn.value = "Turn Delay Filter Off"; 
  }
  this.playingD = !this.playingD;
}

delayFilter.changeDelayTime = function(element){
  this.delay.delayTime.value = element * 0.5;
};

//*************************************************//




//*******************Distortion Filter****************//
var distortFilter = {
  plyingDist: false
}

distortFilter.play = function(){
  distortion = audioContext.createWaveShaper();
  audioInput.connect(distortion);
  distortion.connect(audioContext.destination);

  // Save audioInput and filterNode for later access.
  this.audioInput = audioInput;
  this.distortion = distortion;
};

distortFilter.toggle = function(){
  var btn = document.getElementById("DistBtn");
  if(this.playingDist){
    this.distortion.disconnect();
    btn.value = "Turn Distortion Filter On";
  }else{
    this.play();
    btn.value = "Turn Distortion Filter Off"; 
  }
  this.playingDist = !this.playingDist;
};

distortFilter.changeCurve = function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  this.distortion.curve = curve;
  //return curve;
};

//*************************************************//




//******************Biquad Filter******************//
var FilterOne = {
  FREQ_MUL: 7000,
  QUAL_MUL: 30,
  DET_MUL: 3000,
  GAIN_MUL: 1,
  playing: false
};

FilterOne.play = function(){
    //Don't have to create the source because it's being taken live from the user's microphone from main.js
    // Create the filter.
    filter = audioContext.createBiquadFilter();
    //filter.type is defined as string type in the latest API. But this is defined as number type in old API.
    filter.type = (typeof filter.type === 'string') ? 'lowpass' : 0; // LOWPASS
    //Set default values for frequency, q and detune values:
    filter.frequency.value = 3000;
    filter.Q.value = 30;
    filter.detune.value = 3000;
    // Connect source/audioInput to filter, filter to destination.
    audioInput.connect(filter);
    filter.connect(audioContext.destination);

    //record the filtered audio
    audioRecorder = new Recorder(filter);

    // Save audioInput and filterNode for later access.
    this.audioInput = audioInput;
    this.filter = filter;

    //updateAnalysers();
};

FilterOne.stop = function() {
  this.filter.disconnect();
  //cancelAnalyserUpdates();
  //updateAnalysers();
};

FilterOne.toggle = function() {
  var btn = document.getElementById("filterOneBtn");
  if(this.playing){
    this.stop()
    btn.value = "Turn Biquad Filter On";
  }else{
    this.play();
    btn.value = "Turn Biquad Filter Off";
  }
  this.playing = !this.playing;
};

FilterOne.changeFrequency = function(element) {
  // Clamp the frequency between the minimum value (40 Hz) and half of the
  // sampling rate.
  var minValue = 40;
  var maxValue = audioContext.sampleRate / 2;
  // Logarithm (base 2) to compute how many octaves fall in the range.
  var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
  // Compute a multiplier from 0 to 1 based on an exponential scale.
  var multiplier = Math.pow(2, numberOfOctaves * (element.value - 1.0));
  // Get back to the frequency value between min and max.
  this.filter.frequency.value = maxValue * multiplier;
};

FilterOne.changeQuality = function(element) {
  this.filter.Q.value = element.value * this.QUAL_MUL;
};

FilterOne.changeDetune = function(element){
  this.filter.detune.value = element.value * this.DET_MUL;
};

FilterOne.changeGain = function(element){
  this.filter.gain.value = element.value * this.GAIN_MUL;
};


FilterOne.toggleFilter = function(element) {
  this.audioInput.disconnect(0);
  this.filter.disconnect(0);
  // Check if we want to enable the filter.
  if (element.checked) {
    // Connect through the filter.
    this.audioInput.connect(this.filter);
    this.filter.connect(audioContext.destination);
  } else {
    // Otherwise, connect directly.
    this.audioInput.connect(audioContext.destination);
  }
};

//*************************************************//


