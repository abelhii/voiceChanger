var FilterOne = {
  FREQ_MUL: 7000,
  QUAL_MUL: 30,
  playing: false
};

/**FilterOne.play = function() {
  // Create the source.
  var source = audioContext.createBufferSource();
  source.buffer = BUFFERS.techno;
  // Create the filter.
  var filter = audioContext.createBiquadFilter();
  //filter.type is defined as string type in the latest API. But this is defined as number type in old API.
  filter.type = (typeof filter.type === 'string') ? 'lowpass' : 0; // LOWPASS
  filter.frequency.value = 5000;
  // Connect source to filter, filter to destination.
  source.connect(filter);
  filter.connect(audioContext.destination);
  // Play!
  if (!source.start)
    source.start = source.noteOn;
  source.start(0);
  source.loop = true;
  // Save source and filterNode for later access.
  this.source = source;
  this.filter = filter;
};

FilterOne.stop = function() {
  if (!this.source.stop)
    this.source.stop = source.noteOff;
  this.source.stop(0);
  this.source.noteOff(0);
};*/

FilterOne.play = function(){
    // Create the source.
    //var source = audioContext.createBufferSource();
    //source.buffer = audioInput.getBuffer;
    // Create the filter.
    filter = audioContext.createBiquadFilter();
    //filter.type is defined as string type in the latest API. But this is defined as number type in old API.
    filter.type = (typeof filter.type === 'string') ? 'lowpass' : 0; // LOWPASS
    filter.frequency.value = 5000;
    // Connect source/audioInput to filter, filter to destination.
    audioInput.connect(inputPoint);
    audioInput.connect(filter);
    filter.connect(audioContext.destination);


    // Save audioInput and filterNode for later access.
    this.audioInput = audioInput;
    this.filter = filter;

    updateAnalysers();
};

FilterOne.stop = function() {
  /*if (!this.audioInput.stop)
    this.audioInput.stop = audioInput.noteOff;
  this.audioInput.stop(0);*/
  //this.audioInput.noteOff(0);
  this.audioInput.disconnect(0);
  updateAnalysers();
};

FilterOne.toggle = function() {
  var btn = document.getElementById("filterOneBtn");
  if(this.playing){
    this.stop()
    btn.value = "turn filter on";
  }else{
    this.play();
    btn.value = "turn filter off";
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
/**
FilterOne.toggleFilter = function(element) {
  this.source.disconnect(0);
  this.filter.disconnect(0);
  // Check if we want to enable the filter.
  if (element.checked) {
    // Connect through the filter.
    this.source.connect(this.filter);
    this.filter.connect(audioContext.destination);
  } else {
    // Otherwise, connect directly.
    this.source.connect(audioContext.destination);
  }
};
*/