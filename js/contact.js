// INTEGRATION POINT: no backend is connected. To receive requests, POST `data` to a
// form service (e.g. Formspree) or your own endpoint inside send() below.
(()=>{const $=id=>document.getElementById(id),f=$("f");
const q=new URLSearchParams(location.search);if(q.get("type"))$("req").value=q.get("type");if(q.get("package"))$("msg").value="Package: "+q.get("package");
const rules={name:v=>v.trim().length<2&&"Enter your full name.",biz:v=>!v.trim()&&"Enter your business name.",email:v=>!/^\S+@\S+\.\S+$/.test(v)&&"Enter a valid email, like name@example.com.",qty:v=>(v&&+v<1)&&"Enter a number of 1 or more."};
async function send(data){console.info("Demo submission (not sent):",data);return true}
f.addEventListener("submit",async e=>{e.preventDefault();let bad=null;
for(const k in rules){const m=rules[k]($(k).value);$("e-"+k).textContent=m||"";if(m&&!bad)bad=$(k)}
if(bad)return bad.focus();
const data=Object.fromEntries([...f.elements].filter(x=>x.id).map(x=>[x.id,x.value]));await send(data);
f.hidden=true;const o=$("ok");o.hidden=false;o.textContent="Preview only: your form is valid, but this site is not yet connected to an inbox, so nothing was sent. Email us directly at "+window.SITE.email+".";o.tabIndex=-1;o.focus()});
})();
