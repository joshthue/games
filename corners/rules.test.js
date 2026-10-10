/* Corners - focused rules checks. Runs the engine straight out of index.html (block 1), never a copy. */
const fs=require('fs');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const blocks=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
eval(blocks[0]);
const C=globalThis.CORN; let bad=[]; const t=(c,m)=>{ if(!c) bad.push(m); };

// the set
t(C.PIECES.length===21,'21 pieces');
t(C.PIECES.reduce((s,P)=>s+P.n,0)===89,'89 squares a set');
t(C.PIECES.reduce((s,P)=>s+P.oris.length,0)===91,'91 distinct orientations');
t(C.PIECES[0].oris.length===1 && C.PIECES.find(P=>P.id==='X5').oris.length===1,'monomino and X have one orientation');
t(C.PIECES.find(P=>P.id==='F5').oris.length===8,'F has eight');
const shapes=new Set(); C.PIECES.forEach(P=>P.oris.forEach(o=>shapes.add(C.key(o)))); t(shapes.size===91,'no two pieces share an orientation');

// first move must cover the start square
let st=C.newState({players:4});
t(!C.legalCells(st,0,[[1,0]]),'first piece off the corner is illegal');
t(C.legalCells(st,0,[[0,0]]),'first piece on the corner is legal');
t(C.legalMoves(st,0).every(m=>m.cells.some(q=>q[0]===0&&q[1]===0)),'every first move covers the corner');
t(C.legalMoves(st,0).length>0,'there are first moves');
C.apply(st,0,{piece:0,cells:[[0,0]]});
t(st.turn===1,'turn passes on');
let threw=false; try{ C.apply(st,0,{piece:1,cells:[[1,1],[2,1]]}); }catch(e){ threw=true; } t(threw,'cannot move out of turn');

// corner yes, side no
st=C.newState({players:4}); C.apply(st,0,{piece:0,cells:[[0,0]]}); st.turn=0;
t(C.legalCells(st,0,[[1,1],[2,1]]),'diagonal touch is legal');
t(!C.legalCells(st,0,[[1,0],[2,0]]),'side touch with your own color is illegal');
t(!C.legalCells(st,0,[[3,3],[4,3]]),'a piece touching nothing of yours is illegal');
t(!C.legalCells(st,0,[[0,0],[0,1]].map(q=>q)),'cannot cover an occupied square');
// other colors may touch any way
st=C.newState({players:2}); st.board[5*st.size+5]=0; st.placed[0]=1; st.board[6*st.size+7]=1; st.placed[1]=1;
t(C.legalCells(st,0,[[6,6]]),'a piece may sit side by side with another color');
t(C.legalCells(st,0,[[6,6],[6,7]]),'and run alongside it');

// a piece can't be used twice
st=C.newState({players:4}); C.apply(st,0,{piece:3,cells:[[0,0],[1,0],[0,1]]}); st.turn=0;
threw=false; try{ C.apply(st,0,{piece:3,cells:[[1,1],[2,1],[1,2]]}); }catch(e){ threw=true; } t(threw,'piece reuse is refused');
t(!C.legalMoves(st,0).some(m=>m.piece===3),'used piece offers no moves');

// scoring
st=C.newState({players:2}); t(C.score(st,0)===-89,'nothing played: -89');
st.hands[0]=st.hands[0].map(()=>false); st.lastPiece[0]=0; t(C.score(st,0)===20,'all played, single last: +20');
st.lastPiece[0]=5; t(C.score(st,0)===15,'all played: +15');

// 2-player starts
st=C.newState({players:2}); t(st.size===14 && C.anchors(st,0)[0][0]===4 && C.anchors(st,1)[0][0]===9,'duo starts at 5-5 and 10-10');

if(bad.filter(Boolean).length){ console.log('FAIL\n - '+bad.filter(Boolean).join('\n - ')); process.exit(1); }
console.log('rules: all passed');
