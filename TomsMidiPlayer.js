desc: Tom's Midi Display
slider1:0<1,1,1{Fixed,Percentage}>Falloff Style;
slider2:0<0.2,4,0.1>Falloff Multiplier
/*
  Credit to Tom's Source Code for the basics, and Reaper for the documentation.
  This is a work in progress and has not been finished yet.

  - To Do:
         - Add Expression Display Support
         - Add Volume/Pitchbend Display
         - Track Solo'ing, CC Overrides 
*/
@init
slider1=0;
slider2=1;
IsInit=1;
ext_midi_bus = 1;
Check=0;

//Dimensions of Track Info
h1=32;
w1=130;

//Dimensions of Track Midi Info
h2=30;
w2=256;

//Spacings
sp1w=1;
sp1h=33;

//window palette
r1= 32/255; g1= 32/255; b1= 32/255; //BG
r2= 96/255; g2= 96/255; b2= 96/255; //text
r3= 64/255; g3= 64/255; b3= 64/255; //Midi BG
r4=  0/255; g4=127/255; b4=255/255; //Midi FG High
r5=255/255; g5=255/255; b5=255/255; //Midi FG Low

//Buffer pointers
MIDIINSTRUMENTS=100000;
MIDINOTES=200000;
VISNOTES =300000;
// - - - - - - - - - Function Start - - - - - - - - - - - - - - - - //

//clamped lerp function
function lerp(a,vmin,vmax)(
vmin*1-(max(0,min(1,a)))+
vmax*(max(0,min(1,a)));
);



