/* SEKA UI v4 — complete RO/RU pass + compact mobile table */
(function(){
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 let lang=localStorage.getItem('seka_lang')||'ro';
 const D={
  ro:{all:'Toate mesele',free:'Locuri libere',enter:'INTRĂ',entry:'Intrare',chatOpen:'Chat deschis',chatClosed:'Chat închis',tables:'Mese',news:'Știri',settings:'Setări',chips:'FIȘE',deposit:'DEPOZIT',stake:'Miză',history:'Istoric',fold:'PAS',bet:'PARIU',back:'DESCHIDE ÎN SPATE · SVARA',reveal:'DESCHIDE',orb:'ÎN ORB',telegram:'TELEGRAM',logout:'Ieșire',setTitle:'Setări',newsTitle:'Noutăți',welcome:'Bine ai venit la SEKA',sub:'Intră în cont sau creează un profil nou.',loginTab:'Intră',regTab:'Înregistrare',loginBtn:'INTRĂ',register:'CREEAZĂ CONT',password:'PAROLĂ',repeat:'REPETĂ PAROLA',wish:'Jucați frumos, riscați cu cap. Mult noroc la masă! 🍀'},
  ru:{all:'Все столы',free:'Свободные места',enter:'ВОЙТИ',entry:'Вход',chatOpen:'Чат открыт',chatClosed:'Чат закрыт',tables:'Столы',news:'Новости',settings:'Настройки',chips:'ФИШКИ',deposit:'ПОПОЛНИТЬ',stake:'Ставка',history:'История',fold:'ПАС',bet:'СТАВКА',back:'ОТКРЫТЬ НАЗАД · SVARA',reveal:'ВСКРЫТЬ',orb:'В ТЁМНУЮ',telegram:'TELEGRAM',logout:'Выйти',setTitle:'Настройки',newsTitle:'Новости',welcome:'Добро пожаловать в SEKA',sub:'Войди в аккаунт или создай новый профиль.',loginTab:'Вход',regTab:'Регистрация',loginBtn:'ВОЙТИ',register:'СОЗДАТЬ АККАУНТ',password:'ПАРОЛЬ',repeat:'ПОВТОРИТЕ ПАРОЛЬ',wish:'Играйте красиво, рискуйте с умом. Удачи за столом! 🍀'}
 };
 const t=()=>D[lang];
 function txt(sel,v){const e=$(sel);if(e)e.textContent=v}
 function tableRows(){ $$('#tables .table').forEach(row=>{
   const b=row.querySelector('button'); if(b)b.textContent=t().enter;
   const m=row.querySelector('.meta'); if(m){let s=m.textContent;s=s.replace(/Intrare|Вход/g,t().entry).replace(/Chat closed|Chat închis|Чат закрыт/g,t().chatClosed).replace(/Chat open|Chat deschis|Чат открыт/g,t().chatOpen);m.textContent=s}
  })}
 function apply(){document.documentElement.lang=lang;
  txt('.authHero h1',t().welcome);txt('.authHero p',t().sub);txt('#lt',t().loginTab);txt('#rt',t().regTab);txt('#login',t().loginBtn);txt('#register',t().register);
  $$('#auth label').forEach(l=>{const s=l.textContent.trim();if(/PAROLĂ|ПАРОЛЬ/.test(s))l.textContent=t().password;if(/REPETĂ PAROLA|ПОВТОРИТЕ ПАРОЛЬ/.test(s))l.textContent=t().repeat});
  txt('#all',t().all);txt('#free',t().free);txt('#deposit','＋ '+t().deposit);const bs=$('#head .balance small');if(bs)bs.textContent=t().chips;
  const nav=$$('.nav');if(nav[0])nav[0].innerHTML='<span>▰</span>'+t().tables;if(nav[1])nav[1].innerHTML='<span>▤</span>'+t().news;if(nav[2])nav[2].innerHTML='<span>⚙</span>'+t().settings;
  txt('#settings .sectionTitle',t().setTitle);txt('#logout',t().logout);txt('#news .sectionTitle',t().newsTitle);
  txt('#history','◷ '+t().history);txt('#fold',t().fold);txt('#bet',t().bet);txt('#openBack',t().back);txt('#headsUpReveal',t().reveal);
  const gs=$('#game .gameTitle small');if(gs){const n=(gs.textContent.match(/\d+/)||[])[0]||'';gs.textContent=t().stake+(n?' '+n:'')}
  const wish=$('#tableWish');if(wish)wish.textContent=t().wish;
  const d=$('#darkPlay');if(d){const nums=d.textContent.match(/\d+/g)||[];d.textContent=t().orb+(nums.length?' '+nums.join(' → '):'')}
  tableRows();
  $$('.lang button').forEach((b,i)=>b.classList.toggle('on',(lang==='ro'&&i===0)||(lang==='ru'&&i===1)));
 }
 function bind(){ $$('.lang button').forEach((b,i)=>{if(b.dataset.v4)return;b.dataset.v4='1';b.addEventListener('click',()=>{lang=i?'ru':'ro';localStorage.setItem('seka_lang',lang);apply()})}) }
 const st=document.createElement('style');st.id='sekaV4Style';st.textContent=`
 #game .gameBar{height:60px!important;padding:6px 10px!important}#game .gameBar .btn,#game .gameBar .icon{width:42px!important;height:42px!important;border-radius:12px!important}#game .gameTable{height:calc(100dvh - 196px)!important;margin-top:5px!important}#game .cards{bottom:17px!important}#game .pc{width:36px!important;height:53px!important;font-size:17px!important}#game .pc .suit{font-size:20px!important}.tableWish{top:54%!important;font-size:8.5px!important}
 #game .gameTools{margin:5px 8px 0!important;padding:5px!important;gap:5px!important;grid-template-columns:1fr 1fr!important;min-height:104px!important;border-radius:16px!important}#game .gameTools .btn{min-height:40px!important;padding:8px 7px!important;font-size:12px!important}#game #history{min-height:32px!important;padding:5px!important}#game #darkPlay,#game #openBack,#game #headsUpReveal,#game #svaraSimple{font-size:9px!important;line-height:1.15!important}.darkStatus{padding:5px 8px!important;font-size:9px!important;min-height:28px!important}
 #game .gameBar .balance{font-size:0!important;display:flex!important;align-items:center!important;justify-content:center!important;min-width:94px!important}#game .gameBar .balance:before{content:'TELEGRAM';font-size:10px;font-weight:850;letter-spacing:.05em;color:#8ed8ff;background:#07131a;border:1px solid #287fae;padding:9px 12px;border-radius:12px}#game .gameBar .balance b,#game .gameBar .balance>span{display:none!important}
 @media(max-width:430px){#game .gameTable{height:calc(100dvh - 192px)!important;width:calc(100% - 12px)!important;margin-left:6px!important;margin-right:6px!important}#game .seat{width:66px!important}.avatar{width:38px!important;height:38px!important}.seatName{font-size:8px!important}#game .gameTools .btn{min-height:38px!important}.header{gap:5px!important}.header .logo{font-size:17px!important}.deposit{padding-left:9px!important;padding-right:9px!important}}
 `;document.head.appendChild(st);
 let busy=false;function run(){if(busy)return;busy=true;requestAnimationFrame(()=>{busy=false;bind();apply()})}new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});document.readyState==='loading'?document.addEventListener('DOMContentLoaded',run):run();
})();