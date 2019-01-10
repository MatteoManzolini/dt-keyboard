//Verify midi access
function requestMIDIAccessFailure(e) {
    console.log('requestMIDIAccessFailure', e);
}

function requestMIDIAccessSuccess(midi) {
    var inputs = midi.inputs.values();
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
            //console.log('midi input', input);
            input.value.onmidimessage = MIDIKeyboardPlay;
    }
    midi.onstatechange = midiOnStateChange;
}

// Highlight the led and the string if the MIDI keyboard is connected
function midiOnStateChange(event) {
    console.log("Midi Keyboard ", event.port.state);
    if(event.port.state==="connected"){
        document.querySelector("#midiled-hilight").classList.add("midiled-active");
        document.querySelector("#midiled-hilight").classList.add("hilight");
        document.querySelector("#midiled-hilight").classList.add("midiled-active-hilight");
        document.querySelector("#midilabel").classList.add("midilabel-active");
    } else if (event.port.state==="disconnected"){
        document.querySelector("#midiled-hilight").classList.remove("midiled-active");
        //document.querySelector("#midiled-hilight").classList.remove("hilight");
        document.querySelector("#midiled-hilight").classList.remove("midiled-active-hilight");
        document.querySelector("#midilabel").classList.remove("midilabel-active");
    }
}

// Play music through the MIDI keyboard
function MIDIKeyboardPlay(event) {
    var data = event.data;
    var type = data[0] & 0xf0;
    var pitch = data[1];  //pitch of the real keyboard note
    var tonic = frequencies[m][t];

    //if the dynamic tonality is enabled and if not
    if(DynKeyboard===1){    
        var note = tonic+pitch-60;  //pitch relative to the selected tonality
    }else{
        var note = pitch;
    }

    //Scale function
    if(ScaleKeyboard===1){
        for(j=-3;j<4;j++){      //for every octave (0 is the middle one)
            for(i=0;i<8;i++){   //for every note in the scale
                if(note===tonic+12*j+modes[m][i]){  //if in the scale, play
                break;
                }else if((note===tonic+12*j+modes[m][i]+1)&&!(note===tonic+12*j+modes[m][i+1])){
                note=note-1;    //if not in the scale, approximate to the nearest inferior one
                break;
                }
            }
        }
    }
    
    switch (type) {
        case 144:   //key pressed
            playSound(note, 1, selectedPreset);
            if(usingFirebase){
                var s = document.getElementById("instruments").value;
                playingInstrument = s;
                instrumentDB.set(playingInstrument);
                instrumentDB.on('value', stateValueInstrument);
                playingNote = note;
                playDB.set(playingNote);
                playDB.on('value', stateValuePlay);
            }
            pression("keydown", note-41);
            break;

        case 128:   //key released
            playSound(note, 0, selectedPreset);
            if(usingFirebase){
                releasingNote = note;
                releaseDB.set(releasingNote);
                releaseDB.on('value', stateValueRelease);
            }
            pression("keyup", note-41);
            break;
    }
}