//instrument LUT
function getInstrument(Bank,IsDrums)(
  IsDrums==1?(
    Output="<No Drum Patch>";
    Bank==0?Output="Standard";
    Bank==8?Output="Room";
    Bank==16?Output="Power";
    Bank==24?Output="Electronic";
    Bank==32?Output="Jazz";
    Bank==40?Output="Brush";
    Bank==48?Output="Orchestral";
    Bank==56?Output="Special Effects (SFX)";
  )
  :(
  Bank==-1?Output="<No Instrument>";
  Bank==0?Output="Acoustic Grand Piano";
  Bank==1?Output="Bright Acoustic Piano";
  Bank==2?Output="Electric Grand Piano";
  Bank==3?Output="Honky-tonk Piano";
  Bank==4?Output="Rhodes Piano";
  Bank==5?Output="Chorused Piano";
  Bank==6?Output="Harpsichord";
  Bank==7?Output="Clavinet";
  Bank==8?Output="Celesta";
  Bank==9?Output="Glockenspiel";
  Bank==10?Output="Music box";
  Bank==11?Output="Vibraphone";
  Bank==12?Output="Marimba";
  Bank==13?Output="Xylophone";
  Bank==14?Output="Tubular Bells";
  Bank==15?Output="Dulcimer";
  Bank==16?Output="Hammond Organ";
  Bank==17?Output="Percussive Organ";
  Bank==18?Output="Rock Organ";
  Bank==19?Output="Church Organ";
  Bank==20?Output="Reed Organ";
  Bank==21?Output="Accordion";
  Bank==22?Output="Harmonica";
  Bank==23?Output="Tango Accordion";
  Bank==24?Output="Acoustic Guitar (nylon)";
  Bank==25?Output="Acoustic Guitar (steel)";
  Bank==26?Output="Electric Guitar (jazz)";
  Bank==27?Output="Electric Guitar (clean)";
  Bank==28?Output="Electric Guitar (muted)";
  Bank==29?Output="Overdriven Guitar";
  Bank==30?Output="Distortion Guitar";
  Bank==31?Output="Guitar Harmonics";
  Bank==32?Output="Acoustic Bass";
  Bank==33?Output="Electric Bass (finger)";
  Bank==34?Output="Electric Bass (pick)";
  Bank==35?Output="Fretless Bass";
  Bank==36?Output="Slap Bass 1";
  Bank==37?Output="Slap Bass 2";
  Bank==38?Output="Synth Bass 1";
  Bank==39?Output="Synth Bass 2";
  Bank==40?Output="Violin";
  Bank==41?Output="Viola";
  Bank==42?Output="Cello";
  Bank==43?Output="Contrabass";
  Bank==44?Output="Tremolo Strings";
  Bank==45?Output="Pizzicato Strings";
  Bank==46?Output="Orchestral Harp";
  Bank==47?Output="Timpani";
  Bank==48?Output="String Ensemble 1";
  Bank==49?Output="String Ensemble 2";
  Bank==50?Output="Synth Strings 1";
  Bank==51?Output="Synth Strings 2";
  Bank==52?Output="Choir Aahs";
  Bank==53?Output="Voice Oohs";
  Bank==54?Output="Synth Voice";
  Bank==55?Output="Orchestra Hit";
  Bank==56?Output="Trumpet";
  Bank==57?Output="Trombone";
  Bank==58?Output="Tuba";
  Bank==59?Output="Muted Trumpet";
  Bank==60?Output="French Horn";
  Bank==61?Output="Brass Section";
  Bank==62?Output="Synth Brass 1";
  Bank==63?Output="Synth Brass 2";
  Bank==64?Output="Soprano Sax";
  Bank==65?Output="Alto Sax";
  Bank==66?Output="Tenor Sax";
  Bank==67?Output="Baritone Sax";
  Bank==68?Output="Oboe";
  Bank==69?Output="English Horn";
  Bank==70?Output="Bassoon";
  Bank==71?Output="Clarinet";
  Bank==72?Output="Piccolo";
  Bank==73?Output="Flute";
  Bank==74?Output="Recorder";
  Bank==75?Output="Pan Flute";
  Bank==76?Output="Bottle Blow";
  Bank==77?Output="Shakuhachi";
  Bank==78?Output="Whistle";
  Bank==79?Output="Ocarina";
  Bank==80?Output="Lead 1 (square)";
  Bank==81?Output="Lead 2 (sawtooth)";
  Bank==82?Output="Lead 3 (calliope lead)";
  Bank==83?Output="Lead 4 (chiffer lead)";
  Bank==84?Output="Lead 5 (charang)";
  Bank==85?Output="Lead 6 (voice)";
  Bank==86?Output="Lead 7 (fifths)";
  Bank==87?Output="Lead 8 (brass + lead)";
  Bank==88?Output="Pad 1 (new age)";
  Bank==89?Output="Pad 2 (warm)";
  Bank==90?Output="Pad 3 (polysynth)";
  Bank==91?Output="Pad 4 (choir)";
  Bank==92?Output="Pad 5 (bowed)";
  Bank==93?Output="Pad 6 (metallic)";
  Bank==94?Output="Pad 7 (halo)";
  Bank==95?Output="Pad 8 (sweep)";
  Bank==96?Output="FX 1 (rain)";
  Bank==97?Output="FX 2 (soundtrack)";
  Bank==98?Output="FX 3 (crystal)";
  Bank==99?Output="FX 4 (atmosphere)";
  Bank==100?Output="FX 5 (brightness)";
  Bank==101?Output="FX 6 (goblins)";
  Bank==102?Output="FX 7 (echoes)";
  Bank==103?Output="FX 8 (sci-fi)";
  Bank==104?Output="Sitar";
  Bank==105?Output="Banjo";
  Bank==106?Output="Shamisen";
  Bank==107?Output="Koto";
  Bank==108?Output="Kalimba";
  Bank==109?Output="Bagpipe";
  Bank==110?Output="Fiddle";
  Bank==111?Output="Shana";
  Bank==112?Output="Tinkle Bell";
  Bank==113?Output="Agogo";
  Bank==114?Output="Steel Drums";
  Bank==115?Output="Woodblock";
  Bank==116?Output="Taiko Drum";
  Bank==117?Output="Melodic Tom";
  Bank==118?Output="Synth Drum";
  Bank==119?Output="Reverse Cymbal";
  Bank==120?Output="Guitar Fret Noise";
  Bank==121?Output="Breath Noise";
  Bank==122?Output="Seashore";
  Bank==123?Output="Bird Tweet";
  Bank==124?Output="Telephone Ring";
  Bank==125?Output="Helicopter";
  Bank==126?Output="Applause";
  Bank==127?Output="Gunshot";
  );
  //Send output string
  Output
);

//Patch updates, expression updates and UI changes
function SendUpdate(Type,Value,Channel,Drum)(
 Type=="Program"?(
  BUF[MIDIINSTRUMENTS+(Channel*4)]=getInstrument(Value,Drum);
 );
);

//The main attraction - The midi display.
function SendToWindow(Ch,Note,Height)(
BUF[MIDINOTES+((CH-1)*127)+Note]=Height;
);
function UpdateGUINotes(Ch)(
  N=0;
  loop(127,
  N+=1;
  slider1?(
    BUF[VISNOTES+((CH-1)*127)+N]=
    max(BUF[VISNOTES+((CH-1)*127)+N]*fl_rtperc,BUF[MIDINOTES+((CH-1)*127)+N]);
  ):BUF[VISNOTES+((CH-1)*127)+N]=
    max(BUF[VISNOTES+((CH-1)*127)+N]-fl_rtfix,BUF[MIDINOTES+((CH-1)*127)+N]);
  );
);
function parseInput(Channel,Get,CMD,CMD2)(
  //listen for a channel
  M_GET = Get;
  //if we have the channel we want,
  (M_Get==(Channel+0x90-0x01))?(
      //if we have Note On messages, parse.
      M_Ch=Channel;
      M_NT=CMD;
      M_Vol=CMD2/127;
      SendToWindow(Channel,M_NT,M_Vol);
  );
  (M_Get==(Channel+0x80-0x01))?(
      //if we have Note Off messages, parse.
      M_Ch=Channel;
      M_NT=CMD;
      M_Vol=0;
      SendToWindow(Channel,M_NT,M_Vol);
  );
  (M_Get==(Channel+0xC0-0x01))?(
        //if we have Program messages, parse.
        M_Ch=Channel;
        M_Prog=CMD;
        M_Drum=(M_CH==10);
        SendUpdate("Program",M_Prog,Channel,M_Drum);
  );
);


