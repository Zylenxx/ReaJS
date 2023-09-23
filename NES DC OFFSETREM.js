desc: NES DC Offset remover

slider1:128<64,1024,16>DC amount preview Size
slider2:192<192,512,1>DC Removal Rate

@slider
  SZ=slider1;
  RATE=slider2;

@init
  // retrieve DC Offsets by recursively measuring the mean of audio polarity
  function getDC(self,mono)(
    fract=RATE/srate;
    self*(1-fract)+mono*fract
  );

  // simple offset for removing DC
  function removeDC(get)(
    spl0-get
  );


@sample
  t+=1;
  A = getDC(A,spl0); // recursive as mentioned above
  buf[SZ]=A;         // store offset as buffer memory
  fixed=removeDC(A); // calculate audio with dc offset
  spl0=fixed;        // Mono out with fixed DC Offset
  spl1=fixed;        //

@gfx
  // scrolling buffer feedback
  loop(SZ,
  i+=1;
  i%=SZ;
  buf[i]=buf[i+1];
  );

  gfx_mode=1;
  gfx_set(1,1,1);

    //draw loop
    loop(SZ,
    frac=(frac+1)%SZ;
    gfx_line(
    (frac/SZ)*gfx_w,
    (gfx_h/2)+gfx_h*buf[frac],
    ((frac+1)/SZ)*gfx_w,
    (gfx_h/2)+gfx_h*buf[frac+1],1);
    );
     //reset position
     gfx_x=5;gfx_y=5;

