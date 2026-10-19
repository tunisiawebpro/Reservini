(()=>{const S=window.SITE,page=(location.pathname.split("/").pop()||"index.html").split("?")[0];
const LANG=localStorage.getItem("rsv-lang")||"en";
const T=k=>(window.I18N&&window.I18N[LANG]&&window.I18N[LANG][k])||(window.I18N&&window.I18N.en[k])||k;
document.documentElement.lang=LANG;
function applyI18n(){document.querySelectorAll("[data-i18n]").forEach(el=>{const v=T(el.dataset.i18n);if(v&&v!==el.dataset.i18n)el.textContent=v});const tt=document.querySelector("title[data-i18n]");if(tt)document.title=T(tt.dataset.i18n)}
window.setLang=l=>{localStorage.setItem("rsv-lang",l);location.reload()};
document.querySelectorAll("[data-brand]").forEach(e=>e.textContent=S.BRAND_NAME);
if(document.title.includes("BRAND_NAME"))document.title=document.title.replace(/BRAND_NAME/g,S.BRAND_NAME);
const navNoDemo=S.nav.filter(([h])=>h!=="demo.html");
const links=navNoDemo.map(([h,t])=>`<li><a class="nl" href="${h}"${h===page?' aria-current="page"':""}>${T(t)}</a></li>`).join("");
const langSw=`<span class="lang-sw" role="group" aria-label="Language"><button class="${LANG==="en"?"on":""}" onclick="setLang('en')">EN</button><button class="${LANG==="fr"?"on":""}" onclick="setLang('fr')">FR</button></span>`;
const hd=document.getElementById("site-header");
if(hd){hd.innerHTML=`<div class="wrap hd-in"><a class="logo" href="index.html"><span class="logo-mark">◈</span><span>${S.BRAND_NAME}</span></a><nav aria-label="Main"><ul class="desk">${links}<li><a class="btn sm p" data-cursor="TRY DEMO" href="demo.html">${T("nav.demo")}</a></li><li>${langSw}</li></ul><button class="btn sm burger" aria-expanded="false" aria-controls="mmenu">${T("nav.menu")}</button></nav></div>`;
const mm=document.createElement("div");mm.className="mmenu";mm.id="mmenu";
mm.innerHTML=navNoDemo.map(([h,t],i)=>`<a class="big" href="${h}"><span>0${i+1}</span>${T(t)}</a>`).join("")+`<a class="big" href="demo.html"><span>0${navNoDemo.length+1}</span>${T("nav.demo")}</a>`+`<p style="margin-top:1.2rem;display:flex;gap:.6rem;flex-wrap:wrap;align-items:center"><a class="btn p" href="demo.html">${T("nav.demo")}</a><a class="btn" href="contact.html?type=quote">${T("nav.quote")}</a>${langSw}</p>`;
document.body.appendChild(mm);
const b=hd.querySelector(".burger");
b.addEventListener("click",()=>{const o=mm.classList.toggle("open");b.setAttribute("aria-expanded",o);b.textContent=o?T("nav.close"):T("nav.menu")});mm.addEventListener("click",e=>{if(e.target.closest("a")){mm.classList.remove("open");b.textContent=T("nav.menu")}});}
const ft=document.getElementById("site-footer");
if(ft){ft.innerHTML=`<div class="wrap"><div class="f-grid"><div><a class="logo" href="index.html"><span class="logo-mark">◈</span><span>${S.BRAND_NAME}</span></a><p style="color:var(--mute);margin-top:.8rem;max-width:34ch">${T("foot.tag")}</p><p style="color:var(--mute);margin-top:.6rem">${S.email} · ${S.phone}</p></div><div><h4>${T("foot.explore")}</h4>${S.nav.map(([h,t])=>`<a href="${h}">${T(t)}</a>`).join("")}</div><div><h4>${T("foot.studio")}</h4>${S.legal.map(([h,t])=>`<a href="${h}">${t}</a>`).join("")}${Object.entries(S.social).map(([n,u])=>`<a href="${u}">${n} ↗</a>`).join("")}</div></div><div class="big-foot" aria-hidden="true">${S.BRAND_NAME} — ${S.BRAND_NAME}</div><div class="f-bottom"><span>© ${new Date().getFullYear()} ${S.BRAND_NAME}. ${T("foot.demo")}</span><span>${T("foot.slogan")}</span></div></div>`;}
applyI18n();
//__PART2__
const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine=matchMedia("(hover:hover) and (pointer:fine)").matches;
document.body.insertAdjacentHTML("beforeend",'<div class="grain" aria-hidden="true"></div><div class="progress" id="prog" aria-hidden="true"></div><div id="cursor" aria-hidden="true"><span class="tag" id="ctag"></span><span class="ring"></span><span class="dot"></span></div><div class="toast" id="toast" role="status"></div>');
const prog=document.getElementById("prog"),toast=document.getElementById("toast");
addEventListener("scroll",()=>{const h=document.documentElement;const p=h.scrollTop/(h.scrollHeight-h.clientHeight||1);prog.style.width=(p*100)+"%";hd&&hd.classList.toggle("scrolled",h.scrollTop>30)},{passive:true});
window.toastMsg=m=>{toast.textContent=m;toast.classList.add("show");clearTimeout(toast._t);toast._t=setTimeout(()=>toast.classList.remove("show"),2600)};
// cursor
const cur=document.getElementById("cursor"),tag=document.getElementById("ctag");
if(fine&&!reduced){let x=innerWidth/2,y=innerHeight/2,rx=x,ry=y;
addEventListener("pointermove",e=>{x=e.clientX;y=e.clientY;cur.querySelector(".dot").style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`},{passive:true});
(function loop(){rx+=(x-rx)*.16;ry+=(y-ry)*.16;cur.querySelector(".ring").style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;tag.style.left=rx+"px";tag.style.top=ry+"px";requestAnimationFrame(loop)})();
const bind=()=>{document.querySelectorAll("a,button,summary,.feat,.copt,.hcard").forEach(el=>{if(el._cb)return;el._cb=1;el.addEventListener("pointerenter",()=>{cur.classList.add("is-hover");const l=el.dataset.cursor||el.getAttribute("data-cursor-label");if(l){tag.textContent=l;cur.classList.add("is-label")}else cur.classList.remove("is-label")});el.addEventListener("pointerleave",()=>cur.classList.remove("is-hover","is-label"))})};
bind();new MutationObserver(bind).observe(document.body,{childList:true,subtree:true});
addEventListener("pointerdown",()=>cur.classList.add("is-down"));addEventListener("pointerup",()=>cur.classList.remove("is-down"));
}
// click ripple
if(!reduced)addEventListener("pointerdown",e=>{if(e.target.closest("input,select,textarea"))return;const r=document.createElement("span");r.className="ripple";r.style.left=e.clientX+"px";r.style.top=e.clientY+"px";document.body.appendChild(r);setTimeout(()=>r.remove(),750)},{passive:true});
//__PART3__
// reveals
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.14});
document.querySelectorAll(".rv,.rv-l,.rv-r,.rv-s,.stag").forEach(el=>io.observe(el));
// magnetic buttons
if(fine&&!reduced)document.querySelectorAll(".btn.p").forEach(b=>{b.addEventListener("pointermove",e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.14}px,${(e.clientY-r.top-r.height/2)*.2}px)`});b.addEventListener("pointerleave",()=>b.style.transform="")});
// hero 3D tilt
const stage=document.querySelector("[data-tilt]");
if(stage&&fine&&!reduced){const tilt=stage.querySelector(".tilt"),glow=document.querySelector(".hero-glow");let tx=0,ty=0,cx=0,cy=0;
stage.addEventListener("pointermove",e=>{const r=stage.getBoundingClientRect();tx=((e.clientX-r.left)/r.width-.5)*2;ty=((e.clientY-r.top)/r.height-.5)*2});
stage.addEventListener("pointerleave",()=>{tx=0;ty=0});
(function anim(){cx+=(tx-cx)*.07;cy+=(ty-cy)*.07;if(tilt)tilt.style.transform=`rotateY(${cx*14}deg) rotateX(${-cy*12}deg)`;if(glow)glow.style.transform=`translate(${cx*60}px,${cy*40}px)`;requestAnimationFrame(anim)})();
stage.addEventListener("click",()=>{if(!tilt)return;tilt.style.transition="transform .5s cubic-bezier(.16,1,.3,1)";tilt.style.transform="rotateY(24deg) rotateX(-14deg) scale(1.04)";setTimeout(()=>{tilt.style.transition="transform .12s linear"},550);window.toastMsg&&toastMsg("NFC pulse sent — menu would open on the guest phone")});}
// journey line
const jl=document.getElementById("jline");
if(jl){const fill=jl.querySelector(".fill"),steps=[...jl.querySelectorAll(".jstep")];
const jo=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){steps.forEach((s,i)=>setTimeout(()=>s.classList.add("active"),i*350));fill.style.width="88%";jo.disconnect()}}),{threshold:.3});jo.observe(jl);}
// counters
const cio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const b=e.target,end=parseFloat(b.dataset.count),suf=b.dataset.suffix||"";let s=null;const t0=performance.now(),dur=1400;
function fr(t){const p=Math.min(1,(t-t0)/dur),v=end*(1-Math.pow(1-p,3));b.textContent=(end%1?v.toFixed(1):Math.round(v))+suf;if(p<1)s=requestAnimationFrame(fr)}if(!reduced)s=requestAnimationFrame(fr);else b.textContent=end+suf;cio.unobserve(b)}),{threshold:.5});
document.querySelectorAll("[data-count]").forEach(b=>cio.observe(b));
// feat + light follow + keyboard
document.querySelectorAll(".feat").forEach(f=>{f.addEventListener("pointermove",e=>{const r=f.getBoundingClientRect();f.style.setProperty("--mx",(e.clientX-r.left)+"px");f.style.setProperty("--my",(e.clientY-r.top)+"px")});f.addEventListener("click",()=>f.classList.toggle("open"));f.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();f.classList.toggle("open")}})});
document.querySelectorAll("[data-spot]").forEach(z=>{z.addEventListener("pointermove",e=>{const r=z.getBoundingClientRect();z.style.background=`radial-gradient(420px 260px at ${e.clientX-r.left}px ${e.clientY-r.top}px, rgba(213,255,69,.09), transparent 65%), var(--char)`})});
// card state buttons
document.querySelectorAll("[data-cardstate]").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll("[data-cardstate]").forEach(b=>b.classList.remove("on"));btn.classList.add("on");const c=document.getElementById("miniCard");if(!c)return;c.classList.remove("flip","tilted");const v=btn.dataset.cardstate;if(v==="flip")c.classList.add("flip");if(v==="tilt")c.classList.add("tilted");document.getElementById("cardSpec").textContent=btn.dataset.spec||"";window.toastMsg&&toastMsg(btn.textContent.trim()+" preview")}));
})();
   if(!window.__cursorInit){const s=document.createElement("script");s.src="js/cursor.js";s.defer=true;document.head.appendChild(s)}
