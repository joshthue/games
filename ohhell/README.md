# Oh Hell

Exact-bid trick-taking for four. Each round deals a fixed hand size (growing 1→N, or up and
back down), flips a trump, and everyone bids the precise number of tricks they'll take.
Make it exactly for 10 + your bid; miss by any amount for nothing. **Screw the dealer:** the
bids can't total the hand size, forcing the dealer off the safe number. High total wins.

Single-file PWA. Pure engine (`window.OHELL`, no DOM) + separate UI, sharing the
trick-taking table shell with Euchre/Spades (`gn-header`, `gn-setup`, `cardsize`, `sfx`).

## Engine
`roundSizes`, `deal` (flips trump), `bidLegal` (enforces the screw-the-dealer constraint),
`placeBid`, `legal`/`trickWinner`/`play` (follow-suit, trump wins), `score` (exact → 10+bid,
else 0), and `chooseBid`/`choosePlay` bots that bid to a hand-strength estimate and play to
hit their bid exactly (grab tricks when short, duck when full).

## Testing
`scratchpad/ohhell-test.js` — 18 assertions (round sizes, deal/trump, bid legality incl.
screw-the-dealer, trick winner, exact-bid scoring) + a 200-game/1,400-round bot soak with
tricks conserved and only legal bids. `scratchpad/ohhell-pw.js` — Playwright full game to a
winner across four viewports, no overflow, no console errors.

## Test door
`window.__OH` exposes `G`, `H`, `busy`, `bid(n)`, `play(card)`, `start()`.
