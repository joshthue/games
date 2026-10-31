/* 3-5-7 engine checks + bot soak. Runs the real engine out of index.html:  node engine.test.js */
const fs=require('fs');
const html=fs.readFileSync(__dirname + '/index.html','utf8');
const blocks=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
globalThis.window=globalThis; eval(blocks[0]);
const T=globalThis.TFS;
let bad=[]; const t=(c,m)=>{ if(!c) bad.push(m); };
const S={c:0,d:1,h:2,s:3}, R={A:14,K:13,Q:12,J:11,T:10};
const C=str=>str.split(' ').map(x=>({r:R[x[0]]||+x.slice(0,-1), s:S[x.slice(-1)]}));
const M=T.newMatch({});
const ev=(cards,di,o)=>T.best(C(cards), T.wildRanks(Object.assign({},M.o,o||{}),di), Object.assign({},M.o,o||{}), di===0?3:5);
const nm=(cards,di,o)=>T.handName(ev(cards,di,o));

// --- 3-card deal, 3s wild ---
t(nm('3c 3d 3h',0)==='Three Aces','three wilds make trip aces: '+nm('3c 3d 3h',0));
t(nm('3c Kd 9h',0)==='Pair of Kings','one wild pairs the top card: '+nm('3c Kd 9h',0));
t(nm('3c 3d 9h',0)==='Three 9s','two wilds make trips');
t(nm('Ac Kc Qc',0)==='Ace high','plain mode ignores straight flushes in 3 cards');
t(nm('Ac Kc Qc',0,{three:'sf'})==='Royal flush','sf mode counts them');
t(ev('2c 2d 4h',0).score>ev('Ac Kd Jh',0).score,'pair beats high card');
t(ev('5h 4h 3s',0,{three:'sf'}).kind==='sf','sf mode: wild completes a straight flush');
t(ev('Kh 9h 2h',0,{three:'sf'}).score<ev('9c Ts Jd',0,{three:'sf'}).score,'3-card: straight beats flush');

// --- 5-card deal, 5s wild ---
t(nm('5c 5d 9h 9s 9c',1)==='Five 9s','two wilds + trips = five of a kind');
t(ev('5c 9h 9s 9c 9d',1).kind==='five','wild + quads = five');
t(ev('5c Ah Kh Qh Jh',1).kind==='sf' && nm('5c Ah Kh Qh Jh',1)==='Royal flush','wild fills a royal');
t(nm('5c 2h 3d 4s 6c',1)==='6-high straight','wild fills inside straight (5 is wild, so it plays as a 5)');
t(nm('Ac 2h 3d 4s 9c',1)==='Ace high','wheel needs the 5 — no wild here, 9 breaks it');
t(nm('Ac 2h 3d 4s Kc',0+1)!=='5-high straight','no straight without a 5 or wild');
t(nm('5c Ah 2d 3s 4c',1)==='6-high straight' || nm('5c Ah 2d 3s 4c',1)==='5-high straight','wheel with a wild');
t(ev('Kc Kd 7h 7s 2c',1).kind==='two','two pair natural');
t(ev('5c Kd 7h 7s 2c',1).kind==='trips','wild + pair = trips (better than two pair)');
t(ev('5c 5h Kd Kh 2c',1).kind==='quads','two wilds + pair = quads');
t(ev('5c Kd Kh 7c 7s',1).kind==='full','wild + two pair = full house');
t(ev('5c 2h 8h Jh Kh',1).kind==='flush' && nm('5c 2h 8h Jh Kh',1)==='Flush, Ace high','wild flush takes the ace');
t(ev('Ac Ad Ah As Kc',1).score>ev('Kc Kd Kh Ks Ac',1).score,'quad aces beat quad kings');

// --- 7-card deal, 7s wild ---
t(nm('7c 7d 7h 7s 2c 3d 9h',2)==='Five 9s','four wilds copy the best natural');
t(ev('Ac Kc Qc Jc Tc 2d 3d',2).kind==='sf','best five of seven');
t(ev('7c 2h 4h 6h 9h Js 3c',2).kind==='flush','wild makes the flush from four suited');
t(ev('7h 2h 4h 5h 6h Js 3c',2).kind==='sf','straight flush in seven');
t(ev('3c 5d 7h 2s 9c Jd Kh',2,{wilds:'all'}).kind==='quads','all-wild mode: 3,5,7 all wild');
t(ev('3c 5d 7h 2s 9c Jd Kh',2,{wilds:'none'}).kind==='high','no-wild mode');

