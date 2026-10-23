# Dump

**Dump** — an original take on the classic colour-and-number shedding game, one `index.html`,
you against three bots. **Not the Mattel brand** — original name, original card design (a white oval with a
bold numeral, corner indices, a star-backed deck, and custom glyphs for the actions), no trade
dress. Live at <https://joshthue.github.io/games/dump/>.

## How it plays
- Four players, seven cards each. Match the top of the discard by **colour**, **number**, or
  **symbol**, or play a **Wild** to change the colour. Empty your hand first to win.
- **Action cards:** Skip (next player misses a turn), Reverse (flip the order), Draw Two (+2),
  Wild (choose a colour), Wild Draw Four (+4, choose a colour).
- **Stacking (house rule, on):** a Draw Two can be stacked on a Draw Two, and a +4 on a +4 —
  the penalty accumulates and passes along until someone can't stack, and they draw the whole
  total and are skipped.
- **Draw to match (house rule, on):** can't play? You keep drawing until you turn up a playable
  card, then you may play it (or pass if the deck runs out).
- **Last card** is called for you automatically when you're down to one — no penalty to miss.
- First to empty their hand wins the hand.

## How it's built
Two script blocks in the one file, per the house standard:
1. **`window.DUMP`** — the pure engine. The 108-card deck, legal-play matching, `play` with
   all the effects, the **+2/+4 stacking chain**, draw-to-match, deck reshuffle from the discard,
   first-out win, and the bot. **No DOM.**
2. **The UI** — the only block that touches the page. The four-seat table, the discard/draw
   piles with a colour + direction indicator, the fanned hand, the wild colour picker, the
   stacking prompt, resume-from-`localStorage`. Asks `window.DUMP` for every rule.

Cards are drawn in CSS with an original look (coloured card, white oval, bold numeral/glyph,
corner indices; a conic four-colour face for wilds; a star-backed deck). Shared `../gn-header.js`,
`../gn-setup.js`, `../cardsize.js`, `../sfx.js`; felt-and-gold theme; build stamp.

`window.__DUMP` is the test door: `play(card, color)`, `draw()`, and getters for the hand and busy
state.

## Testing
The engine is proven in node by extracting its `<script>` block from this file and `eval`-ing it:
- deck integrity (108 cards; one 0 and two of each 1–9 per colour; two of each action; 4+4 wilds);
- legal matching by colour / number / symbol / wild;
- effects (skip advances two, reverse flips direction, draw-two sets the pending penalty);
- the **stacking chain** — +2 on +2 accumulates to +4 and passes along, then the player who
  can't stack takes the full total and is skipped; +4 stacks only on +4 (a +2 can't);
- draw-to-match, both the "draw until playable" and the "draw out and pass" cases;
- card conservation and termination over a 250-game bot-vs-bot soak (every game reaches a winner
  with all 108 cards accounted for).

A Playwright pass checks every viewport (390×844, 320×568, 430×932, 834×1112) for no horizontal
overflow and no console/page errors, then plays a full game through the UI via the test door.

## Not built (possible later)
Classic 500-point scoring across hands; 7-0 swap/rotate; jump-in; tap-to-call last card with a
catch penalty; two-phone multiplayer over ntfy. v1 is first-out-wins, solo vs three bots, with
stacking and draw-to-match on.
