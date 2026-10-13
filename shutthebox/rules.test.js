/* Shut the Box - rules checks, the perfect-play solver, and a soak of bot rounds.
   Engine straight from index.html (block 1). */
const fs=require('fs');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
eval([...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1]);
const S=globalThis.STB; let bad=[]; const t=(c,m)=>{ if(!c) bad.push(m); };
t(Math.abs(S.P2.reduce((a,b)=>a+b,0)-1)<1e-12 && Math.abs(S.P2[7]-6/36)<1e-12,'two-dice odds');
const all=S.full(9);
t(S.ways(all,9).map(S.sum).every(s=>s===9) && S.ways(all,9).length===8,'eight ways to make 9 from 1-9');
t(S.ways(S.toMask([1,2,4]),5).length===1,'1 + 4 makes 5');
t(!S.oneDieOK(S.toMask([1,7]),true) && S.oneDieOK(S.toMask([1,2,6]),true) && !S.oneDieOK(S.toMask([1,2]),false),'one die only once 7 and up are shut, and only with the rule');
// the solver against a hand-worked box: only tile 1 left -> you can only make 1 with one die
t(Math.abs(S.expected(9,true,S.toMask([1]))-5/6)<1e-12,'lone 1: roll one die, 1/6 to shut, else score 1');
t(Math.abs(S.expected(9,false,S.toMask([1]))-1)<1e-12,'lone 1 without the rule: two dice never make 1');
const e9=S.expected(9,true,all), p9=S.shutChance(9,true);
t(e9>10.9&&e9<11.1,'perfect play from 1-9 with one die averages about 11.0 ('+e9.toFixed(3)+')');
t(p9>0.095&&p9<0.099,'and shuts the box about 9.7% ('+(100*p9).toFixed(2)+'%)');
// a round: shutting, dead rolls, scoring, the shut-the-box win
const st=S.newRound(9,2,true); st.roll=9; st.dice=[4,5]; st.dead=false;
let threw=false; try{ S.shut(st,S.toMask([4,6])); }catch(e){ threw=true; } t(threw,'tiles that do not add up are refused');
S.shut(st,S.toMask([4,5])); t(st.box===(all^S.toMask([4,5])) && st.roll==null,'shut 4 + 5');
st.box=S.toMask([9]); st.roll=null; if(S.rollDice(st,2)) t(S.endTurn(st)===9,'a dead roll scores what is standing'); else t(S.shut(st,st.box)===0,'shutting the last tile shuts the box');
t(st.turn===1 || st.over,'turn passes on');
// soak: bots finish every round, scores are what's standing, one-die only when allowed
let rounds=0, shuts=0;
for(let i=0;i<3000;i++){ const n=[9,10,12][i%3], r=i%2===0, lv=i%4<2?'normal':'easy', R=S.newRound(n,4,r);
  let guard=0; while(!R.over && guard++<200){ const d=S.botDice(R,lv); if(d===1) t(S.oneDieOK(R.box,R.rule),'one die only when allowed');
    const box=R.box; if(S.rollDice(R,d)){ const sc=S.endTurn(R); t(sc===S.sum(box),'score is what is standing'); continue; }
    const m=S.botShut(R,lv); t(S.canShut(R,m),'bot shuts a legal set'); if(S.shut(R,m)===0) shuts++; }
  t(R.over,'round ends'); t(S.winners(R).length>=1,'somebody wins'); rounds++; }
bad=[...new Set(bad)];
console.log(bad.length?'FAIL\n'+bad.join('\n'):'ok - solver checks; '+rounds+' bot rounds ('+shuts+' boxes shut)');
process.exit(bad.length?1:0);
