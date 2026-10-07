/* ============================================================
   Game Night standard setup sheet - one start screen for every game.

   The rule this file exists to enforce: the Start button never needs a scroll.
   The sheet fills the screen under the standard header, the options scroll in
   the middle if they ever have to, and the footer with Start is pinned to the
   bottom. A game can't push Start off-screen by adding an option, because Start
   isn't in the flow the options are in.

   Markup, right after the game's .gn-hdr:

     <div class="gn-setup" id="setup">
       <div class="gn-setup-body">
         <p class="gn-pitch">One sentence on what you're doing.</p>
         <label class="gn-field">Your name <input id="nameIn" placeholder="You"></label>
         <div class="gn-row"><span>Players</span> ...segmented control... </div>
         <details class="gn-more"><summary>More options</summary>
           ...tips, deck, speed, CARDSIZE.rowsHTML(), sound...
         </details>
       </div>
       <div class="gn-setup-foot">
         <button class="gn-start" id="startBtn">Deal</button>
         <button class="gn-alt">Join a friend's game</button>   (optional, at most one)
       </div>
     </div>

   Rules of the standard:
   - Name first, then at most three key choices as one-line rows, everything else
     under "More options". No "How to play" button - Rules is in the header. No X -
     the sheet is the start of the game, not a pop-up over it.
   - One primary Start button, gold, full width. At most one secondary (.gn-alt).
   - The game's own state (how it decides the sheet shows) is unchanged:
     GNSETUP.show(el) / GNSETUP.hide(el), or toggle the "hidden" attribute.

   Loaded in <head> after gn-header.js. Must stay in sw.js ASSETS.
   ============================================================ */
(function(){
  var css =
    ".gn-setup{position:fixed;left:0;right:0;top:var(--gn-top,96px);bottom:0;z-index:45;display:flex;flex-direction:column;"
   +  "background:var(--felt,#0f4a2c);color:var(--cream,#f7f3e8);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}"
   +".gn-setup[hidden]{display:none!important}"
   +".gn-setup-body{flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:4px 16px 12px;"
   +  "width:100%;max-width:520px;margin:0 auto;box-sizing:border-box}"
   +".gn-setup-foot{flex:0 0 auto;width:100%;max-width:520px;margin:0 auto;box-sizing:border-box;"
   +  "padding:10px 16px calc(12px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:8px;"
   +  "background:linear-gradient(to bottom,rgba(0,0,0,0),rgba(0,0,0,.28) 30%)}"
   +".gn-pitch{margin:2px 0 12px;font-size:14px;line-height:1.35;opacity:.85}"
   +".gn-field{display:block;font-size:12px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:var(--gold,#f0c674);margin:0 0 12px}"
   +".gn-field input{display:block;width:100%;box-sizing:border-box;margin-top:5px;font:600 17px/1.2 inherit;font-family:inherit;"
   +  "padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.28);color:var(--cream,#f7f3e8);"
   +  "letter-spacing:0;text-transform:none}"
   +".gn-row{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:40px;margin:0 0 8px;flex-wrap:wrap}"
   +".gn-row>span:first-child{font-size:14px;font-weight:700;white-space:nowrap}"
   +".gn-row .gn-note{flex-basis:100%;font-size:12px;opacity:.7;margin-top:-2px}"
   +".gn-more{margin:4px 0 0;border-top:1px solid rgba(255,255,255,.14);padding-top:2px}"
   +".gn-more>summary{list-style:none;cursor:pointer;font-size:14px;font-weight:700;color:var(--gold,#f0c674);padding:10px 0;"
   +  "-webkit-user-select:none;user-select:none}"
   +".gn-more>summary::-webkit-details-marker{display:none}"
   +".gn-more>summary::after{content:' \\25BE';opacity:.8}.gn-more[open]>summary::after{content:' \\25B4'}"
   +".gn-start{width:100%;min-height:50px;border:none;border-radius:14px;background:var(--gold,#f0c674);color:var(--ink,#1b1b1b);"
   +  "font:800 18px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;cursor:pointer;margin:0;"
   +  "box-shadow:0 3px 0 rgba(0,0,0,.3)}"
   +".gn-start:active{transform:translateY(1px);box-shadow:0 2px 0 rgba(0,0,0,.3)}"
   +".gn-start:disabled{opacity:.5}"
   +".gn-alt{width:100%;min-height:42px;border:1px solid rgba(255,255,255,.3);border-radius:12px;background:transparent;"
   +  "color:var(--cream,#f7f3e8);font:700 15px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;cursor:pointer;margin:0}"
   +"@media (max-height:600px){.gn-pitch{margin-bottom:8px;font-size:13px}.gn-row{min-height:36px;margin-bottom:6px}"
   +  ".gn-field{margin-bottom:8px}.gn-field input{padding:8px 10px}.gn-start{min-height:46px}.gn-alt{min-height:38px}}";
  var st=document.createElement("style"); st.id="gn-setup-css"; st.textContent=css;
  (document.head||document.documentElement).appendChild(st);

  // The sheet starts where the header ends. Measured, not hardcoded: the header is
  // one row plus the name line, plus a dedication line in two games.
  function layout(){
    var h=document.querySelector(".gn-hdr"), top=0;
    if(h){ var r=h.getBoundingClientRect(); top=Math.max(0,Math.round(r.bottom+scrollY)); }
    document.documentElement.style.setProperty("--gn-top", top+"px");
  }
  function show(el){ if(typeof el==="string") el=document.getElementById(el); if(!el) return; scrollTo(0,0); layout(); el.hidden=false; }
  function hide(el){ if(typeof el==="string") el=document.getElementById(el); if(el) el.hidden=true; }

  window.GNSETUP={layout:layout, show:show, hide:hide};
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",layout); else layout();
  addEventListener("load",layout); addEventListener("resize",layout);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
})();
