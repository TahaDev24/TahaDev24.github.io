(() => {
  "use strict";
  const progress=document.getElementById("progress"),menu=document.querySelector(".menu-toggle"),nav=document.getElementById("primary-navigation"),year=document.getElementById("year");
  if(year)year.textContent=String(new Date().getFullYear());
  let ticking=false;
  const updateProgress=()=>{if(progress){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?Math.min(100,scrollY/max*100):0)+"%";}ticking=false;};
  addEventListener("scroll",()=>{if(!ticking){requestAnimationFrame(updateProgress);ticking=true;}},{passive:true});updateProgress();
  if(menu&&nav){
    const close=()=>{nav.classList.remove("is-open");menu.setAttribute("aria-expanded","false");menu.setAttribute("aria-label","باز کردن منو");menu.querySelector("span").textContent="☰";};
    menu.addEventListener("click",()=>{const open=menu.getAttribute("aria-expanded")!=="true";menu.setAttribute("aria-expanded",String(open));menu.setAttribute("aria-label",open?"بستن منو":"باز کردن منو");menu.querySelector("span").textContent=open?"×":"☰";nav.classList.toggle("is-open",open);});
    nav.addEventListener("click",e=>{if(e.target.closest("a"))close();});addEventListener("resize",()=>{if(innerWidth>700)close();},{passive:true});document.addEventListener("keydown",e=>{if(e.key==="Escape")close();});
  }
  const reveal=document.querySelectorAll(".reveal");
  if("IntersectionObserver"in window&&!matchMedia("(prefers-reduced-motion: reduce)").matches){const io=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add("is-visible");io.unobserve(e.target);}},{threshold:.12,rootMargin:"0px 0px -35px 0px"});reveal.forEach(el=>io.observe(el));}else reveal.forEach(el=>el.classList.add("is-visible"));
  if(nav&&"IntersectionObserver"in window){const sections=document.querySelectorAll("main section[id]");const io=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)nav.querySelectorAll("a").forEach(a=>{if(a.getAttribute("href")==="#"+e.target.id)a.setAttribute("aria-current","location");else a.removeAttribute("aria-current");});},{rootMargin:"-35% 0px -55% 0px"});sections.forEach(s=>io.observe(s));}
})();