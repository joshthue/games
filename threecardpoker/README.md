# Three-Card Poker

A single-file, play-in-the-browser version of casino **Three-Card Poker** —
you against the dealer, with a chip bankroll.

## How it plays

- Put up an **Ante** (and an optional **Pair Plus** side bet), then you're dealt three cards.
- Look at your hand and choose **Play** (match your ante) or **Fold**.
- The dealer needs **Queen-high or better** to qualify. If the dealer doesn't qualify,
  your Ante pays 1:1 and the Play bet is returned. If the dealer qualifies, the higher
  hand wins both bets (a tie pushes).
- Hand ranking (high to low): straight flush, three of a kind, **straight**, flush, pair,
  high card — note a straight beats a flush with only three cards.

## Payouts

- **Ante bonus** (paid even if the dealer beats you): straight 1:1, three of a kind 4:1, straight flush 5:1.
- **Pair Plus**: pair 1:1, flush 3:1, straight 6:1, three of a kind 30:1, straight flush 40:1.

## Start screen

The standard Game Night setup sheet (`../gn-setup.js`): a one-line pitch, your name and
the Tips row up front, then **More options** (four-color deck, speed play, card size,
card text). **Sit down** is pinned to the bottom of the screen, so it never needs a
scroll. Menu → New session brings the sheet back.

## Options

- Starts with a **100-chip** bankroll (re-buy when you bust).
- **Four-color deck** and **Speed play** (both on by default).
- **Learning tips** with a live Play/Fold hint using the Q-6-4 rule (off by default).

## Sound

Sound comes from `../sfx.js`, the shared Game Night sound layer — synthesized with
WebAudio, so there are no audio files to load and it works offline. The setting is stored
once for the whole origin, so muting in any Game Night game mutes them all. iOS won't let
a page make noise before the first touch, so the audio context waits for a gesture.

## Card size and card text

Cards scale with the shared **S / M / L / XL** control (`../cardsize.js`), in Menu and
under More options on the start screen. The steps are multipliers (0.86 / 1 / 1.2 / 1.4)
rather than pixel sizes, because the games don't share a base card size — a multiplier
scales each game from its own design. The choice is stored once for the whole origin,
like the mute key, so the size you pick here is the size in every Game Night card game.

XL is deliberately larger than a 7-card hand fits on one row on a small phone: past
about 390px wide the hand wraps to two rows instead of overflowing, which is the
trade-off XL is for.

## Running it

Open `index.html` in a browser — no build step or dependencies. Works offline once
loaded, as part of the Game Night home-screen app.

**Card text** is a second shared S / M / L / XL (0.9 / 1 / 1.2 / 1.4) that scales only the
printed rank and pip (`--cardtext`), so big print doesn't need big cards. Verified at card
size XL + card text XL on a 320px phone: nothing prints outside its card.
