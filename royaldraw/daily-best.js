#!/usr/bin/env node
// Royal Draw — precompute the Daily Deal's best boards (v269).
//
//   node royaldraw/daily-best.js [days] [runs]      (defaults: 400 days from DAILY_EPOCH, 16 runs a day)
//
// Every phone deals the same 25 cards for a day (dailyDeal, seeded from the date), and the Daily Deal's
// score is a share of the best board those cards can make. Two phones' own searches can land a point or
// two apart, so the best board is found here, ahead of time, with a much longer search than a phone
// runs (16 anneals of 1.5M steps plus the polish, keeping the top), and shipped in DAILY_BEST in
// index.html: 25 base-36 characters a day, square by square, each the index of that card in the deal.
// Days already in the table are kept; run it again to extend it (the game falls back to the phone's
// own search past the end). The engine (SCORING, makeDeck, makeSolver, dailyRng, dailyDeal) is read
// out of index.html itself, so the table always matches the game.
const fs = require("fs"), path = require("path"), os = require("os");
const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");
const FILE = path.join(__dirname, "index.html");

function engine(html) {
  const grab = name => { const i = html.indexOf("function " + name + "("), j = html.indexOf("{", i); let d = 0;
    for (let k = j; k < html.length; k++) { if (html[k] === "{") d++; else if (html[k] === "}" && --d === 0) return html.slice(i, k + 1); }
    throw new Error("can't find " + name); };
  const a = html.indexOf("const SCORING={"), b = html.indexOf("};", a) + 2;
  const src = html.slice(a, b) + "\n" + ["makeDeck", "makeSolver", "dailyRng", "dailyDeal"].map(grab).join("\n")
    + "\nreturn {SCORING, makeDeck, makeSolver, dailyDeal};";
  return new Function(src)();
}
function bestFor(E, day, runs) {
  const deal = E.dailyDeal(day), P = E.SCORING.american, S = E.makeSolver(deal, P), T0 = 2 * Math.max(P.flush, P.straight);
  let best = S.polish([...Array(25).keys()]);
  for (let r = 0; r < runs; r++) { const p = S.polish(S.anneal(1500000, T0, T0 / 100).grid); if (p.score > best.score) best = p; }
  return { code: best.grid.map(i => i.toString(36)).join(""), score: best.score };
}

if (!isMainThread) {
  const E = engine(fs.readFileSync(FILE, "utf8"));
  for (const day of workerData.days) parentPort.postMessage({ day, ...bestFor(E, day, workerData.runs) });
  process.exit(0);
}

const days = +process.argv[2] || 400, runs = +process.argv[3] || 16;
let html = fs.readFileSync(FILE, "utf8");
const epoch = /const DAILY_EPOCH="(\d{4}-\d{2}-\d{2})"/.exec(html)[1];
const m = /const DAILY_BEST="([0-9a-z]*)";/.exec(html); if (!m) throw new Error("DAILY_BEST not found");
const have = Math.floor(m[1].length / 25);
const dayOf = k => new Date(Date.parse(epoch) + k * 864e5).toISOString().slice(0, 10);
const todo = []; for (let k = have; k < days; k++) todo.push(dayOf(k));
if (!todo.length) { console.log(`DAILY_BEST already covers ${have} days from ${epoch}`); process.exit(0); }
const n = Math.max(1, Math.min(os.cpus().length, todo.length)), out = {}; let done = 0; const t0 = Date.now();
console.log(`${todo.length} days (${todo[0]} to ${todo[todo.length - 1]}) on ${n} threads, ${runs} runs a day`);
let live = n;
for (let w = 0; w < n; w++) {
  const wk = new Worker(__filename, { workerData: { days: todo.filter((_, i) => i % n === w), runs } });
  wk.on("message", r => { out[r.day] = r.code; if (++done % 20 === 0 || done === todo.length) console.log(`${done}/${todo.length}  ${r.day}  best ${r.score}  ${Math.round((Date.now() - t0) / 1000)}s`); });
  wk.on("exit", () => { if (--live) return;
    const table = m[1].slice(0, have * 25) + todo.map(d => out[d]).join("");
    if (table.length !== days * 25) throw new Error("incomplete table");
    html = fs.readFileSync(FILE, "utf8").replace(/const DAILY_BEST="[0-9a-z]*";/, `const DAILY_BEST="${table}";`);
    fs.writeFileSync(FILE, html);
    console.log(`DAILY_BEST: ${days} days from ${epoch} through ${dayOf(days - 1)}`); });
}
