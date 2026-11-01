# Poker Squares (`pokersquares/`)

Solitaire poker on a 5×5 grid — a.k.a. **Poker Solitaire / Poker Patience**. Self-contained single `index.html`, no backend.

## How it plays
- 25 cards are dealt **one at a time** into a 5×5 grid. Tap any empty square to drop the card in the tray.
- A placed card **can't be moved** — `↩ Undo` reverses only your most recent placement.
- When all 25 squares are full, each of the **5 rows and 5 columns** is scored as a poker hand; the total is the sum of all ten.
- Aces play high or low, `A-2-3-4-5` is a straight, `10-J-Q-K-A` suited is a royal flush.
- Best score is kept per device in `localStorage` (`pokersquares.v1`).
- **🏆 High scores for everybody (v105):** a shared top 10 per scoring system — see below.

## High scores — one board for everybody (v105)
Finish a game with a score that makes the top 10 and the results panel asks for your name
(remembered for next time) and posts it. **Scores** in the header (or Menu → High scores) shows the
board, with American and English scoring as separate top-10s.

There's no backend. Scores ride the public ntfy topic `jtps-v1-scores` on `ntfy.envs.net`
(the relay Pull Tabs uses; `?hs=<topic>` overrides it for tests):
- `{t:'score', e}` when someone posts; `e` = `{id, name, score, sys, at, cards}`.
- ntfy keeps only **12 hours** of messages, so every phone also keeps the whole board in
  `localStorage` (`pokersquares.board`) and re-posts it as `{t:'board', b}` whenever the feed has no
  board message from the last 6 hours. The board carries forward as long as somebody plays now and
  then, and a phone that has been away merges its copy back in when it returns.
- Each entry carries its **25 cards** (2 base-36 chars each), and every phone re-scores them on the
  way in, so a made-up "999" sent to the topic is dropped. (A real 25-card board could still be built
  by hand — fine for friends and family, not for money.)
- Offline: the score is saved locally and posted on the next load. One post per deal.
- If the planned small Cloudflare server happens, this moves there and the board becomes permanent.

**View any entry's board.** Every leaderboard row is tappable. It opens that player's actual
5×5 board — decoded from the entry's stored 25 cards and rendered read-only with the row/column
hands and total — with an **As played / ✨ Best** toggle. **Best** runs the same `makeSolver`
on those 25 cards (on demand, synchronously) and shows the optimal arrangement for the deal, so
you can see exactly how much was left on the table. `‹ Back` returns to the leaderboard.
Rendering reuses `viewBoardHTML(cards, sys)` (a read-only board via `miniHTML`/`chipHTML`/
`computeLines`) and `bestBoardFor(cards, sys)`; neither touches live game state.

## Best board (v103)
After the 25th card, a search rearranges the **same 25 cards** for the highest possible total
and the results panel says how close you came ("best these cards make scores 275 — 265 more than yours").
`✨ Show the best board` flies every card that changes square to its new spot (and back), counting the score across.
- `makeSolver()` scores all 53,130 five-card subsets once into a table, then runs simulated annealing on
  card swaps, finished by every 2-swap and 3-cycle. It stops when two searches agree on the top score
  (minimum 3 runs) or after 10 runs / 12 s. Your own board seeds it, so "best" never comes out below your score.
- Runs in a Web Worker built from a Blob (works offline); falls back to the main thread between frames.
- `alignToMine()` picks, among the 28,800 equivalent layouts (row/column shuffles + transpose), the one that
  leaves the most of your cards where they were, so the animation only shows the moves that matter.
- Not a proof: on test deals it matched much longer searches about 99% of the time.
- `window.__PS` exposes `state`, `showView`, `startSolve`, `deal(cards)` for headless tests.

## Watch the bot (v135, removed in v210)
**Gone from the game in v210:** no button, no bot bar, no Menu rows, no "Watch again". `makeBot`
and the code that ran it are still there, dormant: the bot's brain calibrated the level targets and
could power hints later. The notes below are what it did.

