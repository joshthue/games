/* Nerts - soak: hundreds of bot-only rounds (2-4 players, mixed speeds), rotating when everyone's stuck,
   checking cards are conserved, every work pile is a legal run, every middle pile runs A up in one suit,
   and every round ends - by a Nerts call, or by the stuck rule. */
const fs=require('fs');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
eval([...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1]);
const N=globalThis.NERTS; const R=+(process.argv[2]||300); let called=0, stuck=0;
for(let g=0;g<R;g++){
  const n=2+g%3, skill=[1,1,.9,.8], st=N.newRound(n,1000+g); let steps=0, idle=0, last=0, rot=0;
  while(!st.over){ if(++steps>40000){ console.log('FAIL: round '+g+' never ended'); process.exit(1); }
    N.botStep(st,Math.floor(Math.random()*n),skill[Math.floor(Math.random()*4)]);
    if(st.moves!==last){ last=st.moves; idle=0; rot=0; } else if(++idle>n*60){ N.rotate(st); idle=0; if(++rot>40){ st.over=true; st.stalled=true; } } }
  st.stalled?stuck++:called++;
  for(let p=0;p<n;p++){ if(N.cardsInPlay(st,p)+st.players[p].played!==52){ console.log('FAIL: cards lost, round '+g); process.exit(1); }
    if(!st.players[p].work.every(w=>!w.length||N.validRun(w))){ console.log('FAIL: bad work pile, round '+g); process.exit(1); } }
  const inMid=st.center.reduce((s,c)=>s+c.length,0), played=st.players.reduce((s,pl)=>s+pl.played,0);
  if(inMid!==played){ console.log('FAIL: middle count mismatch, round '+g); process.exit(1); }
  for(const c of st.center) c.forEach((x,i)=>{ if(x.r!==i+1||x.s!==c[0].s){ console.log('FAIL: bad middle pile, round '+g); process.exit(1); } });
}
console.log('soak: '+R+' rounds, '+called+' ended by a Nerts call, '+stuck+' by the stuck rule; all checks passed');
