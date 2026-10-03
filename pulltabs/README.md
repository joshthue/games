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
**Slanted lines (v89):** the printed strips push the rows further apart than a square is wide,
so a diagonal can't run corner to corner in each square. `paintArrows()` measures the real
slope (row pitch / square width) once the ticket is on screen — and on resize — and draws each
square's piece along it; both strips are a fixed height so the three windows are evenly spaced.
The pieces sit within ~1px of one straight line at every tested size.
**Thin lines (v90):** arrows and bars are drawn thin and slightly see-through (shaft ~4.5% of a
square, ~88% opacity) so the picture under the line still shows — you have to read the combo.
**The line is the tell (v92-v93):** winning squares look like any other square, and most
winners print **no $ box** — you spot the line and read what the combo pays off the flare.
`t.box` (drawn last in `ticketFor`, so older tickets' squares don't shift) prints the $ box on
about one winner in four, and always on a two-line ticket, where the TOTAL adds them up.

**Two marker styles (v87)**, both from real tickets: arrow deals (Walleye, Hotdish, Loonatic)
print an orange arrow with a "$X TOTAL" splash; bar deals (State Fair, Uff Da 7s) print a flat
red bar with a plain yellow "$X" square, like Josh's $200 darts ticket. `PT.DEALS[k].marker`.

**The card (v87)** copies the real card stock: white with a border of stars in the deal's colour,
rounded perforated windows, a printed strip between each pair of tabs (deal name + price, then
cheesy fine print from `PT.DEALS[k].fine`), and a yellow serial-number sticker on the top window
— one per box, derived from the box id. **Since v94 the sticker is only on the big winners**
(the top three rungs: $200/$100/$60 on a $2 box, $500/$250/$150 on the $5 box — 3 tickets a box,
`BIG_TIERS`/`bigOne()`), because seeing it under the top tab is how you know you've hit a big one. Since v91 the sticker is printed over the pictures and
the line (only the $ box sits above it), and it moves to the right of the top window when the
$ box is in the top-left square, so neither ever hides the other.
Tickets from before v86 (matching rows, five tabs, seal cards) are cleared from a pile on
load, and any unopened winner among them is paid out first.

## Play (v95: the booth)
- **The booth** — all five boxes sit on the counter at once, each drawn as an open cardboard box
  whose stack of tabs goes down as anybody buys, with its count left and whether its top prize
  is still in. Tap a box to buy from it and see its flare. A sold-out box stays on the counter,
  empty and stamped SOLD OUT, until somebody buys that deal again — then a fresh box is cracked.
- **Buying goes by the 20** (20 / 40 / 60 tabs). You walk in with **$100** (counted as money you
  brought, so Net starts even); the ATM gives $100 for $103.
- **Solo** — your own booth, all five boxes saved between visits. Fully offline.
- **Shared booth** — one phone starts it and reads out a 4-letter code; everyone joins and buys
  from the *same* five boxes, watching them go down together. Big hits pop up on every phone.
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
Five deals, 400 tickets each. Tabs are **$2** like at the bar — **Walleye Wishes**, **Hotdish
Heaven**, **State Fair Fortune**, **Loonatic Lake** — with **Uff Da 7s** as the occasional **$5**
box (v89). Prizes scale with the price, so a $2 box tops out at $200 and the $5 box at $500.

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
  (`jtpt-v1-<code>`), same model as Hold'em: the host's phone holds all five boxes
  (`S.boxes`, saved to `pt_host_v2` with the last few sold-out boxes in `S.old` so their tickets
  can still be claimed; "Reopen booth" survives a reload and upgrades a v1 single-box save).
  Guests send `hello` / `buy` (with the deal) / `claim`; the host answers `tix` to the buyer
  only — **in parts of 12** (`TIX_PART`), because 60 tickets don't fit one ~4KB relay message —
  and broadcasts a debounced `board`: a summary of every box plus the newest 12 winners across
  all of them (each phone keeps its own full history per box). Only the host broadcasts — ntfy
  rate-limits per IP and a bar is one IP.
- A `buy` carries a request id; a retry with the same id gets the **same** tickets back
  instead of selling more (`S.rids`, last 200). A guest re-asks if any part of its tickets is missing. A claim is honoured only from the ticket's buyer, once.
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
