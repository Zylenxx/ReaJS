desc: NES APU DPCM Filter

//Please use 44khz internal samplerate for this!
//This uses an internal samplerate reduction to match the 12000HZ that the NES uses!

slider1:1<1,32,1>DC Removal rate
slider2:0.01<0.01,1,0.01>Scrollspeed
slider3:0<0,1,1{False,True}>Freeze

@slider
S1=slider1;
S2=slider2;
Freeze=slider3;
@init
function downsample()(
	mb_index+=1;
	mb_index<floor(srate/12000)?mb_index=0;
	mb_index==0?(Tick=1-Tick;OSPL=spl0):OSPL=OSPL;
	OSPL;
);


gfx_clear=0;
INPUT=0;
OUTPUT=0;
DCOFFSET=0;
	function DPCMsign(target,current)(
		target<current?0:1;
	);
	function doDPCM(get,value)(
		//get last sample if possible
		lasts==value?dither=1:dither=0;
		//recursive,will output set, should use it as next get at all times.
		//clamps at minmax of 0000000-FFFFFFF
		min=0;
		max=127;
		dither?ADD=Tick-(Tick==0);
		get?(value>max?max:value+max(ADD,1);
			):(value>min?min:value-max(ADD,1);
			);
		);
	function APU_HandleAudio(Input)(
		// Input = 0-127 (0000000-FFFFFFF)
		// => -1=>1 Signed output
		(Input/64)-1;
	);
	function APU_DCRemove(Recursive,rate)(
		//recursive DC Removal
		//decaying "rate" per second;
		R=(rate/srate);
		// has to feed back into itself.
		DCOFFSET=(DCOFFSET*(1-R))+R*Recursive;
		Recursive;
	);

gfx_clear=-1;
@sample
	spl0=downsample();
	INPUT=spl0;
	SGN=DPCMsign(-64+(INPUT)*64,OUTPUT); //get sample
	OUTPUT=APU_DCRemove(doDPCM(SGN,OUTPUT),S1); // recursive step approaching
	lasts=OUTPUT;// used for dithering when required
	spl0=APU_HandleAudio(OUTPUT-(DCOFFSET*2)); // output current step
	spl1=spl0; //make mono
	((INDEX<gfx_W)+(1-Freeze))?(
	INDEX=(INDEX+S2)*(INDEX<gfx_w);
	BUF[INDEX%gfx_w]=spl0; // for gfx display
	);
@gfx
gfx_clear=1;
loop(gfx_w,
gfx_mode=0;
gfx_r=1;gfx_g=1;gfx_b=1;
gfx_x>=gfx_w?(gfx_clear=0;gfx_x=0):(gfx_x=gfx_x+1;gfx_clear=-1);
gfx_y=256-256*BUF[gfx_x];
BUF[gfx_x]-BUF[gfx_x-1]<0?(gfx_r=0;gfx_g=128/255;gfx_b=255/255;):(gfx_r=255/255;gfx_g=0/255;gfx_b=128/255;);
gfx_line(gfx_x,256,gfx_x+1,256-256*BUF[gfx_x]);
gfx_clear=0;)