**🤖 Watch bot** (beside New game, or Menu → Watch the bot play a new board) hands the board to a
bot. On a fresh board it plays the whole deal; mid-game it picks up from where you are. While it
plays, the buttons under the board become:

- **Auto** switch: on, it places a card every **1.5 s**; off, it waits and **Next card ▶** places
  one. The setting sticks (`settings.botAuto`, also in Menu). Auto pauses while a panel is open.
- **Take over**: stops the bot; the board is yours from that card on.

The board can't be tapped while the bot plays. **A board the bot placed any card on doesn't count**:
your best is left alone and the high-score board isn't offered; the results say "The bot's board"
and offer **Watch again**. Best board (the hindsight solver) still works on it.

How it plays (`makeBot`, one function, no DOM): it sees what you see, never the deck order. For
each empty square it estimates how much the card there raises the expected final value of that
square's row plus its column, and takes the best. A partial line is worth the most of its flush odds
(hypergeometric odds on the suit cards still unseen, split with the other lines chasing that suit),
its straight odds (the ranks it still needs), and what its ranks make now plus their likeliest
upgrades. Weights were tuned offline on 150-500 deals per setting and validated on fresh ones:
**about 84 a board American and 37 English**, against 14 and 8 for placing at random. About 0.25 ms
a card.

## Results screen (v137)
One screen, never scrolls (checked at 320×568, 375×667, 390×844, 430×932, with and without the
name-entry row). Top to bottom:
- **Title and score**: "Board complete" / "New best!", your points, best and scoring system on one line.
- **Top scores**: the top 5 of the shared board (top 3 on phones under 640px tall), plus your own
  row if you're lower down. **All 10 ›** opens the full list (same as the Scores pill). Making the
  board still shows the name box here.
- **Stat tiles**: **You** (this board), **Max** (the best board these same 25 cards can make, from the
  best-board search), **Of max** (your share of it, as a %, with a bar), and **Avg** (your average
  board under this scoring and how many games it covers; stored in `pokersquares.stats`, bot boards
  never count). Max and % show "…" until the search finishes.
- **New game** and **✨ Best board** side by side (Best board waits for the search; Watch again
  instead for bot boards).

The old per-row/column hand list is gone from this screen: the chips beside the board already show
each line's hand. The panel stops its own scroll from dragging the page (`overscroll-behavior`).

## Main screen never scrolls (v138)
- The build stamp is pinned to the bottom (off the page flow, above the home bar), and the page's
  bottom padding dropped from 44 to 22px.
- `fitPS()` runs after every render: if the page is taller than the phone, it takes the difference
  out of the board's cell height (floor 38px). Bigger card sizes grow the tray's card, which is
  what pushed it over on smaller phones.
- After the 25th card the tray's empty card slot hides (there's no next card), and on phones under
  640px tall the "Tap Best to watch…" hint under the Your board / Best switch is dropped.
- **All 10 ›** on the results screen opens the full list with a **‹ Back** button that returns to
  the results (it used to replace them with no way back).

Checked with real iPhone notch/home-bar insets (15 Pro Max to 320-wide SE), every card size, through
a whole game to the results, the All 10 → Back round trip, and the results panel itself.

## Scoring
Two point systems, switchable in the Menu (persisted):

| Hand | American | English |
| --- | --- | --- |
| Royal flush | 100 | 30 |
| Straight flush | 75 | 30 |
| Four of a kind | 50 | 16 |
| Full house | 25 | 10 |
| Flush | 20 | 5 |
| Straight | 15 | 12 |
| Three of a kind | 10 | 6 |
| Two pair | 5 | 3 |
| One pair | 2 | 1 |

American mirrors real-poker rarity; English rewards how hard each hand is to build inside the grid. Both reproduce the canonical Wikipedia example totals (197 American / 66 English).

