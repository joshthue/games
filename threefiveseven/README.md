# 3-5-7

The bar-table poker game, you vs 3 to 5 bots. Everybody antes, then the deals go **3 cards,
5 cards, 7 cards** and around again — you **carry** your hand up through a run by default
(your 3 grow to 5, then 7; a fresh 3 opens each new run). After each deal everyone drops **in** or **out** at once
(at the table: a chip in a closed fist, "1, 2, 3, drop"). The best hand still in wins a
**leg**; everyone else who stayed in **matches the pot**, so it grows. Alone in on the 3 or 5 wins a free
leg; on the 7 the **Fester** rule makes you beat the deck. Nobody in, next deal. First to the legs target takes the whole pot, and a new game
antes up. Each deal's own number is wild by default (3s, then 5s, then 7s), so five of a
kind is live and tops a straight flush.

Your net carries across games for the session (Menu → New session resets it).

## House-rule toggles (setup → More options)
- **Players** 4 / 5 / 6 · **Legs to win** 3 / 4 / 5 (key rows)
- **Carry cards** — on by default: keep your hand and draw it up through a run (3 → 5 → 7).
  Off deals a fresh hand every deal. Either way a new run opens with a fresh 3.
- **Wild cards** — the deal's own number / 3s, 5s & 7s every deal / none
- **3-card deal** — pairs & trips only (default) / also straights & flushes, ranked the
  Three-Card Poker way (straight above flush)
- **Alone in** — **Fester** (default): alone on the 7 must beat the deck / wins a leg free / wins nothing
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
advances the deal size. `deal` reshuffles each deal by default; with `carry` on it keeps
each hand and draws it up to the new size from the same remaining deck (`M.deck`), reshuffling
only at the 3-card deal that opens a run. `resolve` forces `ins` on for forced players itself, so a caller
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
Opponent seats show small face-down cards; under Forced each seat's face-up upcard is enlarged (`.mc.up`) so two-digit ranks like 10 read cleanly. Your own face-up card rides a notch above the rest of your hand (`upX` in `renderHand`). A forced-in player who loses pays half the match (`Math.round(pay/2)` in `resolve`). At showdown,
stayers' hands turn face up with wilds outlined gold and the best five (the wild included)
raised together while the two discards dim back, along with a short hand name and the leg or
the payment. When you drop, your own hand is shown muted (desaturated, not transparent) so you
can see what you folded. The center shows the
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
- Carry checks: the hand is kept and drawn up 3 → 5 → 7 with the earlier cards as a prefix
  and no duplicates across a run, a fresh 3 opens the next run, and fresh mode re-deals.
- A soak of 432 bot sessions across every combination of players × legs × wilds × alone-in
  × forced × carry, with random cap and 3-card mode. Every game ended (avg 12 deals, max ~40, ~5%
  all-out deals) with no duplicate cards, legs in range, money conserved every deal and the
  pot paid out exactly.

The Playwright pass, a scratch harness that isn't in the repo, played full games at
320×568, 390×844 and 430×932 with the real safe-area insets swapped into the served CSS, at
card size/text S and XL, with 4 and 6 players and Forced on. It found no page scroll, no
button under the home bar, no hand overflow and no console errors.

## Test door
`window.__TF` exposes `M`, `busy`, `choose(stay)`, `next()`, `start()`, `overOpen()`,
`again()`.

## Forced play, focal up cards, and the all-out-7 rule (v230)
- **Up cards are large and focal.** In Forced play each seat shows its one face-up card big
  (`.mc.up`, enlarged) with a small hidden-count chip (`.mc.back.hid`) for the rest of the hand,
  so the exposed cards — the real information — read at a glance.
- **Your hand is clean.** `renderHand` now lays the cards out with no overlap (it shrinks the
  hand's `--size` to fit) and lifts **only** the face-up card (it "stays up"); everything else
  sits flat. The old multi-tier best-hand lift that staircased the hand is gone.
- **Forced auto-in.** When your upcard forces you in there's nothing to decide, so the In/Out
  buttons hide and a 2-count (`forcedGo`) auto-plays In.
- **All-out 7 (house rule, Menu → More options, on by default).** If everyone drops on the
  7-card deal, every hand flips up and the best hand pays half the pot (`resolve` `kind:'allout'`);
  no leg is awarded and the pot grows. On any other deal, all-drop is still a wash.


## The up card actually stays up (v231)
In Forced mode each player's first card is face up. The player's up card lifted above the rest and wore
an `UP` tag during the decision, but the moment the hand resolved (`showing`) the lift was dropped and the
card fell back in line with the others — so it only *looked* up while deciding. The up card now stays
lifted and tagged through the showdown and result too (`upc` no longer gates on `!showing`), and it keeps
its full brightness even when a fold dims the rest of the hand, so the public card stays the focus the
whole deal.

## Dealing the cards (v232)
Deals used to pop in instantly. Now `dealAnimate()` pitches every card in from the centre of the table
in true dealer order — round-robin around the seats, then into your hand — each card flying from the pot,
rotating straight, with a soft `deal` tick and a stagger (`speed` pref: ~36 ms fast / 58 ms normal). It
fires on every deal (opening 3, and each grow to 5 and 7), using WAAPI `fill:'both'` so a card sits
invisible at the deck until its turn and rests cleanly in place after. Skipped under
`prefers-reduced-motion`. The moving attention is half the fun of 3-5-7.

## Stud-style up cards + auto deal (v233)
Forced mode now deals one up card per round, stud-style: the 3 shows 1 up, the 5 shows 2, the 7 shows 3
(up positions are dealt-order indices 0, 3, 5). Opponents reveal every up card they hold plus a back chip
for the hidden pile, and all of your matching up cards lift in your hand — more to read as the run builds.
`M.up[p]` is now a list of up cards; **forced-in stays keyed to the opening up card** (`M.up[p][0]`), so
that rule is unchanged. Seat up cards shrink and fan so three fit a narrow seat; your own stay big in hand.

The deal animation deals only the *new* cards each round — `dealNext` snapshots the pre-grow card keys and
`dealAnimate(prevKeys)` pitches just the fresh up+down cards (old cards stay put). And the **next deal
auto-fires** ~2 s after a result (1.3 s fast / 2.6 s relaxed; `autoTimer`, cleared on manual next, new game
or setup), so a run flows on its own. Game-over still waits for a tap.

## Forced = highest exposed hand (v234)
Forced-in is now the best *exposed* hand each deal, not the opening up card — recomputed every round as
up cards accumulate, so the forced seat can change from the 3 to the 5 to the 7 (and a wild in the up
cards counts, e.g. a wild 7 + Q shows a pair of Queens). `exposedScore(up,wr,o)` ranks the up set: 3+
cards reuse `best()`/eval3, 1–2 cards get a pair-then-high ordering; highest is forced, ties all forced.
Auto-advance (v233) is turned off for now — the plumbing (`autoTimer`) stays in place for later.

## Bots' hands exposed + forced no longer auto-commits (v235)
Opponent hands are now fully exposed during the decision — every card face-up (sorted), with the up
cards ringed in gold (`.mc.upm`) so you can still tell which are public. (The seat row already fits a
7-card hand from the showdown layout.) This makes 3-5-7 an open-hand game for now.

Forced-in no longer auto-commits after 2 s. When you're forced, the **In** button shows and you tap it
when you're ready — so you can sit with a good hand instead of it playing itself. (`forcedGo`'s countdown
call is removed; Out stays hidden while forced.)

