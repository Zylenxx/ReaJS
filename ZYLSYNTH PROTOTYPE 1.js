desc: ZylSynth Prototype V1.00

//matrix: 1 2 3 4  O

//        1 2 3 4  H  
//        5 6 7 8  I
//        C B A 9  J
//        D E F G  K

slider1:0<0,255,1>-1>1
slider2:0<0,255,1>-1>2
slider3:0<0,255,1>-1>3
slider4:0<0,255,1>-1>4

slider5:0<0,255,1>-2>1
slider6:0<0,255,1>-2>2
slider7:0<0,255,1>-2>3
slider8:0<0,255,1>-2>4

slider12:0<0,255,1>-3>1
slider11:0<0,255,1>-3>2
slider10:0<0,255,1>-3>3
slider9:0<0,255,1>-3>4

slider13:0<0,255,1>-4>1
slider14:0<0,255,1>-4>2
slider15:0<0,255,1>-4>3
slider16:0<0,255,1>-4>4

slider17:0<0,255,1>-1 out
slider18:0<0,255,1>-2 out
slider19:0<0,255,1>-3 out
slider20:0<0,255,1>-4 out

slider21:0<0,32,1>-A1
slider22:0<0,32,1>-D1
slider23:0<0,32,1>-S1
slider24:0<0,32,1>-R1

slider25:0<0,32,1>-A2
slider26:0<0,32,1>-D2
slider27:0<0,32,1>-S2
slider28:0<0,32,1>-R2

slider29:0<0,32,1>-A3
slider30:0<0,32,1>-D3
slider31:0<0,32,1>-S3
slider32:0<0,32,1>-R3

slider33:0<0,32,1>-A4
slider34:0<0,32,1>-D4
slider35:0<0,32,1>-S4
slider36:0<0,32,1>-R4

slider37:0<0,32,1>-MBV1
slider38:0<0,32,1>-MBV2
slider39:0<0,32,1>-MBV3
slider40:0<0,32,1>-MBV4

slider41:0<1,4,1>-ChannelsUsed
slider42:440<430,460,1>-Tuning

slider43:0<0,16,1>-Mult1
slider44:0<0,16,1>-Mult2
slider45:0<0,16,1>-Mult3
slider46:0<0,16,1>-Mult4

slider47:0<-3,3,1>-DT1
slider48:0<-3,3,1>-DT2
slider49:0<-3,3,1>-DT3
slider50:0<-3,3,1>-DT4


@init
ID=1;
ext_midi_bus = 1;

ValBank   = 0x01000;
//adsr timer storage for each op
ADSRBank  = 0x00000;

//note storage, 4 max if only using 1 voice
NoteBank  = 0x80000;
NState    = 0x81000;

//compiler bank (32 samples width,signed)
CompBank  = 0xF0000;

__=0;
  loop(32,
    BUF[CompBank+__]=0;
    __=__+1;
  );
__=0;

//MIDI FILTERS
NOTEON=0x90;
NOTEOFF=0x80;
PBEND=0xE0;

//timer,note,volume
function allocNote(X,n,v)(
  BUF[NoteBank+X*0x4]=0; //reset timer for ADSR
  BUF[NoteBank+X*0x4+0x1]=n; //set note
  BUF[NoteBank+X*0x4+0x2]=v //set volume
  //#SEND=sprintf(#,"%x",NoteBank+X*0x4+0x1);
);

function notetrigger(FILTER,NT,VOL)(
  (FILTER==NOTEON&&VOL!=90)?(//set noteflag for adsr
      NCH==4?(
        ID=ID+1;
        ID>4?ID=1;
        BUF[NState+ID]=1;
        allocNote(ID,NT,VOL);
      );
      NCH==2?(
              ID=ID+1;
              ID>2?ID=1;
              BUF[NState+(ID*2)]=1;
              BUF[NState+(ID*2)+2]=1;
              allocNote(ID*2-1,NT,VOL);
              allocNote(ID*2,NT,VOL);
      );
      NCH==1?(
      ID=1;
      allocNote(ID,NT,VOL);
      allocNote(ID+1,NT,VOL);
      allocNote(ID+2,NT,VOL);
      allocNote(ID+3,NT,VOL);
      )
      
  );
  FILTER==NOTEOFF?(//set noteflag for adsr
      NCH==4?(
        BUF[NState+ID]=0 
      );
      NCH==2?(
              BUF[NState+(ID*2-1)]=0;
              BUF[NState+(ID*2)]=0;                            
      );
      NCH==1?(
      BUF[NState+ID]=0;
      BUF[NState+ID+1]=0;
      BUF[NState+ID+2]=0;
      BUF[NState+ID+3]=0;                 
      )
  )
);

function adsrTimer(n,t1) local(a d s r t2 na tofs) (
  
  t2 = t1/srate * (tempo/60); //rescale sample rate into a fine beat position for the adsr.
  
  a = BUF[ValBank+1+(n-1)*4]/32;
  d = BUF[ValBank+2+(n-1)*4]/32;
  s = BUF[ValBank+3+(n-1)*4]/32;
  r = BUF[ValBank+4+(n-1)*4]/32;
  na= BUF[NState+n];
  //if sustained, we want to keep the sustained state.
  //once released, let t2 continue. 
  
  
  g = max( 0 ,
    (min( t2/a,1 ) )* 
    (max( s , ( 1 - (1/(d/(1-s)) * max( 0, t2-a )) ) ) )* 
    (1 - ( (1/max(r,0.001)) * max( 0 , t2 - a - d ) ))
  );
  
  //sprintf(#Debug,"%x %d | %x %x %x %x => %d",na,t2*0x10,a*0x20,d*0x20,s*0x20,r*0x20,g*0x20);
  //debugG=g;
  g;
);

