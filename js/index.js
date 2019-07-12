/* This is the main JavaScript file for the DT-Keyboard*/
/* Credits to Matteo Manzolini, Alessandro Montali, Davide Salvi */

var selectedPreset=_tone_0000_Chaos_sf2_file;
var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContextFunc();
var player=new WebAudioFontPlayer();
var index = 0;
var sound = [];
var instruments = [];
var instrumentsInfo=[];
var channelMaster = player.createChannel(audioContext);	
var reverberator = player.createReverberator(audioContext);
var vibratoDur = 0;
var vibratoVolumeMin = 0.25;
var usingFirebase = false;

channelMaster.output.connect(reverberator.input);
reverberator.output.connect(audioContext.destination);

//Load Instruments
instrumentsInfo[0] = player.loader.instrumentInfo(1);   //Piano
instrumentsInfo[1] = player.loader.instrumentInfo(160); //Organ  
instrumentsInfo[2] = player.loader.instrumentInfo(286); //Guitar 
instrumentsInfo[3] = player.loader.instrumentInfo(483); //Violin
instrumentsInfo[4] = player.loader.instrumentInfo(721)  //Sax 
for(i=0;i<instrumentsInfo.length;i++){
  player.loader.startLoad(audioContext, instrumentsInfo[i].url, instrumentsInfo[i].variable);
  player.loader.waitLoad(function() {
	  instruments[i] = window[instrumentsInfo[i].variable];
	  player.loader.decodeAfterLoading(audioContext, instrumentsInfo[i].variable);
	  selectedPreset = instruments[0];
  });
}

//Given the MIDI value, the interaction of the key (pressed or released) and the instrument,
//Play the sound
function playSound(freq, what, instr){ 
  if(what===1){
    //console.log("attack: ",freq);
    if(!sound[freq]){
      vibrato();
      sound[freq]=player.queueWaveTable(audioContext, channelMaster.input, instr, 0, freq, 999);
    }   
  }
  else if(what===0){
    //console.log("release: ",freq);
    if(sound[freq]){
			sound[freq].cancel();
			sound[freq]=null;
	  }
  }
}

tonalities = [
  ['A♭+','E♭+', 'B♭+', 'F+', 'C+', 'G+', 'D+', 'A+', 'E+', 'B+', 'F#+', 'C#+'],
  ['F-', 'C-', 'G-', 'D-', 'A-', 'E-', 'B-', 'F#-', 'C#-', 'G#-', 'D#-', 'A#-']
]

