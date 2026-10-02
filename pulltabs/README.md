# Pull Tabs

Minnesota bar pull tabs at the Lake Uffda VFW Post 10,000. Buy tabs from a finite box,
peel back five windows, check the flare, sign the seal. Darlene runs the booth.

## Play
- **Solo** — your own private box per deal, saved between visits. Fully offline.
- **Shared box** — one phone starts a box and reads out a 4-letter code; everyone joins
  and buys from the *same* box. When somebody hits big it pops up on every phone.
- **Opening** — tap a tab, or slide it right past a third of its width. "Pull all five" opens the rest.
- **The flare** — the prize sheet: every rung of the ladder with a dot per prize (red = pulled,
  green = still in the box), the seal board, and the winners board. Beside the ticket on an
  iPad in landscape, under it in portrait, behind the 📋 Flare button on a phone.

## Deals
Four deals, 400 tickets each: **Walleye Wishes**, **Hotdish Heaven**, **State Fair Fortune**
($1) and **Uff Da 7s** ($2, everything doubled). Per $1 of price the box holds
$100×1, $50×1, $20×2, $10×3, $5×8, $2×10, $1×16 plus 8 seal cards and a $50 seal —
86.5% back over the whole box, ~1 ticket in 8 does something.

## The seal
A ✍️✍️✍️ ticket pays no cash; it signs your name on the next of eight seal lines. When the
eighth line is signed the seal is peeled — a line number fixed when the box was made — and
that line wins the seal prize. If a box sells out with lines still blank, the box holder can
peel it early from the Menu; a blank winning line pays nobody (dock fund).

## Money
Play money, kept per device across visits (`pt_bank_v1`). The ATM gives $20 for $23 —
a $3 fee, because it's a VFW. **Net** = cash − everything taken from the ATM.

## Architecture
Single `index.html`, two script blocks like Hold'em and Spite & Malice.

- **Block 1 — `window.PT`, the engine. No DOM.** A box is decided when it's made: every
  outcome is shuffled into `box.order` from a seed, so the odds are real and finite.
  `ticketFor(box, n)` derives a ticket's five rows deterministically from the seed and the
  ticket number, so a lost ticket can be resent identically. Losing rows never show three
  of a kind (a third of them tease two of the top symbol). `sell`, `claim`, `openSeal`,
  `view` — and `view()` never contains `order` or the seal number until it's opened.
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
