/* Soak test: pulls the engine + bot straight out of index.html and plays them
   against each other. No DOM, no stubs — the same code the page runs. */
const fs = require('fs');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (blocks.length < 3) { console.error('expected 3 script blocks, got ' + blocks.length); process.exit(1); }
eval(blocks[0]);           // engine  -> globalThis.STRAT
eval(blocks[1]);           // bot     -> globalThis.STRATAI
const S = globalThis.STRAT, AI = globalThis.STRATAI;

let fails = [];
function chk(cond, msg) { if (!cond) fails.push(msg); return cond; }

function armyCensus() { const m = {}; S.ARMY.forEach(a => m[a.rank] = a.count); return m; }

function auditState(st, tag) {
  // board <-> piece agreement
  const seen = new Set();
  for (let i = 0; i < S.SIZE; i++) {
    const id = st.b[i];
    if (id == null) continue;
    const p = st.p[id];
    if (!chk(p && p.at === i && !p.dead, `${tag}: board/piece disagree at ${i}`)) return;
    if (!chk(!seen.has(id), `${tag}: piece ${id} on the board twice`)) return;
    if (!chk(!S.isLake(i), `${tag}: a piece is standing in a lake at ${i}`)) return;
    seen.add(id);
  }
  // exact army, alive + dead, per side
  for (const side of ['red', 'blue']) {
    const want = armyCensus(), got = {};
    let n = 0;
    for (const id in st.p) {
      const p = st.p[id];
      if (p.side !== side) continue;
      got[p.rank] = (got[p.rank] || 0) + 1; n++;
    }
    chk(n === 40, `${tag}: ${side} has ${n} pieces, not 40`);
    for (const r in want) chk((got[r] || 0) === want[r], `${tag}: ${side} has ${got[r] || 0} of rank ${r}, want ${want[r]}`);
    // a live piece must be on the board
    for (const id in st.p) {
      const p = st.p[id];
      if (p.side === side && !p.dead) chk(st.b[p.at] === p.id, `${tag}: live ${side} piece ${id} not on the board`);
    }
  }
}

function auditRedaction(view, forSide, st, tag) {
  for (const id in view.p) {
    const v = view.p[id], real = st.p[id];
    if (v.side === forSide) { chk(v.rank === real.rank, `${tag}: own rank hidden from owner`); continue; }
    if (real.seen[forSide]) chk(v.rank === real.rank, `${tag}: earned rank withheld`);
    else chk(v.rank === null, `${tag}: LEAK — ${forSide} can see an unearned rank (piece ${id}, ${real.rank})`);
  }
}

function playGame(seed, auditEvery) {
  const rnd = S.mulberry(seed);
  const st = S.newState();
  S.applySetup(st, 'red', S.makeSetup('red', rnd));
  S.applySetup(st, 'blue', S.makeSetup('blue', rnd));
  st.phase = 'play'; st.turn = 'red';
  const bots = { red: AI.create('red', seed % 4 === 0 ? 'easy' : 'normal'),
                 blue: AI.create('blue', seed % 3 === 0 ? 'easy' : 'normal') };
  auditState(st, `seed ${seed} setup`);

  let plies = 0;
  while (st.phase === 'play') {
    const side = st.turn;
    const view = S.redact(st, side);
    if (auditEvery) auditRedaction(view, side, st, `seed ${seed} ply ${plies}`);
    // the bot must never see a rank it hasn't earned
    const mv = bots[side].move(view);
    if (!chk(mv, `seed ${seed}: bot returned no move with ${S.legalMoves(st, side).length} legal`)) break;
    const legal = S.movesFrom(st, mv.from);
    if (!chk(legal.indexOf(mv.to) >= 0, `seed ${seed}: bot proposed an illegal move ${mv.from}->${mv.to}`)) break;
    S.applyMove(st, mv);
    plies++;
    if (auditEvery) auditState(st, `seed ${seed} ply ${plies}`);
    if (!chk(plies < 6000, `seed ${seed}: game never ended`)) break;
  }
  auditState(st, `seed ${seed} end`);
  return { plies, winner: st.winner, reason: st.reason };
}

const GAMES = parseInt(process.argv[2] || '300', 10);
const t0 = Date.now();
const reasons = {}, winners = {}; let totalPlies = 0, longest = 0;
for (let s = 1; s <= GAMES; s++) {
  const r = playGame(s, s <= 25);          // deep audit on the first 25, fast for the rest
  reasons[r.reason] = (reasons[r.reason] || 0) + 1;
  winners[r.winner] = (winners[r.winner] || 0) + 1;
  totalPlies += r.plies; longest = Math.max(longest, r.plies);
  if (fails.length > 12) break;
}
console.log(`${GAMES} games in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
console.log('  avg plies :', (totalPlies / GAMES).toFixed(1), ' longest:', longest);
console.log('  endings   :', JSON.stringify(reasons));
console.log('  winners   :', JSON.stringify(winners));
if (fails.length) { console.log('\nFAILURES (' + fails.length + '):'); fails.slice(0, 12).forEach(f => console.log('  - ' + f)); process.exit(1); }
console.log('\nAll assertions passed.');
