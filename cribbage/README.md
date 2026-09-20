# Cribbage

A single-file, play-in-the-browser game of **Cribbage** — the classic race to **121**.
Play against the computer or pass-and-play on two phones.

## How it plays

- Standard cribbage scoring: fifteens, pairs, runs, flushes, nobs, and the play/pegging.
- First to 121 points wins.

## Sound

Sound comes from `../sfx.js`, the shared Game Night sound layer — synthesized with
WebAudio, so there are no audio files to load and it works offline. The setting is stored
once for the whole origin, so muting in any Game Night game mutes them all. iOS won't let
a page make noise before the first touch, so the audio context waits for a gesture.

## Card size

Cards scale with the shared **S / M / L / XL** control (`../cardsize.js`), which sits
next to the four-color deck toggle. The steps are multipliers (0.86 / 1 / 1.2 / 1.4)
rather than pixel sizes, because the games don't share a base card size — a multiplier
scales each game from its own design. The choice is stored once for the whole origin,
like the mute key, so the size you pick here is the size in every Game Night card game.

XL is deliberately larger than a 7-card hand fits on one row on a small phone: past
about 390px wide the hand wraps to two rows instead of overflowing, which is the
trade-off XL is for.

## Running it

Open `index.html` in a browser — no build step or dependencies. Works offline once
loaded, as part of the Game Night home-screen app.
