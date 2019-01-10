tonalities = [
  ['A♭+','E♭+', 'B♭+', 'F+', 'C+', 'G+', 'D+', 'A+', 'E+'],
  ['F-', 'C-', 'G-', 'D-', 'A-', 'E-', 'B-', 'F#-', 'C#-']
]

frequencies = [ 
  [56, 63, 58, 53, 60, 55, 62, 57, 64], //MIDI
  [53, 60, 55, 62, 57, 64, 59, 54, 61]
]

modes = [
  [0, 2, 4, 5, 7, 9, 11, 12],
  [0, 2, 3, 5, 7, 8, 10, 12]
]

t = 4;    // tonality
m = 0;    // major or minor
oct = 0;  // octave
keys = "asdfghjk";

// DATABASE

var myRoom = "Room0";
//var playingInstrument;
var selectedPreset=_tone_0000_Chaos_sf2_file;
var playingPreset=selectedPreset;
var mDB;
var tDB;
var masterDB;

initializeFirebase();

//Inizialize Firebase

function initializeFirebase(){
  mDB = firebase.database().ref("Rooms/"+myRoom+"/m");
  tDB = firebase.database().ref("Rooms/"+myRoom+"/t");
  masterDB = firebase.database().ref("Rooms/"+myRoom+"/master");

  mDB.on('value', stateValueM);
  tDB.on('value', stateValueT);
  masterDB.on('value', stateValueMaster);
}


function stateValueM(data) {
  document.getElementById(tonalities[m][t]).classList.remove("tonalita-attiva")
  m = data.val();
  document.getElementById("tonality").innerHTML = tonalities[m][t];
  document.getElementById(tonalities[m][t]).classList.add("tonalita-attiva")
}

function stateValueT(data) {
  document.getElementById(tonalities[m][t]).classList.remove("tonalita-attiva")
  t = data.val();
  document.getElementById("tonality").innerHTML = tonalities[m][t]
  document.getElementById(tonalities[m][t]).classList.add("tonalita-attiva")
}

function stateValueMaster(data) {
  masterVolumeRange.value = data.val();
}

document.querySelector("#masterVolumeRange").ontouchend = function() {
  masterDB.set(masterVolumeRange.value);
  masterDB.on('value', stateValueMaster);
}

////// 

tones = []

for(var i=0; i<8; i++) {
  tones[i] = modes[m][i]+frequencies[m][t]+oct
}

document.getElementById("tonality").innerHTML = tonalities[m][t];

document.onkeyup = function(event){
  i = keys.indexOf(event.key);
  if(i>=0){
    playSound(tones[i], 0)
  }
}

// TABLE OF TONALITIES

function clickOnTonality(data) {
  document.getElementById(tonalities[m][t]).classList.remove("tonalita-attiva");

  t = Number(data.target.getAttribute("tonality-col"))
  m = Number(data.target.getAttribute("tonality-row"))
  
  tDB.set(t);
  tDB.on('value', stateValueT);
  
  mDB.set(m);
  mDB.on('value', stateValueM);
  
  document.getElementById(tonalities[m][t]).classList.add("tonalita-attiva")
}

function tonalityClick(tonality) {
  tonality.onmousedown = clickOnTonality;
}

document.querySelectorAll(".tonalita").forEach(tonalityClick)


// POPUP

try{Typekit.load({ async: true });}catch(e){}
document.body.onload = openPopupTutorial;

function openPopupTutorial() {
  $('#mch_popup').fadeToggle();
}

function closePopupTutorial() {
  $('#mch_popup').fadeOut();
}

$('#mch_popup').click(function(e){
  var target = $(e.target), el
  if(target.is('.tutorial,.overlay')) {
    closePopupTutorial();
    openPopupRoom();
  }
});

///////////////// ROOM

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

 //////   Room Selection

 var roomName;
 var roomPassword;
 
 //Retrieving existing rooms from Firebase - done on page load to avoid asynchrony
 var rooms = [];
 var fetchedPassword;
 var listOfRooms = document.getElementById("roomList");
 fetchRooms();

 //Fetches the roomlist from the DB
 function fetchRooms(){
   firebase.database().ref('Rooms/').once('value').then(function(snapshot) {
     rooms = Object.keys(snapshot.val());
   });
 }
 
  //Retrieves the password associated to the selected room from firebase for confrontation
 function retrievePassword(){
   roomName = document.getElementById("roomList").value;
   firebase.database().ref("Rooms/"+roomName+"/password").once('value').then
     (function(snapshot) {
       fetchedPassword = snapshot.val();
   });
 }
  
 //Gets user inputs and does stuff... work in progress
 function formInput(){
   roomName = document.getElementById("roomList").value;;
   roomPassword = document.getElementById("roomPassword").value;
 
   if (roomName!="" && roomPassword!=""){        //checks that all the fields are written
     if(roomName==="Room0"){                     //if the selected one is the base room
       myRoom = "Room0";
       initializeFirebase();
       console.log("Base Room joined");
       setRoomNumber();
       closePopupRoom();
     }else{
       for(var k=0;k<rooms.length;k++){          //Checks the room name and verify the password
         if (rooms[k]===roomName){               //Then connects and re-initializes the values
           break;
         }
       }
       if(roomPassword===fetchedPassword){
           myRoom = roomName;
           initializeFirebase();
           console.log("Room "+roomName+" joined");
           setRoomNumber();
           closePopupRoom();
       }else{
         alert("Wrong password");
       }
     }
   }else{
     console.log("Something is missing");
   }
 }
 
 //Takes the room list loaded from Firebase and dynamically adds it to the select
 function displayRooms(){
   if (rooms.length===0){
      closePopupRoom();
   }else{
     var option;
     console.log(rooms.length+" rooms found: "+rooms);
     for(var k=0;k<rooms.length;k++){
        option = document.createElement("option");
        option.text = rooms[k];
        option.value = rooms[k];
        listOfRooms.add(option);
      }
   }
   
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
   if (s==="Room0"){
     document.getElementById("roomPassword").value = "No password required!!";
     document.getElementById("roomPassword").setAttribute("disabled", "");
   }else{
     retrievePassword();
     document.getElementById("roomPassword").value = "";
     document.getElementById("roomPassword").setAttribute("placeholder", "Room Password");
     document.getElementById("roomPassword").removeAttribute("disabled");
   }
 }
 
 function setRoomNumber(){
   var roomNumber = myRoom[myRoom.length-1];
   document.getElementById("room-number").innerHTML = roomNumber;
 }