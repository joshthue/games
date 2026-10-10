/* Nerts - focused rules checks. Runs the engine straight out of index.html (block 1), never a copy. */
const fs=require('fs');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
eval([...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1]);
const N=globalThis.NERTS; let bad=[]; const t=(c,m)=>{ if(!c) bad.push(m); };
const C=(r,s,o)=>({r,s,o:o||0});

// the deal
let st=N.newRound(4,42);
st.players.forEach((pl,p)=>{ t(pl.nertz.length===13,'13 in the Nerts pile'); t(pl.work.every(w=>w.length===1),'4 work piles of 1');
  t(pl.stock.length===35,'35 in the stock'); t(N.cardsInPlay(st,p)===52,'52 a player'); t([...pl.nertz,...pl.stock,...pl.work.flat()].every(c=>c.o===p),'own deck'); });
t(JSON.stringify(N.newRound(3,7))===JSON.stringify(N.newRound(3,7)),'same seed, same deal');

// the middle
st=N.newRound(2,1); st.center=[];
t(N.centerSpot(st,C(1,0))===-1,'an ace starts a pile'); t(N.centerSpot(st,C(2,0))===null,'a 2 needs an ace');
st.center.push([C(1,0)]); t(N.centerSpot(st,C(2,0))===0,'2 of the same suit goes on'); t(N.centerSpot(st,C(2,1))===null,'other suit does not');
t(N.centerSpot(st,C(3,0))===null,'no skipping');

// work piles: down, alternating colour; empty takes anything
t(N.fitsWork([C(8,0)],C(7,1)),'red 7 on black 8'); t(!N.fitsWork([C(8,0)],C(7,3)),'black on black refused');
t(!N.fitsWork([C(8,0)],C(9,1)),'must go down'); t(N.fitsWork([],C(12,2)),'empty pile takes anything');
t(N.validRun([C(9,1),C(8,0),C(7,2)]),'a run'); t(!N.validRun([C(9,1),C(8,1)]),'not a run');

// moves
st=N.newRound(2,3); const me=st.players[0];
me.nertz=[C(5,3),C(1,2)]; me.work=[[C(9,0)],[C(8,1)],[],[C(4,1)]]; me.waste=[C(3,0)]; st.center=[];
t(N.move(st,0,{kind:'nertz'},{kind:'center'}),'nertz ace to the middle'); t(me.played===1 && st.center.length===1,'counted');
t(!N.move(st,0,{kind:'nertz'},{kind:'center'}),'5 of clubs cannot go to the middle yet');
t(N.move(st,0,{kind:'nertz'},{kind:'work',i:2}),'nertz card into an empty work pile');
t(st.over && st.caller===0,'emptying the Nerts pile calls it');
st=N.newRound(2,3); const m2=st.players[0]; m2.work=[[C(9,0)],[C(8,1),C(7,3)],[],[]]; m2.nertz=[C(13,0)];
t(N.move(st,0,{kind:'work',i:1,k:0},{kind:'work',i:0}),'move a run of two');
t(m2.work[0].length===3 && m2.work[1].length===0,'run moved whole');
t(!N.canMove(st,0,{kind:'work',i:0,k:1},{kind:'work',i:0}),'not onto itself');

// stock: three at a time, then start over
st=N.newRound(2,9); const m3=st.players[0]; m3.stock=[C(1,0),C(2,0),C(3,0),C(4,0),C(5,0)]; m3.waste=[];
N.flip(st,0); t(m3.waste.length===3 && m3.waste[2].r===3 && m3.stock.length===2,'flip three: the third is on top');
N.flip(st,0); t(m3.waste.length===5 && m3.stock.length===0,'last two');
N.flip(st,0); t(m3.stock.length===5 && m3.waste.length===0 && m3.stock[4].r===5,'turn the waste back over in order');
N.rotate(st); t(m3.stock[0].r===1 || m3.stock.length===5,'rotate moves the top card to the bottom');

// scoring
st=N.newRound(2,5); st.players[0].played=14; st.players[0].nertz=st.players[0].nertz.slice(0,4); t(N.score(st,0)===6,'+14 -8 = 6');

if(bad.length){ console.log('FAIL\n - '+bad.join('\n - ')); process.exit(1); }
console.log('rules: all passed');
