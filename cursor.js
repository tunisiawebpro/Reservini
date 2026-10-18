/* Custom cursor: dot + trailing ring, hover states, press feedback, click bursts.
   Desktop mouse only. Uses JS lerp + Web Animations API so it still runs when the OS asks for reduced motion. */
(()=>{
if(window.__cursorInit)return;window.__cursorInit=1;
if(!matchMedia("(hover:hover) and (pointer:fine)").matches)return;
const root=document.documentElement,mk=c=>{const e=document.createElement("div");e.className=c;e.setAttribute("aria-hidden","true");document.body.appendChild(e);return e};
const dot=mk("cur-dot"),ring=mk("cur-ring"),lab=mk("cur-label");
const LINK='a,button,summary,select,label,[role=button],[data-cursor],.btn,.copt,.hcard,input[type=checkbox],input[type=radio],input[type=submit]';
const TEXT='input:not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button]),textarea,[contenteditable=true]';
let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my,sc=1,ts=1,state="",pressed=false,seen=false;
root.classList.add("has-cursor");
function setState(el){
 let s="",t="";
 if(el){
  if(el.closest(TEXT))s="text";
  else if(el.closest(LINK))s="link";
  const l=el.closest("[data-cursor-label]");t=l?l.dataset.cursorLabel:(el.closest(".hscroll")?"Drag":"");
  ring.classList.toggle("on-light",!!el.closest(".light"));dot.classList.toggle("on-light",!!el.closest(".light"));
 }
 if(t&&s==="link")s="label";
 if(s!==state){state=s;root.dataset.cur=s}
 if(lab.textContent!==t)lab.textContent=t;
 ts=s==="link"?1.55:s==="label"?2.3:1;
}
addEventListener("mousemove",e=>{mx=e.clientX;my=e.clientY;if(!seen){seen=true;rx=mx;ry=my;root.classList.add("cur-visible")}setState(e.target)},{passive:true});
document.addEventListener("mouseleave",()=>root.classList.remove("cur-visible"));
document.addEventListener("mouseenter",()=>seen&&root.classList.add("cur-visible"));
addEventListener("pointerdown",e=>{if(e.button!==0)return;pressed=true;burst(e.clientX,e.clientY,!!e.target.closest(LINK))});
addEventListener("pointerup",()=>pressed=false);
addEventListener("blur",()=>pressed=false);
function burst(x,y,strong){
 const r=document.createElement("div");r.className="cur-burst";r.style.left=x+"px";r.style.top=y+"px";document.body.appendChild(r);
 r.animate([{transform:"translate(-50%,-50%) scale(.15)",opacity:.95,borderWidth:"3px"},{transform:"translate(-50%,-50%) scale(1)",opacity:0,borderWidth:"1px"}],{duration:700,easing:"cubic-bezier(.16,1,.3,1)"}).onfinish=()=>r.remove();
 const n=strong?12:7,off=Math.random()*Math.PI;
 for(let i=0;i<n;i++){
  const p=document.createElement("i");p.className="cur-spark";p.style.left=x+"px";p.style.top=y+"px";document.body.appendChild(p);
  const a=off+i*(Math.PI*2/n)+(Math.random()-.5)*.35,d=(strong?46:34)+Math.random()*34,s=2+Math.random()*3;
  p.style.width=p.style.height=s+"px";
  p.animate([{transform:"translate(-50%,-50%) scale(1)",opacity:1},{transform:`translate(calc(-50% + ${Math.cos(a)*d}px),calc(-50% + ${Math.sin(a)*d}px)) scale(.2)`,opacity:0}],{duration:450+Math.random()*350,easing:"cubic-bezier(.22,1,.36,1)"}).onfinish=()=>p.remove();
 }
}
(function loop(){
 rx+=(mx-rx)*.2;ry+=(my-ry)*.2;sc+=((pressed?ts*.7:ts)-sc)*.25;
 dot.style.transform=`translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`;
 const t=`translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
 ring.style.transform=t+` scale(${sc.toFixed(3)})`;lab.style.transform=t;
 requestAnimationFrame(loop);
})();
})();