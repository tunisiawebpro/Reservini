(()=>{const P=window.PRICING,g=document.getElementById("pk"),t=document.getElementById("cmp");
if(!P||!g)return;
g.innerHTML=P.packages.map(p=>`<article class="pk${p.featured?" feat":""}" data-pk="${p.id}" tabindex="0"><span class="ed-label">${p.featured?"Most chosen":"Package"}</span><h3>${p.name}</h3><p style="color:var(--mute)">${p.desc}</p><div class="price">${p.price}</div><ul>${Object.entries(p.features).slice(0,3).map(([k,v])=>`<li>✓ ${k}: ${v}</li>`).join("")}</ul><a class="btn ${p.featured?"p":""}" href="contact.html?type=quote&package=${p.id}">Ask for a ${p.name} quote →</a></article>`).join("");
const rows=Object.keys(P.packages[0].features);
if(t)t.innerHTML=`<thead><tr><th>Feature</th>${P.packages.map(p=>`<th>${p.name}</th>`).join("")}</tr></thead><tbody>`+rows.map(r=>`<tr><td>${r}</td>${P.packages.map(p=>`<td>${p.features[r]}</td>`).join("")}</tr>`).join("")+"</tbody>";
const ad=document.getElementById("ad");if(ad)ad.innerHTML=P.addons.map(a=>`<li>${a}</li>`).join("");
g.querySelectorAll(".pk").forEach(k=>{k.addEventListener("click",e=>{if(e.target.closest("a"))return;g.querySelectorAll(".pk").forEach(x=>x.classList.remove("feat"));k.classList.add("feat")})});
})();