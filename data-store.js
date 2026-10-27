/* SEKA data adapter. Replace LocalSekaStore with an API-backed adapter later. */
(function(g){
 const KEY='seka_db_v4';
 const seed={version:4,users:{},tables:[],memberships:[],hands:[]};
 class LocalSekaStore{
  constructor(){this.db=this.load();this.migrate();}
  load(){try{return JSON.parse(localStorage.getItem(KEY))||structuredClone(seed)}catch(e){return JSON.parse(JSON.stringify(seed))}}
  persist(){localStorage.setItem(KEY,JSON.stringify(this.db));return this.db}
  migrate(){const old=JSON.parse(localStorage.getItem('seka_proto_v3')||'null');if(old&&!this.db.migratedV3){this.db.users={...old.users,...this.db.users};this.db.tables=this.db.tables.length?this.db.tables:(old.tables||[]).map((t,i)=>({...t,id:t.id||'t'+Date.now()+i}));this.db.migratedV3=true;this.persist()}['users','tables','memberships','hands'].forEach(k=>{if(!this.db[k])this.db[k]=k==='users'?{}:[]})}
 user(name){return this.db.users[name]||null}
 users(){return Object.entries(this.db.users).map(([name,u])=>({name,...u}))}
 createUser(name,password,telegram=''){if(this.db.users[name])throw Error('Логин занят');this.db.users[name]={password,telegram,balance:0,createdAt:Date.now()};this.persist();return this.user(name)}
 auth(name,password){const u=this.user(name);return !!u&&u.password===password}
 changeBalance(name,delta){const u=this.user(name);if(!u)throw Error('Пользователь не найден');u.balance=Math.max(0,Number(u.balance||0)+Number(delta||0));this.persist();return u.balance}
 tables(){return this.db.tables}
 createTable(data){const t={id:'t_'+Date.now().toString(36),name:data.name||'SEKA',bet:+data.bet||10,limit:+data.limit||100,chat:data.chat||'open',players:+data.players||7,private:!!data.private,password:data.password||'',bots:[],createdAt:Date.now()};this.db.tables.push(t);this.persist();return t}
 removeTable(id){this.db.tables=this.db.tables.filter(t=>t.id!==id);this.db.memberships=this.db.memberships.filter(m=>m.tableId!==id);this.persist()}
 addBot(id,name){const t=this.db.tables.find(x=>x.id===id);if(!t)throw Error('Стол не найден');if(t.bots.length>=t.players-1)throw Error('Нет свободных мест');t.bots.push({id:'b_'+Date.now().toString(36),name:name||('Bot '+(t.bots.length+1)),balance:t.limit});this.persist();return t}
 removeBot(id,botId){const t=this.db.tables.find(x=>x.id===id);if(t)t.bots=t.bots.filter(b=>b.id!==botId);this.persist()}
 join(id,user){this.db.memberships=this.db.memberships.filter(m=>m.user!==user);this.db.memberships.push({tableId:id,user,joinedAt:Date.now()});this.persist()}
 leave(user){this.db.memberships=this.db.memberships.filter(m=>m.user!==user);this.persist()}
 history(id){return this.db.hands.filter(h=>h.tableId===id).slice(-50).reverse()}
 addHand(id,entry){this.db.hands.push({id:'h_'+Date.now().toString(36),tableId:id,time:Date.now(),...entry});this.persist()}
 }
 g.SekaStore=new LocalSekaStore();
})(window);
