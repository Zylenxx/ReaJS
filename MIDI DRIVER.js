desc:MSGS CREATOR

/*
  MSGS CREATOR
  Author : Zylenxx (discord: @zylenxx)
  Description: A Software driven Midi driver. Drives one channel at a time.
  
  #########################################################################
  
  Distribution of this file is permitted as is under following rules:
  Should you edit this file,add yourself to the author list. 
  If you rewrote the entire code to be better while keeping original 
  functions indentical, you are to still credit me as the prototype creator. 
  
  I expect this file to be reshaped and improved over time by other people.
  So treat co-coders with respect and do not attempt to remove a contributors
  credit if reasonable additions were brought into the code.
  
  Not crediting coders in the simplest form will be taken as attempted 
  stealing and be frowned upon.
  
  Do not monetize this base/prototype under any means and explicitly
  distribute this under a free license if done so.
  
  This falls under the CC BY-NC-SA 4.0 license.
  https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.txt
  
  
  #########################################################################
  
  Version 1.00 (Feature Testing)
  
  + arc knobs. hopefully they dont hog cpu time.
  - removed old ui method
  
  Version 1.02 (Completion of Features)
  + sliders
  + digit containers
  + buttons
  + rough midi setup (no outputs yet)
  - removed doublecheck for processing inputs via scrollwheel
  
  Version 1.03 (Completion of Features II)
  + text selectors
  + midi controls
  + midi now outputs stuff
  + filters by the channel only
  + global instrument communication
  (no way to swap before noteon yet)
  *+ added memory available to system

    1.03b
    + software envelope panel now has ADSR
    + Planning to make a visual part to be able to drag points 
      to set ADSR manually

    + now mapped ADSR as savable parameters
*/
options:no_meter gmem=MIDIPARSE

// this hack is to make it savable.

//General Tab
slider1:0<0,128,1>-Gen_Expr
slider2:0<0,128,1>-Gen_Pan
slider3:0<0,128,1>-Gen_Mod
slider4:0<0,128,1>-Gen_Inst
slider5:1<0,128,1>-Gen_FNS
slider6:0<0,128,1>-Gen_ch

//Soft Env tab
slider7:0<0,255,1>-SE_A
slider8:0x3f<0,255,1>-SE_D
slider9:0x3f<0,255,1>-SE_S
slider10:0x1f<0,255,1>-SE_R
slider11:0<0,1,1>-SE_gs
slider12:0<0,1,1>-SE_sp
slider13:1<0,32,1>-SE_zoom

@slider
      //writeback so sliders save states properly.
      
      //General Tab
      w1=slider1;
      w2=slider2;
      w3=slider3;
      t1=slider4;
      fns=slider5;
      d1=slider6;
      
      //Soft Env tab
      SE_A=slider7;
      SE_D=slider8;
      SE_S=slider9;
      SE_R=slider10;
      SE_gs=slider11;
      SE_sp=slider12;
      SE_zoom=slider13;
