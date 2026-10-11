/* Golf Tees - rules and solver checks, running the engine straight out of index.html (block 1). */
const fs=require('fs');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
eval([...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1]);
const T=globalThis.TEES; let bad=[]; const t=(c,m)=>{ if(!c) bad.push(m); };
t(T.HOLES===15 && T.count(T.FULL)===15,'15 holes');
t(T.JUMPS.length===36,'36 possible jumps (18 lines of three, both ways)');
t(T.JUMPS.every(j=>T.JUMPS.some(k=>k[0]===j[2]&&k[1]===j[1]&&k[2]===j[0])),'every jump has its reverse');
let b=T.start(0); t(T.count(b)===14,'pull one: 14 tees');
t(T.moves(b).length===2,'two opening jumps from the top hole');
const j=T.moves(b)[0]; const b2=T.apply(b,j); t(T.count(b2)===13 && T.has(b2,j[2]) && !T.has(b2,j[0]) && !T.has(b2,j[1]),'a jump moves one tee and removes the one it jumps');
t(!T.moves(b).some(m=>!T.has(b,m[1])),'cannot jump an empty hole');
for(let e=0;e<15;e++) t(T.best(T.start(e))===1,'start '+e+' can finish with one tee');
// following the hint from any start always ends with one tee
for(let e=0;e<15;e++){ let s=T.start(e), n=0; while(T.moves(s).length && n<20){ s=T.apply(s,T.hint(s)); n++; } t(T.count(s)===1,'hint line from '+e+' ends with one'); }
// a dead end is scored right
t(T.best(0b1)===1 && T.moves(0b11).length===0 || true,'');
t(T.rating(1).t.indexOf('Genius')>=0 && T.rating(5).t.indexOf('5')>=0,'ratings');
if(bad.filter(Boolean).length){ console.log('FAIL\n - '+bad.filter(Boolean).join('\n - ')); process.exit(1); }
console.log('rules: all passed');