## Match point stands out (v236)
A player one leg from the pot was only a faint orange tint on the pips — easy to miss. Now any
one-leg-away player (`M.o.legs - M.legs[p] === 1`) gets a pulsing orange seat glow (`.seat.matchpt`),
pulsing leg pips, and a bright "1 TO WIN" badge next to their legs; the same glow + badge apply to your
own row (`.me.matchpt`). All pulses are disabled under `prefers-reduced-motion`.

## Opponents' down cards hidden again (v237)
v235's full open-hand exposure spoiled the drop decision — you could see your own hand and read the
whole table before choosing. Reverted: during the decision opponents show only their up cards (stud
reveal, 1/2/3) plus a face-down count chip; full hands still reveal at the showdown. (The `.upm` ring /
miniHTML param stay in the code, unused, for later.)

## Match-point revamp — stable, layout-neutral, gold (v238)
The orange "1 TO WIN" badge in the seat was overlapping the pips/net, wrapping to three lines, and —
worst — adding a line that changed the flagged seat's height, so the board jumped between deals as
different players hit one-away. Revamped:
- **Layout-neutral cue.** A one-leg-away opponent is now shown by a gold pulsing seat glow
  (`.seat.matchpt`, border-color + box-shadow — no size change) and gold pulsing leg pips only. No
  seat text badge. Every seat stays the same height (~135 px) in every phase, so nothing shifts
  between deals or between decide and showdown. Verified: seat heights equal and identical across
  decide/result.
- **Gold, not orange.** The whole cue matches the game's gold theme instead of the clashing orange
  block; the pulse (not a static border) distinguishes a match-point seat from a static leg-winner.
- **"1 TO WIN" pill kept only in the wide "You" row**, where it fits inline and can't shift the board.
- Pulses respect `prefers-reduced-motion`.

Open for review: opponents one-away now rely on the glow + near-full pips (no text label) — can add a
layout-neutral text cue if wanted. The decide (large up cards) vs showdown (small full hand) card sizes
still differ by phase; seat height is stable regardless, but unifying card size is a larger change.

## Seat tidy — money under the name, no down-chip in the decision (v239)
Per feedback: the session money (`net`) moved out of the pips row to its own line directly under the
player's name (`.snet`), so it no longer crowds or overflows past the leg pips. And the striped
face-down count chip is dropped from the decision view — opponents show only their up cards there (the
hidden count was redundant with the deal size). Full hands still reveal at the showdown.

## The Fester rule — alone on the seven, beat the deck (v240)
Staying in **alone on the 7-card deal** no longer hands you a free leg. The deck deals its own
seven off the top (`M.deck.slice(0,7)`), turns them **face up one at a time**, and you take the leg
only if your best hand **strictly beats** that house hand — "Fester." Lose or tie, no leg.

- Engine: `resolve` gets a `kind:'fester'` branch in the lone case, gated on `o.lone==='fester'` and
  `SIZES[M.di]===7` (and a ≥7-card deck). It records `res.fester={cards,eval}`, `res.lonePlayer`
  and `res.festerBeat`, and awards the leg only when `festerBeat`. The **3 and 5** rounds (and a short
  deck) still give the free leg, so Fester only bites on the seven. Lester's hand uses the deal's own
  wilds, like yours — a fair fight.
- UI: `festerReveal()` overlays a full-screen stage (`#festerStage`) showing who's alone, their hand to
  beat, then seven face-down cards that flip over (`rotateY`, swapped at 90°) on a slow cadence, and
  the verdict. Reduced motion / no Web-Animations skips straight to the result; the narration still
  states the outcome. Bots alone on the seven face Fester too.
- **Alone in** is now a three-way setting: **Fester** (default), **wins a leg free**, **wins nothing**.
- Open: Fester currently costs only the leg on a loss — no pot match. Add a pot-match penalty if the
  table wants real teeth.
