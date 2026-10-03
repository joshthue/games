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
so a peek shows the right-hand square first.
Since v98 the tab folds **flat** toward its hinge (`scaleX`), so it only ever gets narrower from
the right. The earlier 3D tilt toward the viewer made the right edge grow past the window at the
start of a pull — something a left-hinged tab can't do. The arrow is drawn a piece per square (`arrowSVG`), the way it's printed, so a peek
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
- **The booth** — all six boxes sit on the counter at once (two rows of three on a phone, one row
  of six on a tablet), each drawn as an open cardboard box
  whose stack of tabs goes down as anybody buys, with its count left and whether its top prize
  is still in. Tap a box to buy from it and see its flare. A sold-out box stays on the counter,
  empty and stamped SOLD OUT, until somebody buys that deal again — then a fresh box is cracked.
- **Buying goes by the 20** (20 / 40 / 60 tabs). You walk in with **$100** (counted as money you
  brought, so Net starts even); the ATM gives $100 for $103.
- **Live (v97)** — no rooms, no codes: there is ONE booth and everybody who opens Pull Tabs is
  in it, buying from the same six boxes in real time. A **BIG WINNERS ticker** scrolls across the
  top (wins of 10× the tab price and up, fresh boxes, sell-outs, "🔥 down to 50 tabs — the $200
  is still in!"), flashing gold on a big one; the roombar shows LIVE and who's at the booth
  (anyone seen in the last 10 minutes). `?booth=<name>` opens a private booth for testing.
- **Solo** — your own booth, all six boxes saved between visits. Fully offline.

## Deals
Six deals, 400 tickets each. Tabs are **$2** like at the bar — **Cherry Poppers** (v96, the
classic slot-style box from Josh's first photos: cherries are the key, arrow lines), **Walleye
Wishes**, **Hotdish Heaven**, **State Fair Fortune**, **Loonatic Lake** — with **Uff Da 7s** as the
occasional **$5** box (v89). Prizes scale with the price, so a $2 box tops out at $200 and the $5 box at $500.

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
- **Block 2 — the booth and the network (v97: no host).** Every phone posts its buys and claims
  to ONE ntfy.sh topic (`jtpt-v2-lakeuffda`) and applies that feed **in the relay's order** with the
  same `apply()`. Boxes are seeded from `(epoch, deal, generation)` (`seedOf`), so every phone
  builds the identical box, allocates the identical tabs to each buyer, and cracks the identical
  fresh box when one sells out — no phone holds the boxes and nobody has to stay open.
  Verified against the real relay: the cached replay (`poll=1&since=all`) and the live stream
  deliver messages in the same order, and repeated polls are identical. Only ntfy.sh is used
  (not the second relay), because two relays could order messages differently and **the order
  is the game**. Claims are batched (one message per ~1.5s) for the per-IP rate limit.
  The relay keeps ~12h, so every 20th buy its buyer posts a **snapshot** (gen/sold/claimed per
  box + recent winners, ~2KB). A phone walking in starts from the first snapshot it can see, or
  cold-starts at today's epoch; tickets sold before that snapshot have no known owner and are
  accepted on first claim. Trade-off, stated plainly: with no server, anyone reading the source
  can work out upcoming tickets — fine for play money; a Cloudflare Durable Object would close it.
- A `buy` carries a request id; a retried buy is applied once (`S.rids`). A claim is honoured only from the ticket's buyer, once.
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
