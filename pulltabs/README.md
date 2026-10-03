# Pull Tabs

Minnesota bar pull tabs at the Lake Uffda VFW Post 10,000. Buy tabs from a finite box,
peel back three tabs over a square 3×3 grid, look for the arrow, check the flare. Darlene runs the booth.

## The ticket (v86, modelled on real tickets Josh photographed at the bar)
A winner has an **arrow** printed through three squares in a line — across, down, or corner
to corner (8 possible lines) — over a **combo from the chart** (v88, from the back of a real
"No Dice" ticket): KEY, KEY, PRIZE read from the tail to the arrowhead. `syms[0]` is the deal's
key symbol and tier *i*'s prize symbol is `syms[i+1]`. A yellow **"$X TOTAL"** in another square
adds up every line. **Multiple winners:** `MULTI_PAIRS` (6) cheap winners per box are folded
onto other winning tickets, so a box still holds exactly the flare's prizes but some tickets
carry two lines — always non-crossing (top+bottom rows or outer columns). An outcome is
`-1`, a tier, or an array of tiers; read it through `tiersOf()`. Losers' squares are re-rolled
until no line spells a combo in either direction (`comboOn`; checked over 120,000 tickets).
**Tabs hinge on the left** like the real ones: grab the right edge (OPEN HERE) and peel left,
so a peek shows the right-hand square first. The arrow is drawn a piece per square (`arrowSVG`), the way it's printed, so a peek
at one tab shows exactly the part of the arrow under it, and a down or slantwise arrow needs
all three tabs. Each window is three square cells (`aspect-ratio:3/1`, symbols sized in `cqw`).

**Two marker styles (v87)**, both from real tickets: arrow deals (Walleye, Hotdish, Loonatic)
print an orange arrow with a "$X TOTAL" splash; bar deals (State Fair, Uff Da 7s) print a flat
red bar with a plain yellow "$X" square, like Josh's $200 darts ticket. `PT.DEALS[k].marker`.

**The card (v87)** copies the real card stock: white with a border of stars in the deal's colour,
rounded perforated windows, a printed strip between each pair of tabs (deal name + price, then
cheesy fine print from `PT.DEALS[k].fine`), and a yellow serial-number sticker on the top window
— one per box, derived from the box id. The prize box sits above the sticker.
Tickets from before v86 (matching rows, five tabs, seal cards) are cleared from a pile on
load, and any unopened winner among them is paid out first.

## Play
- **Solo** — your own private box per deal, saved between visits. Fully offline.
- **Shared box** — one phone starts a box and reads out a 4-letter code; everyone joins
  and buys from the *same* box. When somebody hits big it pops up on every phone.
- **Opening** — tap a tab to rip it open. Or slide it: it follows your finger, and if you let
  go part way it **stays peeked** right where you left it (saved with the ticket). Slide past
  85% and it peels off. A peeked tab can be picked up from where it sits.
- **Set aside** — puts the ticket (peeks and all) in a tray under the stage and moves on.
  Tap it in the tray to bring it back to the front. The tray survives a reload (`pt_aside_v1`).
- **Toss it** — on an unfinished ticket, Darlene checks it first: a winner is
  opened and paid instead of thrown out; a loser goes straight in the bucket. "Pull all five" opens the rest.
- **The flare** — laid out like the chart on a ticket back: each combo with its arrow (or bar),
  the prize, "N Winners", a dot per prize (red = pulled, green = still in the box), and the winners board. Beside the ticket on an
  iPad in landscape, under it in portrait, behind the 📋 Flare button on a phone.

## Deals
Five deals, 400 tickets each: **Walleye Wishes**, **Hotdish Heaven**, **State Fair Fortune**,
**Loonatic Lake** ($1) and **Uff Da 7s** ($2, everything doubled).

**Loonatic Lake** (v84) is the Loonatic Cannabis box: the top symbol is the brand's own loon
roundel (cropped from the brand sheet in `~/Developer/loonaticCannabis/brand`, cream keyed to
transparent, a 9KB WebP data URI inside `PT.DEALS.loon`), a night-lake ticket in the brand's
black-to-forest green, and the spaced serif wordmark. A symbol may be an emoji string or
`{img, alt}`; the UI draws every symbol through `sym()`/`sym3()`, never `d.syms[i]` directly. Per $1 of price the box holds
$100×1, $50×1, $30×1, $20×2, $10×3, $4×10, $2×12, $1×20 — 50 winners in 400,
83.5% back over the whole box. No seal (removed in v86).

## Money
Play money, kept per device across visits (`pt_bank_v1`). The ATM gives $20 for $23 —
a $3 fee, because it's a VFW. **Net** = cash − everything taken from the ATM.

## Architecture
Single `index.html`, two script blocks like Hold'em and Spite & Malice.

- **Block 1 — `window.PT`, the engine. No DOM.** A box is decided when it's made: every
  outcome is shuffled into `box.order` from a seed, so the odds are real and finite.
  `ticketFor(box, n)` derives a ticket's nine cells, and for a winner its line, arrow direction and TOTAL cell, deterministically from the seed and the
  ticket number, so a lost ticket can be resent identically. `sell`, `claim`, `view` —
  and `view()` never contains `order`.
- **Claims tell the board, not sales.** A winner bought but not yet opened still shows green
  on the flare — exactly how the wall at the VFW works.
- **Block 2 — the booth and the network.** Host-authoritative over the two ntfy relays
  (`jtpt-v1-<code>`), same model as Hold'em: the host's phone holds the box (saved to
  `pt_host_v1`, so "Reopen box" survives a reload); guests send `hello` / `buy` / `claim`,
  the host answers `tix` to the buyer only and broadcasts a debounced `board` (and a 20s
  heartbeat). Only the host broadcasts — ntfy rate-limits per IP and a bar is one IP.
- A `buy` carries a request id; a retry with the same id gets the **same** tickets back
  instead of selling more. A claim is honoured only from the ticket's buyer, once.
- Streams start at `since=<now-20s>`, not `since=all` — an all-night box would otherwise
  replay every old buy at a newcomer.
- The board carries only the last 15 log entries (ntfy caps ~4KB); each phone merges them
  into its own full winners board.
- Your unopened pile (`pt_pile_v1`) survives a reload; rejoin the same box to keep claiming.

## Testing
Harnesses in the cloud container at `/root/smt/`: `pt1.mjs` sells out a whole solo box at
four viewports and asserts every prize, the seal and the payout land; `pt2.mjs` tap- and
drag-opens (a short drag must not open); `pt4.mjs`/`pt5.mjs` run a host and two guests on an
in-memory relay (`window.__PT_TX`) — shared board agreement, duplicate-rid safety, and the
big-win toast reaching the other phones. Test door: `window.__PT`.
