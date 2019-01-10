// Audio files list

// Songs from https://www.conversesamplelibrary.com/
var songs = [{
  title: "01 - Autumn Leaves",
  songURL: "./tracks/01 - Autumn Leaves.mp3"
}, {
  title: "02 - The Thrill is Gone",
  songURL: "./tracks/02 - The Thrill Is Gone.mp3"
}, {
  title: "03 - Green Onions",
  songURL: "./tracks/03 - Green Onions.mp3"
}, {
  title: "04 - Hey Joe",
  songURL: "./tracks/04 - Hey Joe.mp3"
}, {
  title: "05 - Isn't She Lovely",
  songURL: "./tracks/05 - Isn't She Lovely.mp3"
}];

// connect the array index to the right song timer
function selectTrack(){
  if (currentSong===0){
    modes = [[0, 2, 4, 5, 7, 9, 11, 12],[0, 2, 3, 5, 7, 8, 10, 12]];
    for(var i=0; i<8; i++) {
      tones[i] = tones[i] = modes[m][i]+frequencies[m][t]+oct;
    }
    document.querySelector(".custom-select-modal-trigger").textContent = "Ionian";
    document.querySelector(".custom-select-minor-trigger").textContent = "Natural";
    var song = leaves;
  }else if (currentSong===1){
    modes=[[0, 2, 4, 5, 7, 9, 11, 12],[0, 3, 5, 6, 7, 10, 12, 15]];
    for(var i=0; i<8; i++) {
      tones[i] = tones[i] = modes[m][i]+frequencies[m][t]+oct;
    }
    document.querySelector(".custom-select-minor-trigger").textContent = "Blues";
    var song = thrill;
  }else if (currentSong===2){
    modes=[[0, 3, 5, 6, 7, 10, 12, 15],[0, 2, 3, 5, 7, 8, 10, 12]];
    for(var i=0; i<8; i++) {
      tones[i] = tones[i] = modes[m][i]+frequencies[m][t]+oct;
    }
    document.querySelector(".custom-select-modal-trigger").textContent = "Blues";
    var song = onions;
  }else if (currentSong===3){
    modes=[[0, 2, 4, 7, 9, 12, 14, 16],[0, 2, 3, 5, 7, 8, 10, 12]];
    for(var i=0; i<8; i++) {
      tones[i] = tones[i] = modes[m][i]+frequencies[m][t]+oct;
    }
    document.querySelector(".custom-select-modal-trigger").textContent = "Pentatonic";
    var song = joe;
  }else if (currentSong===4){
    modes = [[0, 2, 4, 5, 7, 9, 11, 12],[0, 2, 3, 5, 7, 8, 10, 12]];
    for(var i=0; i<8; i++) {
      tones[i] = tones[i] = modes[m][i]+frequencies[m][t]+oct;
    }
    document.querySelector(".custom-select-modal-trigger").textContent = "Ionian";
    document.querySelector(".custom-select-minor-trigger").textContent = "Natural";
    var song = lovely;
  }
  return song;
}

// Autumn Leaves
var leaves = [{time: 0.1*10, tonality: 5,  mode: 0}];
for(var i=0;i<6;i++){
  leaves.push(
    {time: (4+64*i)*10,  tonality: 5, mode: 0},   //G+
    {time: (12+64*i)*10, tonality: 5, mode: 1},   //E-
    {time: (20+64*i)*10, tonality: 5, mode: 0},   //G+
    {time: (28+64*i)*10, tonality: 5, mode: 1},   //E-
    {time: (44+64*i)*10, tonality: 5, mode: 0},   //G+
    {time: (52+64*i)*10, tonality: 5, mode: 1},   //E-
    {time: (57+64*i)*10, tonality: 3, mode: 1},   //D-
    {time: (59+64*i)*10, tonality: 4, mode: 0},   //C+
    {time: (62+64*i)*10, tonality: 5, mode: 1}    //E-
  );
}

/*  // The Thrill Is Gone
       Bm   |%  |% |%|
       Em   |%  |Bm|%|
       Gmaj7|F#7|Bm|%|
*/
var thrill = [{time: 0.1*10, tonality: 6,  mode: 1}];