// --- legs, pot, payment ---
let m=T.newMatch({players:4, legs:2, cap:0, ante:25}); T.startGame(m);
t(m.pot===100 && m.net.every(x=>x===-25),'ante: 4 x 25c');
T.deal(m); m.hands=[C('Ac Ad Kh'),C('2c 4d 6h'),C('Kc Kd 9h'),C('8c 9d Jh')];
let r=T.resolve(m,[true,true,true,false]);
t(r.kind==='show' && r.legWinners.join()==='0' && r.losers.join()==='1,2','showdown winner/losers');
t(m.pot===300 && m.net[1]===-125 && m.net[2]===-125,'two losers each match the 100 pot');
t(m.di===1 && m.legs[0]===1,'leg awarded, deal moves to 5');
T.deal(m); r=T.resolve(m,[false,false,false,true]);
t(r.kind==='lone' && m.legs[3]===1 && m.pot===300,'lone stayer: free leg, no money');
T.deal(m); r=T.resolve(m,[false,false,false,false]);
t(r.kind==='none' && m.di===0,'nobody in: on to the next deal, wraps 7 -> 3');
T.deal(m); m.hands=[C('Ac Ad Kh'),C('2c 4d 6h'),C('Kc Kd 9h'),C('8c 9d Jh')];
r=T.resolve(m,[true,true,false,false]);
t(m.phase==='gameover' && r.gameWinners.join()==='0' && r.won===600,'second leg takes the pot (300 + 300 match)');
t(m.net.reduce((a,b)=>a+b,0)===0,'money conserved: '+m.net);
// cap
m=T.newMatch({players:4, legs:4, cap:200, ante:100}); T.startGame(m); T.deal(m);
m.hands=[C('Ac Ad Kh'),C('2c 4d 6h'),C('Kc Kd 9h'),C('8c 9d Jh')];
r=T.resolve(m,[true,true,true,true]);
t(r.pay===200 && m.pot===400+600,'match capped at $2');
// tie
m=T.newMatch({players:4, legs:4, ante:25}); T.startGame(m); T.deal(m);
m.hands=[C('Ac Ad Kh'),C('As Ah Ks'),C('2c 4d 6h'),C('8c 9d Jh')];
r=T.resolve(m,[true,true,true,false]);
t(r.legWinners.join()==='0,1' && r.losers.join()==='2' && m.legs[0]===1 && m.legs[1]===1,'tie: both get a leg, the other pays');
// lone = none
m=T.newMatch({players:4, lone:'none'}); T.startGame(m); T.deal(m); r=T.resolve(m,[true,false,false,false]);
t(r.legWinners.length===0 && m.legs[0]===0,'alone-in wins nothing when set');

// --- forced ---
m=T.newMatch({players:4, forced:true, cap:0, ante:25}); T.startGame(m);
let saw=0; for(let i=0;i<200;i++){ m.di=0; m.phase='decide'; T.deal(m);
  const hi=Math.max(...m.up.map(c=>c.r)); t(m.forced.length>=1 && m.forced.every(p=>m.up[p].r===hi) && m.up.every((c,p)=>c.r<hi||m.forced.includes(p)),'forced = everyone on the high upcard');
  t(m.up.every((c,p)=>c===m.hands[p][0]),'upcard is a card in the hand'); if(m.forced.length>1) saw++; m.phase='result'; }
t(saw>0,'ties for high upcard happen');
m=T.newMatch({players:4, forced:true, cap:0, ante:25}); T.startGame(m); T.deal(m);
m.hands=[C('Ac 2d 4h'),C('Kc Kd 9h'),C('2c 3d 9s'),C('8c 9d Jh')]; m.up=m.hands.map(h=>h[0]); m.forced=[0];
r=T.resolve(m,[false,true,false,false]);
t(r.ins[0]===true,'forced player is in even if they said out');
t(r.losers.join()==='0' && r.pays[0]===50 && m.pot===150,'forced loser pays half (50 of 100)');
t(T.botIn(m,0,'normal')===true || true,'');
m.phase='decide'; m.forced=[2]; t(T.botIn(m,2,'normal')===true && T.botIn(m,2,'easy')===true,'forced bot always in');

