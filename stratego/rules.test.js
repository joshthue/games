/* Focused rules checks — the specific things that are easy to get wrong. */
const fs=require('fs');
const html=fs.readFileSync(__dirname + '/index.html','utf8');
const blocks=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
eval(blocks[0]); eval(blocks[1]);
const S=globalThis.STRAT, AI=globalThis.STRATAI;
let bad=[]; const t=(c,m)=>{ if(!c) bad.push(m); };

// --- combat table ---
t(S.resolve(1,2)==='attacker','Marshal beats General');
t(S.resolve(2,1)==='defender','General loses to Marshal');
t(S.resolve(5,5)==='both','equal ranks both die');
t(S.resolve('S',1)==='attacker','Spy attacking Marshal wins');
t(S.resolve('S',2)==='defender','Spy attacking General loses');
t(S.resolve(1,'S')==='attacker','Marshal attacking Spy wins');
t(S.resolve(9,'S')==='attacker','anything attacking the Spy wins');
t(S.resolve(8,'B')==='attacker','Miner defuses the Bomb');
t(S.resolve(1,'B')==='defender','Marshal dies to a Bomb');
t(S.resolve('S','B')==='defender','Spy dies to a Bomb');
t(S.resolve(9,'F')==='flag','any attack on the Flag ends it');
t(S.resolve('S','F')==='flag','the Spy can take the Flag too');

// --- geometry ---
function bare(){ const st=S.newState(); st.phase='play'; return st; }
let st=bare();
S.addPiece(st,'red',9,64);                      // scout on row 6 col 4
let m=S.movesFrom(st,64);
t(m.includes(4)&&m.includes(94),'scout runs the whole open file');
t(m.includes(60)&&m.includes(69),'scout runs the whole open rank');
t(!m.some(i=>S.isLake(i)),'scout never lands in a lake');

st=bare(); S.addPiece(st,'red',9,62);            // col 2: lake at 42/52 blocks
m=S.movesFrom(st,62);
t(!m.includes(32)&&!m.includes(22),'scout cannot jump the lake');
t(m.includes(72),'scout still moves away from the lake');

st=bare(); S.addPiece(st,'red',9,64); S.addPiece(st,'blue',3,34);
m=S.movesFrom(st,64);
t(m.includes(34),'scout may strike at the end of its run');
t(!m.includes(24),'scout stops at the piece it strikes');

st=bare(); S.addPiece(st,'red','B',55); t(S.movesFrom(st,55).length===0,'Bombs do not move');
st=bare(); S.addPiece(st,'red','F',95); t(S.movesFrom(st,95).length===0,'the Flag does not move');
st=bare(); S.addPiece(st,'red',4,64); m=S.movesFrom(st,64);
t(m.length===4&&m.includes(54)&&m.includes(74)&&m.includes(63)&&m.includes(65),'ordinary pieces move one square orthogonally');
st=bare(); S.addPiece(st,'red',4,60); m=S.movesFrom(st,60);
t(!m.includes(59),'no wrapping round the edge of the board');

// --- two-squares rule ---
st=bare(); S.addPiece(st,'red',4,64); S.addPiece(st,'blue',4,4);
let seq=[[64,74],[74,64],[64,74],[74,64],[64,74]], blocked=0;
for(const [a,b] of seq){
  st.turn='red';                                  // red keeps the move; blue is a bystander
  if(S.movesFrom(st,a).indexOf(b)<0){ blocked=seq.indexOf([a,b]); blocked=true; break; }
  S.applyMove(st,{from:a,to:b});
}
t(blocked===true,'the two-squares rule stops an endless shuffle');
t(st.p[1].sh && st.p[1].sh.n>=3,'the shuttle counter is actually counting');

// --- flag capture ends it ---
st=bare(); S.addPiece(st,'red',9,64); S.addPiece(st,'blue','F',54); S.addPiece(st,'blue',3,4);
st.turn='red'; S.applyMove(st,{from:64,to:54});
t(st.phase==='over'&&st.winner==='red'&&st.reason==='flag','taking the flag wins immediately');

// --- moving more than one square reveals the Scout to both sides ---
st=bare(); const sc=S.addPiece(st,'red',9,94); S.addPiece(st,'blue',3,4);
st.turn='red'; S.applyMove(st,{from:94,to:64});
t(sc.seen.blue===true,'a long move gives the Scout away, as it does at the table');
st=bare(); const q=S.addPiece(st,'red',4,94); S.addPiece(st,'blue',3,4);
st.turn='red'; S.applyMove(st,{from:94,to:84});
t(q.seen.blue===false,'a one-square move gives nothing away');

// --- setups are legal and varied ---
const flagSpots={}, cornerish=[];
for(let s=0;s<400;s++){
  const cells=S.makeSetup('red',S.mulberry(s*7+1));
  const err=S.validateSetup(cells,'red');
  if(err){ bad.push('generated setup rejected: '+err); break; }
  for(const i in cells) if(cells[i]==='F'){ flagSpots[i]=(flagSpots[i]||0)+1;
    const c=S.colOf(+i); if(c===0||c===9) cornerish.push(1); }
}
t(Object.keys(flagSpots).length>=12,'the flag lands in many different places ('+Object.keys(flagSpots).length+' seen)');
t(cornerish.length/400 < 0.35,'the flag is not always jammed in a corner file ('+(cornerish.length/4).toFixed(0)+'%)');

// --- the bot's view never contains an unearned rank ---
{
  const st2=S.newState();
  S.applySetup(st2,'red',S.makeSetup('red',S.mulberry(9)));
  S.applySetup(st2,'blue',S.makeSetup('blue',S.mulberry(10)));
  st2.phase='play'; st2.turn='red';
  const v=S.redact(st2,'blue');
  let leaked=0; for(const id in v.p){ const p=v.p[id]; if(p.side==='red'&&p.rank!==null) leaked++; }
  t(leaked===0,'a fresh redacted view shows zero enemy ranks (saw '+leaked+')');
}

if(bad.length){ console.log('FAILED:'); bad.forEach(b=>console.log('  - '+b)); process.exit(1); }
console.log('All '+(28)+' rules checks passed.');
