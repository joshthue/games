# Hold'em — 6-Player Sit & Go

A single-file, play-in-the-browser **Texas Hold'em tournament**: you against five
computer opponents, six-max, rising blinds, last one standing wins. This is real
Hold'em against a table — not the casino you-vs-the-dealer game in
[`ultimatetexasholdem/`](../ultimatetexasholdem/).

## How it plays

- **6, 8 or 9 players**, 5,000 chips each. Blinds start at 10/20 and go up every few hands.
- Two hole cards each, five community cards: **preflop → flop → turn → river → showdown**.
- Bust and you're out. When you're knocked out the rest of the table plays on so the
  finishing order you're shown is the real one.
- Finishes are kept locally — games played, wins, top-3s, average finish.

## The rules it actually implements

The betting engine is the point of this one; the fiddly cases are all handled:

- **Side pots** — every all-in creates its own pot with its own eligibility list, built
  from each player's total contribution. Folded players' chips stay in the pots they paid into.
- **Min-raise re-opening** — a raise must be at least the size of the last one, and an
  all-in *short* of a full raise does **not** re-open the betting for anyone who already acted.
  They can call or fold, nothing else.
- **Uncalled bets** are returned before the board runs out.
- **Heads-up** — the button posts the small blind, acts first preflop and last after the flop.
- **Split pots** — odd chips go to the first player left of the button.
- **Dead button** — as players bust, the big blind always advances one live player, so the
  small blind and the button can land on an empty seat.

## The opponents

Each bot is drawn from a pool of personalities — The Rock, Nitwit, Tag, Grinder,
Wildcard, Calls-a-Lot and Maniac — that differ in opening range, aggression and how
often they bluff. They open by position, tighten against big raises, and switch to
push-or-fold once they're short-stacked. After the flop they estimate their equity by
Monte Carlo against a range and weigh it against the pot odds.

Measured over ~58,000 hands of bots-versus-bots, they play like their labels: The Rock
runs about 16% VPIP / 10% PFR, Calls-a-Lot 37% / 7%, Maniac 44% / 42%.

## Options

- **Table size**: 6, 8 or 9 players, picked before a tournament starts. A fuller table
  plays tighter and runs longer (roughly 84, 92 and 99 hands respectively).
- **Blind speed**: Turbo (~20 min), Standard (~30), Marathon (~40). Turbo is the default.
- **Text size**: S / M / L / XL, applied immediately — useful on a tablet, where the
  felt gets much bigger and the default type can look small.
- **Felt logo**: Birch & Gran, Loonatic Cannabis, a plain Hold'em wordmark, or none.
- **Four-color deck** and **Speed play** on by default; **Tips** (pot odds and each
  opponent's playing style) off by default.
- A tournament in progress is saved between hands, so you can close the app and come back.

## The felt watermark

Two brand marks ship with the game, both built to read as watermarks on a dark ground
rather than as pasted-on images.

**Birch & Gran** is drawn as inline SVG straight from the brand kit's own rules: on a dark
field the wordmark and birch go paper cream and the ornament gold *lifts* to `#C6A868`,
because lichen is unreadable on a dark ground and gold is never set as text. Birch above,
wordmark, gold rule and diamond, tagline — the letterhead lockup, vertically stacked.

**Loonatic Cannabis** is the real artwork, not a redrawing — the loon has far too much in
it to reproduce by hand and still be the same mark. The supplied image is cropped to the
primary lockup, its photographic lake background keyed out by luminance (black point 75 —
low enough to keep the arch, CANNABIS and the leaf, high enough that the mist and aurora
don't leave a ghost rectangle on the felt), tinted paper cream, and embedded as a 13 KB
WebP data URI so the game stays a single self-contained file.

## Laying out the table

Seats aren't a hand-maintained coordinate table — they're placed on an ellipse with the
player pinned at the bottom, so 6, 8 and 9 all fall out of one formula. The widest a seat
can be without overhanging the felt is computed from the same geometry, so no table size
can produce horizontal scroll.

Everything on the felt is sized in container-query units against the table's own width,
so the whole table scales together from a 320px phone to a tablet; the text-size setting
is a multiplier on top of that. With 8 or 9 seats the side seats sit level with the board,
so the board narrows and anything that would land on it — bet chips, the dealer button —
is pushed to the near edge.

## How it's put together

Two script blocks. The first is the pure rules engine — card evaluator, betting engine,
bots — with no DOM access at all; the second is the table UI. Nothing in the first block
knows who is choosing the actions, which is what would let a networked table reuse it
unchanged.

The evaluator was checked exhaustively against an independently written brute-force
reference over all 2,598,960 five-card hands, producing exactly the 7,462 distinct hand
values a correct evaluator must. The betting engine was soaked over tens of thousands of
hands asserting chips are conserved, no stack goes negative, every hand terminates, the
pots always equal what was committed, and side-pot eligibility is properly nested.

## Running it

Open `index.html` in a browser — no build step or dependencies. Works offline once
loaded, as part of the Game Night home-screen app.
