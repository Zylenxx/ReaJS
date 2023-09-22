desc: NES DC Offset remover

slider1:128<64,1024,16>DC amount preview Size
slider2:192<192,512,1>DC Removal Rate
@slider
SZ=slider1;
RATE=slider2;
@init
function getDC(self,mono)(
  fract=RATE/srate;
  self*(1-fract)+mono*fract
);
function removeDC(get)(
  spl0-get
);


@sample
t+=1;
A = getDC(A,spl0);
buf[SZ]=A;
fixed=removeDC(A);
spl0=fixed;
spl1=fixed;
@gfx
loop(SZ,
i+=1;
i%=SZ;
buf[i]=buf[i+1];
);
gfx_mode=1;
gfx_set(1,1,1);
loop(SZ,
frac=(frac+1)%SZ;
gfx_line(
(frac/SZ)*gfx_w,
(gfx_h/2)+gfx_h*buf[frac],
((frac+1)/SZ)*gfx_w,
(gfx_h/2)+gfx_h*buf[frac+1],1);
);
gfx_x=5;gfx_y=5;

