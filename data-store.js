/* SEKA data adapter. Replace LocalSekaStore with an API-backed adapter later. */
(function(g){
 const KEY='seka_db_v4';
 const seed={version:4,users:{},tables:[],memberships:[],hands:[]};
 class LocalSekaStore{
  constructor(){this.db=this.load();this.migrate();}
  load(){try{return JSON.parse(localStorage.getItem(KEY))||structuredClone(seed)}catch(e){return JSON.parse(JSON.stringify(seed))}}
  persist(){localStorage.setItem(KEY,JSON.stringify(this.db));return this.db}
  migrate(){const old=JSON.parse(localStorage.getItem('seka_proto_v3')||'null');if(old&&!this.db.migratedV3){this.db.users={...old.users,...this.db.users};this.db.tables=this.db.tables.length?this.db.tables:(old.tables||[]).map((t,i)=>({...t,id:t.id||'t'+Date.now()+i}));this.db.migratedV3=true;this.persist()}['users','tables','memberships','hands'].forEach(k=>{if(!this.db[k])this.db[k]=k==='users'?{}:[]});this.db.tables.forEach(t=>{t.players=Math.max(2,Math.min(7,+t.players||7));if(!Array.isArray(t.bots))t.bots=[]});this.persist()}
 user(name){return this.db.users[name]||null}
 users(){return Object.entries(this.db.users).map(([name,u])=>({name,...u}))}
 createUser(name,password,telegram=''){if(this.db.users[name])throw Error('Логин занят');this.db.users[name]={password,telegram,balance:0,createdAt:Date.now()};this.persist();return this.user(name)}
 auth(name,password){const u=this.user(name);return !!u&&u.password===password}
 changeBalance(name,delta){const u=this.user(name);if(!u)throw Error('Пользователь не найден');u.balance=Math.max(0,Number(u.balance||0)+Number(delta||0));this.persist();return u.balance}
 tables(){return this.db.tables}
 createTable(data){const requested=document.getElementById('sekaPlayerCount');const players=Math.max(2,Math.min(7,+(requested?.value||data.players||7)));const t={id:'t_'+Date.now().toString(36),name:data.name||'SEKA',bet:+data.bet||10,limit:+data.limit||100,chat:data.chat||'open',players,private:!!data.private,password:data.password||'',bots:[],createdAt:Date.now()};this.db.tables.push(t);this.persist();return t}
 removeTable(id){this.db.tables=this.db.tables.filter(t=>t.id!==id);this.db.memberships=this.db.memberships.filter(m=>m.tableId!==id);this.persist()}
 addBot(id,name){const t=this.db.tables.find(x=>x.id===id);if(!t)throw Error('Стол не найден');if(t.bots.length>=t.players-1)throw Error('Нет свободных мест');t.bots.push({id:'b_'+Date.now().toString(36),name:name||('Bot '+(t.bots.length+1)),balance:t.limit});this.persist();return t}
 removeBot(id,botId){const t=this.db.tables.find(x=>x.id===id);if(t)t.bots=t.bots.filter(b=>b.id!==botId);this.persist()}
 join(id,user){const t=this.db.tables.find(x=>x.id===id);if(!t)throw Error('Стол не найден');const occupied=(t.bots||[]).length+this.db.memberships.filter(m=>m.tableId===id&&m.user!==user).length;if(occupied>=t.players)throw Error('Нет свободных мест');this.db.memberships=this.db.memberships.filter(m=>m.user!==user);this.db.memberships.push({tableId:id,user,joinedAt:Date.now()});this.persist()}
 leave(user){this.db.memberships=this.db.memberships.filter(m=>m.user!==user);this.persist()}
 history(id){return this.db.hands.filter(h=>h.tableId===id).slice(-50).reverse()}
 addHand(id,entry){this.db.hands.push({id:'h_'+Date.now().toString(36),tableId:id,time:Date.now(),...entry});this.persist()}
 }
 const store=new LocalSekaStore();g.SekaStore=store;

 /* Compatibility UI layer: current single-file UI originally rendered seven seats.
    This keeps that UI intact while allowing each table to choose 2–7 seats. */
 function installPlayerSelector(){
  const old=document.getElementById('tp'); if(!old||document.getElementById('sekaPlayerCount'))return;
  old.value='7';
  const wrap=document.createElement('div');wrap.style.marginTop='10px';
  const label=document.createElement('label');label.id='playerCountLabel';label.textContent=document.documentElement.lang==='ru'?'ИГРОКИ':'JUCĂTORI';
  const sel=document.createElement('select');sel.id='sekaPlayerCount';
  for(let n=2;n<=7;n++){const o=document.createElement('option');o.value=String(n);o.textContent=String(n);if(n===7)o.selected=true;sel.appendChild(o)}
  wrap.append(label,sel);
  const fixed=old.nextElementSibling;old.parentNode.insertBefore(wrap,fixed||old.nextSibling);
  if(fixed&&fixed.classList.contains('meta'))fixed.textContent=document.documentElement.lang==='ru'?'Количество мест за столом: от 2 до 7.':'Numărul de locuri la masă: de la 2 la 7.';
 }
 function tableByName(name){return store.tables().find(t=>String(t.name).trim()===String(name||'').trim())}
 function refreshAdaptiveSeats(){
  installPlayerSelector();
  document.querySelectorAll('.table').forEach(row=>{
   const join=row.querySelector('[data-join]');const t=join&&store.tables().find(x=>x.id===join.dataset.join);if(!t)return;
   const occ=row.querySelector('.occ');if(occ){const shown=String(occ.textContent).split('/')[0];occ.textContent=shown+'/'+t.players}
  });
  const game=document.getElementById('game');
  if(game&&!game.classList.contains('hidden')){
   const t=tableByName(document.getElementById('gname')?.textContent);if(t){
    const seats=[...document.querySelectorAll('#seats .seat')];
    seats.forEach((seat,i)=>{if(i>=t.players){seat.style.display='none';return}seat.style.display='';const q=2*Math.PI*i/t.players+Math.PI/2;seat.style.left=(50+42*Math.cos(q))+'%';seat.style.top=(48+39*Math.sin(q))+'%'});
    const status=document.getElementById('status');if(status)status.textContent=status.textContent.replace(/\/7\.?$/, '/'+t.players+'.').replace(/\/7$/, '/'+t.players);
   }
  }
  const admin=document.getElementById('admin');if(admin&&!admin.classList.contains('hidden')){
   const lines=[...document.querySelectorAll('#adminTables .line')];store.tables().forEach((t,i)=>{const s=lines[i]?.querySelector('span');if(s)s.textContent=`${t.name} · ${t.bet}/${t.limit} · ${t.players}`});
  }
 }
 let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;refreshAdaptiveSeats()})};
 new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
})(window);
