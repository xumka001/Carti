/* SEKA SVARA v2 — prototype rules layer. Local UI/state now; backend events later. */
(function(){
 const $=id=>document.getElementById(id);
 const session=()=>{try{return JSON.parse(localStorage.getItem('seka_session_v2')||'null')}catch(e){return null}};
 const table=()=>{const n=$('gname')?.textContent;return window.SekaStore?.tables().find(t=>String(t.name)===String(n))};
 const state=t=>window.SekaStore?.gameState(t.id);
 const save=(t,s)=>window.SekaStore?.saveGameState(t.id,s);
 const amount=s=>Math.max(1,Number(s.currentEffective||s.currentNominal||s.base||10));
 const safe=s=>String(s||'').replace(/[<>]/g,'');
 function info(x){const e=$('sekaActionInfo');if(e)e.textContent=x}
 function close(){ $('sekaSvaraV2')?.remove() }
 function modal(title,text,buttons){close();const m=document.createElement('div');m.id='sekaSvaraV2';m.className='sekaMiniModal';m.innerHTML='<div class="sekaMiniBox"><h3>'+title+'</h3><p>'+text+'</p><div class="sekaMiniActions" id="sekaSvaraActions"></div></div>';document.body.appendChild(m);const a=$('sekaSvaraActions');buttons.forEach(b=>{const x=document.createElement('button');x.className='btn'+(b.gold?' gold':'');x.textContent=b.text;x.onclick=b.go;a.appendChild(x)})}
 function pay(t,s,n,reason){n=Math.max(0,Number(n)||0);const ss=session();if(ss&&!ss.admin&&window.SekaStore?.user(ss.user)){const u=window.SekaStore.user(ss.user);if(Number(u.balance||0)<n){info('Jetoane insuficiente pentru '+n+'.');return false}window.SekaStore.changeBalance(ss.user,-n)}s.pot=Number(s.pot||Number($('pot2')?.textContent||0))+n;s.log=s.log||[];s.log.push({type:'pay',amount:n,reason,time:Date.now()});save(t,s);if($('pot2'))$('pot2').textContent=s.pot;if($('pot'))$('pot').textContent=s.pot;return true}
 function target(t){return (t.bots||[]).find(b=>!state(t)?.folded?.[b.id])||(t.bots||[])[0]||null}
 function markFold(s,key){s.folded=s.folded||{};s.folded[key]=true}
 function resultPicker(t,s,p,withSvara){modal('Rezultat deschidere','Prototype local: alege rezultatul comparației cu <b>'+safe(p.name||'Bot')+'</b>. Motorul de cărți va face asta automat când conectăm mâinile reale.',[
  {text:'EU AM MAI MARE',gold:true,go:()=>{markFold(s,p.id||p.name);s.log.push({type:'openResult',result:'challenger-wins',target:p.name,svara:withSvara,time:Date.now()});if(withSvara)s.svara={...(s.svara||{}),status:'resolved-no-svara',result:'challenger-wins'};save(t,s);close();badge('');info(p.name+' cade în PAS. Tu continui mâna.')}},
  {text:'EU AM MAI MIC',go:()=>{markFold(s,'self');s.log.push({type:'openResult',result:'target-wins',target:p.name,svara:withSvara,time:Date.now()});if(withSvara)s.svara={...(s.svara||{}),status:'armed',carrier:p.name,result:'target-wins'};save(t,s);close();badge(withSvara?'SVARA · '+p.name:'');info('Tu cazi în PAS. '+p.name+' continuă.'+(withSvara?' Dacă el câștigă mâna, banca merge în SVARA.':''))}},
  {text:'EGAL',go:()=>{markFold(s,'self');s.log.push({type:'openResult',result:'equal',target:p.name,svara:withSvara,time:Date.now()});if(withSvara)s.svara={...(s.svara||{}),status:'armed',carrier:p.name,result:'equal'};save(t,s);close();badge(withSvara?'SVARA · '+p.name:'');info('Egalitate. Tu cazi în PAS, '+p.name+' continuă.'+(withSvara?' Dacă el câștigă mâna, banca rămâne pentru SVARA.':''))}}
 ])}
 function badge(text){let b=$('svaraBadge');if(!text){b?.remove();return}if(!b){b=document.createElement('div');b.id='svaraBadge';b.className='svaraBadge';document.querySelector('#game .gameTable')?.appendChild(b)}b.textContent=text}
 function openNormal(t,s,p){const n=amount(s);if(!pay(t,s,n,'open-back-normal'))return;close();resultPicker(t,s,p,false)}
 function refused(t,s,p){modal('SVARA refuzată','<b>'+safe(p.name||'Jucător')+'</b> nu vrea să fie deschis pe SVARA. Poți să-l deschizi normal pentru <b>'+amount(s)+'</b> sau să continui jocul cu aceeași miză.',[
  {text:'DESCHIDE NORMAL · '+amount(s),gold:true,go:()=>openNormal(t,s,p)},
  {text:'CONTINUĂ · '+amount(s),go:()=>{close();info('Continui jocul. Miza curentă: '+amount(s)+'.')}}
 ])}
 function acceptBack(t,s,p){const n=amount(s);if(!pay(t,s,n,'open-back-svara'))return;s.svara={type:'open-back',challenger:'self',target:p.name,status:'accepted',stake:n,pot:s.pot,time:Date.now()};save(t,s);resultPicker(t,s,p,true)}
 function proposeBack(){const t=table();if(!t)return;const s=state(t),p=target(t);if(!p)return info('Nu există jucător activ în spate.');const n=amount(s);modal('Deschide în spate pe SVARA','Propui lui <b>'+safe(p.name||'Bot')+'</b> deschiderea în spate pe SVARA pentru <b>'+n+'</b>. Dacă acceptă, '+n+' intră automat în bancă și cărțile se compară. Dacă refuză, alegi deschidere normală sau continui.',[
 {text:'PROPUNE SVARA · '+n,gold:true,go:()=>botResponse(t,s,p)},
 {text:'DESCHIDE NORMAL · '+n,go:()=>openNormal(t,s,p)},
 {text:'ANULEAZĂ',go:close}
 ])}
 function botResponse(t,s,p){modal('Răspuns '+safe(p.name||'Bot'),'În multiplayer aceste butoane vor apărea la jucătorul din spate. Acum alegem răspunsul botului pentru test.',[
 {text:'DA — ACCEPTĂ SVARA',gold:true,go:()=>acceptBack(t,s,p)},
 {text:'NU — REFUZĂ',go:()=>{s.svara={type:'open-back',target:p.name,status:'declined',stake:amount(s),time:Date.now()};save(t,s);refused(t,s,p)}}
 ])}
 function plainSvara(){const t=table();if(!t)return;const s=state(t);const active=[{id:'self'},...(t.bots||[]).filter(b=>!s.folded?.[b.id])].filter(x=>!s.folded?.[x.id]);if(active.length!==2)return info('SVARA simplă poate fi propusă când au rămas exact 2 jucători activi.');const p=active.find(x=>x.id!=='self')||target(t);if(!p)return;const n=amount(s);modal('Propune SVARA','Ați rămas doi. Propui lui <b>'+safe(p.name||'Bot')+'</b> SVARA la miza curentă <b>'+n+'</b>. Aceasta este SVARA simplă, fără deschidere în spate.',[
 {text:'PROPUNE SVARA',gold:true,go:()=>modal('Răspuns '+safe(p.name||'Bot'),'În multiplayer răspunde adversarul. Pentru test alege răspunsul botului.',[
   {text:'DA — SVARA',gold:true,go:()=>{s.svara={type:'heads-up',challenger:'self',target:p.name,status:'accepted',stake:n,pot:Number(s.pot||$('pot2')?.textContent||0),time:Date.now()};save(t,s);close();badge('SVARA · ACCEPTATĂ');info(p.name+' a acceptat SVARA.')}},
   {text:'NU',go:()=>{s.svara={type:'heads-up',target:p.name,status:'declined',stake:n,time:Date.now()};save(t,s);close();info(p.name+' a refuzat SVARA. Jocul continuă.') }}
 ])},
 {text:'ANULEAZĂ',go:close}
 ])}
 function install(){const tools=document.querySelector('#game .gameTools');if(!tools||$('svaraSimple'))return;const old=$('openBack');if(old){old.textContent='DESCHIDE ÎN SPATE · SVARA';old.onclick=e=>{e.preventDefault();e.stopImmediatePropagation();proposeBack()};}
 const b=document.createElement('button');b.id='svaraSimple';b.className='btn';b.textContent='PROPUNE SVARA';b.style.cssText='font-size:10px;min-height:38px;border-color:#c2a45b55;color:#ead89d;background:#151109';b.onclick=plainSvara;tools.appendChild(b)}
 let q=false;const tick=()=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;install()})};new MutationObserver(tick).observe(document.documentElement,{childList:true,subtree:true});document.readyState==='loading'?document.addEventListener('DOMContentLoaded',tick):tick();
})();