tonalities_nosign = [
  ['A♭','E♭', 'B♭', 'F', 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'],
  ['F', 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#']
]

frequencies = [ 
  [56, 63, 58, 53, 60, 55, 62, 57, 64, 59, 54, 61], //MIDI
  [53, 60, 55, 62, 57, 64, 59, 54, 61, 56, 63, 58]
]

modes = [
  [0, 2, 4, 5, 7, 9, 11, 12],
  [0, 2, 3, 5, 7, 8, 10, 12]
]

t = 4;    // tonality
m = 0;    // major or minor
oct = 0;  // octave
keys = "asdfghjk";
document.getElementById("minorScales").setAttribute("disabled","");
document.getElementById("tonality").innerHTML = tonalities[m][t];
document.getElementById(tonalities[m][t]).classList.add("tonalita-attiva")

var sign_flag = [1,1];

document.getElementById("A♭+").innerHTML = tonalities[0][0];
document.getElementById("E♭+").innerHTML = tonalities[0][1];
document.getElementById("B♭+").innerHTML = tonalities[0][2];
document.getElementById("F+").innerHTML = tonalities[0][3];
document.getElementById("C+").innerHTML = tonalities[0][4];
document.getElementById("G+").innerHTML = tonalities[0][5];
document.getElementById("D+").innerHTML = tonalities[0][6];
document.getElementById("A+").innerHTML = tonalities[0][7];
document.getElementById("E+").innerHTML = tonalities[0][8];
document.getElementById("B+").innerHTML = tonalities[0][9];
document.getElementById("F#+").innerHTML = tonalities[0][10];
document.getElementById("C#+").innerHTML = tonalities[0][11];

document.getElementById("F-").innerHTML = tonalities[1][0];
document.getElementById("C-").innerHTML = tonalities[1][1];
document.getElementById("G-").innerHTML = tonalities[1][2];
document.getElementById("D-").innerHTML = tonalities[1][2];
document.getElementById("A-").innerHTML = tonalities[1][4];
document.getElementById("E-").innerHTML = tonalities[1][5];
document.getElementById("B-").innerHTML = tonalities[1][6];
document.getElementById("F#-").innerHTML = tonalities[1][7];
document.getElementById("C#-").innerHTML = tonalities[1][8];
document.getElementById("G#-").innerHTML = tonalities[1][9];
document.getElementById("D#-").innerHTML = tonalities[1][10];
document.getElementById("A#-").innerHTML = tonalities[1][11];

DynKeyboard = 0;
ScaleKeyboard = 0;
DBPlaying = 0;


//// DATABASE INTERACTION

//Database utility variables
var myRoom = "-";
var playingInstrument;
var playingPreset=selectedPreset;
var mDB;
var tDB;
var masterDB;
var playDB;
var releaseDB;
var timesDB;
var playingNote;
var releasingNote;
var usingModes = 0;

//Connects local values with the room ones
function initializeFirebase(){
  mDB = firebase.database().ref("Rooms/"+myRoom+"/m");
  tDB = firebase.database().ref("Rooms/"+myRoom+"/t");
  masterDB = firebase.database().ref("Rooms/"+myRoom+"/master");
  playDB = firebase.database().ref("Rooms/"+myRoom+"/play");
  releaseDB = firebase.database().ref("Rooms/"+myRoom+"/release");
  instrumentDB = firebase.database().ref("Rooms/"+myRoom+"/instrument");
  timesDB = firebase.database().ref("Rooms/"+myRoom+"/timesPlayed");
  timesRelDB = firebase.database().ref("Rooms/"+myRoom+"/timesReleased");

  mDB.on('value', stateValueM);
  tDB.on('value', stateValueT);
  masterDB.on('value', stateValueMaster);
  playDB.on('value', stateValuePlay);
  releaseDB.on('value', stateValueRelease);
  instrumentDB.on('value', stateValueInstrument);
  timesDB.on('value', stateNumberTimesPlayed)
  timesRelDB.on('value', stateNumberTimesReleased)  
  console.log("firebase initialized");
}

//Reads the value of M from Firebase and does stuff
function stateValueM(data) {
  document.getElementById(tonalities[m][t]).classList.remove("tonalita-attiva")
  m = data.val();
  if(m===0) {
    document.getElementById("minorScales").setAttribute("disabled","");
    document.getElementById("modalScales").removeAttribute("disabled");
  } else {
    document.getElementById("modalScales").setAttribute("disabled","");
    document.getElementById("minorScales").removeAttribute("disabled");
  }
  if(sign_flag[m]==1){document.getElementById("tonality").innerHTML = tonalities[m][t];}
  else{document.getElementById("tonality").innerHTML = tonalities_nosign[m][t];}
  document.getElementById(tonalities[m][t]).classList.add("tonalita-attiva")

  for(var i=0; i<8; i++) {
    playSound(tones[i], 0, selectedPreset);
    tones[i] = modes[m][i]+frequencies[m][t]+oct;
  }

  for(i=0;i<47;i++){
    pression("keyup", i);
  }

  toggleScale();
}

//Reads the value of T from Firebase and does stuff
function stateValueT(data) {
  document.getElementById(tonalities[m][t]).classList.remove("tonalita-attiva")
  t = data.val();
  if(sign_flag[m]==1){document.getElementById("tonality").innerHTML = tonalities[m][t];}
  else{document.getElementById("tonality").innerHTML = tonalities_nosign[m][t];}
  document.getElementById(tonalities[m][t]).classList.add("tonalita-attiva")

  for(var i=0; i<8; i++) {
    playSound(tones[i], 0, selectedPreset);
    tones[i] = modes[m][i]+frequencies[m][t]+oct;
  }

  for(i=0;i<47;i++){
    pression("keyup", i);
  }
  
  toggleScale()
}

//Reads and applies the value of the master volume from Firebase
function stateValueMaster(data) {
  knob0value = data.val();
  channelMaster.output.gain.setTargetAtTime(knob0value,0,0.0001);
  angle = 240*knob0value-120;
  document.getElementById("silverknob0").style.transform = 'rotate('+ angle +'deg)';
}

//Reads the value of the last played note from Firebase and plays it
function stateValuePlay(data) {
  if (DBPlaying===1) {
   playingNote = data.val();
   //console.log("Somebody played note", playingNote);
   mapInstrument();
   playSound(playingNote,1,playingPreset);
  }
}

//Reads the value of the last released note from Firebase and releases it
function stateValueRelease(data) {
  if (DBPlaying===1) {
   releasingNote = data.val();
   //console.log("Somebody released note", releasingNote);
   mapInstrument();
   playSound(playingNote,0,playingPreset);
  }
}

//Reads the instrument from Firebase and uses it to play the next note
function stateValueInstrument(data) {
  if (DBPlaying===1) {
   playingInstrument = data.val();
   //console.log("Somebody played instrument", playingInstrument);
  }
}

//Reads the value of the number of times the same note has been played
function stateNumberTimesPlayed(data) {
  numberTimesPlayed = data.val();
  if (DBPlaying===1) {
    if(numberTimesPlayed!=0){
      mapInstrument();
      playSound(playingNote, 1, playingPreset);
    }
  }
}

//Reads the value of the number of times the same note has been played
function stateNumberTimesReleased(data) {
	numberTimesReleased = data.val();
  if (DBPlaying===1) {
    if(numberTimesReleased!=0){
      mapInstrument();
      playSound(releasingNote, 0, playingPreset);
    }
  }
}

//Maps instrument names with the relative preset files from WebAudioFont
function mapInstrument(){
  if(playingInstrument==="Piano")  playingPreset=_tone_0000_Chaos_sf2_file; 
  if(playingInstrument==="Organ")  playingPreset=_tone_0160_Aspirin_sf2_file;   
  if(playingInstrument==="Guitar") playingPreset=_tone_0270_Aspirin_sf2_file;
  if(playingInstrument==="Violin") playingPreset=_tone_0440_Aspirin_sf2_file;
  if(playingInstrument==="Sax")    playingPreset=_tone_0670_Aspirin_sf2_file;
}

////SOUND CONTROL

tones = []

for(var i=0; i<8; i++) {
  tones[i] = modes[m][i]+frequencies[m][t]+oct;
}

var prevNoteRel = null;
var numberTimesReleased = 0;
var prevNote = null;
var numberTimesPlayed = 0;

//When a key is released, stops sound
document.onkeyup = function(event){
  i = keys.indexOf(event.key);
  if(i>=0){
    playSound(tones[i], 0, selectedPreset);

    if(usingFirebase){
      releasingNote = tones[i];
      releaseDB.set(releasingNote);
      releaseDB.on('value', stateValueRelease);  
      repetitionRelease();
    }
  }
}

//When a key is pressed, does the right interaction
document.onkeydown = function(event) {
  i = keys.indexOf(event.key);

  //If it's a sound key, plays the correct note
  if(i>=0 && !event.repeat){
    playSound(tones[i], 1, selectedPreset);

    if(usingFirebase){                  
      var s = document.getElementById("instruments").value;
      playingInstrument = s;
      instrumentDB.set(playingInstrument);
      instrumentDB.on('value', stateValueInstrument);
      playingNote = tones[i];
      playDB.set(playingNote);
      playDB.on('value', stateValuePlay); 
      repetitionPlay();
    }
  }
  
  //If it's the up or down arrows, changes octave
  if(event.key=='ArrowUp') {
    if(oct<1) oct = oct+12;
    for(var i=0; i<8; i++) {
      playSound(tones[i], 0, selectedPreset);
    }
  }
  if(event.key=='ArrowDown') {
    if(oct>-0.5) oct = oct-12;
    for(var i=0; i<8; i++) {
      playSound(tones[i], 0, selectedPreset);
    }
  }

  //If it's the left or right arrow, changes tonality by a fifth
  if(event.key=='ArrowLeft') {
    document.getElementById(tonalities[m][t]).classList.remove("tonalita-attiva");
    if (t>0)  {t = t-1}
     else {t=11};

    if (usingFirebase){
      tDB.set(t);
      tDB.on('value', stateValueT);
    }
    //console.log(t);
    document.getElementById(tonalities[m][t]).classList.add("tonalita-attiva");

    for(i=0;i<8;i++){
      playSound(tones[i], 0, selectedPreset);     
      tonalityTableClick(tones[i], 0);   
    }

    for(i=0;i<47;i++){
      pression("keyup", i);
    }

  }
  if(event.key=='ArrowRight') {
    document.getElementById(tonalities[m][t]).classList.remove("tonalita-attiva");  
    if (t<11) {t = t+1}
      else {t=0};
    if (usingFirebase){
      tDB.set(t);
      tDB.on('value', stateValueT);
    }
    //console.log(t);
    document.getElementById(tonalities[m][t]).classList.add("tonalita-attiva");

    for(i=0;i<8;i++){
      playSound(tones[i], 0, selectedPreset);
      tonalityTableClick(tones[i], 0);
    }

    for(i=0;i<47;i++){
      pression("keyup", i);
    }
    
  }

  //If its the Shift key, changes between major and minor relative
  if(event.key=='Shift') {
    document.getElementById(tonalities[m][t]).classList.remove("tonalita-attiva");
    m = Math.abs(m-1);
    if(m===0) {
      document.getElementById("minorScales").setAttribute("disabled","");
      document.getElementById("modalScales").removeAttribute("disabled");
    } else {
      document.getElementById("modalScales").setAttribute("disabled","");
      document.getElementById("minorScales").removeAttribute("disabled");
    }
    if(usingModes===0){
      if(m===0){
        document.querySelector(".custom-select-minor-trigger").textContent = "Major";
        modes[0]=[0, 2, 4, 5, 7, 9, 11, 12];
        sign_flag[m] = 1;
      } else {
        document.querySelector(".custom-select-minor-trigger").textContent = "Natural";
        modes[1]=[0, 2, 3, 5, 7, 8, 10, 12];
        sign_flag[m] = 1;
      }
    } else sign_flag[m] = 0;
    if (usingFirebase){
      mDB.set(m);
      mDB.on('value', stateValueM);
    }
    //console.log(m);
    document.getElementById(tonalities[m][t]).classList.add("tonalita-attiva");

    for(i=0;i<8;i++){
      playSound(tones[i], 0, selectedPreset);
      tonalityTableClick(tones[i], 0);
    }

    for(i=0;i<47;i++){
      pression("keyup", i);
    }

  }
  
  tones = []
  
  for(var i=0; i<8; i++) {
    tones[i] = tones[i] = modes[m][i]+frequencies[m][t]+oct
  }
  
  if(sign_flag[m]==1){document.getElementById("tonality").innerHTML = tonalities[m][t];}
  else{document.getElementById("tonality").innerHTML = tonalities_nosign[m][t];}
  toggleScale();
  toggleSignFlag();
}

//If a note is repeated playing, using Firebase
function repetitionPlay(){
  if (prevNote === playingNote) {
    numberTimesPlayed++;
    timesDB.set(numberTimesPlayed);
  } else {
    numberTimesPlayed = 0;
    timesDB.set(numberTimesPlayed);
  }
  prevNote = playingNote;
}

//If a note is repeated releasing, using Firebase
function repetitionRelease(){
  if (prevNoteRel === releasingNote) {
    numberTimesReleased++;
    timesRelDB.set(numberTimesReleased);
  } else {
    numberTimesReleased = 0;
    timesRelDB.set(numberTimesReleased);
  }
  prevNoteRel = releasingNote;  
}


////PIANO KEYBOARD VISUAL INTERACTION

index_datakey = [65, 83, 68, 70, 71, 72, 74, 75]

index_tonalkeys = [
  [15, 22, 17, 12, 19, 14, 21, 16, 23, 18, 13, 20],
  [12, 19, 14, 21, 16, 23, 18, 13, 20, 15, 22, 17]
]

//Set a piano key as normal or pressed
function toggleKeyPressed(eventHappening) {
  i = keys.indexOf(eventHappening.key);
  press = eventHappening.type;
  pianoKey = index_tonalkeys[m][t]+(modes[m][index_datakey.indexOf(eventHappening.keyCode)])+oct;

  if (i>=0) pression(press, pianoKey);
}

//Pressing function for white and black keys
function pression(pressed, keyValue){
    const keyW = document.querySelector(".white[data-key='"+keyValue+"']");
    const keyB = document.querySelector(".black[data-key='"+keyValue+"']");
    if(keyW){
      if(pressed === "keydown"){
        keyW.classList.add("playingW");
        tonalityTableClick(keyValue, 1)
      }
      else {
        keyW.classList.remove("playingW");
        tonalityTableClick(keyValue, 0)
      }
    } else {
      if(pressed === "keydown") {
        keyB.classList.add("playingB");
        tonalityTableClick(keyValue, 1)
      }
      else {
        keyB.classList.remove("playingB");
        tonalityTableClick(keyValue, 0)
      }
    }
}

window.addEventListener("keydown", toggleKeyPressed);
window.addEventListener("keyup", toggleKeyPressed);

////USING THE MOUSE TO PLAY THE KEYBOARD 

//When a key is clicked, play the right sound
function clickOnKey(data) {
  index = Number(data.target.getAttribute("data-key"));
  tonalityTableClick(index, 1);
  playSound(index+41, 1, selectedPreset);
  if(usingFirebase){   
    var s = document.getElementById("instruments").value;
    playingInstrument = s;
    instrumentDB.set(playingInstrument);
    instrumentDB.on('value', stateValueInstrument);                       //if using Firebase
    playingNote = (index+41);
    playDB.set(playingNote);
    playDB.on('value', stateValuePlay);
    repetitionPlay();
  }
}

//When a key is released, stops the right sound
function releaseOnKey(data) {
  index = Number(data.target.getAttribute("data-key"));
  tonalityTableClick(index, 0);
  playSound(index+41, 0, selectedPreset);
  if(usingFirebase){                         //if using Firebase
    releasingNote = (index+41);
    releaseDB.set(releasingNote);
    releaseDB.on('value', stateValueRelease);
    repetitionRelease();
  }
}

//What to do on mouse interaction
function toggleKey(key) {
  key.onmousedown = clickOnKey;
  key.onmouseup = releaseOnKey;
  key.onmouseout = releaseOnKey;
}

document.querySelectorAll(".key").forEach(toggleKey)


////KNOBS

var angle = 0;
var maxAngle = 130;
var minAngle = -130;
var mouseDown = false;
var direction = "",
    oldy = 0;
var value = 0;
var indexSel=0;

knob0value = 0.5; //Master Volume
knob1value = 0;   //Echo
knob2value = 0.5; //Vibrato Depth
knob3value = 0;   //Vibrato Rate

channelMaster.output.gain.setTargetAtTime(knob0value,0,0.0001);
reverberator.wet.gain.setTargetAtTime(knob3value,0,0.0001);

//Gets the angle and the value of an interacted knob
function clickKnob(data) {
  indexSel = Number(data.target.getAttribute("knob_number")); 
  mouseDown = true;
  if (indexSel == 0) {
    knobLabelId = "knobLabel0";
    value = knob0value;
    angle = 260*knob0value-130}
  if (indexSel == 1) {
    knobLabelId = "knobLabel1";
    value = knob1value;
    angle = 260*knob1value-130}
  if (indexSel == 2) {
    knobLabelId = "knobLabel2";
    value = knob2value;
    angle = 260*knob2value-130}
  if (indexSel == 3) {
    knobLabelId = "knobLabel3";
    value = knob3value;
    angle = 260*knob2value-130}   
}

function toggleKnob(knob) {
  knob.onmousedown = clickKnob;
}

document.querySelectorAll(".knob").forEach(toggleKnob);

window.addEventListener('mouseup', function(){mouseDown = false});
window.addEventListener('mousemove', function(e){
  if(!mouseDown) {return}

  if (e.pageY < oldy) {
      direction = "up"
  } else if (e.pageY > oldy) {
      direction = "down"
  }

  oldy = e.pageY;
  moveKnob(direction); 
})

function setAngle(){
  document.querySelectorAll(".knob")[indexSel].style.transform = 'rotate('+ angle +'deg)';
}

function moveKnob(direction) {
  if(direction == "up") {
    if(angle < maxAngle){
      angle = angle + 12;
      setAngle();
    } else {
    angle = maxAngle; }}
  
  else if(direction == "down") {
    if(angle > minAngle){
      angle = angle - 12;
      setAngle();
    } else {
      angle = minAngle; }}
  value = (( angle + 130 ) / 260).toFixed(3);
  
  if (indexSel == 0) {
    knob0value = parseFloat(value);
    channelMaster.output.gain.setTargetAtTime(value,0,0.0001);
    if(usingFirebase){                        //if using Firebase
      masterDB.set(knob0value);
      masterDB.on('value', stateValueMaster);
    }
  }
  if (indexSel == 1) {
    knob1value = value;
    reverberator.wet.gain.setTargetAtTime(value,0,0.0001);
  }
  if (indexSel == 2) {
    knob2value = value;
    vibratoVolumeMin = value/2;
  }
  if (indexSel == 3) {
    knob3value = value;
    vibratoDur = value/10;
    
  }  
}


////CHANGING THE INSTRUMENT

//Change Instrument 
function changeInstrument() {
	index = parseInt(document.getElementById("instruments").selectedIndex);
	selectedPreset = instruments[index];
  if(usingFirebase){                                            //if using Firebase
    var s = document.getElementById("instruments").value;
    playingInstrument = s;
    instrumentDB.set(playingInstrument);
    instrumentDB.on('value', stateValueInstrument);    
  }
}

function change() {
  var s = document.getElementById("instruments").value; 
  if(s==="Piano")  changeInstrument(_tone_0000_Chaos_sf2_file); 
  if(s==="Organ")  changeInstrument(_tone_0160_Aspirin_sf2_file);   
  if(s==="Guitar") changeInstrument(_tone_0270_Aspirin_sf2_file);
  if(s==="Violin") changeInstrument(_tone_0440_Aspirin_sf2_file);
  if(s==="Sax")    changeInstrument(_tone_0670_Aspirin_sf2_file);
} 


////MIDI KEYBOARD ADD-ON

//Midi Keyboard Add-On
//console.log(navigator.requestMIDIAccess);
if (navigator.requestMIDIAccess) {
  //console.log('navigator.requestMIDIAccess ok');
	navigator.requestMIDIAccess().then(requestMIDIAccessSuccess, requestMIDIAccessFailure);
} else {
  //console.log('navigator.requestMIDIAccess undefined');  
	msg.innerHTML = 'navigator.requestMIDIAccess undefined';
}

document.querySelector('#DynKeySwitch').onclick = function(data){
  if (DynKeyboard===0) {
    DynKeyboard=1;
    console.log("Dynamic Keyboard Enabled");
  }else{
    DynKeyboard=0;
    console.log("Dynamic Keyboard Disabled");
  }
}

document.querySelector('#ScaleKeySwitch').onclick = function(data){
  if (ScaleKeyboard===0) {
    ScaleKeyboard=1;
    console.log("Scale Function Enabled");
  }else{
    ScaleKeyboard=0;
    console.log("Scale Function Disabled");
  }
}

document.querySelector('#DBPlaying').onclick = function(data){
  if (DBPlaying===0) {
    DBPlaying=1;
    console.log("DB Playing Enabled");
  }else{
    DBPlaying=0;
    console.log("DB Playing Disabled");
  }
}

//// TABLE OF TONALITIES

//When the table is clicked, sets the right tonality
function clickOnTonality(data) {
  document.getElementById(tonalities[m][t]).classList.remove("tonalita-attiva");

  t = Number(data.target.getAttribute("tonality-col"))
  m = Number(data.target.getAttribute("tonality-row"))

  if(m===0) {
    document.getElementById("minorScales").setAttribute("disabled","");
    document.getElementById("modalScales").removeAttribute("disabled");
  } else {
    document.getElementById("modalScales").setAttribute("disabled","");
    document.getElementById("minorScales").removeAttribute("disabled");
  }
  if(usingModes===0){
   if(m===0){
    document.querySelector(".custom-select-minor-trigger").textContent = "Major";
    modes[0]=[0, 2, 4, 5, 7, 9, 11, 12];
    sign_flag[m] = 1;
   } else {
    document.querySelector(".custom-select-minor-trigger").textContent = "Natural";
    modes[1]=[0, 2, 3, 5, 7, 8, 10, 12];
    sign_flag[m] = 1;
   }
  } else sign_flag[m] = 0;
  
  
  if(usingFirebase){                          //if using Firebase
    tDB.set(t);
    mDB.set(m);
    tDB.on('value', stateValueT);
    mDB.on('value', stateValueM);
  }
  
  document.getElementById(tonalities[m][t]).classList.add("tonalita-attiva")
  if(sign_flag[m]==1){document.getElementById("tonality").innerHTML = tonalities[m][t];}
  else{document.getElementById("tonality").innerHTML = tonalities_nosign[m][t];}

  for(i=0;i<8;i++){
    playSound(tones[i], 0, selectedPreset);    
    tonalityTableClick(tones[i], 0);    
  }

  for(i=0;i<47;i++){
    pression("keyup", i);
  }

  tones = []

  for(var i=0; i<8; i++) {
    tones[i] = tones[i] = modes[m][i]+frequencies[m][t]+oct
  }
  
  if(sign_flag[m]==1){document.getElementById("tonality").innerHTML = tonalities[m][t];}
  else{document.getElementById("tonality").innerHTML = tonalities_nosign[m][t];}
  toggleScale();
}

function tonalityClick(tonality) {
  tonality.onmousedown = clickOnTonality;
}

document.querySelectorAll(".tonalita").forEach(tonalityClick)

//Tonality Suggestion Matrix
chords = [                    //    Fa, Fa#, Sol, ... , Mi  <- All the notes
  [1,0,1,2,0,1,0,2,1,0,2,0],  //  Ab
  [1,0,2,1,0,2,0,1,0,1,2,0],  //  Eb
  [2,0,1,0,1,2,0,1,0,2,1,0],  //  Bb
  [2,0,1,0,2,1,0,2,0,1,0,1],  //  ...                       <- Major tonalities
  [1,0,2,0,1,0,1,2,0,1,0,2],
  [0,1,2,0,1,0,2,1,0,2,0,1],
  [0,2,1,0,2,0,1,0,1,2,0,1],
  [0,1,0,1,2,0,1,0,2,1,0,2],
  [0,1,0,2,1,0,2,0,1,0,1,2],  //  E+
  [0,2,0,1,0,1,2,0,1,0,2,1],  //  B+
  [1,2,0,1,0,2,1,0,2,0,1,0],  //  F#+
  [2,1,0,2,0,1,0,1,2,0,1,0],  //  C#+
  [2,0,1,2,0,1,0,2,1,0,1,0],  //  F-
  [1,0,2,0,1,0,1,2,0,1,2,0],  //  ...                       <- Minor tonalities
  [1,0,2,0,1,2,0,1,0,2,1,0],
  [2,0,1,0,2,1,0,1,0,2,0,1],
  [1,0,1,0,2,0,1,2,0,1,0,2],
  [0,1,2,0,1,0,2,1,0,1,0,2],
  [0,2,1,0,1,0,2,0,1,2,0,1],
  [0,2,0,1,2,0,1,0,2,1,0,1],
  [0,1,0,2,1,0,1,0,2,0,1,2],  //  C#-
  [0,1,0,2,0,1,2,0,1,0,2,1],  //  G#-
  [1,2,0,1,0,2,1,0,1,0,2,0],  //  D#-
  [2,1,0,1,0,2,0,1,2,0,1,0]   //  A#-
]

//When one or multiple keys are clicked or pressed, highlights the tonality suggestions
function tonalityTableClick(index, pressed){
  importance = "";
  for(i=0;i<12;i++){
    if(chords[i][index%12]===0){
      importance = "tonalita-off";
    }else if(chords[i][index%12]===1){
      importance = "tonalita-normale";
    }else if(chords[i][index%12]===2){
      importance = "tonalita-impo";
    }

    if (pressed===1){
      document.getElementById(tonalities[0][i]).classList.add(importance);
    }else{
      document.getElementById(tonalities[0][i]).classList.remove(importance);
    }

    if(chords[i+12][index%12]===0){
      importance = "tonalita-off";
    }else if(chords[i+12][index%12]===1){
      importance = "tonalita-normale";
    }else if(chords[i+12][index%12]===2){
      importance = "tonalita-impo";
    }

    if (pressed===1){
      document.getElementById(tonalities[1][i]).classList.add(importance);
    }else{
      document.getElementById(tonalities[1][i]).classList.remove(importance);
    }
  }
}


//// EQUALIZER

rangeValueNumber = [];
document.querySelectorAll(".range").forEach(rangeSelected)


/////AUDIO PLAYER

var playerArea = document.getElementById("mediaPlayer");
var playButton = document.getElementById("playState");
var stopButton = document.getElementById("stopItem");
var nextButton = document.getElementById("nextItem");
var prevButton = document.getElementById("backItem");
var durationLabel = document.getElementById("currentDuration");
var songTitleLabel = document.getElementById("songTitleLabel");
var audioPlayer = document.getElementById("audioPlayer");
var volumeSlider = document.getElementById("volumeSlider");
var currentSong = 0;
var dataAvailable = false;
var currentLength = void 0;
var timer = void 0;
var timerTonality = 0;
var savedTimerTonality = 0;
var firstClick = 0;

durationLabel.innerText = parseTime(audioPlayer.currentTime) + " / " + parseTime(0);

volumeSlider.addEventListener("input", function () {
	audioPlayer.volume = parseFloat(volumeSlider.value);
}, false);

playButton.addEventListener("click", function () {
  firstClick = 1;
  playerArea.classList.toggle("play");
  songTitleLabel.innerHTML = songs[currentSong].title;
	if (audioPlayer.paused) {
  var song = selectTrack();
  interval = setInterval(function() {
    timerTonality++;
    savedTimerTonality=timerTonality;
    for(var i=0;i<song.length;i++){
      if (timerTonality === song[i].time){
        document.getElementById(tonalities[m][t]).classList.remove("tonalita-attiva");
        if (t>0) { 
          t = song[i].tonality;
          m = song[i].mode;
          document.querySelector(".custom-select-minor-trigger").textContent = song[i].scale;
        }

        if(m===0) {
          document.getElementById("minorScales").setAttribute("disabled","");
          document.getElementById("modalScales").removeAttribute("disabled");
        } else {
          document.getElementById("modalScales").setAttribute("disabled","");
          document.getElementById("minorScales").removeAttribute("disabled");
        }
          
        if(usingFirebase){
          tDB.set(t);
          tDB.on('value', stateValueT);
          mDB.set(m);
          mDB.on('value', stateValueM);
        }
          
        document.getElementById(tonalities[m][t]).classList.add("tonalita-attiva");

        for(j=0;j<8;j++){
          playSound(tones[j], 0, selectedPreset);   
          tonalityTableClick(tones[j], 0);     
        }

        for(j=0;j<47;j++){
          pression("keyup", j);
        }

        tones = [];
        for(var j=0; j<8; j++) {
          tones[j] = tones[j] = modes[m][j]+frequencies[m][t]+oct;
        }
        if(sign_flag[m]==1){document.getElementById("tonality").innerHTML = tonalities[m][t];}
        else{document.getElementById("tonality").innerHTML = tonalities_nosign[m][t];}
        toggleScale();
      }
    }
  }, 100);
	  audioPlayer.play();
		timer = setInterval(updateDurationLabel, 100);
	} else {
    audioPlayer.pause();
    timerTonality=savedTimerTonality;
    clearInterval(interval);
		clearInterval(timer);
	}
}, false);

stopButton.addEventListener("click", function () {
  if(firstClick===1){
	 playerArea.classList.remove("play");
	 audioPlayer.pause();
	 audioPlayer.currentTime = 0;
   updateDurationLabel();
   timerTonality=0;
   clearInterval(interval);
  } else return;
}, false);

nextButton.addEventListener("click", function () {
  if(firstClick===1){
	 dataAvailable = false;
	 loadNext(true);
   playerArea.classList.remove("play");
  } else return;
}, false);

prevButton.addEventListener("click", function () {
  if(firstClick===1){
	 dataAvailable = false;
	 loadNext(false);
   playerArea.classList.remove("play");
  } else return;
}, false);

audioPlayer.addEventListener("loadeddata", function () {
	dataAvailable = true;
	currentLength = audioPlayer.duration;
});

// Converts time in ms to zero-padded string in seconds
function parseTime(time) {
	var minutes = Math.floor(time / 60);
	var seconds = Math.floor(time - minutes * 60);
	var secondsZero = seconds < 10 ? "0" : "";
	var minutesZero = minutes < 10 ? "0" : "";
	return minutesZero + minutes.toString() + ":" + secondsZero + seconds.toString();
}

// Loads next song
function loadNext(next) {
  audioPlayer.pause();
  timerTonality=0;
  clearInterval(interval);
	if (next) {
		currentSong = (currentSong + 1) % songs.length;
	} else {
		currentSong = currentSong - 1 < 0 ? songs.length - 1 : currentSong - 1;
	}
	audioPlayer.src = songs[currentSong].songURL;
	songTitleLabel.innerHTML = songs[currentSong].title;
}

// Updates the duration label
function updateDurationLabel() {
	if (dataAvailable) {
		durationLabel.innerText = parseTime(audioPlayer.currentTime) + " / " + parseTime(currentLength);
	} else {
		durationLabel.innerText = parseTime(audioPlayer.currentTime) + " / " + parseTime(0);
	}
}

//rewind on completion
audioPlayer.addEventListener("ended", function () {
	myAudio.currentTime = 0;
});


////TUTORIAL POPUP

function popupElementTutorial() { 
  var popupContainer = document.getElementById('mch_popup');
  // open popup onload
  openPopupTutorial();
}

function openPopupTutorial() {
  $('#mch_popup').fadeToggle();
}

function closePopupTutorial() {
  $('#mch_popup').fadeOut();
}

$('#mch_popup').click(function(e){
  var target = $(e.target), el
  if(target.is('.close,.overlay')) {
    closePopupTutorial();
  }
});


////ROOM POPUP

function popupElementRoom() { 
  var popupContainer = document.getElementById('roomForm');
  // open popup onload
  openPopupRoom();
}

function openPopupRoom() {
  $('#roomForm').fadeToggle();
  displayRooms();

  //When opening the popup, always display the base room data
  document.getElementById("roomName").value = "Base Room";
  document.getElementById("roomPassword").value = "No password required";
  document.getElementById("roomPassword").setAttribute("disabled", "");
}

function closePopupRoom() {
  $('#roomForm').fadeOut();
  removeRooms();
}

$('#roomForm').click(function(e){
  var target = $(e.target), el
  if(target.is('.close,.overlay')) {
    closePopupRoom();
  }
});


////Room Selection

var roomName;
var roomPassword;

//Retrieving existing rooms from Firebase - done on page load to avoid asynchrony
var rooms = [];
var fetchedPassword;
var listOfRooms = document.getElementById("roomList");

//Fetches the roomlist from the DB
function fetchRooms(){
  firebase.database().ref('Rooms/').once('value').then(function(snapshot) {
    rooms = Object.keys(snapshot.val());
  });
}

fetchRooms();
setRoomNumber();

//Retrieves the password associated to the selected room from firebase for confrontation
function retrievePassword(){
  roomName = document.getElementById("roomName").value;
  firebase.database().ref("Rooms/"+roomName+"/password").once('value').then
    (function(snapshot) {
      fetchedPassword = snapshot.val();
  });
}

//Disable the use of firebase
function stopUsingFirebase(){
  usingFirebase = false;
  myRoom = "-";
  setRoomNumber();
  console.log("Using Firebase: "+usingFirebase);
}

//Gets user inputs and join rooms if selected or creates a new one using the inserted password
function formInput(){
  roomName = document.getElementById("roomName").value;
  roomPassword = document.getElementById("roomPassword").value;
  var check = false;

  if (roomName!="" && roomPassword!=""){        //checks that all the fields are written
    if(roomName==="Base Room"){                 //if the selected one is the base room
      usingFirebase = true;
      myRoom = "Room0";
      initializeFirebase();
      console.log("Base Room Joined");
      setRoomNumber();
      closePopupRoom();
    }else{
      for(var k=0;k<rooms.length;k++){          //Checks the room name and verify the password
        if (rooms[k]===roomName){               //Then connects and re-initializes the values
          check = true;
          break;
        }
      }
      if(check && roomPassword===fetchedPassword){
          usingFirebase = true;
          myRoom = roomName;
          initializeFirebase();
          console.log("Room "+roomName+" joined");
          setRoomNumber();
          closePopupRoom();
      }else if(check && roomPassword!=fetchedPassword){
        alert("Wrong password");
      }
      else if(!check){
        usingFirebase = true;
        createRoom(roomName, roomPassword);
        myRoom = roomName;
        initializeFirebase();
        console.log("Room "+roomName+" joined");
        setRoomNumber();
        closePopupRoom();
        fetchRooms();
      }
    }
  }else{
    console.log("Password is missing");
  }
}

//Takes the room list loaded from Firebase and dynamically adds it to the select
function displayRooms(){
  var option;
  console.log(rooms.length+" rooms found: "+rooms);
  for(var k=0;k<rooms.length;k++){
    option = document.createElement("option");
    option.text = rooms[k];
    option.value = rooms[k];
    listOfRooms.add(option);
  }
  option = document.createElement("option");
  option.text = "new Room";
  option.value = "newRoom";
  option.setAttribute("style", "font-style:italic");
  listOfRooms.add(option);
}

//Removes rooms from the list to avoid duplication on form reload
function removeRooms(){
  while (listOfRooms.firstChild) {
    listOfRooms.removeChild(listOfRooms.firstChild);
  }
}

//Enables or disables inputs for existing or non existing rooms and relative passwords
function selectRoom(){
  var s = document.getElementById("roomList").value;
  if(s==="newRoom"){
    document.getElementById("roomName").value = "Room"+rooms.length;
    document.getElementById("roomPassword").value = "";
    document.getElementById("roomPassword").setAttribute("placeholder", "Create Password");
    document.getElementById("roomPassword").removeAttribute("disabled");
  }else if (s==="Room0"){
    document.getElementById("roomName").value = "Base Room";
    document.getElementById("roomPassword").value = "No password required";
    document.getElementById("roomPassword").setAttribute("disabled", "");
  }else{
    document.getElementById("roomName").value = s;
    retrievePassword();
    document.getElementById("roomPassword").value = "";
    document.getElementById("roomPassword").setAttribute("placeholder", "Room Password");
    document.getElementById("roomPassword").removeAttribute("disabled");
  }
}

//Creates a new room with default parameters, given name and password
function createRoom(name, password){
  firebase.database().ref('Rooms/' + name).set({
    "password" : password,
    "instrument" : "Piano",
    "m" : 0,
    "master" : 0.5,
    "play" : 0,
    "release" : 0,
    "t" : 4,
    "timesPlayed" : 0,
    "timesReleased" : 0
  });
}

//Deletes a Room
function deleteRoom(){
  roomName = document.getElementById("roomName").value;
  roomPassword = document.getElementById("roomPassword").value;

  if (roomName!="" && roomPassword!=""){        //checks that all the fields are written
    if(roomName==="Base Room"){                 //if the selected one is the base room
      alert("You can't delete the Base Room!");
    }else{
      for(var k=0;k<rooms.length;k++){          //Checks the room name and verify the password
        if (rooms[k]===roomName){               //Then connects and re-initializes the values
          break;
        }
      }
      if(roomPassword===fetchedPassword){       //Delete a Room only if the password is correct
        firebase.database().ref('Rooms/' + roomName).remove();
        alert(roomName+" successfully deleted.");
        if(myRoom===roomName){
          location.reload();
        }else{
          closePopupRoom();
          fetchRooms();       //Re-reads the roomlist from the DB
        }
      }else{
        alert("Wrong Password");
      }
    }
  }else{
    console.log("Password is missing");
  }
}

//Writes the room number on the special div
function setRoomNumber(){
  var roomNumber = myRoom[myRoom.length-1];
  document.getElementById("roomNumber").innerHTML = roomNumber;
}


////MODAL SCALES

function toggleSignFlag(){
  if(sign_flag[m] == 1) {

document.getElementById("A♭+").innerHTML = tonalities[0][0];
document.getElementById("E♭+").innerHTML = tonalities[0][1];
document.getElementById("B♭+").innerHTML = tonalities[0][2];
document.getElementById("F+").innerHTML = tonalities[0][3];
document.getElementById("C+").innerHTML = tonalities[0][4];
document.getElementById("G+").innerHTML = tonalities[0][5];
document.getElementById("D+").innerHTML = tonalities[0][6];
document.getElementById("A+").innerHTML = tonalities[0][7];
document.getElementById("E+").innerHTML = tonalities[0][8];
document.getElementById("B+").innerHTML = tonalities[0][9];
document.getElementById("F#+").innerHTML = tonalities[0][10];
document.getElementById("C#+").innerHTML = tonalities[0][11];

document.getElementById("F-").innerHTML = tonalities[1][0];
document.getElementById("C-").innerHTML = tonalities[1][1];
document.getElementById("G-").innerHTML = tonalities[1][2];
document.getElementById("D-").innerHTML = tonalities[1][3];
document.getElementById("A-").innerHTML = tonalities[1][4];
document.getElementById("E-").innerHTML = tonalities[1][5];
document.getElementById("B-").innerHTML = tonalities[1][6];
document.getElementById("F#-").innerHTML = tonalities[1][7];
document.getElementById("C#-").innerHTML = tonalities[1][8];
document.getElementById("G#-").innerHTML = tonalities[1][9];
document.getElementById("D#-").innerHTML = tonalities[1][10];
document.getElementById("A#-").innerHTML = tonalities[1][11];

}  else {

document.getElementById("A♭+").innerHTML = tonalities_nosign[0][0];
document.getElementById("E♭+").innerHTML = tonalities_nosign[0][1];
document.getElementById("B♭+").innerHTML = tonalities_nosign[0][2];
document.getElementById("F+").innerHTML = tonalities_nosign[0][3];
document.getElementById("C+").innerHTML = tonalities_nosign[0][4];
document.getElementById("G+").innerHTML = tonalities_nosign[0][5];
document.getElementById("D+").innerHTML = tonalities_nosign[0][6];
document.getElementById("A+").innerHTML = tonalities_nosign[0][7];
document.getElementById("E+").innerHTML = tonalities_nosign[0][8];
document.getElementById("B+").innerHTML = tonalities_nosign[0][9];
document.getElementById("F#+").innerHTML = tonalities_nosign[0][10];
document.getElementById("C#+").innerHTML = tonalities_nosign[0][11];

document.getElementById("F-").innerHTML = tonalities_nosign[1][0];
document.getElementById("C-").innerHTML = tonalities_nosign[1][1];
document.getElementById("G-").innerHTML = tonalities_nosign[1][2];
document.getElementById("D-").innerHTML = tonalities_nosign[1][3];
document.getElementById("A-").innerHTML = tonalities_nosign[1][4];
document.getElementById("E-").innerHTML = tonalities_nosign[1][5];
document.getElementById("B-").innerHTML = tonalities_nosign[1][6];
document.getElementById("F#-").innerHTML = tonalities_nosign[1][7];
document.getElementById("C#-").innerHTML = tonalities_nosign[1][8];
document.getElementById("G#-").innerHTML = tonalities_nosign[1][9];
document.getElementById("D#-").innerHTML = tonalities_nosign[1][10];
document.getElementById("A#-").innerHTML = tonalities_nosign[1][11];

}}



//Changes the scale
function changeModalScale(){
  var mode = document.getElementById("modalScales").value; 
    if(mode==="Ionian")     {modes[0]=[0, 2, 4, 5, 7, 9, 11, 12];modes[1]=[0, 2, 4, 5, 7, 9, 11, 12];
                            sign_flag[m] = 0;}
    if(mode==="Dorian")     {modes[0]=[0, 2, 3, 5, 7, 9, 10, 12];modes[1]=[0, 2, 3, 5, 7, 9, 10, 12];
                            sign_flag[m] = 0;}
    if(mode==="Phrygian")   {modes[0]=[0, 1, 3, 5, 7, 8, 10, 12];modes[1]=[0, 1, 3, 5, 7, 8, 10, 12];
                            sign_flag[m] = 0;}
    if(mode==="Lydian")     {modes[0]=[0, 2, 4, 6, 7, 9, 11, 12];modes[1]=[0, 2, 4, 6, 7, 9, 11, 12];
                            sign_flag[m] = 0;}
    if(mode==="Mixolydian") {modes[0]=[0, 2, 4, 5, 7, 9, 10, 12];modes[1]=[0, 2, 4, 5, 7, 9, 10, 12];
                            sign_flag[m] = 0;}
    if(mode==="Aeolian")    {modes[0]=[0, 2, 3, 5, 7, 8, 10, 12];modes[1]=[0, 2, 3, 5, 7, 8, 10, 12];
                            sign_flag[m] = 0;}
    if(mode==="Locrian")    {modes[0]=[0, 1, 3, 5, 6, 8, 10, 12];modes[1]=[0, 1, 3, 5, 6, 8, 10, 12];
                            sign_flag[m] = 0;}
  document.querySelector(".custom-select-minor-trigger").textContent = "---";
  usingModes=1;
  if(mode==="---"){
    usingModes=0;
    if(m===0){
      document.querySelector(".custom-select-minor-trigger").textContent = "Major";
      modes[0]=[0, 2, 4, 5, 7, 9, 11, 12];
      sign_flag[m] = 1;
    } else {
      document.querySelector(".custom-select-minor-trigger").textContent = "Natural";
      modes[1]=[0, 2, 3, 5, 7, 8, 10, 12];
      sign_flag[m] = 1;
    }
  }
  for(var i=0; i<8; i++) {
    tones[i] = tones[i] = modes[m][i]+frequencies[m][t]+oct;
  }
  toggleScale();
  toggleSignFlag();
  if(sign_flag[m]==1){document.getElementById("tonality").innerHTML = tonalities[m][t];}
  else{document.getElementById("tonality").innerHTML = tonalities_nosign[m][t];}
}

function changeMinorScale(){
  var minor = document.getElementById("minorScales").value;
  var mode = document.getElementById("modalScales").value;
  if(mode!="---") {document.querySelector(".custom-select-minor-trigger").textContent = "---"; return;}
  if(m===1){
    if(minor==="Natural")    {modes[1]=[0, 2, 3, 5, 7, 8, 10, 12];
                            sign_flag[m] = 1;}
    if(minor==="Harmonic")   {modes[1]=[0, 2, 3, 5, 7, 8, 11, 12];
                            sign_flag[m] = 1;}
    if(minor==="Melodic")    {modes[1]=[0, 2, 3, 5, 7, 9, 11, 12];
                            sign_flag[m] = 1;}
    if(minor==="Blues")      {modes[1]=[0, 3, 5, 6, 7, 10, 12, 15];
                            sign_flag[m] = 1;}
    if(minor==="Pentatonic") {modes[1]=[0, 3, 5, 7, 10, 12, 15, 17];
                            sign_flag[m] = 1;}
    if(minor==="Major") {
      alert("You are in a minor tonality!"); 
      document.querySelector(".custom-select-minor-trigger").textContent = "Natural";
      modes[1]=[0, 2, 3, 5, 7, 8, 10, 12];
      sign_flag[m] = 1;
    }  
  } else if(m===0) {
    if(minor==="Major") {modes[0]=[0, 2, 4, 5, 7, 9, 11, 12];
      sign_flag[m] = 1;}
    if(minor==="Blues")      {modes[0]=[0, 3, 5, 6, 7, 10, 12, 15];
      sign_flag[m] = 1;}
    if(minor==="Pentatonic") {modes[0]=[0, 2, 4, 7, 9, 12, 14, 16];
      sign_flag[m] = 1;}
    if(minor==="Natural" || minor==="Harmonic" || minor==="Melodic") {
      alert("You are in a major tonality!"); 
      document.querySelector(".custom-select-minor-trigger").textContent = "Major";
      modes[0]=[0, 2, 4, 5, 7, 9, 11, 12];
      sign_flag[m] = 1;
    }  
      
  }  
  for(var i=0; i<8; i++) {
    tones[i] = tones[i] = modes[m][i]+frequencies[m][t]+oct;
  }
  toggleScale();
  toggleSignFlag();
  if(sign_flag[m]==1){document.getElementById("tonality").innerHTML = tonalities[m][t];}
  else{document.getElementById("tonality").innerHTML = tonalities_nosign[m][t];}
}

/////CURRENT SCALE HIGHLIGHT

//Highlights the notes of the current tonality, scale and octave
function toggleScale() {
  currentScale = document.querySelectorAll(".currentScale");
  for(i=0;i<48;i++) {
    currentScale[i].classList.remove("currentScale-activeW");
    currentScale[i].classList.remove("currentScale-activeB")};
  for(i=0;i<8;i++) {
    if ($(currentScale[tones[i]-41]).hasClass("white-point")){
  currentScale[tones[i]-41].classList.add("currentScale-activeW")
    } else {
      currentScale[tones[i]-41].classList.add("currentScale-activeB")
    }
}}

toggleScale()


/* ///////// CUSTOM SELECT MENU //////// */

///////////////// INSTRUMENT CUSTOM SELECT

$(".custom-select-instr").each(function() {
  var classes = $(this).attr("class");
      id      = $(this).attr("id");
      name    = $(this).attr("name");

  var template =  '<div class="' + classes + '">';
      template += '<span class="custom-select-trigger custom-select-instr-trigger">' + $(this).attr("placeholder") + '</span>';
      template += '<div class="custom-options">';
      $(this).find("option").each(function() {
        template += '<span class="custom-option ' + $(this).attr("class") + ' custom-instr-option" data-value="' + $(this).attr("value") + '">' + $(this).html() + '</span>';
      });
  template += '</div></div>';

  $(this).wrap('<div class="custom-select-wrapper"></div>');
  $(this).hide();
  $(this).after(template);
});

$(".custom-option:first-of-type").hover(function() {
  $(this).parents(".custom-options").addClass("option-hover");
}, function() {
  $(this).parents(".custom-options").removeClass("option-hover");
});

$(".custom-select-instr-trigger").on("click", function() {
  $('html').one('click',function() {
    $(".custom-select").removeClass("opened");
  });
  $(this).parents(".custom-select").toggleClass("opened");
  event.stopPropagation();
});

$(".custom-instr-option").on("click", function() {   
  $(this).parents(".custom-select-wrapper").find("select").val($(this).data("value"));
  $(this).parents(".custom-options").find(".custom-option").removeClass("selection");
  $(this).addClass("selection");
  $(this).parents(".custom-select").removeClass("opened");
  $(this).parents(".custom-select").find(".custom-select-trigger").text($(this).text());
});

///////////////// MAJOR CUSTOM SELECT

$(".custom-select-modal").each(function() {
  var classes = $(this).attr("class");
      id      = $(this).attr("id");
      name    = $(this).attr("name");

  var template =  '<div class="' + classes + '">';
      template += '<span class="custom-select-trigger custom-select-modal-trigger">' + $(this).attr("placeholder") + '</span>';
      template += '<div class="custom-options">';
      $(this).find("option").each(function() {
        template += '<span class="custom-option ' + $(this).attr("class") + ' custom-modal-option" data-value="' + $(this).attr("value") + '">' + $(this).html() + '</span>';
      });
  template += '</div></div>';

  $(this).wrap('<div class="custom-select-wrapper"></div>');
  $(this).hide();
  $(this).after(template);
});

$(".custom-option:first-of-type").hover(function() {
  $(this).parents(".custom-options").addClass("option-hover");
}, function() {
  $(this).parents(".custom-options").removeClass("option-hover");
});

$(".custom-select-modal-trigger").on("click", function() {  
  $('html').one('click',function() {
    $(".custom-select").removeClass("opened");
  });
  $(this).parents(".custom-select").toggleClass("opened");
  event.stopPropagation();
});

$(".custom-modal-option").on("click", function() {  
  $(this).parents(".custom-select-wrapper").find("select").val($(this).data("value"));
  $(this).parents(".custom-options").find(".custom-option").removeClass("selection");
  $(this).addClass("selection");
  $(this).parents(".custom-select").removeClass("opened");
  $(this).parents(".custom-select").find(".custom-select-trigger").text($(this).text());
});

///////////////// MINOR CUSTOM SELECT

$(".custom-select-minor").each(function() {
  var classes = $(this).attr("class");
      id      = $(this).attr("id");
      name    = $(this).attr("name");

  var template =  '<div class="' + classes + '">';
      template += '<span class="custom-select-trigger custom-select-minor-trigger">' + $(this).attr("placeholder") + '</span>';
      template += '<div class="custom-options">';
      $(this).find("option").each(function() {
        template += '<span class="custom-option ' + $(this).attr("class") + ' custom-minor-option" data-value="' + $(this).attr("value") + '">' + $(this).html() + '</span>';
      });
  template += '</div></div>';

  $(this).wrap('<div class="custom-select-wrapper"></div>');
  $(this).hide();
  $(this).after(template);
});

$(".custom-option:first-of-type").hover(function() {
  $(this).parents(".custom-options").addClass("option-hover");
}, function() {
  $(this).parents(".custom-options").removeClass("option-hover");
});

$(".custom-select-minor-trigger").on("click", function() { 
  $('html').one('click',function() {
    $(".custom-select").removeClass("opened");
  });
  $(this).parents(".custom-select").toggleClass("opened");
  event.stopPropagation();
//else {alert("You are in a major tonality!")}
});

$(".custom-minor-option").on("click", function() {  
  $(this).parents(".custom-select-wrapper").find("select").val($(this).data("value"));
  $(this).parents(".custom-options").find(".custom-option").removeClass("selection");
  $(this).addClass("selection");
  $(this).parents(".custom-select").removeClass("opened");
  $(this).parents(".custom-select").find(".custom-select-trigger").text($(this).text());
});

document.querySelector(".custom-select-minor-trigger").textContent = "Major";
document.querySelector(".custom-select-modal-trigger").textContent = "---";
modes[0]=[0, 2, 4, 5, 7, 9, 11, 12];
sign_flag[m] = 1;

function toggleModScale(key) {key.onclick = changeModalScale}

document.querySelectorAll(".modScale").forEach(toggleModScale)

function toggleMinScale(key) {key.onclick = changeMinorScale}

document.querySelectorAll(".minScale").forEach(toggleMinScale)

function toggleInstr(key) {key.onclick = change}

document.querySelectorAll(".instr").forEach(toggleInstr)
