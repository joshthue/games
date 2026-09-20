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

  window.CARDSIZE={ STEPS:STEPS, idx:idx, value:value, apply:apply, choose:choose, controlHTML:controlHTML };
  apply();
})();