@init

    //instrument lookup table
    #Instr = "Acoustic Grand Piano|Bright Acoustic Piano|Electric Grand Piano|Honky-tonk Piano|Electric Piano 1|Electric Piano 2|Harpsichord|Clavi|Celesta|Glockenspiel|Music Box|Vibraphone|Marimba|Xylophone|Tubular Bells|Dulcimer|Drawbar Organ|Percussive Organ|Rock Organ|Church Organ|Reed Organ|Accordion|Harmonica|Tango Accordion|Acoustic Guitar (nylon)|Acoustic Guitar (steel)|Electric Guitar (jazz)|Electric Guitar (clean)|Electric Guitar (muted)|Overdriven Guitar|Distortion Guitar|Guitar harmonics|Acoustic Bass|Electric Bass (finger)|Electric Bass (pick)|Fretless Bass|Slap Bass 1|Slap Bass 2|Synth Bass 1|Synth Bass 2|Violin|Viola|Cello|Contrabass|Tremolo Strings|Pizzicato Strings|Orchestral Harp|Timpani|String Ensemble 1|String Ensemble 2|SynthStrings 1|SynthStrings 2|Choir Aahs|Voice Oohs|Synth Voice|Orchestra Hit|Trumpet|Trombone|Tuba|Muted Trumpet|French Horn|Brass Section|SynthBrass 1|SynthBrass 2|Soprano Sax|Alto Sax|Tenor Sax|Baritone Sax|Oboe|English Horn|Bassoon|Clarinet|Piccolo|Flute|Recorder|Pan Flute|Blown Bottle|Shakuhachi|Whistle|Ocarina|Lead 1 (square)|Lead 2 (sawtooth)|Lead 3 (calliope)|Lead 4 (chiff)|Lead 5 (charang)|Lead 6 (voice)|Lead 7 (fifths)|Lead 8 (bass + lead)|Pad 1 (new age)|Pad 2 (warm)|Pad 3 (polysynth)|Pad 4 (choir)|Pad 5 (bowed)|Pad 6 (metallic)|Pad 7 (halo)|Pad 8 (sweep)|FX 1 (rain)|FX 2 (soundtrack)|FX 3 (crystal)|FX 4 (atmosphere)|FX 5 (brightness)|FX 6 (goblins)|FX 7 (echoes)|FX 8 (sci-fi)|Sitar|Banjo|Shamisen|Koto|Kalimba|Bagpipe|Fiddle|Shanai|Tinkle Bell|Agogo|Steel Drums|Woodblock|Taiko Drum|Melodic Tom|Synth Drum|Reverse Cymbal|Guitar Fret Noise|Breath Noise|Seashore|Bird Tweet|Telephone Ring|Helicopter|Applause|Gunshot
    ";
    
    //ADSRMenu lookup table
    #ADSRM = "";
    
    //ADSR Menus:
      //software envelope
      SE_A=0;
      SE_D=0x3f;
      SE_S=0x3f;
      SE_R=0x1f;
      SE_gs=0;SE_sp=0;   
            SE_zoom=2;
      
    
    // data pointer
    PTR = 0x10000;
    
    ext_midi_bus = 1;
    Menu = "General";
    controlX=0;controlY=0;
    w1=0x7f; //expr (multiplicative, software env is later down the line)
    w2=0x3f; //pan
    w3=0x00; //mod
    d1=0x00; //channel
    fns=0x1; //force no subtype is enabled by default to avoid weird behavior
    t1=gmem[d1*2];//get channel from global storage 
   
function setGmem(ch,val)(
    gmem[ch*2]!=val?gmem[ch*2]=val
);

function getInst()(
    // Gather all instrument info
    Inst1=gmem[0]; Inst9=gmem[16];
    Inst2=gmem[2]; InstA=gmem[18];
    Inst3=gmem[4]; InstB=gmem[20];
    Inst4=gmem[6]; InstC=gmem[22];
    Inst5=gmem[8]; InstD=gmem[24];
    Inst6=gmem[10];InstE=gmem[26];
    Inst7=gmem[12];InstF=gmem[28];
    Inst8=gmem[14];InstG=gmem[30];
    
    //Gather subtype (to reset when needed);
    Inst1s=gmem[1]; Inst9s=gmem[17];
    Inst2s=gmem[3]; InstAs=gmem[19];
    Inst3s=gmem[5]; InstBs=gmem[21];
    Inst4s=gmem[7]; InstCs=gmem[23];
    Inst5s=gmem[9]; InstDs=gmem[25];
    Inst6s=gmem[11];InstEs=gmem[27];
    Inst7s=gmem[13];InstFs=gmem[29];
    Inst8s=gmem[15];InstGs=gmem[31];
);

function getMidi(a,b,c)(
    #MIDIINFO="";
    #MIDIINFO+=sprintf(#,"%x ",a);
    #MIDIINFO+=sprintf(#,"%x ",b);
    #MIDIINFO+=sprintf(#,"%x ",c);
);

function lerp(a,b,frac)(
    frac<0?frac=0;
    frac>1?frac=1;
    a*(frac)+b*(1-frac);
);

function sinD(r)(
    sin(r*($pi/180))
);

function cosD(r)(
    cos(r*($pi/180))
);

function setprimary()(
    gfx_set(1, 0.667, 0,1);
);
function setprimaryhover()(
    gfx_set(0, 0.812, 1);
);

function setsecondary()(
    gfx_set(0.196, 0.224, 0.259,1);
);

function setsecondaryhover()(
    gfx_set(0.196*1.5, 0.224*1.5, 0.259*1.5,1);
);

function transparent()(
    gfx_set(1,1,1,0.2);
);

