# Ultimate Texas Hold'em

A single-file, play-in-the-browser version of casino **Ultimate Texas Hold'em** —
heads-up against the dealer with shared community cards.

## How it plays

- Post an **Ante** and an equal **Blind** to be dealt in (plus an optional **Trips** side bet).
- You get two hole cards; you and the dealer share five community cards for the best 5-card hand.
- You make **one Play bet**, and the earlier you commit the bigger it is:
  **4×/3×** after your hole cards, **2×** after the flop, or **1×** at the river — or **fold**.
- The dealer needs a **pair or better** to qualify. Play always pays on a win; the Ante pushes
  when the dealer doesn't qualify; the Blind pays a bonus only when you win with a straight or better.

## Payouts

- **Blind**: straight 1:1, flush 3:2, full house 3:1, quads 10:1, straight flush 50:1, royal 500:1.
- **Trips** (side bet, any outcome): trips 3:1, straight 4:1, flush 7:1, full house 8:1, quads 30:1, straight flush 40:1, royal 50:1.

## Options

- Starts with a **100-chip** bankroll (re-buy when you bust). Bets can't exceed what leaves you able to make a Play bet.
- **Four-color deck** and **Speed play** on by default.
- **Learning tips** with a live bet/check/fold rule-of-thumb (off by default).

## Running it

Open `index.html` in a browser — no build step or dependencies. Works offline once
loaded, as part of the Game Night home-screen app.
