# Spades

Four-player partnership Spades, one `index.html`, you against three bots.
You (south) and **North** (across) are a team; **West** and **East** are the other.
Live at <https://joshthue.github.io/games/spades/>.

## How it plays
- **Thirteen cards each. Spades are always trump.**
- **Bid** the tricks you expect to take. Your bid and your partner's make the team
  contract. **Nil** is a bid of 0 — a promise to take no tricks (±100). **Blind nil**
  (optional, only when your team is 100+ behind) is a nil bid before you look (±200).
- **Play:** follow the led suit if you can; otherwise play anything, including a spade to
  trump. Highest spade wins; with no spade, the highest card of the led suit wins. You
  can't *lead* a spade until spades are **broken** (someone has trumped in), unless spades
  are all you hold.
- **Score:** make the contract for +10 per bid trick, miss it for −10 per bid trick.
  Overtricks are **bags**: +1 each, but every **10 bags costs 100**. First team to the
  target (200 / 300 / 500) wins; a team at −200 loses.

## Teaching mode
A toggle on the start screen and in Menu. With it on:
- every card you're allowed to play is outlined in **green**, the rest dimmed;
- tapping a card you can't play explains the rule (follow suit / spades not broken);
- the bidding grid highlights the engine's trick estimate, and the note explains how to
  count a bid and when nil is safe;
- **Hint** lifts the card the bot would play and the green coach line says *why* (trump to
  win, duck to save strength, cash an ace, cover a partner);
- the hand recap after each hand explains who made or set their contract and tracks bags.

## How it's built
Two script blocks in the one file, per the house standard:
1. **`window.SPADES`** — the pure engine. Deal, bidding, `legal`, `trickWinner`, `play`,
   `score` (contract, bags with the 10-bag roll, nil / blind nil), win detection, and the
   bot (bid estimate, nil-safety check, trick play). **No DOM.**
2. **The UI** — the only block that touches the page. Table, bidding box, hand, teaching
   coach, animations, resume-from-`localStorage`. Asks `window.SPADES` for every rule.

Shared pieces: `../gn-header.js` (header), `../gn-setup.js` (start sheet),
`../cardsize.js` (card size / text), `../sfx.js` (sound). Felt-and-gold theme, the standard
four-seat table, and the build stamp at the bottom.

`window.__SPADES` is the test door: `bid(n, blind)`, `play(card)`, and getters for the game
and current hand, so a headless harness drives the real UI path.

## Testing
The engine is proven in node by extracting the engine `<script>` block from this file and
`eval`-ing it (never a second copy):
- trick resolution (follow suit, a lone spade beats the led-suit ace, highest spade wins);
- spades-can't-lead-until-broken, and the "nothing but spades" exception;
- contract scoring, set penalties, the 10-bag → −100 roll, nil made/failed, blind nil ±200;
- a soak of hundreds of bot-vs-bot games, each asserted to terminate legally with all 13
  tricks accounted for and a winner reached.

A Playwright pass checks every viewport (390×844, 320×568, 430×932, 834×1112) for no
horizontal overflow and no console/page errors, then plays a full game through the UI via
the test door to a winner.
