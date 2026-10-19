(()=>{const D={cafe:{name:"Café Demo Corniche",sub:"Espresso bar · fictional demo",cover:"Café Lumière",tables:["Table 04","Table 05","Table 08"],cats:{Coffee:[["Espresso","Short, intense shot",3.5,"#D5FF45","E"],["Cappuccino","Velvet milk foam",5,"#e9d8a6","C"],["Iced Latte","Double shot over ice",6,"#9bd1e5","I"]],Pastry:[["Croissant","French butter, baked today",4,"#f2b36b","Cr"],["Pain au Chocolat","Dark chocolate batons",4.5,"#d9915a","P"]],Fresh:[["Orange Juice","Pressed to order",5.5,"#f4a259","O"]]}},
resto:{name:"Restaurant Demo Medina",sub:"Modern Tunisian · fictional demo",cover:"Dar Zellij",tables:["Table 08","Table 12","Terrasse 02"],cats:{Starters:[["Brik","Crisp pastry, egg & tuna",9,"#e9d8a6","B"],["Salade Mechouia","Smoked peppers, tuna",8,"#D5FF45","S"]],Mains:[["Grilled Sea Bream","Lemon, herbs, olive oil",32,"#9bd1e5","G"],["Lamb Couscous","Seven vegetables, harissa",28,"#f2b36b","L"]],Dessert:[["Makroudh","Dates, semolina, honey",7,"#d9915a","M"]]}}};
const $=id=>document.getElementById(id),pm=$("pm"),staff=$("staff"),hint=$("hint");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const money=v=>v.toFixed(2)+" DT";
let sc="cafe",cat,cart,view,n=24,order,table,timer1,timer2,hist=[];
const all=()=>Object.values(D[sc].cats).flat();
function reset(s){sc=s||sc;cat=Object.keys(D[sc].cats)[0];cart={};view="menu";order=null;table=D[sc].tables[1];clearTimeout(timer1);clearTimeout(timer2);if(staff){staff.hidden=true;staff.innerHTML=""}if(hint)hint.hidden=false;draw()}
const count=()=>Object.values(cart).reduce((a,b)=>a+b,0);
const total=()=>all().reduce((t,p)=>t+(cart[p[0]]||0)*p[2],0);
const now=()=>{const d=new Date();return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")};
function statusBar(){return `<div class="pm-status"><b>${now()}</b><span>5G ▮▮▮▯ 87%</span></div><div class="sys-notif" id="sysNotif" role="alert"><div class="ni">◈</div><div><b id="snTitle">Commande confirmée</b><small id="snBody">Votre commande a été reçue.</small></div></div>`}
function head(back){return `<div class="pm-h"><b>${back?`<button class="cartbtn" data-a="back">← Back</button>`:esc(D[sc].name)}</b>${back?"":`<button class="cartbtn" data-a="cart" aria-label="Open cart">Cart (${count()})</button>`}</div>`}
//__D2__
function draw(){if(!pm)return;let h=statusBar();
if(view==="menu"){h+=head()+`<div class="pm-b"><div class="pm-cover"><b>${esc(D[sc].cover)}</b><span>${esc(D[sc].sub)} · ${esc(table)} · DEMO</span></div><div class="tabs">${Object.keys(D[sc].cats).map(c=>`<button data-c="${c}" class="${c===cat?"on":""}">${c}</button>`).join("")}</div>`+D[sc].cats[cat].map(p=>`<div class="item"><div class="ph" style="background:${p[3]}">${p[4]}</div><div><b>${p[0]}</b><small>${p[1]}</small>${money(p[2])}</div><button class="cartbtn" data-add="${esc(p[0])}">Add</button></div>`).join("")+`</div>`}
else if(view==="cart"){const L=all().filter(p=>cart[p[0]]);h+=head(1)+`<div class="pm-b"><h3>Your cart · ${esc(table)}</h3><p style="color:var(--mute);font-size:.85rem;margin:.3rem 0">Demo only — nothing real is sent.</p>`+(L.length?L.map(p=>`<div class="item"><div><b>${p[0]}</b><small>${money(p[2])} each</small></div><div class="qty"><button data-dec="${esc(p[0])}" aria-label="Remove one">−</button>${cart[p[0]]}<button data-add="${esc(p[0])}" aria-label="Add one">+</button></div></div>`).join("")+`<div class="tot"><span>Subtotal</span><span>${money(total())}</span></div><div class="tot"><span>Total</span><span>${money(total())}</span></div><button class="btn p" style="width:100%;justify-content:center" data-a="place">Place Demo Order · ${money(total())}</button>`:`<p style="color:var(--mute);margin-top:1rem">Your cart is empty. Go back and add something from the menu.</p>`)+`<p class="err" id="e" role="alert"></p></div>`}
else if(view==="placing"){h+=head(0).replace(/<button.*button>/,"")+`<div class="pm-b" style="display:grid;place-items:center;text-align:center;min-height:300px"><div><div class="badge">Sending…</div><h3 style="margin-top:1rem">Contacting the kitchen</h3><p style="color:var(--mute)">Simulated latency, about 1.4s.</p></div></div>`}
else{const stColor=order.status.includes("Ready")?"#D5FF45":"#D5FF45";h+=head(0).replace(/<button.*button>/,"")+`<div class="pm-b"><span class="badge">${esc(order.status)}</span><h3 style="margin:1rem 0 .2rem">${order.ref} · ${order.table}</h3><p style="color:var(--mute);font-size:.85rem">${hist.length} demo order(s) this session · Demo restaurant, fictional data.</p>`+order.items.map(i=>`<div class="item"><div>${i[1]} × ${i[0]}</div><b>${money(i[2])}</b></div>`).join("")+`<div class="tot"><span>Total paid (simulated)</span><span>${money(order.t)}</span></div><div class="note" style="font-size:.82rem">No real order, payment or restaurant notification was sent.</div><div style="display:flex;gap:.6rem;flex-wrap:wrap"><button class="btn sm" data-a="restart">Restart demo</button><button class="btn sm p" data-a="track">Track order</button></div><div id="trackBox" hidden style="margin-top:1rem">${trackHtml()}</div></div>`}
pm.innerHTML=h}
function trackHtml(){const steps=["Received","Accepted","Preparing","Ready"];const ix=steps.findIndex(s=>order.status.includes(s));return `<div style="display:grid;gap:.4rem">${steps.map((s,i)=>`<div style="display:flex;gap:.6rem;align-items:center;font-size:.85rem;color:${i<=(ix<0?0:ix)?"var(--ivory)":"var(--mute)"}"><span style="width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:${i<=(ix<0?0:ix)?"var(--lime)":"transparent"};border:1px solid var(--line2);color:${i<=(ix<0?0:ix)?"#111":"var(--mute)"};font-size:.7rem">${i<(ix<0?0:ix)?"✓":i+1}</span>${s}</div>`).join("")}</div>`}
function notify(title,body){const n=$("sysNotif");if(!n)return;$("snTitle").textContent=title;$("snBody").textContent=body;requestAnimationFrame(()=>n.classList.add("show"));clearTimeout(notify._t);notify._t=setTimeout(()=>n&&n.classList.remove("show"),4200);n.onclick=()=>n.classList.remove("show")}
//__D3__
function staffView(){if(!staff||!order)return;staff.hidden=false;if(hint)hint.hidden=true;
staff.innerHTML=`<p class="ed-label"><span class="dot-live"></span> Staff preview · simulated · ${esc(table)}</p><h3 style="margin:.5rem 0">${order.ref} · ${order.table}</h3><p><span class="badge">${esc(order.status)}</span></p><ul>${order.items.map(i=>`<li>${i[1]} × ${esc(i[0])}</li>`).join("")}</ul><div class="tot"><span>Total</span><span>${money(order.t)}</span></div><div class="staff-actions"><button class="btn sm p" data-s="accept">Accepter la commande</button><button class="btn sm" data-s="prep">Marquer en préparation</button><button class="btn sm" data-s="ready">Prête à servir</button></div><p class="note" style="font-size:.82rem">Simulated interface — staff do not receive real notifications.</p><p style="color:var(--mute);font-size:.85rem">History: ${hist.map(h=>h.ref).join(", ")||"—"}</p>`}
function setStatus(s,msg){order.status=s;draw();staffView();notify("Commande "+s.toLowerCase(),`${order.ref} · ${order.table} — ${msg}`);if(window.toastMsg)toastMsg("Staff: "+s)}
if(pm)pm.addEventListener("click",e=>{const t=e.target.closest("button");if(!t)return;const d=t.dataset;
if(d.c){cat=d.c}
else if(d.add){cart[d.add]=(cart[d.add]||0)+1;if(window.toastMsg)toastMsg(d.add+" added")}
else if(d.dec){cart[d.dec]--;if(cart[d.dec]<=0)delete cart[d.dec]}
else if(d.a==="cart")view="cart";
else if(d.a==="back")view="menu";
else if(d.a==="restart")return reset();
else if(d.a==="track"){const b=$("trackBox");if(b)b.hidden=!b.hidden;return}
else if(d.a==="place"){if(!count()){$("e").textContent="Add at least one item before placing the demo order.";return}
view="placing";draw();
timer1=setTimeout(()=>{order={ref:"DEMO-"+String(n++).padStart(3,"0"),table:table,t:total(),status:"Received",items:all().filter(p=>cart[p[0]]).map(p=>[p[0],cart[p[0]],cart[p[0]]*p[2]])};hist.push(order);view="done";draw();staffView();notify("Commande confirmée",`Votre commande ${order.ref} a été reçue. ${order.table} · Préparation en cours`);if(window.toastMsg)toastMsg("Order "+order.ref+" sent to staff (simulated)")},1400);return}
draw()});
if(staff)staff.addEventListener("click",e=>{const b=e.target.closest("[data-s]");if(!b||!order)return;const a=b.dataset.s;
if(a==="accept")setStatus("Accepted","Le restaurant a accepté votre commande.");
else if(a==="prep")setStatus("Preparing","Vos plats sont en préparation.");
else if(a==="ready")setStatus("Ready","Votre commande est prête à être servie.")});
const scn=$("scn");if(scn)scn.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;scn.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));reset(b.dataset.s)});
const tsel=$("tableSel"),rst=$("resetDemo");
if(tsel){tsel.addEventListener("change",()=>{table=tsel.value;cart={};view="menu";draw();if(window.toastMsg)toastMsg("Seated at "+table+" (demo)")})}
if(rst)rst.addEventListener("click",()=>{reset();if(tsel){tsel.innerHTML=D[sc].tables.map(t=>`<option ${t===table?"selected":""}>${t}</option>`).join("")}if(window.toastMsg)toastMsg("Demo reset")});
function syncTables(){if(tsel)tsel.innerHTML=D[sc].tables.map(t=>`<option ${t===table?"selected":""}>${t}</option>`).join("")}
const _reset=reset;reset=function(s){_reset(s);syncTables()};
reset();syncTables()})();

