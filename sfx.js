/* Game Night — shared sound effects.
 *
 * Everything here is SYNTHESIZED with WebAudio: no audio files, nothing to fetch, so it
 * works on a plane like the rest of the app. Load it once per game:
 *     <script src="../sfx.js"></script>
 * and add it to sw.js ASSETS. Then call SFX.play("deal") etc.
 *
 * The mute setting lives in localStorage under one key for the whole origin, so turning
 * sound off in Cribbage turns it off in Hold'em too — one setting for the app, which is
 * what a player expects from a home-screen app with a launcher.
 *
 * iOS/Safari will not let a page make noise until the user has touched it, so the context
 * is created lazily on the first gesture (SFX.arm() wires that up automatically on load).
 */
(function (global) {
  "use strict";

  var KEY = "gn_sound_on";
  var ctx = null, master = null, noiseBuf = null, armed = false;
  // Private browsing and blocked site-data make localStorage throw. Without this fallback
  // the mute toggle would appear to do nothing, because every read would answer "on".
  var memOn = null;

  function enabled() {
    try {
      var v = localStorage.getItem(KEY);
      if (v !== null) return v !== "0";
    } catch (e) {}
    return memOn === null ? true : memOn;
  }
  function setEnabled(on) {
    memOn = !!on;
    try { localStorage.setItem(KEY, on ? "1" : "0"); } catch (e) {}
    if (on) ensure();                       // so the toggle itself can make a sound
    return memOn;
  }

  function ensure() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return ctx; }
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    master = ctx.createGain();
    master.gain.value = 0.32;               // headroom: several of these can overlap
    master.connect(ctx.destination);
    // one second of white noise, reused by every noise-based sound
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }

  // --- tiny builders -------------------------------------------------------
  function env(node, t0, attack, decay, peak) {
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
    node.connect(g); g.connect(master);
    return g;
  }
  function tone(freq, t0, dur, type, peak, bendTo) {
    var o = ctx.createOscillator();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t0);
    if (bendTo) o.frequency.exponentialRampToValueAtTime(bendTo, t0 + dur);
    env(o, t0, 0.008, dur, peak == null ? 0.5 : peak);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noise(t0, dur, freq, q, peak, bendTo) {
    var s = ctx.createBufferSource(); s.buffer = noiseBuf;
    var f = ctx.createBiquadFilter();
    f.type = "bandpass"; f.frequency.setValueAtTime(freq, t0); f.Q.value = q || 1;
    if (bendTo) f.frequency.exponentialRampToValueAtTime(bendTo, t0 + dur);
    s.connect(f);
    env(f, t0, 0.004, dur, peak == null ? 0.5 : peak);
    s.start(t0); s.stop(t0 + dur + 0.05);
  }

  // --- the kit -------------------------------------------------------------
  // Keep these named for what HAPPENS, not what they sound like, so a game reads well:
  // SFX.play("illegal") not SFX.play("buzz").
  var KIT = {
    deal:    function (t) { noise(t, 0.13, 1900, 0.8, 0.35, 650); },
    flip:    function (t) { noise(t, 0.08, 3200, 1.2, 0.30, 1200); },
    place:   function (t) { noise(t, 0.09, 900,  1.0, 0.30, 380);
                            tone(150, t, 0.07, "sine", 0.22, 90); },
    select:  function (t) { tone(880, t, 0.035, "triangle", 0.18); },
    chip:    function (t) { noise(t, 0.035, 5200, 3, 0.35);
                            noise(t + 0.045, 0.035, 4300, 3, 0.26); },
    shuffle: function (t) { for (var i = 0; i < 7; i++)
                              noise(t + i * 0.055, 0.05, 1500 + Math.random() * 1600, 1.1, 0.16); },
    turn:    function (t) { tone(660, t, 0.10, "sine", 0.24);
                            tone(990, t + 0.09, 0.14, "sine", 0.20); },
    illegal: function (t) { tone(150, t, 0.13, "square", 0.16, 105); },
    good:    function (t) { [523.25, 659.25, 783.99].forEach(function (f, i) {
                              tone(f, t + i * 0.075, 0.20, "triangle", 0.26); }); },
    bad:     function (t) { tone(392, t, 0.16, "triangle", 0.22);
                            tone(293.66, t + 0.13, 0.28, "triangle", 0.20); },
    win:     function (t) { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
                              tone(f, t + i * 0.085, 0.30, "triangle", 0.30); });
                            noise(t + 0.34, 0.5, 5000, 0.7, 0.10, 2000); },
    lose:    function (t) { [440, 392, 349.23, 293.66].forEach(function (f, i) {
                              tone(f, t + i * 0.105, 0.26, "sine", 0.22); }); }
  };

  function play(name, when) {
    if (!enabled()) return;
    var c = ensure(); if (!c) return;
    if (c.state === "suspended") { c.resume(); }      // Safari parks it between gestures
    var fn = KIT[name]; if (!fn) return;
    try { fn(c.currentTime + (when || 0)); } catch (e) { /* never break a game over audio */ }
  }

  // First real gesture unlocks audio on iOS. Harmless everywhere else.
  function arm() {
    if (armed) return; armed = true;
    var go = function () { ensure(); };
    ["pointerdown", "touchstart", "keydown"].forEach(function (evt) {
      global.addEventListener(evt, go, { once: true, passive: true });
    });
  }

  global.SFX = {
    play: play,
    isOn: enabled,
    setOn: setEnabled,
    toggle: function () { return setEnabled(!enabled()); },
    arm: arm,
    names: Object.keys(KIT)
  };
  arm();
})(window);
