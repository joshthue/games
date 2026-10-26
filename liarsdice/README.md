# Liar's Dice

Bluffing dice. Everyone hides five dice; you bid how many of a face are on the whole
table (aces wild), raising each other until someone calls **Liar** and the cups come up.
Guess the challenge wrong and you lose a die. Last player with dice wins.

Single-file PWA. Pure engine (`window.LIARS`, no DOM) + separate UI, sharing the dice
shell with Farkle and Pig (`gn-header.js`, `gn-setup.js`, `sfx.js`).

## Rules implemented
- Five dice each, hidden; you see only your own until a reveal.
- A bid is **quantity × face** (face 2–6) claiming at least that many across all dice.
  **Aces (1s) are wild** and count as the bid face.
- A raise must be a higher quantity, or the same quantity at a higher face. (Bidding the
  face 1 itself is disallowed — aces are wild only, which keeps the raise ordering clean.)
- **Liar** reveals everything and counts the bid face plus aces: enough → the challenger
  loses a die; not enough → the bidder loses a die.
- Lose all five and you're out; the round's loser opens the next round.

## Bot
Estimates the table from its own hand plus `unknown/3` (each unseen die matches a given
face — itself or an ace — with probability 1/3). It challenges an obvious overbid, makes
the most believable legal raise it can, and calls Liar when no safe raise is left. Easy
is looser and bluffs more.

## Testing
`scratchpad/liars-test.js` — wild-ace counting, bid legality, challenge resolution, a
2,000-case check that the bot only ever makes legal bids, and a 600-game soak (every game
resolves to one winner, dice conserved and never negative). `scratchpad/liars-pw.js` —
Playwright plays a full game to a winner through the real UI in four viewports, no
overflow, no console errors.

## Test door
`window.__LD` exposes `G`, `st`, `myDice()`, `total()`, and `bid(q,f)`, `liar()`,
`setB(q,f)`, `start()`.
