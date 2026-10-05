/* ============================================================
   Game Night standard header - one source for every game.

   Markup a game uses, at the top of its page:
     <div class="gn-hdr">
       <div class="gn-top">
         <a class="gn-pill" href="../">‹ Games</a><span class="sp"></span>
         ...the game's own pills...  <button class="gn-pill" id="rulesBtn">Rules</button>  <button class="gn-pill" id="menuBtn">Menu</button>
       </div>
       <h1 class="gn-name">Game name</h1>
     </div>

   Rules of the standard: text pills only (no emoji or suit glyphs), the name on its
   own line in gold Georgia, no subtitles, and the name never wraps - fit() shrinks
   the type to the line instead. A dedication line (e.g. "Grandma Jo's game") may sit
   under the name as <div class="gn-sub">. A game that needs a compact status on the name's line
   (Bar Dice: jackpot + ATM) wraps the h1 in <div class="gn-namerow"> and puts it after the h1;
   the name still shrinks rather than wraps.

   Loaded in <head> so the style is there before first paint. The page keeps its own
   button ids and handlers; this file only styles and fits. Must stay in sw.js ASSETS.
   ============================================================ */
(function(){
  var css =
    ".gn-hdr{width:100%;margin:0 0 8px}"
   +".gn-top{display:flex;gap:6px;align-items:center}"
   +".gn-top .sp{flex:1}"
   +".gn-top .gn-pill{background:rgba(255,255,255,.13);color:var(--cream,#f7f3e8);border:none;border-radius:10px;padding:8px 11px;"
   +  "font:700 13px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;text-decoration:none;white-space:nowrap;"
   +  "cursor:pointer;box-shadow:none;margin:0;letter-spacing:0;text-transform:none}"
   +".gn-top .gn-pill:active{background:rgba(255,255,255,.22)}"
   +"h1.gn-name{font-family:Georgia,'Times New Roman',serif;color:var(--gold,#f0c674);font-size:28px;line-height:1.15;font-weight:400;"
   +  "font-style:normal;letter-spacing:0;text-transform:none;text-shadow:none;margin:6px 0 0;padding:0;white-space:nowrap;overflow:hidden;text-align:left}"
   +".gn-namerow{display:flex;align-items:center;gap:8px}.gn-namerow h1.gn-name{flex:1 1 auto;min-width:0}"
   +".gn-sub{font-size:12.5px;color:var(--cream,#f7f3e8);opacity:.75;margin:1px 0 0;font-style:italic}";
  var st=document.createElement("style"); st.id="gn-header-css"; st.textContent=css;
  (document.head||document.documentElement).appendChild(st);
  function fit(){
    var els=document.querySelectorAll("h1.gn-name");
    for(var i=0;i<els.length;i++){ var el=els[i], s=28; el.style.fontSize=s+"px";
      while(el.scrollWidth>el.clientWidth && s>16){ s--; el.style.fontSize=s+"px"; } }
  }
  window.GNHEADER={fit:fit};
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",fit); else fit();
  addEventListener("load",fit); addEventListener("resize",fit);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
})();
