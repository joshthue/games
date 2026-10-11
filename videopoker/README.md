# Video Poker (`videopoker/`)

The bar-top machine at the Lake Uffda VFW: the blue glass, the yellow pay table, your bet column lit
red, HELD under the cards, and Speed / Bet One / Bet Max / Deal-Draw buttons.

## Games
| Game | Pay table (per coin) |
|---|---|
| **Jacks or Better 9/6** | RF 250 · SF 50 · 4K 25 · FH 9 · FL 6 · ST 4 · 3K 3 · 2P 2 · JJ+ 1 |
| **Bonus Poker 8/5** | RF 250 · SF 50 · 4 aces 80 · 4 2-4 40 · 4 5-K 25 · FH 8 · FL 5 · ST 4 · 3K 3 · 2P 2 · JJ+ 1 |
| **Double Double Bonus 9/6** | RF 250 · SF 50 · 4 aces + 2-4 400 · 4 2-4 + A-4 160 · 4 aces 160 · 4 2-4 80 · 4 5-K 50 · FH 9 · FL 6 · ST 4 · 3K 3 · 2P 1 · JJ+ 1 |
| **Deuces Wild (full pay)** | natural RF 250 · 4 deuces 200 · wild RF 25 · 5K 15 · SF 9 · 4K 5 · FH 3 · FL 2 · ST 2 · 3K 1 |

A royal flush on 5 coins pays **4000**, not 1250, like every real machine.

## Playing
- **Bet One** cycles 1 to 5 coins; **Bet Max** sets 5 and deals. **Deal**, tap cards to hold
  (HELD), **Draw**. The draw comes from the rest of the same 52-card deck.
- A dealt hand that already pays lights its row in white and names it. A win blinks its row and
  rolls up the WIN and CREDITS meters (a chip tick per step). A royal or four deuces sets off confetti.
- **Speed** 1-3 changes how fast the cards flip.

## Cards
- The house card from Three-Card Poker and Poker Squares: rank and suit in the corners, the pip in
  the middle, the blue back, and the **four-color deck** (on by default, Menu to turn off).
- **Card size** and **Card text** are the shared controls (`gn_cardsize`, `gn_cardtext`) in Menu.
  Five cards run across the glass, so sizes are relative to its width: **L fills it**, M is 83%,
  S 72%. XL can't go any wider than L. The print scales with the card (`--vs` = the card's width
  over the standard 52px).
- Card text **L/XL** switches to the index face (rank and suit top-left, suit bottom-right) so the
  big print never piles up, the same rule Jerry, Blackjack and Cribbage use.

## Money
- It's the **same wallet as Pull Tabs, Horse Race and Bar Dice** (`pt_bank_v1`), with the same
  ATM ($100 for a $3 fee). The bet comes out on Deal and the win goes in on Draw. **Credits** are
  your cash counted in the coin you picked (5¢, 25¢ or $1), so there's nothing to cash out.
- A hand dealt but not drawn is saved (`vp_hand`). Reopening the app puts you back on it, with the
  money already taken.
- Menu shows each game's hands, money put in, paid out, return %, and best hit (`vp_stats`). Also
  in Menu: Card text, Sound, and Change game or coin.

## Fit
One screen, no scroll. The cards size from the glass width. On a tall phone the pay table grows
into the spare glass (font first, as long as every label fits, then the row spacing). A phone on
its side puts the table on the left and the cards on the right. Checked with real notch/home-bar
insets at 320×568, 375×667, 390×844 and 430×932, plus 667×375 and 932×430 on the side, for all
four games and every Card size and Card text step.

## How it's built
- **Engine** `window.VP`, no DOM: `GAMES` (rows top to bottom as drawn), `evaluate(game, five)`
  (natural hands with the Bonus/DDB quad and kicker splits; Deuces Wild counts wild cards toward
  five of a kind, straights and flushes), `pay`, `deal(game, coins, seed)`, `draw(hand)`.
- `node videopoker/rules.test.js` runs every one of the 2,598,960 five-card hands through all four
  evaluators and matches the published deal counts (e.g. Deuces Wild: 4 natural royals, 48 four
  deuces, 480 wild royals, 624 five of a kind). It also checks 2000 draws: held cards stay, draws
  come from the rest of the deck, and every win matches the table.