function instn(val)local(str)(
    str="";
    val==0?str="Acoustic Grand Piano";
    val==1?str="Bright Acoustic Piano";
    val==2?str="Electric Grand Piano";
    val==3?str="Honky-tonk Piano";
    val==4?str="Electric Piano 1";
    val==5?str="Electric Piano 2";
    val==6?str="Harpsichord";
    val==7?str="Clavi";
    
    val==8?str="Celesta";
    val==9?str="Glockenspiel";
    val==10?str="Music Box";
    val==11?str="Vibraphone";
    val==12?str="Marimba";
    val==13?str="Xylophone";
    val==14?str="Tubular Bells";
    
    val==15?str="Dulcimer";
    
    val==16?str="Drawbar Organ";
    val==17?str="Percussive Organ";
    val==18?str="Rock Organ";
    val==19?str="Church Organ";
    val==20?str="Reed Organ";
    
    val==21?str="Accordion";
    val==22?str="Harmonica";
    val==23?str="Tango Accordion";
    
    val==24?str="Acoustic Guitar (nylon)";
    val==25?str="Acoustic Guitar (steel)";
    
    val==26?str="Electric Guitar (jazz)";
    val==27?str="Electric Guitar (clean)";
    val==28?str="Electric Guitar (muted)";
    
    val==29?str="Overdriven Guitar";
    val==30?str="Distortion Guitar";
    
    val==31?str="Guitar harmonics";
    
    val==32?str="Acoustic Bass";
    val==33?str="Electric Bass (finger)";
    val==34?str="Electric Bass (pick)";
    val==35?str="Fretless Bass";
    val==36?str="Slap Bass 1";
    val==37?str="Slap Bass 2";
    val==38?str="Synth Bass 1";
    val==39?str="Synth Bass 2";
    
    val==40?str="Violin";
    val==41?str="Viola";
    val==42?str="Cello";
    val==43?str="Contrabass";
    val==44?str="Tremolo Strings";
    val==45?str="Pizzicato Strings";
    
    val==46?str="Orchestral Harp";
    val==47?str="Timpani";
    
    val==48?str="String Ensemble 1";
    val==49?str="String Ensemble 2";
    val==50?str="SynthStrings 1";
    val==51?str="SynthStrings 2";
    
    val==52?str="Choir Aahs";
    val==53?str="Voice Oohs";
    val==54?str="Synth Voice";
    
    val==55?str="Orchestra Hit";
    
    val==56?str="Trumpet";
    val==57?str="Trombone";
    val==58?str="Tuba";
    val==59?str="Muted Trumpet";
    val==60?str="French Horn";
    val==61?str="Brass Section";
    val==62?str="SynthBrass 1";
    val==63?str="SynthBrass 2";
    
    val==64?str="Soprano Sax";
    val==65?str="Alto Sax";
    val==66?str="Tenor Sax";
    val==67?str="Baritone Sax";
    
    val==68?str="Oboe";
    val==69?str="English Horn";
    val==70?str="Bassoon";
    val==71?str="Clarinet";
    val==72?str="Piccolo";
    val==73?str="Flute";
    val==74?str="Recorder";
    val==75?str="Pan Flute";
    val==76?str="Blown Bottle";
    val==77?str="Shakuhachi";
    val==78?str="Whistle";
    val==79?str="Ocarina";
    
    val==80?str="Lead 1 (square)";
    val==81?str="Lead 2 (sawtooth)";
    val==82?str="Lead 3 (calliope)";
    val==83?str="Lead 4 (chiff)";
    val==84?str="Lead 5 (charang)";
    val==85?str="Lead 6 (voice)";
    val==86?str="Lead 7 (fifths)";
    val==87?str="Lead 8 (bass + lead)";
    
    val==88?str="Pad 1 (new age)";
    val==89?str="Pad 2 (warm)";
    val==90?str="Pad 3 (polysynth)";
    val==91?str="Pad 4 (choir)";
    val==92?str="Pad 5 (bowed)";
    val==93?str="Pad 6 (metallic)";
    val==94?str="Pad 7 (halo)";
    val==95?str="Pad 8 (sweep)";
    
    val==96?str="FX 1 (rain)";
    val==97?str="FX 2 (soundtrack)";
    val==98?str="FX 3 (crystal)";
    val==99?str="FX 4 (atmosphere)";
    val==100?str="FX 5 (brightness)";
    val==101?str="FX 6 (goblins)";
    val==102?str="FX 7 (echoes)";
    val==103?str="FX 8 (sci-fi)";
    
    val==104?str="Sitar";
    val==105?str="Banjo";
    val==106?str="Shamisen";
    val==107?str="Koto";
    val==108?str="Kalimba";
    val==109?str="Bagpipe";
    val==110?str="Fiddle";
    val==111?str="Shanai";
    
    val==112?str="Tinkle Bell";
    val==113?str="Agogo";
    val==114?str="Steel Drums";
    val==115?str="Woodblock";
    val==116?str="Taiko Drum";
    val==117?str="Melodic Tom";
    val==118?str="Synth Drum";
    
    val==119?str="Reverse Cymbal";
    val==120?str="Guitar Fret Noise";
    val==121?str="Breath Noise";
    val==122?str="Seashore";
    val==123?str="Bird Tweet";
    val==124?str="Telephone Ring";
    val==125?str="Helicopter";
    val==126?str="Applause";
    val==127?str="Gunshot";
    str
);