/*  // Green Onions
       F |% |%|%|
       Bb|% |F|%|
       C |Bb|F|%|
*/
var onions = [
    {time: 0.1*10,   tonality: 3, mode: 0},   //F+      

    {time: 11*10,    tonality: 3, mode: 0},   //F+
    {time: 17.8*10,  tonality: 2, mode: 0},   //Bb+
    {time: 21*10,    tonality: 3, mode: 0},   //F+
    {time: 24.2*10,  tonality: 4, mode: 0},   //C+
    {time: 25.8*10,  tonality: 2, mode: 0},   //Bb+
    {time: 27.5*10,  tonality: 3, mode: 0},   //F+

    {time: 30.4*10,  tonality: 3, mode: 0},   //F+
    {time: 37.2*10,  tonality: 2, mode: 0},   //Bb+
    {time: 40.4*10,  tonality: 3, mode: 0},   //F+
    {time: 43.6*10,  tonality: 4, mode: 0},   //C+
    {time: 45.2*10,  tonality: 2, mode: 0},   //Bb+
    {time: 46.9*10,  tonality: 3, mode: 0},   //F+

    {time: 49.8*10,  tonality: 3, mode: 0},   //F+
    {time: 56.6*10,  tonality: 2, mode: 0},   //Bb+
    {time: 59.8*10,  tonality: 3, mode: 0},   //F+
    {time: 63*10,    tonality: 4, mode: 0},   //C+
    {time: 64.8*10,  tonality: 2, mode: 0},   //Bb+
    {time: 66.3*10,  tonality: 3, mode: 0},   //F+

    {time: 69.2*10,  tonality: 3, mode: 0},   //F+
    {time: 76*10,    tonality: 2, mode: 0},   //Bb+
    {time: 79.2*10,  tonality: 3, mode: 0},   //F+
    {time: 82.4*10,  tonality: 4, mode: 0},   //C+
    {time: 84.4*10,  tonality: 2, mode: 0},   //Bb+
    {time: 85.7*10,  tonality: 3, mode: 0},   //F+

    {time: 88.6*10,  tonality: 3, mode: 0},   //F+
    {time: 95.4*10,  tonality: 2, mode: 0},   //Bb+
    {time: 98.6*10,  tonality: 3, mode: 0},   //F+
    {time: 101.8*10, tonality: 4, mode: 0},   //C+
    {time: 103.8*10, tonality: 2, mode: 0},   //Bb+
    {time: 105.1*10, tonality: 3, mode: 0},   //F+
    
    {time: 108*10,   tonality: 3, mode: 0},   //F+
    {time: 114.8*10, tonality: 2, mode: 0},   //Bb+
    {time: 118*10,   tonality: 3, mode: 0},   //F+
    {time: 121.2*10, tonality: 4, mode: 0},   //C+
    {time: 123.2*10, tonality: 2, mode: 0},   //Bb+
    {time: 124.5*10, tonality: 3, mode: 0},   //F+
    
    {time: 127.4*10, tonality: 3, mode: 0},   //F+
    {time: 134.2*10, tonality: 2, mode: 0},   //Bb+
    {time: 137.4*10, tonality: 3, mode: 0},   //F+
    {time: 140.6*10, tonality: 4, mode: 0},   //C+
    {time: 142.6*10, tonality: 2, mode: 0},   //Bb+
    {time: 143.9*10, tonality: 3, mode: 0},   //F+

    {time: 146.8*10, tonality: 3, mode: 0},   //F+
];

/*  // Hey Joe
       C G |D A | E | % |
*/
var joe = [{time: 0.1*10, tonality: 5, mode: 0}]; 

/*  // Isn't She Lovely
       C#m7  |F#7|B7sus4|E|
       C#m7  |F#7|B7sus4|E|
       Amaj7 |G#7|C#m7  |F#7|
       B7sus4|%  |E     |%
*/
var lovely = [{time: 0.1*10, tonality: 8,  mode: 0}];
for(var i=0;i<9;i++){
  lovely.push(
    {time: (5+32*i)*10,   tonality: 8, mode: 0},   //E+
    {time: (7+32*i)*10,   tonality: 9, mode: 0},   //B+
    {time: (9+32*i)*10,   tonality: 8, mode: 0},   //E+
    {time: (15+32*i)*10,  tonality: 9, mode: 0},   //B+
    {time: (17+32*i)*10,  tonality: 8, mode: 0},   //E+
    {time: (23+32*i)*10,  tonality: 8, mode: 1},   //C#-
    {time: (27+32*i)*10,  tonality: 9, mode: 0},   //B+
    {time: (29+32*i)*10,  tonality: 8, mode: 0},   //E+
  );
}