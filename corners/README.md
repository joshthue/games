# Corners

A territory game of 21 polyomino pieces a player, the Blokus rules under an original name
(Blokus is Mattel's trademark and this is a public site). You against bots: **you + 3 bots on a
20×20 board**, or **1 on 1 on a 14×14 board**. Bots are Easy or Normal.

## How it plays
- Everybody holds the same 21 pieces: every shape of one to five squares, 89 squares in all.
- Your first piece covers your start square: your corner (4 players), or your dot near the middle
  (1 on 1, squares 5-5 and 10-10 as in the two-player edition).
- After that, every piece must touch one of **your own** pieces **corner to corner** and must
  **never** touch your own pieces **side to side**. Other colors don't matter; touching them is
  how you block them.
- Can't fit anything? You're out; the others play on. When everyone is out: **−1** a square you
  still hold, **+15** for playing all 21, **+5 more** if the single square went last.

## On a phone
- Tap a piece below the board: it lands on the board somewhere it fits (near where you last
  pointed, if it fits there).
- Tap or drag on the board to move it. **Rotate** / **Flip** turn it about that spot. It snaps so
  one of its squares sits under your finger, choosing a square that makes it legal when one does.
- White outline = fits, red = doesn't. **Place** is only live when it fits.
- Dots mark the squares you can grow from (Menu → Show where you can play). Pieces with no legal
  spot right now are dimmed. Each bot's last piece is outlined white.
- Short phones (under 740px tall): the pieces become one swipeable row and the board shrinks
  to fit, so board, buttons and pieces are all on screen (verified 320×568, 390×844, 430×932).
- Bots show only their color and squares left on narrow screens.
- A game in progress is saved after every move (`cn_game`) and comes back when you reopen.

## How it's built
Two script blocks, the house pattern:
1. **The engine**, `window.CORN`. Pieces and their 91 orientations, `legalCells`, `legalMoves`
   (anchors × pieces × orientations × which square sits on the anchor, deduplicated),
   `apply`/`advance` (marks players out, ends the game), scoring, and the bot. No DOM.
2. **The screen**: canvas board, piece tray, standard Game Night header and setup sheet.

**The bot** (`CORN.choose`). Normal scores every legal move: piece size (heavier early), plus new
corners it opens for itself, plus opponent growth squares it covers, plus a pull to the middle for
its first six pieces. Easy picks a random legal move weighted toward big pieces. Normal beats Easy
96 of 100 one-on-one games; its slowest move is about 35 ms.

## Tested
- `node corners/rules.test.js`: piece set (21 pieces, 89 squares, 91 orientations, no duplicates),
  first move must cover the start, corner yes / own side no / other colors fine, no piece reuse,
  out-of-turn refused, scoring, two-player start squares.
- `node corners/soak.test.js [N]`: N bot-vs-bot games (default 300, mixed 2 and 4 players, both
  levels), re-checking every move: always legal, every game ends, no color ever touches itself
  side to side across pieces, squares conserved, nobody left with a move when it ends.
- Browser: full games played through the UI at 320×568, 390×844 and 430×932, 4 players and
  1 on 1, including drag, Rotate, Flip and the scores screen; no page errors, no horizontal or
  vertical scroll.