function setMenu(ctrl,x,y,w,h,get)local(hover)(
  hover=(mouse_x>x-w/2)&&(mouse_x<x+w/2)&&
    (mouse_y>y-h/2)&&(mouse_y<y+h/2);
    
  hover&&mouse_cap==1?(
  gfx_x=x-w/2;gfx_y=y+h/2;
  ctrl = gfx_showmenu(get)-1
  );
  ctrl
);

// scroll wheel input parsing.
function processInput(value)(
  value=value+(mouse_wheel/120);
  value
);

function processDragIn(value)(
value
);

//event listener for mouse events. Used to send midi queries later on
function mouseEvent()(
  mouse_cap||mouse_wheel;
);

// midi output. yet to finish.
function setEvent(ctrl,cmd,type)local(lastval)(
  ctrl!=lastval?(
  midisend(0,cmd,type,ctrl);
  getMidi(cmd,type,ctrl);
  lastval=ctrl;
  )
);
// midi output but ctrl controls msg2. yet to finish.
function setEvent2(ctrl,cmd)local(lastval)(
  ctrl!=lastval?(
  midisend(0,cmd,ctrl,0x00);
  getMidi(cmd,ctrl,0x00);
  lastval=ctrl;
  )
);

// single value midi output. yet to finish.
function setEventForced(ctrl,cmd,type,value)local(lastval)(
  ctrl!=lastval?(
  midisend(0,cmd,type,value);
  getMidi(cmd,type,value);
  lastval=ctrl;
  )
);

/*####################################### GRAPHICAL ITEMS #######################################*/

// Envelope UI
function gfx_gridBox(x,y,len,wid,menu)local(I,Z,hover)(

  hover=(mouse_x>x)&&(mouse_x<x+len)&&
      (mouse_y>y)&&(mouse_y<y+wid);

  hover?SE_zoom=max(1,processInput(SE_zoom));
  setsecondary();
  gfx_r=gfx_r/2;gfx_g=gfx_g/2;gfx_b=gfx_b/2;
  gfx_gradrect(x,y,len,wid,0,0,0,0.1,0,0,0,0,gfx_r*1/wid,gfx_g*1/wid,gfx_b*1/wid,1/wid);
  gfx_set(0,0,0,1);
  gfx_line(x,y,x+len,y);
  gfx_line(x+len,y,x+len,y+wid);
  gfx_line(x,y,x,y+wid);
  gfx_line(x,y+wid,x+len,y+wid);
  gfx_line(x,y+wid+1,x+len,y+wid+1);
  I=0;Z=32/SE_zoom;
  loop(Z,
    (I)%8>3?(
        gfx_set(0,0,0,0.3);
        gfx_rect(x+len*I/Z,y,(len/Z)+1,wid)
      );
    gfx_set(0,0,0,0.1+((I+1)%2)*0.2);gfx_line(x+len*I/Z,y,x+len*I/Z,y+wid-1);
    gfx_set(0,0,0,0.1);gfx_line(1+x+len*I/Z,y,1+x+len*I/Z,y+wid-1);
    gfx_set(0,0,0,0.1);gfx_line(-1+x+len*I/Z,y,-1+x+len*I/Z,y+wid-1);
    I+=1
  )

);

