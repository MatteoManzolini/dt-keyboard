////////    Equalizer

function rangeValue(index) {
    rangeNumber = Number(index.target.getAttribute("range-number"));
    rangeValue = index.target.value;
    rangeValueNumber[rangeNumber]=rangeValue;
    if (rangeNumber == 0) channelMaster.band32.gain.setTargetAtTime(rangeValue,0,0.0001);
    if (rangeNumber == 1) channelMaster.band64.gain.setTargetAtTime(rangeValue,0,0.0001);
    if (rangeNumber == 2) channelMaster.band128.gain.setTargetAtTime(rangeValue,0,0.0001);
    if (rangeNumber == 3) channelMaster.band256.gain.setTargetAtTime(rangeValue,0,0.0001);
    if (rangeNumber == 4) channelMaster.band512.gain.setTargetAtTime(rangeValue,0,0.0001);
    if (rangeNumber == 5) channelMaster.band1k.gain.setTargetAtTime(rangeValue,0,0.0001);
    if (rangeNumber == 6) channelMaster.band2k.gain.setTargetAtTime(rangeValue,0,0.0001);
    if (rangeNumber == 7) channelMaster.band4k.gain.setTargetAtTime(rangeValue,0,0.0001);
    if (rangeNumber == 8) channelMaster.band8k.gain.setTargetAtTime(rangeValue,0,0.0001);
    if (rangeNumber == 9) channelMaster.band16k.gain.setTargetAtTime(rangeValue,0,0.0001);
  }
  
function rangeSelected(data) {
    data.onmouseup = rangeValue;
}

////////    Vibrato

function vibrato(){
    if(vibratoDur>0){
      for (var i = 0; i < selectedPreset.zones.length; i++) {
        selectedPreset.zones[i].ahdsr = [];
        for (j = 0; j<999; j++){
          selectedPreset.zones[i].ahdsr.push(
            {
              duration: 0.15-vibratoDur,
              volume: 0.95
            }, {
              duration: 0.15-vibratoDur,
              volume: 0.5-vibratoVolumeMin
            }
          );
        }
      }
    } else {
      for (var i = 0; i < selectedPreset.zones.length; i++) {
        selectedPreset.zones[i].ahdsr = false;
      }
    }
  }