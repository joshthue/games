# 3-5-7

The bar-table poker game, you vs 3 to 5 bots. Everybody antes, then the deals go **3 cards,
5 cards, 7 cards** and around again. After each deal everyone drops **in** or **out** at once
(at the table: a chip in a closed fist, "1, 2, 3, drop"). The best hand still in wins a
**leg**; everyone else who stayed in **matches the pot**, so it grows. Alone in wins a free
leg; nobody in, next deal. First to the legs target takes the whole pot, and a new game
antes up. Each deal's own number is wild by default (3s, then 5s, then 7s), so five of a
kind is live and tops a straight flush.

Your net carries across games for the session (Menu → New session resets it).

## House-rule toggles (setup → More options)
- **Players** 4 / 5 / 6 · **Legs to win** 3 / 4 / 5 (key rows)
- **Wild cards** — the deal's own number / 3s, 5s & 7s every deal / none
- **3-card deal** — pairs & trips only (default) / also straights & flushes, ranked the
  Three-Card Poker way (straight above flush)
- **Alone in** — wins a leg (default) / wins nothing
- **Match cap** — $2 / $5 (default) / $10 / none. A loser pays the pot or the cap, whichever
  is less; with no cap the pot grows by the number of losers every showdown.
- **Forced** — off by default. Each player's first card is dealt face up; whoever shows the
  highest upcard (everyone tied for it) is forced in, and a forced player who loses pays
  only **half** the match (rounded to the cent). Upcards are by printed rank, so a wild
  showing face up counts as its own number for this.
- **Ante** 25¢ / 50¢ / $1 · **Bots** Easy / Normal · Speed · card size and card text

Ties: everyone tied for best gets a leg and none of them pay. If two reach the target on
the same deal they split the pot.

## Engine — `window.TFS`, no DOM
Money is integer cents. `newMatch(opts)` → `startGame` (ante) → `deal` → `resolve(M, ins)`
returns the showdown (`evals`, `legWinners`, `losers`, `pays`, `gameWinners`, `won`) and
advances the deal size. `resolve` forces `ins` on for forced players itself, so a caller
can't let one slip out.

**Hand evaluation with wilds** (`best`). A wild can copy any card, so using every wild you
hold (up to the hand size) is never worse than holding one back. It takes `min(wilds, size)`
wilds, tries each set of naturals for the rest of the hand (best 5 of 7), and each multiset
of ranks for the wilds. Flush is on when the naturals share a suit. `wildCands` limits a
wild to ranks that can matter: ones you hold, an ace, or a rank inside a straight window
around your naturals. That cut the 7-card all-wild case from ~120 ms to ~20 ms per
160-sample bot decision. It was checked against the unpruned 13-rank brute force on 48,000
wild-heavy hands, with 0 mismatches. Duplicate cards from wilds are allowed (five aces is a
hand).

**Bots.** `strength()` is a Monte Carlo share of random hands from the unseen cards that
this hand beats (ties count half). `threshold()` is the strength a steady player wants
before staying in:

- It starts at `0.56 + 0.095·√opponents`, about 72% at 3 opponents and 77% at 5.
- −7 points when you're one leg from the pot.
- −5 points when an opponent is one leg away (stay in to block them).
- −4 points once the pot is past the match cap.

Normal bots use that ±4 points of noise plus a 5% stab. Easy bots use a flat ~60% ±15
points. Bots decide without seeing your choice.

## UI
Opponent seats show small face-down cards (with their upcard under Forced). At showdown,
stayers' hands turn face up with wilds outlined gold and the cards used in the best five
raised, along with a short hand name and the leg or the payment. The center shows the
3·5·7 track, the pot and what's wild. Your hand is always face up, with your best hand
named under it.

**Teaching mode** puts a coach line on every decision, built from the bots' own
`strength`/`threshold`: what your hand beats and what a steady player wants here
(including leg-race adjustments), then *stay in* or *drop out*. After the reveal it tells
you whether a drop was right.

## Testing
`node engine.test.js` pulls the engine block out of `index.html` and evals it.

- Rules checks: wilds in all three deal sizes and all three wild modes, wheel and inside
  straights, wild flushes, five of a kind, ante, matching, cap, lone leg, nobody in, ties,
  the 7→3 wrap, and money conservation.
- Forced checks: the high upcard (ties included) is forced, a forced player can't drop, a
  forced loser pays half, and forced bots always stay in.
- A soak of 432 bot sessions across every combination of players × legs × wilds × alone-in
  × forced, with random cap and 3-card mode. Every game ended (avg 12 deals, max ~40, ~5%
  all-out deals) with no duplicate cards, legs in range, money conserved every deal and the
  pot paid out exactly.

The Playwright pass, a scratch harness that isn't in the repo, played full games at
320×568, 390×844 and 430×932 with the real safe-area insets swapped into the served CSS, at
card size/text S and XL, with 4 and 6 players and Forced on. It found no page scroll, no
button under the home bar, no hand overflow and no console errors.

## Test door
`window.__TF` exposes `M`, `busy`, `choose(stay)`, `next()`, `start()`, `overOpen()`,
`again()`.