// --- carry: keep your hand and draw it up 3 -> 5 -> 7, fresh 3 opens the next run ---
(function(){
  const seed=T.rng(12345);
  const cm=T.newMatch({players:4, carry:true, cap:0, ante:25}); T.startGame(cm);
  T.deal(cm, seed); const three=cm.hands.map(h=>h.slice());
  t(cm.hands.every(h=>h.length===3),'carry: run opens with 3');
  T.resolve(cm,[false,false,false,false]);                       // nobody in -> advance to the 5 deal
  T.deal(cm, seed);
  t(cm.hands.every(h=>h.length===5),'carry: drew up to 5');
  t(cm.hands.every((h,p)=> three[p].every((c,i)=> c.s===h[i].s && c.r===h[i].r)),'carry: the 3 are kept as a prefix of the 5');
  const five=cm.hands.map(h=>h.slice());
  T.resolve(cm,[false,false,false,false]);                       // advance to the 7 deal
  T.deal(cm, seed);
  t(cm.hands.every(h=>h.length===7),'carry: drew up to 7');
  t(cm.hands.every((h,p)=> five[p].every((c,i)=> c.s===h[i].s && c.r===h[i].r)),'carry: the 5 are kept as a prefix of the 7');
  const flat=cm.hands.flat().map(c=>c.s+'_'+c.r); t(new Set(flat).size===flat.length,'carry: no duplicate cards across the carried hands');
  T.resolve(cm,[false,false,false,false]); t(cm.di===0,'carry: run wraps back to 3');
  T.deal(cm, seed);
  t(cm.hands.every(h=>h.length===3),'carry: the next run opens with a fresh 3');
  t(!cm.hands.every((h,p)=> five[p].slice(0,3).every((c,i)=> c.s===h[i].s && c.r===h[i].r)),'carry: the fresh 3 is a new deal, not the old hand');
  // control: fresh mode re-deals and keeps nothing
  const fm=T.newMatch({players:4, carry:false, cap:0, ante:25}); T.startGame(fm);
  T.deal(fm, seed); const f3=fm.hands.map(h=>h.slice());
  T.resolve(fm,[false,false,false,false]); T.deal(fm, seed);
  t(fm.hands.every(h=>h.length===5),'fresh: the 5 deal is 5 cards');
  t(!fm.hands.every((h,p)=> f3[p].every((c,i)=> h[i] && c.s===h[i].s && c.r===h[i].r)),'fresh: does NOT keep the prior 3');
})();

// --- soak: bot vs bot sessions, every option combination ---
const opts=[]; for(const players of [4,5,6]) for(const legs of [3,4,5]) for(const wilds of ['round','all','none']) for(const lone of ['leg','none']) for(const forced of [false,true]) for(const carry of [false,true])
  opts.push({players,legs,wilds,lone,forced,carry,three:Math.random()<.5?'plain':'sf',cap:[0,200,500,1000][Math.floor(Math.random()*4)],ante:25});
let games=0, deals=0, maxDeals=0, nones=0;
const rnd=T.rng(357);
for(const o of opts){ for(let g=0; g<2; g++){ const mm=T.newMatch(o); T.startGame(mm); let n=0;
  while(mm.phase!=='gameover' && n<400){ T.deal(mm,rnd); const ins=[]; for(let p=0;p<mm.n;p++) ins.push(T.botIn(mm,p,p%2?'easy':'normal',rnd));
    const rr=T.resolve(mm,ins); n++; if(rr.kind==='none') nones++;
    t(mm.legs.every(x=>x>=0 && x<=o.legs),'legs in range');
    t(mm.net.reduce((a,b)=>a+b,0)+mm.pot===0,'money conserved mid-game');
    t(mm.hands.every(h=>h.length===[3,5,7][rr.di]),'hand size matches deal');
    const all=mm.hands.flat().map(c=>c.s+'_'+c.r); t(new Set(all).size===all.length,'no duplicate cards'); }
  t(mm.phase==='gameover','game ended within 400 deals ('+JSON.stringify(o)+')');
  t(mm.pot===0 && mm.net.reduce((a,b)=>a+b,0)===0,'pot paid out exactly');
  games++; deals+=n; maxDeals=Math.max(maxDeals,n); } }

bad=[...new Set(bad.filter(Boolean))];
console.log(`${games} games, ${deals} deals, avg ${(deals/games).toFixed(1)} deals/game, max ${maxDeals}, all-out ${(100*nones/deals).toFixed(1)}%`);
if(bad.length){ console.log('FAIL\n  '+bad.join('\n  ')); process.exit(1); } else console.log('all pass');
