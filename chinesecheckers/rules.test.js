/* Chinese Checkers - rules checks, plus a soak of bot-only games. Engine straight from index.html (block 1). */
const fs=require('fs');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
eval([...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1]);
const C=globalThis.CC; let bad=[]; const t=(c,m)=>{ if(!c) bad.push(m); };
t(C.N===121,'121 holes'); t(C.POINTS.every(p=>p.length===10),'six points of 10');
t(new Set(C.POINTS.flat()).size===60,'points do not overlap');
t(C.POINTS.every((p,k)=>C.opposite(C.opposite(k))===k),'opposite of opposite');
for(const n of [2,3,4,6]){ const st=C.newGame(n); t(st.board.filter(x=>x>=0).length===10*n, n+' players: 10 marbles each'); }
// steps and hops
const st=C.newGame(2); st.board.fill(-1);
const at=(q,r)=>C.ID[q+','+r];
st.board[at(0,0)]=0; st.board[at(1,0)]=1;           // a marble with a neighbour to the east
let r=C.reach(st,at(0,0)); t(r.some(m=>m.to===at(2,0)&&m.hops===1),'hop over a neighbour into the hole beyond');
t(!r.some(m=>m.to===at(1,0)),'cannot land on a marble');
t(r.filter(m=>m.hops===0).length===5,'steps to the five empty neighbours');
st.board[at(3,0)]=1; r=C.reach(st,at(0,0)); t(r.some(m=>m.to===at(4,0)&&m.hops===2),'chain two hops');
t(!r.some(m=>m.hops>0&&m.path.slice(1).includes(at(0,0))),'a chain never lands back where it started');
st.board[at(2,0)]=1; r=C.reach(st,at(0,0)); t(!r.some(m=>m.to===at(3,0)),'no jumping two marbles at once');
// winning, including a marble parked in the target
const w=C.newGame(2); w.board.fill(-1); C.POINTS[w.target[0]].forEach((i,k)=>w.board[i]=k===0?1:0); t(C.won(w,0),'full target with a parked opponent marble still wins');
C.POINTS[w.target[0]].forEach(i=>w.board[i]=1); t(!C.won(w,0),'a target full of only opponent marbles is not a win');
// soak: bot-only games always finish, marbles conserved, every move legal
let games=0; for(const n of [2,3,4,6]) for(const lv of ['easy','normal']) for(let g=0;g<8;g++){
  const s=C.newGame(n); let k=0; while(!s.over&&k<4000){ const p=s.turn, m=C.choose(s,p,lv); if(!m){ bad.push('no move'); break; }
    if(!C.canMove(s,p,m.from,m.to)) bad.push('illegal bot move'); s.lastBy=s.lastBy||{}; s.lastBy[p]={from:m.from,to:m.to}; C.apply(s,p,m); k++; }
  t(s.over,n+'p '+lv+' game finished'); t(s.board.filter(x=>x>=0).length===10*n,'marbles conserved'); games++; }
if(bad.length){ console.log('FAIL\n - '+[...new Set(bad)].join('\n - ')); process.exit(1); }
console.log('rules + '+games+' bot games: all passed');
