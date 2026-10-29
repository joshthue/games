# Gin Rummy

Two-handed. Draw and discard to build melds (sets and runs); get your leftover deadwood
to 10 or less and knock, or clear it for gin. First to 100. Play **vs the bot** or **two
phones** online.

Single-file PWA. Pure engine (`window.GIN`, no DOM) + separate UI, sharing `gn-header`,
`gn-setup`, `sfx`.

## Engine
- `bestMelds(hand)` — the minimum-deadwood partition via a set-packing solver over all
  candidate melds (so four of a kind that would be better split into 3-of-a-kind + a run is
  resolved correctly). Returns melds, deadwood, and the leftover cards.
- `layoff(knockerMelds, defenderDead)` — extends the knocker's melds with the defender's
  dead cards to compute the reduced deadwood.
- `knock()` resolves gin (+25, no lay-offs), a normal knock (difference), or an **undercut**
  (defender ties or beats → +25 plus the difference).
- Bot: draws the discard only when it lowers deadwood; discards to the minimum; knocks at
  ≤10.

## UI
Melded cards wear a gold bar; a live deadwood readout shows what you'd knock with; the Knock
button lights (and reads "Gin!") only when a discard gets you to ≤10 (0). **Sort** cycles the
hand through three orderings — by suit (spot runs), by rank (spot sets), and melds-first
(your melds grouped, then deadwood). The card you just drew wears a **ring** so you can spot it
in your sorted hand — teal for a stock draw, red for the upcard you took off the discard — and
sits flat in the hand. **Tap** a card to select it (it rises); tap it again, or **flick it up**,
to throw it to the discard — the card flies to the pile. When you draw that upcard you
**can't discard it the same turn** (the standard Gin rule): it wears a red ring, taps and flicks
on it are refused, and the knock/deadwood readouts exclude it. Hand cards slide to their new
spots as the hand reorders; animations honor `prefers-reduced-motion`. The
start screen and the in-game menu both carry a **four-color deck** (clubs green, diamonds blue)
to tell the suits apart at a glance, plus **Card size** and **Card text** (S/M/L/XL, the shared
`cardsize.js` control used across the card games) that scale the cards and the printed rank/pip —
the hand re-fans to fit, so it never overflows. On the start screen all options show at once (no
"More options" fold), and on a tablet the sheet centers instead of stranding Deal at the bottom.

## Online — two phones
Pick **Two phones** on the start screen. One player taps **Create game** and reads out the
4-letter code; the other taps **Join with code**. Host-authoritative over the free `ntfy`
relay (`jtgin-v1-<code>`, no accounts), the same transport Spite & Malice uses. The host
runs the engine (seat 0) and publishes a **per-seat view** that carries only the receiver's
hand plus the opponent's card count and the stock count — the opponent's hand and the stock
order never go on the wire. The guest renders that view and sends its moves (`drawStock`,
`drawDiscard`, `discard`, `knock`, `next`) back for the host to apply. No bot in online mode;
a netbar shows the room code and connection. An injected `window.__GIN_TX` replaces the relay
for headless tests.

## Testing
`scratchpad/gin-test.js` — meld detection, min-deadwood on known hands, gin, lay-off,
undercut scoring, + a 120-game bot soak all reaching 100 with a winner.
`scratchpad/gin-pw.js` — Playwright full game to a winner across four viewports, no
overflow, no console errors.
`scratchpad/gin-online-pw.js` — solo regression + a two-page online game over a mocked
relay: connect, hidden-hand deal, turn/stock/discard sync, a knock to a consistent result on
both pages, and a check that no host-hand ever appears in a published message.

## Test door
`window.__GIN` exposes `G`, `H`, `drawStock()`, `drawDiscard()`, `discard(c)`, `knock(c)`,
`start()`, plus `hostCreate()`, `guestJoin(code)`, `net()`, `mode()`, `encodeView`/`decodeView`.