// slider ui
function gfx_slider(x,y,len,wid,smin,smax,val,name)local(r,g,b,r2,g2,b2,frac,lastx,lasty,tw,th,hover)(
  frac=val/smax;
  x=max(0,x);y=max(0,y);len=max(4,len);wid=max(4,wid);smin=max(0,smin);smax=max(1,smax);
  
  hover=(mouse_x>x-len/2)&&(mouse_x<x+len/2)&&
    (mouse_y>y-wid/2)&&(mouse_y<y+wid/2);
  
  setsecondary();
  r=gfx_r;g=gfx_g;b=gfx_b;
  r2=r*2;g2=g*2;b2=b*2;
  
  hover?(
    setprimaryhover();
    val=processInput(val) //let scrollwheel adjust (might later get replaced when i dont need double checks)
    )
  :setprimary();
  val=max(smin,min(smax,val));
  gfx_rect(x-len/2,y-wid/2,len,wid);
  gfx_gradrect(x-len/2+1,y-wid/2+1,len-2,wid-2,r2,g2,b2,1,0,0,0,0,(r-r2)/wid,(g-g2)/wid,(b-b2)/wid,0);

  gfx_rect(x-len/2+2,y-wid/2+2,(len-4)*frac,wid-4);

  gfx_set(1,1,1,1);
  lastx=gfx_x;lasty=gfx_y;
  gfx_measurestr(sprintf(#,"%d",val),tw,th);gfx_x=x-tw/2;gfx_y=y-th/2;
  gfx_printf(sprintf(#,"%d",val));
  gfx_measurestr(name,tw,th);gfx_x=x-tw/2;gfx_y=y-th/2+wid;
  gfx_printf(name);
  gfx_x=lastx;gfx_y=lasty;
  val
);

// digit container ui
function gfx_digit(x,y,len,wid,smin,smax,val,name)local(r,g,b,r2,g2,b2,frac,lastx,lasty,tw,th,hover)(
  x=max(0,x);y=max(0,y);len=max(4,len);wid=max(4,wid);smin=max(0,smin);smax=max(1,smax);
  
  hover=(mouse_x>x-len/2)&&(mouse_x<x+len/2)&&
    (mouse_y>y-wid/2)&&(mouse_y<y+wid/2);
  
  setsecondary();
  r=gfx_r;g=gfx_g;b=gfx_b;
  r2=r*2;g2=g*2;b2=b*2;
  
  hover?(
  setprimaryhover();
  val=processInput(val) //let scrollwheel adjust (might later get replaced when i dont need double checks)
  )  :setprimary();
  val=max(smin,min(smax,val));
  gfx_rect(x-len/2,y-wid/2,len,wid);
  gfx_gradrect(x-len/2+1,y-wid/2+1,len-2,wid-2,r2,g2,b2,1,0,0,0,0,(r-r2)/wid,(g-g2)/wid,(b-b2)/wid,0);
  gfx_set(1,1,1,1);
  lastx=gfx_x;lasty=gfx_y;
  gfx_measurestr(sprintf(#,"%d",val+1),tw,th);gfx_x=x-tw/2;gfx_y=y-th/2;
  gfx_printf(sprintf(#,"%d",val+1));
  gfx_measurestr(name,tw,th);gfx_x=x-tw/2;gfx_y=y-th/2+wid;
  gfx_printf(name);
  gfx_x=lastx;gfx_y=lasty;
  val
);

function gfx_text(x,y,len,wid,smin,smax,val,name)local(r,g,b,r2,g2,b2,frac,lastx,lasty,tw,th,hover)(
  x=max(0,x);y=max(0,y);len=max(4,len);wid=max(4,wid);smin=max(0,smin);smax=max(1,smax);
  
  hover=(mouse_x>x-len/2)&&(mouse_x<x+len/2)&&
    (mouse_y>y-wid/2)&&(mouse_y<y+wid/2);
  
  setsecondary();
  r=gfx_r;g=gfx_g;b=gfx_b;
  r2=r*2;g2=g*2;b2=b*2;
  
  hover?(
  setprimaryhover();
  val=processInput(val) //let scrollwheel adjust (might later get replaced when i dont need double checks)
  )  :setprimary();
  val=max(smin,min(smax,val));
  gfx_rect(x-len/2,y-wid/2,len,wid);
  gfx_gradrect(x-len/2+1,y-wid/2+1,len-2,wid-2,r2,g2,b2,1,0,0,0,0,(r-r2)/wid,(g-g2)/wid,(b-b2)/wid,0);
  gfx_set(1,1,1,1);
  lastx=gfx_x;lasty=gfx_y;
  gfx_measurestr(name,tw,th);gfx_x=x-tw/2;gfx_y=y-th/2;
  gfx_printf(name);
  gfx_x=lastx;gfx_y=lasty;
  val
);

// generic button
function gfx_button(x,y,len,wid,val,name)local(r,g,b,a,r2,g2,b2,lastx,lasty,tw,th,hover,pressed)(
  x=max(0,x);y=max(0,y);len=max(4,len);wid=max(4,wid);
  
  hover=(mouse_x>x-len/2)&&(mouse_x<x+len/2)&&
    (mouse_y>y-wid/2)&&(mouse_y<y+wid/2);
  
  hover?(
    pressed=(mouse_cap==1);
    setsecondaryhover();
    r=gfx_r*(1-0.5*pressed);g=gfx_g*(1-0.5*pressed);b=gfx_b*(1-0.5*pressed);
    r2=r*2;g2=g*2;b2=b*2;
    val=pressed;
    )
    :(
    setsecondary();
    r=gfx_r;g=gfx_g;b=gfx_b;
    r2=r*2;g2=g*2;b2=b*2;
    pressed=0;
    ;val=0
  );
  a=0.6;gfx_a=a;
  gfx_rect(x-len/2,y-wid/2,len,wid);
  gfx_gradrect(x-len/2+1,y-wid/2+1,len-2,wid-2,r2,g2,b2,1-a,0,0,0,0,(r-r2)/wid,(g-g2)/wid,(b-b2)/wid,-1/wid);
  gfx_set(1,1,1,1);
  lastx=gfx_x;lasty=gfx_y;
  gfx_measurestr(name,tw,th);gfx_x=x-tw/2;gfx_y=y-th/2;
  gfx_printf(name);
  gfx_x=lastx;gfx_y=lasty;
  val;
);

/* enable this when you want to debug your window trigger sizes.

function debugInputWindow(x,y,scale)local(x1,y1,sx,sy)( 
  transparent();
  x1=x-scale*1.25;y1=y-scale*1.25;
  sx=scale*1.25*2;sy=scale*1.25*2;
  gfx_rect(x1,y1,sx,sy);
  (mouse_x>x1)&&(mouse_x<x1+sx)&&
  (mouse_y>y1)&&(mouse_y<y1+sy);
);

*/

// knob ui
function gfx_wheel(x,y,sz,steps,rmin,rmax,send,name,default,ctrl)local(I,A,lastx,lasty,fontx,fonty,hover)(
  
  //safety setup - ensure minimum working values
  x=max(0,x);y=max(0,y);sz=max(8,sz);steps=max(2,steps);rmin=max(0,rmin);
  rmax=max(2,rmax);
  
  I=0;
  hover=(mouse_x>x-sz*1.25)&&(mouse_x<x-sz*1.25+sz*1.25*2)&&
  (mouse_y>y-sz*1.25)&&(mouse_y<y-sz*1.25+sz*1.25*2);
  
  //bg
  setsecondary();
  gfx_r=gfx_r*1.5;gfx_g=gfx_g*1.5;gfx_b=gfx_b*1.5;
  gfx_circle(x,y,sz*1.25,1,1);
  
  //fg
  hover?setprimaryhover():setprimary();
  gfx_arc(x,y,sz*1.25,-1/2*$PI+-0.25*$PI,-1/2*$PI+1.25*$PI,1);
  gfx_arc(x,y,sz*0.75,-1/2*$PI+-0.25*$PI,-1/2*$PI+1.25*$PI,1);
  gfx_line(
  x+sz*sin(-1/2*$PI+-0.27*$PI)*1.25,
  y+sz*cos(1/2*$PI+-0.27*$PI)*1.25,
  x+sz*sin(-1/2*$PI+-0.27*$PI)*0.75,
  y+sz*cos(1/2*$PI+-0.27*$PI)*0.75);
  gfx_line(
  x+sz*sin(-1/2*$PI+1.25*$PI)*1.25,
  y-sz*cos(-1/2*$PI+1.25*$PI)*1.25,
  x+sz*sin(-1/2*$PI+1.25*$PI)*0.75,
  y-sz*cos(-1/2*$PI+1.25*$PI)*0.75);
  
  //fill arc
  loop(sz*8,
    A=lerp(-323,-42,I);
    I>((send-1)/rmax)?gfx_set(1,1,1,1);
    gfx_line(x+sz*1.20*sinD(A),y+sz*1.20*cosD(A),x+sz*0.78*sinD(A),y+sz*0.78*cosD(A),1);
    
    I+=send/rmax*1/(sz*8);
  );
  
  //text/ui
  gfx_set(1,1,1,1);
  lastx=gfx_x;lasty=gfx_y;
  gfx_measurestr(name,fontx,fonty);
  gfx_x=x-fontx/2;gfx_y=5+sz+y-fonty/2;
  gfx_printf(name);
  gfx_measurestr(sprintf(#,"%x",send),fontx,fonty);
  gfx_x=x-fontx/2;gfx_y=y-fonty/2;
  gfx_printf(sprintf(#,"%x",send));
  
  //return last x,y
  gfx_x=lastx;gfx_y=lasty;
  
  //return value of knob
  hover?(
  mouse_cap!=64?(
                           //if not middle mouse
  send=processInput(send); //let scrollwheel adjust
  send=processDragIn(send);//let dragging also adjust
  ):send=default;          //otherwise reset to default
  );
  
  max(rmin,min(rmax,send));
  
);

function gfx_chkbx(x,y,sz,name,self)local(held,hover,r,g,b,a,lastx,lasty)(
  lastx=gfx_x;lasty=gfx_y;
  hover=(mouse_x>x-sz/2)&&(mouse_x<x+sz/2)&&
      (mouse_y>y-sz/2)&&(mouse_y<y+sz/2);
    
  hover?
  setprimaryhover()
  :setprimary();
  hover?(mouse_cap==1?held=1;mouse_cap==0&&held?(held=0;self=1-self)//avoids spamming
  );
  r=gfx_r;g=gfx_g;b=gfx_b;
  gfx_rect(x-sz/2,y-sz/2,sz,sz);
  setsecondary();
  gfx_rect(x-sz/2+1,y-sz/2+1,sz-2,sz-2);
  gfx_gradrect(x-sz/2+1,y-sz/2+1,sz-2,sz-2,
  r,g,b,1,
  0,0,0,0,
  0,0,0,-1/(sz));
  gfx_set(1,1,1,1);
  gfx_x=x+sz/2+4;gfx_y=y-4;
  gfx_printf(name);
  self?(
  gfx_rect(x-sz/4,y-sz/4,sz/2,sz/2);
  );
  self
)


// midi input parsing and throughput
@block
     while (midirecv(offset,msg1,msg2,msg3)) ( // REAPER 4.59+ syntax while()         
         msg1=msg1;
         msg2=msg2;
         msg3=msg3;
         getMidi(msg1,msg2,msg3);
         ((msg1-d1)%0x10)==0x0?(
         midisend(0,msg1,msg2,msg3);
         );
         // to do: set up midi adsr for the listened midi channel.
         //msg1==0x90+d1?(startADSR() ; );
         //msg1==0x80+d1?(stopSND()   ; );
      );

@sample
Tick+=1;
Tick%=srate/60;
Tick==0?(
  getInst();
  setEvent(w1,0xb0+d1,0x0b);
  setEvent(w2,0xb0+d1,0x0a);
  fns?( //if no bankpatches, set bank msb to 0
  setEvent2(t1,0xc0+d1);
  setEventForced(t1,0xb0+d1,0x00,0x00);
  ):( // otherwise parse bank type
  setEvent2(t1,0xc0+d1));
  
);
@gfx
/* #################### Safety #################### */

  // ensure minimum panel size , correct mode and values
  gfx_w<300?gfx_w=300;
  gfx_h<250?gfx_h=250;
  gfx_mode=0;controlX=0;controlY=0;
  
/* #################### Setup #################### */
  setsecondary();
    gfx_rect(0,0,gfx_w,gfx_h);
  
  //Bottom tabs
  setsecondary();
    gfx_gradrect(0,gfx_h-30,gfx_w,30,
    gfx_r*0.5,gfx_g*0.5,gfx_b*0.5,1,
    0,0,0,0,
    -1/80,-1/80,-1/80,0);
    
    b1=gfx_button(max(4/30*300,gfx_w*4/30),gfx_h-15,gfx_w*7/30,20,b1,"General");
    b2=gfx_button(max(11.11/30*300,gfx_w*11.11/30),gfx_h-15,gfx_w*7/30,20,b1,"Soft Env");
    b3=gfx_button(max(18.22/30*300,gfx_w*18.22/30),gfx_h-15,gfx_w*7/30,20,b1,"P Env");
    b4=gfx_button(max(25.33/30*300,gfx_w*25.33/30),gfx_h-15,gfx_w*7/30,20,b1,"Sliding");
        
    b1?Menu="General";
    b2?Menu="Soft Env";
   // b3?Menu="P Env";
   // b4?Menu="Sliding";
    
  /* GENERAL MENU */
    Menu=="General"?(
      gfx_set(1,1,1,1);
      gfx_line(5,22,15,22);
      gfx_x=20;gfx_y=20;gfx_printf("General");
      gfx_line(80,22,gfx_w-5,22);  
    
      controlX=gfx_w*0.1;controlX+=5;controlY=60;
      w1=gfx_wheel(controlX,controlY,20,32,0,0x7f,w1,"expr",0x7f,"Expression");
      
      controlX+=gfx_w*0.1;controlX+=20;controlX+=5;
      w2=gfx_wheel(controlX,controlY,20,32,0,0x7f,w2,"pan",0x3f,"Panning");
      
      
      controlX+=gfx_w*0.1;controlX+=20;controlX+=5;
      w3=gfx_wheel(controlX,controlY,20,32,0,0x7f,w3,"mod",0x00,"Modulation");
      
      setsecondary();
      gfx_rect((gfx_w*0.85)-34,24-8,68,24);
      d1=gfx_digit(
        gfx_w*0.85,22,
        64,16,
        0x00,0x0f,d1,"Channel");
      
      controlX=212/2+gfx_w/8;controlX+=5;
      controlY+=gfx_h*0.2;
      
      
      //bank selection. will write to gmem!
      t1=gfx_text(
        controlX,
        controlY,
        212+gfx_w/4,24,
        0x00,0x7f,
        setMenu(t1,controlX,controlY,212,24,#Instr)
        ,instn(t1));  
      setGmem(d1,t1);
      
      controlX=17;
      controlY+=gfx_h*0.1;
      fns=gfx_chkbx(controlX,controlY,24,"force nosubtype",fns);
      
      gfx_y=gfx_h-40;gfx_x=5;
      gfx_printf(sprintf(#,"Mem available: 0x%x B",__memtop()));
      
      slider1=w1;
      slider2=w2;
      slider3=w3;
      slider4=t1;
      slider5=fns;
      slider6=d1;
      
      mouse_wheel=0;//clear after use; 
    );
    Menu=="Soft Env"?(
          gfx_set(1,1,1,1);
          gfx_line(5,22,15,22);
          gfx_x=20;gfx_y=20;gfx_printf("Software Envelope");
          gfx_line(160,22,gfx_w-5,22);
          setsecondaryhover();
          gfx_r=gfx_r*1.2;gfx_g=gfx_g*1.2;gfx_b=gfx_b*1.2;
          gfx_rect(5,60,gfx_w-10,gfx_h-95);
          
          setsecondary();
          gfx_gridBox(9,64,gfx_w-18,gfx_h-153,"No Menu Items yet!"); 
          
          SE_gs=0;SE_sp=0;  
          controlX=gfx_w*2/12;controlY=gfx_h-60;
          SE_A=gfx_wheel(controlX,controlY,15,0x7f,0x00,0x7f,SE_A,"A",0x00,0);
          slider7=SE_A;
          controlX+=gfx_w*2.66/12;
          SE_D=gfx_wheel(controlX,controlY,15,0x7f,0x00,0x7f,SE_D,"D",0x3f,0);
          slider8=SE_D;
          controlX+=gfx_w*2.66/12;
          SE_S=gfx_wheel(controlX,controlY,15,0x7f,0x00,0x7f,SE_S,"S",0x3f,0);
          slider9=SE_S;
          controlX+=gfx_w*2.66/12;
          SE_R=gfx_wheel(controlX,controlY,15,0x7f,0x00,0x7f,SE_R,"R",0x1f,0);
          slider10=SE_R;
          
          //Menu goes on the left lower side, itll be a single button
          
          mouse_wheel=0;//clear after use;        
    );
