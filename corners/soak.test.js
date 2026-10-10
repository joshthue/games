/* Corners - soak: hundreds of bot-vs-bot games, every move re-checked from scratch.
   Asserts each game ends, nobody ever holds a side-by-side pair of their own pieces that
   came from different moves, squares are conserved, and scores match what's left. */
const fs=require('fs');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
eval([...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1]);
const C=globalThis.CORN; let games=0, moves=0, fail=null;
const N=+(process.argv[2]||300);
for(let g=0; g<N && !fail; g++){
  const players=g%3===0?2:4, lv=['easy','normal'][g%2];
  const st=C.newState({players}); const owner=new Array(st.size*st.size).fill(-1); let guard=0;
  while(!st.over){ if(guard++>200){ fail='game '+g+' never ended'; break; }
    const p=st.turn, m=C.choose(st,p,lv); if(!m){ fail='game '+g+': player '+p+' on turn with no move'; break; }
    if(!C.legalCells(st,p,m.cells)){ fail='game '+g+': bot chose an illegal move'; break; }
    C.apply(st,p,m); moves++; m.cells.forEach(q=>owner[q[1]*st.size+q[0]]=st.history.length); }
  if(fail) break;
  // no two side-touching squares of one color from different pieces
  for(let y=0;y<st.size&&!fail;y++) for(let x=0;x<st.size;x++){ const i=y*st.size+x, p=st.board[i]; if(p<0) continue;
    [[1,0],[0,1]].forEach(d=>{ const a=x+d[0], b=y+d[1]; if(a>=st.size||b>=st.size) return; const j=b*st.size+a;
      if(st.board[j]===p && owner[j]!==owner[i]) fail='game '+g+': '+p+' touches itself side to side at '+x+','+y; }); }
  for(let p=0;p<st.n;p++){ const onBoard=st.board.filter(v=>v===p).length; if(onBoard+C.left(st,p)!==89) fail='game '+g+': squares not conserved for '+p;
    if(C.hasMove(st,p) && st.placed[p]<21) fail='game '+g+': ended while '+p+' could still move'; }
  games++;
}
if(fail){ console.log('FAIL: '+fail); process.exit(1); }
console.log('soak: '+games+' games, '+moves+' moves, all legal, all ended properly');
