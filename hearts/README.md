# Hearts

The classic trick-taker: you (south) against three bots, Bea (west), Dot (north) and Cy (east),
Easy or Normal. Play to 50 or 100; lowest score wins.

## Rules
- Pass three cards before each hand: **left, right, across, then no pass**, round again.
- The **2♣** leads the first trick. Follow suit if you can; the highest card of the suit led wins.
- No hearts and no Q♠ on the first trick unless that's all you hold. Hearts can't be **led** until
  one has been played (broken), unless you hold nothing else.
- Each heart is 1 point, the **Q♠ 13**. Take all 26: **shoot the moon**, you score 0 and everyone
  else 26. When somebody reaches the target, lowest total wins (ties share it).

## On the phone
- Tap a card to lift it, tap again to play. Cards you can't play right now are dimmed; tapping one
  says why. The three cards you received are outlined blue until the first trick.
- The table is a cross: each seat's chip shows total, **+this hand** in red, and cards left. The
  middle shows the pass direction, then whether hearts are broken.
- **Hint** lifts the card the Normal bot would play. **Last trick** shows the trick that just went.
- Speed (Relaxed / Normal / Fast) in the setup sheet and Menu; four-color deck, card size and card
  text in Menu. Bigger card text switches to an index face (rank and suit in the corner only).
- Your hand fans in one row while every corner stays readable, otherwise two rows. The table
  scales into whatever height is left: one screen, no scroll, checked with real notch/home-bar
  insets at 320, 375, 390 and 430 wide, every card size and text step, through game over.
- The game saves after every card (`hearts_game`) and resumes on reopen. `hearts_stats` keeps
  games won, best score and moons shot.

## How it's built
- **Engine** `window.HEARTS`, no DOM: `deal(g, seed)`, `setPass`, `legal`, `play` (returns the
  trick winner when a trick completes), `handPoints`, `score` (moon handling), `winners`.
- **Bot**: passes the Q♠ / A♠ / K♠ (unless it has plenty of low spades), high hearts, then the top
  of its shortest side suit. Plays: duck under the winning card; last to a clean trick, take it
  high; void, dump the Q♠, then high spades, then high hearts; leads low spades to smoke out the
  queen when it doesn't hold her. **Easy** plays a random legal card about 45% of the time and
  passes at random half the time (about 1.8x the points per hand of Normal over 300 games).
- `node hearts/rules.test.js`: rules checks plus 300 bot-only games (every play legal, 26 points a
  hand, every game ends).