## Conventions (shared with the hub)
- Felt-and-gold theme via the same `:root` vars + component classes (`.btn`, `.seg`, `.switch`/`.toggle`, `.panel`/`.overlay`, `.setup-opt`, `.tip-block`).
- Standard Game Night header (`gn-header.js`): ‹ Games, Scores, Rules, Menu. Straight-in — no start screen; Menu → New game deals a fresh board. Settings default: **tips off, four-color deck on**.
- Build stamp `build vNN · <local time>` at the bottom (`V`/`ISO` consts) — bump with the `sw.js` cache version.
- In-game asset refs point up one level (`../manifest.webmanifest`, `../icon-180.png`, `../sw.js`).
- Sound from the shared `../sfx.js` (synthesized, offline, one mute setting for every game).

## Card size and card text

Cards scale with the shared **Card size** row (S / M / L / XL, `../cardsize.js`) in the Menu. The steps are multipliers (0.86 / 1 / 1.2 / 1.4)
rather than pixel sizes, because the games don't share a base card size — a multiplier
scales each game from its own design. The choice is stored once for the whole origin,
like the mute key, so the size you pick here is the size in every Game Night card game.

XL is deliberately larger than a 7-card hand fits on one row on a small phone: past
about 390px wide the hand wraps to two rows instead of overflowing, which is the
trade-off XL is for.

