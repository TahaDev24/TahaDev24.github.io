(() => {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarse = window.matchMedia("(pointer: coarse)");
  const rand = (a,b) => a + Math.random() * (b-a);

  // Ambient field: fine metallic dust drifting through the whole page.
  const field = document.getElementById("silver-field");
  const fctx = field && field.getContext("2d", {alpha:true, desynchronized:true});
  if (field && fctx) {
    const s = {w:0,h:0,dpr:1,items:[],raf:0,last:0,px:0,py:0,tx:0,ty:0,visible:true,running:false};
    const count = () => Math.min(coarse.matches ? 74 : 126, Math.max(coarse.matches ? 50 : 86, Math.round(innerWidth*innerHeight/(coarse.matches?12500:9600))));
    function make(initial=true) {
      const depth = Math.pow(Math.random(),1.7);
      return {x:rand(0,s.w),y:initial?rand(0,s.h):rand(-20,-3),z:depth,r:rand(.35,.8)+depth*.65,
        vx:rand(-.13,.13)*(0.25+depth),vy:rand(.035,.18)*(0.35+depth),phase:rand(0,6.28),tw:rand(.4,1.2),angle:rand(0,6.28),length:rand(1.2,3.4)*(0.3+depth),kind:Math.random()<.22?"shard":"dust"};
    }
    function resize() {
      s.w=innerWidth;s.h=innerHeight;s.dpr=Math.min(devicePixelRatio||1,coarse.matches?1.35:1.7);
      field.width=Math.round(s.w*s.dpr);field.height=Math.round(s.h*s.dpr);field.style.width=s.w+"px";field.style.height=s.h+"px";
      fctx.setTransform(s.dpr,0,0,s.dpr,0,0);
      const n=count();while(s.items.length<n)s.items.push(make());s.items.length=n;
    }
    function draw(p,t) {
      const shimmer=.5+.5*Math.sin(t*.0008*p.tw+p.phase);
      const alpha=(.08+p.z*.24)*(.72+shimmer*.28);
      const x=p.x+s.px*p.z*11,y=p.y+s.py*p.z*11;
      fctx.save();fctx.translate(x,y);fctx.rotate(p.angle+Math.sin(t*.0002+p.phase)*.3);
      if(p.kind==="shard") {
        fctx.shadowBlur=0;
        const g=fctx.createLinearGradient(-p.length,0,p.length,0);
        g.addColorStop(0,"rgba(150,168,182,0)");g.addColorStop(.5,"rgba(192,205,215,"+alpha+")");g.addColorStop(1,"rgba(150,168,182,0)");
        fctx.strokeStyle=g;fctx.lineWidth=.45+p.z*.65;fctx.beginPath();fctx.moveTo(-p.length,0);fctx.lineTo(p.length,0);fctx.stroke();
      } else {
        const g=fctx.createRadialGradient(-p.r*.3,-p.r*.3,0,0,0,p.r*2.1);
        g.addColorStop(0,"rgba(205,215,223,"+Math.min(.36,alpha+.08)+")");g.addColorStop(.38,"rgba(150,165,177,"+alpha+")");g.addColorStop(1,"rgba(100,119,135,0)");
        fctx.fillStyle=g;fctx.beginPath();fctx.arc(0,0,p.r*2.1,0,Math.PI*2);fctx.fill();
      }
      fctx.restore();
    }
    function frame(t) {
      if(!s.running)return;
      const dt=Math.min(34,t-(s.last||t));s.last=t;fctx.clearRect(0,0,s.w,s.h);
      s.px+=(s.tx-s.px)*.025;s.py+=(s.ty-s.py)*.025;
      for(const p of s.items) {
        if(!reduceMotion.matches){p.x+=p.vx*dt*.055;p.y+=p.vy*dt*.055;p.angle+=p.vx*.002;
          if(p.y>s.h+12||p.x<-20||p.x>s.w+20){Object.assign(p,make(false));p.x=rand(0,s.w);}}
        draw(p,t);
      }
      s.raf=requestAnimationFrame(frame);
    }
    function start(){if(s.running||document.hidden||!s.visible||reduceMotion.matches)return;s.running=true;s.last=0;s.raf=requestAnimationFrame(frame);}
    function stop(){s.running=false;cancelAnimationFrame(s.raf);}
    resize();if(reduceMotion.matches){for(const p of s.items)draw(p,0);}else start();
    addEventListener("resize",resize,{passive:true});
    addEventListener("pointermove",e=>{if(!coarse.matches){s.tx=(e.clientX/innerWidth-.5)*2;s.ty=(e.clientY/innerHeight-.5)*2;}},{passive:true});
    document.addEventListener("visibilitychange",()=>document.hidden?stop():start());
    if("IntersectionObserver"in window){const io=new IntersectionObserver(entries=>{s.visible=entries[0].isIntersecting;s.visible?start():stop()});io.observe(field);}
    reduceMotion.addEventListener?.("change",()=>{if(reduceMotion.matches){stop();fctx.clearRect(0,0,s.w,s.h);s.items.forEach(p=>draw(p,0));}else start();});
  }

  // Hero sculpture: a volumetric cloud of silver particles forming a rotating,
  // irregular metallic torus with independent depth, shimmer and orbital motion.
  const hero = document.getElementById("hero-core");
  const ctx = hero && hero.getContext("2d",{alpha:true,desynchronized:true});
  if(!hero||!ctx)return;
  const h = {w:0,ht:0,dpr:1,points:[],raf:0,last:0,angle:0,visible:true,running:false,pointer:0};
  function makePoint(i,n) {
    const u=Math.random()*Math.PI*2;
    const v=Math.random()*Math.PI*2;
    const R=126+rand(-13,13),r=42+rand(-11,11);
    const tube=r+rand(-10,10);
    return {u,v,R,tube,seed:rand(0,6.28),size:rand(.45,1.15),alpha:rand(.22,.58),speed:rand(.00008,.00028),metal:Math.random(),spark:Math.random()<.008};
  }
  function setup() {
    const rect=hero.getBoundingClientRect();h.w=rect.width;h.ht=rect.height;h.dpr=Math.min(devicePixelRatio||1,coarse.matches?1.3:1.7);
    hero.width=Math.round(h.w*h.dpr);hero.height=Math.round(h.ht*h.dpr);ctx.setTransform(h.dpr,0,0,h.dpr,0,0);
    const n=coarse.matches?190:340;while(h.points.length<n)h.points.push(makePoint(h.points.length,n));h.points.length=n;
  }
  function project(p,t) {
    const u=p.u,v=p.v+h.angle;
    const R=p.R,r=p.tube+Math.sin(t*.001+p.seed)*1.6;
    let x=(R+r*Math.cos(v))*Math.cos(u);
    let y=(R+r*Math.cos(v))*Math.sin(u);
    let z=r*Math.sin(v);
    const tilt=-.48+h.pointer*.08;
    const yy=y*Math.cos(tilt)-z*Math.sin(tilt);
    const zz=y*Math.sin(tilt)+z*Math.cos(tilt);
    const perspective=440/(440+zz);
    return {x:h.w*.5+x*perspective*1.12,y:h.ht*.5+yy*perspective*.92,z:zz,perspective};
  }
  function drawHero(t) {
    ctx.clearRect(0,0,h.w,h.ht);
    const glow=ctx.createRadialGradient(h.w*.5,h.ht*.5,5,h.w*.5,h.ht*.5,Math.min(h.w,h.ht)*.38);
    glow.addColorStop(0,"rgba(154,177,194,.025)");glow.addColorStop(.48,"rgba(103,127,145,.012)");glow.addColorStop(1,"rgba(3,5,7,0)");
    ctx.fillStyle=glow;ctx.fillRect(0,0,h.w,h.ht);
    const sorted=h.points.map(p=>({p,q:project(p,t)})).sort((a,b)=>a.q.z-b.q.z);
    for(const item of sorted) {
      const p=item.p,q=item.q;
      const shimmer=.55+.45*Math.sin(t*.0013+p.seed);
      const a=p.alpha*(.2+(.8*(q.perspective)))*shimmer;
      const radius=p.size*q.perspective*(q.z>0?1.2:.8);
      if(p.spark&&q.z>5) {
        ctx.save();ctx.globalAlpha=a*.45;ctx.shadowBlur=1;ctx.shadowColor="rgba(170,187,199,.25)";
        ctx.strokeStyle="rgba(190,204,215,.48)";ctx.lineWidth=.6;
        ctx.beginPath();ctx.moveTo(q.x-radius*4,q.y);ctx.lineTo(q.x+radius*4,q.y);ctx.moveTo(q.x,q.y-radius*4);ctx.lineTo(q.x,q.y+radius*4);ctx.stroke();ctx.restore();
      } else {
        const light=p.metal>.52?"232,239,244":"133,154,170";
        ctx.fillStyle="rgba("+light+","+Math.min(.95,a)+")";
        if(q.z>0){ctx.shadowBlur=radius*1.2;ctx.shadowColor="rgba(177,192,204,"+(a*.16)+")";}
        ctx.beginPath();ctx.arc(q.x,q.y,Math.max(.35,radius),0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
      }
    }
    // Three fine orbital trajectories create a readable depth reference.
    ctx.save();ctx.translate(h.w*.5,h.ht*.5);ctx.rotate(-.34+h.angle*.08);
    for(let k=0;k<3;k++){ctx.beginPath();ctx.ellipse(0,0,154+k*19,61+k*8,.08+k*.12,0,Math.PI*2);ctx.strokeStyle="rgba(169,190,205,"+(0.045-k*.012)+")";ctx.lineWidth=.65;ctx.stroke();}
    ctx.restore();
  }
  function frame(t) {
    if(!h.running)return;const dt=Math.min(34,t-(h.last||t));h.last=t;
    if(!reduceMotion.matches)h.angle+=dt*.00011;
    drawHero(t);h.raf=requestAnimationFrame(frame);
  }
  function start(){if(h.running||document.hidden||!h.visible)return;h.running=true;h.last=0;h.raf=requestAnimationFrame(frame);}
  function stop(){h.running=false;cancelAnimationFrame(h.raf);}
  setup();if(reduceMotion.matches)drawHero(0);else start();
  addEventListener("resize",()=>{setup();if(reduceMotion.matches)drawHero(0)},{passive:true});
  addEventListener("pointermove",e=>{h.pointer=(e.clientX/innerWidth-.5)*2},{passive:true});
  if("IntersectionObserver"in window){const io=new IntersectionObserver(entries=>{h.visible=entries[0].isIntersecting;h.visible?start():stop()},{rootMargin:"100px"});io.observe(hero);}
  document.addEventListener("visibilitychange",()=>document.hidden?stop():start());
  reduceMotion.addEventListener?.("change",()=>{if(reduceMotion.matches){stop();drawHero(0)}else start()});
})();