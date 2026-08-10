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

## Options

- Starts with a **100-chip** bankroll (re-buy when you bust).
- **Four-color deck** and **Speed play** (both on by default).
- **Learning tips** with a live Play/Fold hint using the Q-6-4 rule (off by default).

## Running it

Open `index.html` in a browser — no build step or dependencies. Works offline once
loaded, as part of the Game Night home-screen app.
