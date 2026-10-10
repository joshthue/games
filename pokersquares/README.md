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

## Watch the bot (v135)
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
