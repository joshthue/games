# Euchre

The Midwest classic. You and North against West and East — a 24-card deck
(9, 10, J, Q, K, A), five cards each, first team to 10 points.

Single-file PWA, same shape as the other Game Night titles: a pure engine
(`window.EUCHRE`, no DOM) plus a separate UI layer, sharing the common
`gn-header.js`, `gn-setup.js`, `cardsize.js`, and `sfx.js` modules.

## Rules implemented

- **24-card deck**, four players in two fixed partnerships (seats 0+2 vs 1+3).
- **The bowers.** Jack of trump = right bower (top card); the other jack of the
  same colour = left bower, second-highest, and counts as a trump for both
  ranking and follow-suit (its effective suit becomes trump, not its printed
  suit).
- **Two-round bidding.** Round 1: starting left of the dealer, each seat may
  order up the turned suit or pass; on an order-up the dealer takes the up-card
  and discards one. Round 2: if all pass, each seat may name any other suit or
  pass.
- **Stick the dealer** (optional, default on): if round 2 comes back to the
  dealer with everyone passed, the dealer must name a suit. With it off, an
  all-pass hand is a misdeal and is re-dealt.
- **Going alone.** The maker may play alone; their partner sits the hand out and
  the lead skips that empty seat.
- **Follow suit** honouring the left bower's effective suit; trump/ruff/discard
  all legal where expected.
- **Scoring to 10.** Makers 3–4 tricks = 1; all 5 (march) = 2; alone + march = 4;
  alone + 3–4 = 1; makers fewer than 3 (euchred) = defenders 2.

## Bots

Heuristic, two strengths (Easy / Normal). Bidding scores a hand by trump count
and bower/ace strength with a slightly lower bar for ordering up your own
partner's deal; play leads trump when long, grabs off-suit aces, ducks under a
winning partner, and wins as cheaply as possible otherwise. Easy adds some
randomness and a higher bidding bar.

## Teaching mode

Outlines your legal cards in green, flags your trump (and labels the right/left
bower R/L), suggests whether a hand is strong enough to order up, and explains
each hint in plain language.

## Testing

- `scratchpad/euchre-test.js` — 35 engine assertions (bowers, left-bower-as-trump
  follow logic, trick winner, the full bidding flow including stick-the-dealer,
  every scoring case) plus a 250-game / 3,024-hand bot-vs-bot soak; every game
  reaches 10 and every hand records exactly five tricks.
- `scratchpad/euchre-pw.js` — Playwright: drives a full game to a winner through
  the real UI in four viewports (390×844, 320×568, 430×932, 834×1112) with no
  horizontal overflow and no console errors.
- `scratchpad/euchre-bid.js` / `euchre-call.js` — exercise the player-side
  bidding branches (order up, order up alone, discard-by-tap, round-2 suit call).

## Test door

`window.__EU` exposes `G`, `H`, `busy`, and `order(alone)`, `pass()`,
`call(suit)`, `discard(card)`, `play(card)`, `setAlone(v)`, `start()` for
headless driving.