A second row, **Card text** (S / M / L / XL, origin-wide key `gn_cardtext`), scales just the
printed rank and suit on the face (the 5×5 grid's mini cards included) — bigger print without a bigger card. Cards clip
their contents, so XL text on an XL card stays inside the card.

## The 2030 cabinet (v201)
A visual pass: same felt, header, cards, rules, bot, solver and high scores. Only how the board looks
and moves changed. All of it is CSS plus a little UI code; nothing in the scoring reads it.
- **The tray is a dark glass console**: a radial-lit panel with a gold hairline edge and a slow sheen
  across it every 7s.
  - The next card sits in a lit slot and slides in from the left, like it came out of a dealer's shoe.
  - The score is a glowing gold counter that rolls up to its new value (ease-out, up to 0.7s) and
    pops when it rises.
  - **25 lights** under "Card N of 25" show progress; the current card's light breathes.
- **The squares are recessed glass** instead of dashed boxes. The open ones breathe while you have a
  card to place.
- **A placed card flies from the tray to its square** (0.24s), shrinking from the tray card's size.
  This happens for the bot's moves too.
- **Line chips are lit pills, brighter by hand.** Tier 1 is pairs; 2 is trips, straight, flush; 3 is
  full house, four of a kind; 4 is straight and royal flush, which get an animated gold-foil pill.
  The total is a gold bar.
- **A finished row or column sweeps light across its five cards and calls the hand out**
  ("FLUSH +20") in a pill over the line. Size and sound scale with the tier: chip, good, good + chip,
  win. A line that makes nothing says "No hand" quietly. If one card finishes a row and a column,
  the two calls come 0.38s apart.
- **The results screen waits 1.5s after the 25th card** so the last callouts play, unless a new game
  has started in the meantime. `__PS.deal()` and reduced motion open it at once, as before.
- `prefers-reduced-motion`: no flight, sweep, sheen, breathing or roll. Callouts just fade.
- Tested in Chrome at 390×844, 320×568 and 430×932 with a stacked deck:
  - a spade flush on row 1 calls "Flush +20" (tier 2) with all five cells sweeping, and lights its chip;
  - the meter reads 5 lit + 1 breathing;
  - the score rolls to 20;
  - the results open only after the pause;
  - no card is left mid-flight or hidden, the page doesn't scroll, Undo still empties the square;
  - no page errors.

## Next-gen (v204)
If v1 was the cartridge and v201 the console, this is the next generation: the same engine (scoring,
bot, best-board solver, high scores) with a new presentation layer, `NG`, in its own block above
"wire up". It reads `grid`, `current` and `over` and never changes a rule. `render()` calls
`NG.after()`, `place()`/`dealFx()`/`lineFx()`/`finish()` call into it, and that's the whole seam.

**Draws: excitement before the hand is made.** After every render `NG.heat()` checks each unfinished
row and column. A line qualifies if it has 3 or 4 cards, all one suit, all different ranks, that fit a
5-rank straight window (A low or high) whose missing cards are all still unseen (not on the board).
- **3 cards: warm.** A thin blue ring round the line, or gold if the royal window (10-A) is alive.
  One small callout, "Straight flush alive" or "Three to a royal". The chip shows `SF?`/`RF?` and the
  chance both missing cards still come.
- **4 cards: hot.** The line pulses blue plasma, or gold fire for a royal. The open square shows the
  card or cards it needs, as a ghost; the royal out is ringed in gold. A callout appears, e.g. "Royal
  flush draw, need 9♠ or A♠ · 68%", and the chip shows `RF!`/`SF!` and the odds.
- **The odds** are exact for the deal as it stands: 1 − C(D−k, R)/C(D, R), where k is the number of
  live outs, D the unseen cards not counting the tray, and R the cards still to deal after this one.
  K-Q-J-10 of spades with 4 down: 1 − (27·26)/(47·46) = 67.5%.
- **The out is in the tray: "It's here!"** The target square beams white and gold and every other open
  square dims to 35%. The tray card pulses, and a heartbeat thumps every 1.1 s (plus a vibration where
  `navigator.vibrate` exists) until you place it.
- **Draw dead.** If the last live out goes somewhere else, the line says so with a struck-through
  callout and a fizzle. It says nothing if the line simply fills with a different card; the normal
  hand callout covers that.
- **Undo is quiet:** it restores the glow without replaying the announcements. A new callout clears
  any draw callout still up, and a made hand clears it too, so they never stack.
- Bot boards get the same lights and callouts. That's the point of watching.

**Making a straight or royal flush** dims the screen, spins light rays and slams the title in, with
a sub-bass hit, confetti and a 4-pulse haptic. 2.6 s, and it doesn't block taps.

**Look and feel**
- **Table:** a deeper felt with an overhead light and three slow light pools drifting behind it (CSS
  gradients, no blur filters).
- **HUD:** the tray is dark glass with a gold-to-plasma edge.
- **The next card is dealt face-down and flips over** (rotateY, with a back face that hides at 90°).
- **Cards are glossy.** Each has a specular highlight at `--lx/--ly`, which follows your finger while
  you drag and the mouse on desktop. The cards of a full house or better get animated holo foil.
- **Drag the tray card onto a square.** It lifts, tilts with your speed, and on touch rides above
  your finger so you can see it. The square under it is outlined and its row and column brighten.
  Those two chips preview the hands they'd make, and a `+N` badge by the score shows the gain. The
  board leans up to 2.5° toward the card. Let go off the board and it springs back. Tapping a square
  still works.
- **Flights arc.** The card rises off the tray, its shadow grows mid-flight, and it settles in 360 ms.
  On landing a shockwave ring and dust come off the square, the board thumps 1.5 px, and there's a
  thud panned to the square's column.
- **Finished lines** throw sparks scaled to the hand: tier 1-4 is 5 to 20 per card. Full house and
  four of a kind shake the board; straight and royal flushes get the cinematic.
- **End of board:** 1.3 s after the 25th card (the last callouts first), each scoring line lights in
  turn, 100 ms apart, with a rising tick. Then the results open, at most about 2.75 s after the last
  card. `__PS.deal()` still opens them at once.
- **Particles:** one full-screen canvas whose animation loop runs only while something is alive, so
  it costs nothing at rest. The time step is real elapsed time, so 120 Hz phones don't run it double.

**Sound and haptics**
- `NG.snd` is a small WebAudio synth beside `sfx.js`, behind the same mute (`SFX.isOn()`): whoosh,
  panned thud, heartbeat, riser, shimmer, fizzle, boom, tally ticks, trophy ping.
- Haptics use `navigator.vibrate` where it exists. On iPhone it's Safari's `<input type=checkbox
  switch>`, which ticks the Taptic Engine when toggled from a tap (iOS 18+). That only fires inside a
  gesture, so on iPhone you feel the pick-up and the drop, not the delayed effects.
- Menu → **Haptics** turns them off (`pokersquares.ng`).

**Trophies** (Menu → Trophies, `pokersquares.trophies`, this device only, bot boards never count):
- Bronze: First Board, Suited Up (a flush), Full House.
- Silver: Ten for Ten (every line scores), Century (100 American / 50 English), Quads.
- Gold: High Roller (150 / 75), Perfect Board (equal the solver's max), Straight Flush.
- Platinum: Royal Flush.

A toast drops in from the top with a ping; several queue.

**Reduced motion:** no flights, particles, shake, cinematic, flip or tally. The draw glows and the
jackpot beam hold steady instead of pulsing, so you still see them.

**Tested** in headless Chrome against a stacked deck:
- 10-J-Q♠ shows "Three to a royal" (warm, `RF? 44%`).
- K♠ makes it hot, with ghosts 9♠/A♠ and a 68% callout.
- A♠ arriving in the tray shows "It's here!", 1 jack square, the board in jackpot mode.
- Placing it fires the royal callout and the cinematic.
- An open-ended 5-6-7-8♥ draw with both outs placed elsewhere says "draw dead", and Undo brings the
  glow back silently.
- A drag to square 24 shows the drop target and 9 crosshair cells, and places the card. A drag off
  the board springs back.
- A full board: the results are not open at 1 s, are open by 4.2 s, and "First Board" is stored.
- A bot board plays through and earns no trophies. The best-board flight still runs.
- No page scroll at 320×568, 390×844 or 430×932 at every card size, mid-draw. No page errors.

**Native haptics hook (v205).** `NG`'s `hap(n, gap, kind)` calls `window.GN_HAPTICS(kind, n, gap)` when a
host page defines it, instead of the web fallbacks. The kinds are light, medium, heavy, success, beat
and select. The heartbeat and the drag-over tick use it too. The website never defines it, so nothing
changes there. The iOS app does (see `pokersquares-app/app/app-shim.js`), which gives every effect the
Taptic Engine, including bot moves and the delayed effects that the iPhone web workaround can't reach.
Menu → Haptics still gates it.

## Levels (v207) — the default mode
Each board has a target: a share of the **best board its own 25 cards can make**. Clear it to open
the next level. Menu → Play switches between **Levels** and **Free play** (the classic game, with
your best, average and the shared top 10). Levels replaced Duel the bot (v206), which is gone.

**The target is known from the start.** All 25 cards are fixed at the deal, so the solver runs in
the background straight away (`levelSolve` → `runSolver`, the same worker as the end-of-game
search). The line under your score reads "Target …" for a few seconds, then e.g. "Target 92".
It turns green when you pass it. The end-of-game ✨ Best board uses that same search.

**Levels 1-3 come part-built.** The pre-filled squares are locked, marked with a gold dot.
- Level 1 has 15, level 2 has 10, level 3 has 5.
- `levelDeal` solves the deal first (`bestBoardFor`), then locks the squares that matter most on
  that best board. Its whole board is still reachable, so the full target is honest.
- Never more than 3 locks in a row or column, so no line starts finished. Every pre-filled board
  starts at 0 points (checked over 40 deals per level). The first cut locked whole straight-flush
  columns and handed you 150 points before your first card.
- The solver respects locks: `makeSolver(cards, PTS, fixed)` only moves the free squares, in
  anneal and polish both. So the target is the best board that keeps the pre-filled cards where
  they are.

**Targets** (`levelPct`), calibrated with the bot's brain on 25 deals a level:

| Level | Pre-filled | Target | Bot median | Notes |
|---|---|---|---|---|
| 1 | 15 | 40% | 91% | a careless player (first open square) clears 5 of 25 |
| 2 | 10 | 40% | 68% | |
| 3 | 5 | 38% | 54% | |
| 4 | 0 | 34% | ~37% | bare boards from here; no undo |
| 5–14 | 0 | 36% → 54%, +2 a level | | |
| 15+ | 0 | 55% | | |

On bare boards over 60 deals the bot's share was 22 / 31 / 37 / 44 / 50% at the 10th / 25th / 50th
/ 75th / 90th percentile. The best board ran 167-245 points American (median 230).

**Stars:** 1 at the target, 2 at +5 points of percentage, 3 at +10. Progress lives in
`pokersquares.levels` = `{american:{level, stars:{n:best}}, english:{…}}`. Levels follow the Menu's
scoring system, with a separate ladder for each, and changing it starts a fresh board.

**Undo** works on levels 1-3 only. From 4 the button reads "No undo".

**Results** fit one screen at 320×568:
- the stars;
- your points and share of the best board;
- a bar with the target and star marks;
- the target line;
- "N more would have done it" when you miss.

Buttons: cleared gives **Level N+1 ›** and **Replay board**; missed gives **Same board** (identical
cards, order and locks, target known at once) and **New board** (same level).

A second row, the same size (v208): **Best board** and **All levels**. Best board reads "Yours is
best", disabled, when your board already matches the search.

**‹ Results** (v208) sits in the bar under any finished board, beside the Yours / Best switch.
Before it, Best board (or ✕) closed the results with no way back to Level N+1. That was true in
free play too. Checked at 390×844 and 320×568: results → Best board → ‹ Results → Level 2 ›,
nothing scrolls.

**Menu → Levels** lists every open level with its target, pre-fill and stars.

**What counts.** A level board never goes on the shared top 10 or your free-play best and average.
Watch the bot on a level makes it not count. Hand and score trophies only count on boards you built
yourself: free play, or a level with nothing pre-filled. New trophies: Three Stars (bronze), Halfway
Up (silver, clear level 5) and Summit (gold, clear level 10).

**Tested** in headless Chrome:
- Level 1 starts with 15 locked squares, "Card 1 of 10" and "Target …".
- The solve keeps every locked card in place, and its board re-scores to the max it reports.
- A bot-brained play clears level 1 with 3 stars and opens level 2.
- A careless level-6 board misses (6 of target 101). Same board gives the identical deal and order
  with the target already known; New board gives a different deal at the same level.
- Level 4 has no undo.
- Free play still shows the top scores.
- No scroll mid-game or on the results at 320×568. No page errors.

## The clock (v209)
Two kinds:
- **Shot clock: 8 s a card.** Each placement starts a fresh 8 s. Run out and the card goes into a
  random open square, with a "Time!" callout.
- **Board clock: 90 s for all 25.** The progress line shows m:ss. At zero, "Time's up", and the
  remaining cards drop into random squares, 190 ms apart. Tapping and dragging are off while they do.

**Where it applies:**
- **Levels:** every 5th level is **Blitz** (`levelClock`). Levels 5, 15, 25… use the shot clock;
  10, 20… use the board clock. Their targets are 4 points of percentage lower than the curve.
- **Free play:** Menu → Clock: Off / 8 s a card / 90 s board (`settings.clock`). Changing it starts
  a new game.
  - A timed board keeps its own best (`pokersquares.clockbest`, keyed `shot:american` and so on) and
    gets its own results screen.
  - It never touches your untimed best or average, and isn't offered to the shared top 10, so
    those stay comparable.

**Fairness.** The clock only runs while you can actually play. `clockPaused()` stops it for:
- any open panel;
- a hidden app (`document.hidden`);
- a card in flight;
- the bot playing;
- the best-board view;
- the board clock dumping;
- 550 ms of grace as each card is dealt in, plus 300 ms more at the start.

The frame step is capped at 100 ms, so coming back from the background never eats time. There's no
undo with any clock on.

**The look and feel.** A ring drains around the tray card (an SVG rect with `pathLength=100`,
`vector-effect:non-scaling-stroke`). It shows the card's time, or the whole board's. In the last
3 s (shot) or 10 s (board) it turns red and pulses, with a tick and a light haptic each second.
Reduced motion drops the pulse.

**Trophies:** Beat the Clock (bronze, clear a Blitz level) and Ice Cold (silver, 100 American /
50 English with a clock on, in free play or a level with nothing pre-filled).

**Tested** in headless Chrome:
- **Shot clock:** reads 7.35 s after 1.5 s; Rules open freezes it; the ring is red at 2.35 s; at zero
  the card lands at random, "Time!" shows, and the next card gets a fresh 8 s.
- **Pauses:** a hidden page freezes the clock.
- **Results:** a timed board goes to the clock best, and the untimed best stays 0.
- **Board clock:** shows 1:30, goes red under 10 s, fills all 25 at zero, and the results open
  7.2 s later.
- **Levels:** 5 is shot at 32%, 10 is board at 42%, 4 has no clock.
- No scroll at 320×568 with the ring showing, and every earlier suite still passes.

**Public leaderboard: on hold.** The website's shared board works because every entry carries its
25 cards and every phone re-scores them. A level clear would also need its deal, locks and target
to be verifiable. In the App Store it's user-generated content (reporting, blocking, privacy
label). The plan is Game Center leaderboards in the app (highest level, total stars) once the app
has its App Store Connect record.

**Later**
- If timing out feels too harsh, the card could go where the bot would put it instead of a random
  square. That's a one-line change in `clockOut()`.
- Earn helpers on the ladder, e.g. a 3-star clear banks an undo for a no-undo level, a **swap**
  card (exchange two placed cards), or a **joker** (a wild card for one square).

## Trim and Night (v211)
**Trimmed:**
- **Menu, 15 rows to 8:** Play · Clock (free play only) · New board/New game · Trophies · Theme ·
  Scoring · Card size and Card text · Four-color deck · Haptics.
  - Gone because they duplicated something on screen: Back to all games (‹ Games), How to play
    (Rules), High scores (Scores) and Resume (✕).
  - Also gone: the Levels row, now a header pill, and Tips. The tip boxes are deleted; the draw
    lights and Rules teach more.
- **Header:** the one extra pill follows the mode. `html.mode-levels` shows **Levels** (`#lvBtn`,
  opens the ladder); Free play shows **Scores** (`#hsBtn`). The iOS app hides `#hsBtn` (no shared
  board) and keeps Levels.
- **HUD:** the 25-light meter is gone. "Card N of M" (with the board-clock time) says the same thing.
- **Under the board:** Undo is hidden, not shown as a dead "No undo", wherever it doesn't apply.
  New game reads **New board** in Levels.
- **Emoji:** off the panel titles, buttons, Menu rows and notes. The rules panel's title is now
  "How to play". Stars ★ stay; they're the content.

**Night theme.** Menu → **Theme: Auto / Day / Night** (`settings.theme`, default Auto). Auto follows
`prefers-color-scheme`, so it switches with the phone's dark mode, sunset schedule included, and
live (a `matchMedia` change listener). Night is `html[data-theme="night"]`:
- **Table:** a midnight blue-black gradient instead of green felt, with a cool-tinted light drift.
- **Cards:** dimmed parchment (`#e2d9c2` → `#c4b899`) instead of bright cream, with the gloss at 45%.
- **Gold:** `--gold` becomes amber `#e3b25e`. Panels, callouts and the HUD glass are navy.
- **Particles:** at 75% opacity. The blue and gold draw lights keep their contrast.
- **Chrome:** `theme-color` switches to `#0e1a2e`.
- **First paint:** a small script in `<head>` reads the saved theme and sets the attribute before
  anything renders, so Night never flashes green.

**Tested** in headless Chrome:
- **Menu:** shows exactly the 8 rows.
- **Header and controls:** the pill is Levels on levels and Scores in free play; level 4's controls
  are just "New board".
- **Night:** Auto on a dark-mode phone gives Night, the theme-color meta and page background switch
  with it, Day overrides a dark phone, and Night survives a reload.
- **Layout:** no scroll at 320, 390 and 430 wide.
- **Regressions:** the levels, clock and effects suites all pass, and the app build runs.