function w__adsr(n,t)(
  BUF[ADSRBank+n]=adsrTimer(n,t);
);


/*

function compilePMFM(x,n,v,t) local(o1 o2 o3 o4)(




  // parse matrix and outputs, compile into single output
  // make sure to scale output accordingly
  // this gets sent to CompBank
  // with id mapped outputs

  



);
*/

function compileAudio() local(sampmax sampledata index)
(
 sampledata=0; // reset sample data
 sampmax=0;    // reset peak height
 index = 0;
 loop(4,
    index=index+1;
    sampledata=sampledata+BUF[CompBank+index];
    sampmax=max(sampmax,BUF[CompBank+index]);
 );
 spl0 =(sampledata/sampmax)+sampmax/2; 
 // will automaticly dc offset remove
);

function updateADSR()local(k)(
  k=k+1;
  k>4?k=1;
  w__adsr(k,BUF[NoteBank+k*0x4]);
  BUF[ADSRBank+k]<0x100?(
  BUF[NoteBank+k*0x4]=BUF[NoteBank+k*0x4]+1
  );
);

@slider
_=1;
loop(16,
  BUF[ValBank+_]=slider(_+20);
  _=_+1;
);
NCH=(4*pow(2,-slider41+1));

@block
while(midirecv(_,msg1,msg2,msg3))(
  notetrigger(msg1,msg2,msg3);
  //#DEBUG=sprintf(#,"filter %d, note %d, vol %d",msg1,msg2,msg3);
);
//sprintf(#DebugVBank,"%d %d %d %d", BUF[ValBank+1],BUF[ValBank+2],BUF[ValBank+3],BUF[ValBank+4])
@sample
updateADSR();
//compileAudio()

spl1=spl0;//(make mono)

@gfx
gfx_mode=0;
gfx_clear=0x00000;

___=0;
gfx_set(1,1,1,1);
loop(4,
gfx_line(30,30+(___*80),30+(BUF[ADSRBank+(___+1)])*(gfx_w-60),30+(___*80));
gfx_line(30+BUF[ValBank+3+(___*4)]/32*(gfx_w-60),60+(___*80),30+BUF[ValBank+3+(___*4)]/32*(gfx_w-60),40+(___*80));
gfx_line((gfx_w-30),60+(___*80),(gfx_w-30),40+(___*80));
gfx_x=30;gfx_y=15+(___*80);
gfx_printf(sprintf(#,"OP %d",___+1));
___=___+1;
);
gfx_x=30;gfx_y=15+400;
gfx_printf("Register:");
gfx_x=30;gfx_y=25+400;

___=0;
loop(50,
  ___+=1;
  gfx_x=30+((___-1)%16)*32;
  gfx_y=425+floor((___-1)/16)*15;
  gfx_set(0.2,0.5,1,0.3+min(0.7,4*abs(slider(___)%0x1000)/0x100));
  slider(___)<0?(
  gfx_printf(sprintf(#,"%03x ",0x1000+slider(___)))
  ):(
  gfx_printf(sprintf(#,"%03x ",slider(___)))
  );
);

gfx_set(1,0.4,0,1);
___=0;
loop(4,
  ___+=1;
  gfx_x=30+((49+___)%16)*32;
  gfx_y=425+floor((49+___)/16)*15;
  gfx_a=1-0.7*((0x40*BUF[NoteBank+(___*0x4)]/srate)%0x10)/0x10;
  gfx_printf(sprintf(#,"%03x ",(255*BUF[NoteBank+(___*0x4)]/srate)%0x1000));
);
gfx_set(1,0.9,0,1);
___=0;
loop(4,
  ___+=1;
  gfx_x=30+((53+___)%16)*32;
  gfx_y=425+floor((53+___)/16)*15;
  gfx_a=0.3+0.7*((BUF[NoteBank+(___*0x4)+0x1]%12)/12);
  gfx_printf(sprintf(#,"%03x ",(BUF[NoteBank+(___*0x4)+0x1])%0x1000));
);

gfx_set(0.5,1,0,1);
___=0;
loop(4,
  ___+=1;
  gfx_x=30+((57+___)%16)*32;
  gfx_y=425+floor((57+___)/16)*15;
  gfx_a=BUF[NoteBank+(___*0x4)+0x2]/128;
  gfx_printf(sprintf(#,"%03x ",(BUF[NoteBank+(___*0x4)+0x2])%0x1000));
);

___=0;
loop(4,
  ___+=1;
  gfx_x=30+((61+___)%16)*32;
  gfx_y=425+floor((61+___)/16)*15;
  gfx_set(0.9,0,1,0.3+0.7*BUF[ADSRBank+___]);
  gfx_printf(sprintf(#,"%03x ",(BUF[ADSRBank+___]*255)%0x1000));
);

___=0;
loop(4,
  ___+=1;
  gfx_x=30+((65+___)%16)*32;
  gfx_y=425+floor((65+___)/16)*15;
  gfx_set(0.3,1,1,0.3+0.7*BUF[NState+___]);
  gfx_printf(sprintf(#,"%03x ",(BUF[NState+___])%0x1000));
);
  ___+=1;
  gfx_x=30+((65+___)%16)*32;
  gfx_y=425+floor((65+___)/16)*15;
  gfx_set(1,1,1,1);
  gfx_printf(sprintf(#,"%03x ",ID));
