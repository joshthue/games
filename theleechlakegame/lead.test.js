/* Pulls the lead-choice functions straight out of the shipped index.html and
   measures what the opening leader actually plays. No second implementation. */
const fs = require("fs");
const path = process.argv[2] || __dirname + "/index.html";
const src = fs.readFileSync(path, "utf8");

function grab(name){
  const i = src.indexOf("function " + name + "(");
  if(i < 0) throw new Error("not found: " + name);
  let d = 0, started = false;
  for(let j = i; j < src.length; j++){
    const c = src[j];
    if(c === "{"){ d++; started = true; }
    else if(c === "}"){ d--; if(started && d === 0) return src.slice(i, j+1); }
  }
  throw new Error("unbalanced: " + name);
}

const NEEDED = ["makeDeck","shuffle","dist8","trickWinnerIndex","legalCards","strength","leadPressure","chooseLead"];
const LEGACY = !src.includes("function chooseLead(");       // pre-fix build
const names  = NEEDED.filter(n => !(LEGACY && (n === "strength" || n === "leadPressure" || n === "chooseLead")));
let R = null;
eval(names.map(grab).join("\n"));

if(LEGACY){                                                  // reconstruct the old behaviour
  var strength = c => R.gameType==="low" ? (16-c.r) : R.gameType==="closest8" ? (8-dist8(c.r)) : c.r + (R.gameType==="suits"&&c.s===R.trump?100:0);
  var chooseLead = (p, legalIdx) => {
    const needTrick = p.tricks===0, cardsLeft = p.hand.length;
    const sorted=[...legalIdx].sort((a,b)=>strength(p.hand[b])-strength(p.hand[a]));
    return (needTrick||cardsLeft<=2) ? sorted[0] : sorted[Math.min(sorted.length-1,1)];
  };
}

const S = ["♣","♦","♥","♠"], RK = {11:"J",12:"Q",13:"K",14:"A"};
const show = c => (RK[c.r] || c.r) + S[c.s];

function openingDeal(players, handSize){
  const deck = shuffle(makeDeck());
  const hands = Array.from({length: players}, () => []);
  for(let k = 0; k < handSize; k++) for(let i = 0; i < players; i++) hands[i].push(deck.pop());
  return { hands, flip: deck.pop() };
}

function run(label, players, handSize, n){
  let trumpLed = 0, ledWithTrumpInHand = 0, hadTrump = 0;
  const suitCount = {};
  for(let t = 0; t < n; t++){
    const { hands, flip } = openingDeal(players, handSize);
    R = { gameType: "suits", trump: flip.s, handSize, trick: [] };
    const p = { hand: hands[0], tricks: 0 };
    const legalIdx = legalCards(p.hand, R.gameType, R.trick).slice();
    const card = p.hand[chooseLead(p, legalIdx)];
    const holds = p.hand.some(c => c.s === R.trump);
    if(holds) hadTrump++;
    if(card.s === R.trump){ trumpLed++; if(holds) ledWithTrumpInHand++; }
    const k = show(card).slice(0, -1);
    suitCount[k] = (suitCount[k] || 0) + 1;
  }
  console.log(`${label.padEnd(26)} trump led ${(100*trumpLed/n).toFixed(1).padStart(5)}%` +
              `   (holds a trump ${(100*hadTrump/n).toFixed(1)}% of deals;` +
              ` leads it ${(100*ledWithTrumpInHand/hadTrump).toFixed(1)}% of those)`);
  const ranks = Object.entries(suitCount).sort((a,b)=>b[1]-a[1]).slice(0,6)
    .map(([r,c]) => `${r}:${(100*c/n).toFixed(0)}%`).join("  ");
  console.log(`${" ".repeat(26)} lead rank spread  ${ranks}`);
}

console.log(LEGACY ? "=== BEFORE (old cpuPlay lead) ===" : "=== AFTER (chooseLead) ===");
run("opening 7-card flip hand", 4, 7, 20000);
run("mid series, 4 cards", 4, 4, 20000);
run("endgame, 2 cards", 4, 2, 20000);
