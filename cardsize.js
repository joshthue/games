/* ============================================================
   Shared card-size control — Game Night
   One scale, one key, every card game.

   Blackjack had this first as a private S/M/L on its own bj_size key and an A± button
   in the header. This generalises that: the same --size multiplier, one origin-wide key
   so a size picked in one game is the size in all of them (the sfx.js mute-key model),
   and a segmented S/M/L/XL control games drop in beside their four-color toggle.

   The steps are MULTIPLIERS, not pixels, because the games do not share a base card
   size (44x62 in the trick-takers, 52x74 in Three-Card Poker and Poker Squares, a vw
   clamp in Blackjack). A shared pixel value would be too big in one game and too small
   in the next; a shared multiplier scales each game from its own designed size.

   XL is the largest step that clears 320px in the most constrained game with its widest
   hand on screen — measured, not guessed. Re-measure before changing it: the binding
   constraint is a 7-card hand at 320px, and past XL the hand overflows the viewport.

   localStorage can throw (private windows, blocked site data), so every read and write
   is wrapped and falls back to an in-memory value — a storage failure must not wedge
   the control, exactly as sfx.js does for mute.
   ============================================================ */
(function(){
  var KEY="gn_cardsize";
  var STEPS=[{k:"S",v:0.86},{k:"M",v:1},{k:"L",v:1.2},{k:"XL",v:1.4}];
  var mem=null;

  function read(){ try{ var v=localStorage.getItem(KEY); if(v!==null) return v; }catch(e){} return mem; }
  function write(v){ mem=v; try{ localStorage.setItem(KEY,v); }catch(e){} }

  function idx(){ var i=parseInt(read(),10); return (i>=0 && i<STEPS.length) ? i : 1; }   // default M
  function apply(){
    var el=document.documentElement;
    if(!el) return;
    el.style.setProperty("--size", STEPS[idx()].v);
    // data-cardsize lets a game restyle at a particular step - I'm out, Jerry! swaps the
    // rank and the suit at XL - without any game needing to subscribe to changes.
    el.setAttribute("data-cardsize", STEPS[idx()].k);
  }
  function value(){ return STEPS[idx()].v; }
  function choose(i,btn){
    write(String(i)); apply();
    var seg = btn && btn.parentNode;
    // repaint the control in place rather than rebuilding the panel, so this works
    // identically from the in-game menu and the pre-game setup screen
    if(seg) [].forEach.call(seg.children, function(b,n){ b.classList.toggle("on", n===i); });
    if(typeof window.onCardSize==="function") window.onCardSize();
  }
  function controlHTML(){
    var i=idx();
    return '<span class="seg cardsize">'+STEPS.map(function(s,n){
      return '<button type="button" class="'+(n===i?"on":"")+'" onclick="CARDSIZE.choose('+n+',this)">'+s.k+'</button>';
    }).join("")+'</span>';
  }

  window.CARDSIZE={ STEPS:STEPS, idx:idx, value:value, apply:apply, choose:choose, controlHTML:controlHTML,
    rowsHTML:function(opts){ return rowsHTML(opts); } };
  apply();

  /* ---- Card text: the size of the rank and suit on the face, separate from the card ----
     Same model as card size - one origin-wide key, a multiplier, an in-memory fallback - but
     it scales only the printed rank/pip, through --cardtext. A game multiplies its card text
     by it:  font-size: calc(13px * var(--size) * var(--cardtext,1)).  The ,1 fallback means a
     game that forgets to load this file still renders at normal size.

     It exists because a bigger card and bigger print are different needs: big rank text on a
     normal card keeps a 7-card hand on a 320px phone, which an XL card can't.

     Bigger print does NOT fit every card face as designed. A face with a corner rank, a
     centre pip and a mirrored corner has room for four symbols at M; at 1.2-1.4x they pile
     into each other on a small card (v130: I'm out, Jerry! at XL/XL was unreadable). A game
     whose face collides switches to an INDEX face under html[data-cardtext="L"|"XL"] -
     rank top-left, suit bottom-right, nothing else (Jerry, Blackjack, Cribbage at XL).
     "Stays inside the card" is not the test; "the pieces don't overlap each other" is -
     measure it across every size x text step (scratch harness: overlap.mjs). */
  var TKEY="gn_cardtext";
  var TSTEPS=[{k:"S",v:0.9},{k:"M",v:1},{k:"L",v:1.2},{k:"XL",v:1.4}];
  var tmem=null;
  function tread(){ try{ var v=localStorage.getItem(TKEY); if(v!==null) return v; }catch(e){} return tmem; }
  function twrite(v){ tmem=v; try{ localStorage.setItem(TKEY,v); }catch(e){} }
  function tidx(){ var i=parseInt(tread(),10); return (i>=0 && i<TSTEPS.length) ? i : 1; }
  function tapply(){
    var el=document.documentElement; if(!el) return;
    el.style.setProperty("--cardtext", TSTEPS[tidx()].v);
    el.setAttribute("data-cardtext", TSTEPS[tidx()].k);
  }
  function tchoose(i,btn){
    twrite(String(i)); tapply();
    var seg = btn && btn.parentNode;
    if(seg) [].forEach.call(seg.children, function(b,n){ b.classList.toggle("on", n===i); });
    if(typeof window.onCardSize==="function") window.onCardSize();
  }
  function tcontrolHTML(){
    var i=tidx();
    return '<span class="seg cardtext">'+TSTEPS.map(function(s,n){
      return '<button type="button" class="'+(n===i?"on":"")+'" onclick="CARDTEXT.choose('+n+',this)">'+s.k+'</button>';
    }).join("")+'</span>';
  }
  window.CARDTEXT={ STEPS:TSTEPS, idx:tidx, value:function(){ return TSTEPS[tidx()].v; }, apply:tapply, choose:tchoose, controlHTML:tcontrolHTML };
  tapply();

  // The two standard setup-sheet / menu rows. {size:false} for a game whose cards can't grow
  // (BINGO's squares, a fixed board) - those still get Card text.
  function rowsHTML(opts){
    opts=opts||{};
    var h='';
    if(opts.size!==false) h+='<div class="gn-row"><span>Card size</span>'+controlHTML()+'</div>';
    h+='<div class="gn-row"><span>'+(opts.textLabel||'Card text')+'</span>'+tcontrolHTML()+'</div>';
    return h;
  }
})();
