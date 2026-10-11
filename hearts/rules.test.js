/* Hearts - rules checks, plus a soak of bot-only games. Engine straight from index.html (block 1). */
const fs=require('fs');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
eval([...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1]);
const H=globalThis.HEARTS; let bad=[]; const t=(c,m)=>{ if(!c) bad.push(m); };
const c=(s,r)=>({s,r});
t([0,1,2,3,4].map(H.passDir).join()==='1,3,2,0,1','pass left, right, across, hold, round again');
t(H.points(c(H.H,5))===1 && H.points(c(H.S,12))===13 && H.points(c(H.S,13))===0,'points: hearts 1, Q♠ 13');
// a hand by hand: build a play state directly
function st(hands,extra){ return Object.assign({hands, dir:0, phase:'play', passes:[], trick:[], leader:0, turn:0, taken:[[],[],[],[]], heartsBroken:false, tricks:0, lastTrick:null}, extra||{}); }
let h=st([[c(0,2),c(3,5),c(1,9)],[c(0,9)],[c(0,3)],[c(0,4)]]);
t(H.legal(h,0).length===1 && H.same(H.legal(h,0)[0],c(0,2)),'2♣ must lead the first trick');
h=st([[c(1,5)],[c(3,9),c(2,12),c(1,4)],[],[]],{tricks:0,turn:1,trick:[{p:0,c:c(0,2)}]});
t(H.legal(h,1).length===1 && H.legal(h,1)[0].s===1,'no points on the first trick when you have something else');
h=st([[],[c(3,9),c(2,12)],[],[]],{tricks:0,turn:1,trick:[{p:0,c:c(0,2)}]});
t(H.legal(h,1).length===2,'points on the first trick when that is all you have');
h=st([[c(3,5),c(1,4)]],{tricks:3});
t(H.legal(h,0).length===1 && H.legal(h,0)[0].s===1,'cannot lead a heart before they are broken');
h=st([[c(3,5),c(3,7)]],{tricks:3}); t(H.legal(h,0).length===2,'may lead hearts when you hold nothing else');
h=st([[c(3,5),c(1,4)]],{tricks:3,heartsBroken:true}); t(H.legal(h,0).length===2,'hearts lead once broken');
h=st([[c(1,4),c(2,9)],[c(1,10)],[c(3,2)],[c(1,14)]],{tricks:3});
H.play(h,0,c(1,4)); H.play(h,1,c(1,10)); H.play(h,2,c(3,2)); const w=H.play(h,3,c(1,14));
t(w===3 && h.taken[3].length===4 && h.heartsBroken && h.turn===3,'highest of the suit led wins; off-suit heart breaks hearts');
// passing and the moon
const g=H.newGame(100), d=H.deal(g,7); for(let p=0;p<4;p++) H.setPass(d,p,H.choosePass(d,p));
t(d.phase==='play' && d.hands.every(x=>x.length===13) && d.hands[d.turn].some(x=>x.s===0&&x.r===2),'pass swaps three each and the 2♣ holder leads');
const g2=H.newGame(100), m=st([[],[],[],[]],{phase:'done'}); for(let r=2;r<=14;r++) m.taken[2].push(c(3,r)); m.taken[2].push(c(2,12));
const sc=H.score(g2,m); t(sc.moon===2 && g2.totals.join()==='26,26,0,26','shooting the moon: 0 for the shooter, 26 for everyone else');
// soak: bot games always end, 26 points a hand, every play legal
let games=0, hands=0;
for(let gi=0;gi<300;gi++){ const G=H.newGame(100);
  while(!G.over){ const x=H.deal(G,gi*997+G.hand);
    if(x.phase==='pass') for(let p=0;p<4;p++) H.setPass(x,p,H.choosePassAt(x,p,p%2?'easy':'normal'));
    let n=0; while(x.phase==='play'){ const p=x.turn, cc=H.choose(x,p,p%2?'easy':'normal'); t(H.legal(x,p).some(l=>H.same(l,cc)),'bot plays legal'); H.play(x,p,cc); if(++n>52){ bad.push('hand never ends'); break; } }
    t(H.handPoints(x).reduce((a,b)=>a+b)===26,'26 points a hand'); H.score(G,x); hands++; if(G.hand>200){ bad.push('game never ends'); break; } }
  games++; }
bad=[...new Set(bad)];
console.log(bad.length?'FAIL\n'+bad.join('\n'):'ok - '+games+' bot games, '+hands+' hands');
process.exit(bad.length?1:0);
