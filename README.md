# DTKeyboard -- Dynamic Tonality Keboard

**Version 1.0.0**

Demonstration video: https://drive.google.com/open?id=1ZyDayk5WOfHuUH_SrvZERUocpx5qfbta

Surge link: [DTKeyboard v1.0.0](https://dt-keyboard.surge.sh/)

## Welcome to DTKeyboard!

DTKeyboard is an academic project originally concieved for the course of Advanced Coding Tools and Methodologies, held by professor Francesco Bruschi and professor Vincenzo Rana, at the Politecnico di Milano.
Since its source code is never delivered to final users, it is fully GPL-compliant.
No open repository could ever be endorsed and its possible free spread is an exclusive owners' right.
Please refer to the License to get more infos.
All rights belongs to the relatives owners.

## Project Description

DTKeyboard, which stands for "Dynamic Tonality Keyboard", is a simple web-based diatonic keyboard that allows an unexperienced musician as well as a music student to easily play and improvise, transiting between close and/or far tonalities, based on the current scale and played degrees, keeping musical logic.

## Project Features

#### Diatonic keyboard playable by pressing computer keys or by mouse click

Displayed as a piano's keyboard, the DTK can be played simply by pressing the 8 keys corresponding to the letters A,S,D,F,G,H,J,K or by pressing the corresponding button with a left-click of the mouse.
It is possible to use the up and down arrow to switch between three different octaves.

#### Dynamic Tonality change and scale selection

By pressing the left and right arrow, it is possible to change between close tonalities, by jumps of fifth, and by pressing the ```shift``` button it is possible to change between a major or minor tonality. The current tonality and the other ones are highlighted on a display, which also can be clicked to switch to the desired tonality.
It is also possible to change the scale, by using the menù located just beneath the table of tonalities, to switch to any desired modal scale, variant of the minor one and others.
	
#### MIDI sounds, instrument and effects

DTKeyboard fully implements [Surikov's WebAudioFont library](https://surikov.github.io/webaudiofont/), which allows to use MIDI sounds and to change the played instrument between Piano, Organ, Guitar, Violin and Sax. Through the special panels it is also possible to use some audio effects to improve the sound:

- Master Volume
- Reverberation
- Vibrato (two controllers for speed and depth)
- 10 band MIDI equalizer

Each effect can be controlled by a specific knob or slider

### Scale/Tonality modulation recognition

When one or multiple notes are being played, the tonality table verifies them and highlights in red the tonalities whose scales may contain all such notes. Also, the most probable tonalities are highlighted in green if the played notes are either its tonic, mediant or dominant. If a triad is played, the corresponding tonality is so recognized, as well as its nearest ones, allowing the player to easily modulate between tonalities which share that particular triad chord.

#### External MIDI controller keyboard connection

DTKeyboard supports the connection of a MIDI controller, which can be player with all the features of the computer-based keyboard. It has the possibility to switch on and off the Dynamic Tonality function and has a special scale-function which, if enbaled, allows to play exclusively the notes belonging to the selected tonality and scale, approximating the others to the right ones.

### Improvisation helper with metronome and play-along

DTKeyboard comes with an audio player with a few base-tracks, that allows the player to freely improvise with minimum effort or music knowledge, as the tonality is dynamically changed based on the song which is being played.

#### Multi-user room based system

Using [Firebase](https://firebase.google.com/), it is possible to play along with others. The player can join a base room, free to access, and play with others, sharing the same tonality and the possibility to hear what the others are playing, each with his own selected instrument. It is also possible to create a personal room, accessible with a password, to play with just the users that know it.

## Authors

- Matteo Manzolini <matteo.manzolini@mail.polimi.it> 
- Alessandro Montali <alessandro.montali@mail.polimi.it>
- Davide Salvi <davide1.salvi@mail.polimi.it>

## Copyright
Copyright © 2018 by Matteo Manzolini, Alessandro Montali, Davide Salvi, Master's Student in Music and Acoustics Engineering c/o Politecnico di Milano
