/* Video Poker - every 5-card hand (2,598,960) through every game's evaluator, checked against the
   published counts; plus hold/draw and pay checks. Engine straight from index.html (block 1). */
const fs=require('fs');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
eval([...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1]);
const V=globalThis.VP; let bad=[]; const t=(c,m)=>{ if(!c) bad.push(m); };
const d=[]; for(let s=0;s<4;s++) for(let r=2;r<=14;r++) d.push({s,r});
const out={}; for(const g of V.ORDER) out[g]={};
for(let a=0;a<48;a++)for(let b=a+1;b<49;b++)for(let c=b+1;c<50;c++)for(let e=c+1;e<51;e++)for(let f=e+1;f<52;f++){ const h=[d[a],d[b],d[c],d[e],d[f]];
  for(const g of V.ORDER){ const k=V.evaluate(g,h)||'-'; out[g][k]=(out[g][k]||0)+1; } }
const want={
  job:{royal:4,sf:36,'4k':624,fh:3744,fl:5108,st:10200,'3k':54912,'2p':123552,jb:337920},
  bonus:{royal:4,sf:36,'4a':48,'4l':144,'4k':432,fh:3744,fl:5108,st:10200,'3k':54912,'2p':123552,jb:337920},
  ddb:{royal:4,sf:36,'4ak':12,'4lk':36,'4a':36,'4l':108,'4k':432,fh:3744,fl:5108,st:10200,'3k':54912,'2p':123552,jb:337920},
  deuces:{royal:4,'4d':48,wr:480,'5k':624,sf:2068,'4k':31552,fh:12672,fl:14472,st:62232,'3k':355080}};
for(const g in want) for(const k in want[g]) t(out[g][k]===want[g][k], g+' '+k+': '+out[g][k]+' != '+want[g][k]);
for(const g of V.ORDER) t(Object.keys(out[g]).filter(k=>k!=='-').every(k=>V.row(g,k)>=0), g+': every result is on the pay table');
t(V.pay('job','royal',5)===4000 && V.pay('job','royal',4)===1000 && V.pay('ddb','4ak',5)===2000 && V.pay('job',null,5)===0,'pays per coin, royal bonus at max');
const c=(r,s)=>({r,s});
t(V.evaluate('job',[c(14,0),c(2,1),c(3,2),c(4,3),c(5,0)])==='st','wheel A-2-3-4-5 is a straight');
t(V.evaluate('job',[c(12,0),c(13,1),c(14,2),c(2,3),c(3,0)])===null,'no wrapping straights');
t(V.evaluate('deuces',[c(2,0),c(2,1),c(14,2),c(13,2),c(12,2)])==='wr','deuces fill a royal');
t(V.evaluate('deuces',[c(2,0),c(14,1),c(3,2),c(4,3),c(5,0)])==='st','deuce fills a wheel');
for(let i=0;i<2000;i++){ const h=V.deal(V.ORDER[i%4],1+i%5,i); const held=[0,1,2,3,4].map(k=>((i>>k)&1)===1); h.held=held.slice(); const before=h.cards.slice(); V.draw(h);
  t(h.cards.every((x,k)=>held[k]?x===before[k]:true),'held cards stay'); t(new Set(h.cards.concat(before).map(x=>x.s*13+x.r)).size===5+held.filter(x=>!x).length,'draws come from the rest of the deck');
  t(h.win===V.pay(h.game,V.evaluate(h.game,h.cards),h.coins),'win matches the table'); }
bad=[...new Set(bad)];
console.log(bad.length?'FAIL\n'+bad.join('\n'):'ok - all 2,598,960 hands match in 4 games; 2000 draws');
process.exit(bad.length?1:0);