function AddWindow(index,posx,posy,width,height,text)(
  
  gfx_set(r1,g1,b1);
  
  prevx=gfx_x;prevy=gfx_y;
  
  gfx_rect(posx,posy,width,height);
  
  strlen(text)!=0?(
  
    gfx_set(0.05,0.05,0.05);
    gfx_x=posx+(height/4);
    gfx_y=posy+(height/4)+2;
    gfx_printf(text);
      
    gfx_set(r2,g2,b2);
    gfx_x=posx+(height/4);
    gfx_y=posy+(height/4);
    gfx_printf(text);
    
    gfx_x=prevx;gfx_y=prevy;
  );
  Window[index*4]=posx;
  Window[index*4+1]=posy;
  Window[index*4+2]=width;
  Window[index*4+3]=height;
);
function createMidiWindow(id,Channel)(
  //main window
  gfx_set(r3,g3,b3);
  gfx_rect(
    Window[id*4]+1,   //xpos
    Window[id*4+1]+1, //ypos
    Window[id*4+2]-2, //width
    Window[id*4+3]-2  //height
  );
  //actual midi display
  X=0;
  loop(127,
  X+=1;
  NH=BUF[VISNOTES+((Channel-1)*127)+X];
  NW=(Window[id*4+2]-2)/127;
  CW_POSX=lerp(X/127,Window[id*4]+4,Window[id*4+2]-8);
  CW_HEIGHT=lerp(NH,0,Window[id*4+3]-2);
  gfx_set(
    r4*NH+r5*(1-NH),
    g4*NH+g5*(1-NH),
    b4*NH+b5*(1-NH)
    );
  gfx_rect(
    CW_POSX,
    (Window[id*4+1]+1)-CW_HEIGHT+(Window[id*4+3]-2),
    NW*1,
    CW_HEIGHT
  );

  );
);

/*
function updateMidiInfo(id,Channel)(
INST[Channel]=getInst(Channel);
);
*/

@block
  while(midirecv(offset,msg1,msg2,msg3))(
  parseInput(1,msg1,msg2,msg3);
  parseInput(2,msg1,msg2,msg3);
  parseInput(3,msg1,msg2,msg3);
  parseInput(4,msg1,msg2,msg3);
  parseInput(5,msg1,msg2,msg3);
  parseInput(6,msg1,msg2,msg3);
  parseInput(7,msg1,msg2,msg3);
  parseInput(8,msg1,msg2,msg3);
  parseInput(9,msg1,msg2,msg3);
  parseInput(10,msg1,msg2,msg3);
  parseInput(11,msg1,msg2,msg3);
  parseInput(12,msg1,msg2,msg3);
  parseInput(13,msg1,msg2,msg3);
  parseInput(14,msg1,msg2,msg3);
  parseInput(15,msg1,msg2,msg3);
  parseInput(16,msg1,msg2,msg3);
  midisend(offset,msg1,msg2,msg3);
  );


@gfx

//falloff rates
fl_rtperc=min(0.995,lerp(slider2/4,1.04,0.1));
fl_rtfix=0.1*slider2;



gfx_setfont(1,"Small Fonts",13);
gfx_w=512;
gfx_h=512;
R=12;G=12;B=12;
gfx_clear=R+(G*256)+(B*65536);
Test=BUF[MIDIINSTRUMENTS+1];

//Main Midi display
i=-16;
CH=0;
loop(16,
i+=16;
CH+=1;
CurInst=BUF[MIDIINSTRUMENTS+(CH*4)];
AddWindow(1000+i,5,5+(i/16*sp1h),h1,h1,sprintf(#,"%i",CH));
AddWindow(1001+i,5+h1+sp1w,5+(i/16*sp1h),w1,h1,CurInst);
AddWindow(1002+i,5+h1+w1+sp1w*2,5+(i/16*sp1h),w2,h1,"");
AddWindow(1003+i,5+h1+w1+sp1w*3+w2,5+(i/16*sp1h),w2/1.33,h1,"expr1");
AddWindow(1004+i,5+h1+w1+sp1w*4+w2*1.75,5+(i/16*sp1h),w2/1.33,h1,"expr2");
createMidiWindow(1002+i,CH);
UpdateGUINotes(CH);
);
