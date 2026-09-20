/* Head-to-head: the new lead policy against the old one, at the same table.
   Everything but chooseLead is pulled straight out of the two index.html files. */
const fs=require("fs");
function grab(src,name){
  const i=src.indexOf("function "+name+"(");
  if(i<0) throw new Error("not found: "+name);
  let d=0,st=false;
  for(let j=i;j<src.length;j++){const c=src[j];
    if(c==="{"){d++;st=true;} else if(c==="}"){d--; if(st&&d===0) return src.slice(i,j+1);} }
  throw new Error("unbalanced: "+name);
}
const NEW=fs.readFileSync(process.argv[2] || __dirname + "/index.html","utf8");

function makePolicy(kind){
  const common=["makeDeck","shuffle","dist8","trickWinnerIndex","legalCards","cardBeatsCurrent"];
  const src=NEW;
  let code=common.map(n=>grab(src,n)).join("\n");
  code+="\n"+grab(src,"strength");
  if(kind==="new") code+="\n"+grab(src,"leadPressure")+"\n"+grab(src,"chooseLead");
  else code+=`
    function chooseLead(p,legalIdx){
      const needTrick=p.tricks===0, cardsLeft=p.hand.length;
      const sorted=[...legalIdx].sort((a,b)=>strength(p.hand[b])-strength(p.hand[a]));
      return (needTrick||cardsLeft<=2)?sorted[0]:sorted[Math.min(sorted.length-1,1)];
    }`;
  code+="\n"+grab(src,"cpuPlay");
  code+="\nfunction doPlay(seat,idx){ picked=idx; }";
  const wrapped=new Function(`
    let R=null, picked=-1;
    ${code}
    return function(r){ R=r; picked=-1; cpuPlay(r.turn); return picked; };
  `)();
  return wrapped;
}
const POL={ new:makePolicy("new"), old:makePolicy("old") };

function deck(){const d=[];for(let s=0;s<4;s++)for(let r=2;r<=14;r++)d.push({r,s});
  for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}return d;}

function playHand(kinds, handSize){
  const d=deck(), n=kinds.length;
  const players=kinds.map(()=>({hand:[],tricks:0,alive:true}));
  for(let k=0;k<handSize;k++) players.forEach(p=>p.hand.push(d.pop()));
  const trump=d.pop().s;
  const R={phase:"play",turn:0,players,gameType:"suits",trump,trick:[],handSize};
  let leader=0;
  for(let t=0;t<handSize;t++){
    R.trick=[];
    for(let k=0;k<n;k++){
      const seat=(leader+k)%n; R.turn=seat;
      const idx=POL[kinds[seat]](R);
      const card=players[seat].hand.splice(idx,1)[0];
      R.trick.push({p:seat,card});
    }
    const w=R.trick[trickWinner(R.trick,trump)].p;
    players[w].tricks++; leader=w;
  }
  return players.map(p=>p.tricks);
}
function trickWinner(trick,trump){
  const led=trick[0].card.s; let best=-1,bestVal=-1;
  trick.forEach((e,i)=>{ const isT=e.card.s===trump;
    if(!isT && e.card.s!==led) return;
    const v=e.card.r+(isT?100:0); if(v>bestVal){bestVal=v;best=i;} });
  return best;
}

function table(label, kinds, handSize, n){
  const tricks=kinds.map(()=>0), zero=kinds.map(()=>0);
  for(let i=0;i<n;i++){
    const rot=i%kinds.length;                                  // rotate seats, kill positional bias
    const order=kinds.map((_,j)=>kinds[(j+rot)%kinds.length]);
    const res=playHand(order,handSize);
    res.forEach((t,j)=>{ const orig=(j+rot)%kinds.length; tricks[orig]+=t; if(t===0) zero[orig]++; });
  }
  console.log(`  ${label}`);
  kinds.forEach((k,j)=>console.log(
    `    seat ${j} (${k.padEnd(3)})  avg tricks ${(tricks[j]/n).toFixed(3)}   shut out ${(100*zero[j]/n).toFixed(1)}%`));
}
console.log(`=== 7-card Suits hand, 40k hands per table (fair share = 1.750) ===`);
table("1 new vs 3 old:", ["new","old","old","old"], 7, 40000);
table("1 old vs 3 new:", ["old","new","new","new"], 7, 40000);
table("2 v 2:        ", ["new","old","new","old"], 7, 40000);
