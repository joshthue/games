# I'm out, Jerry! — The Leech Lake Game

A single-file, play-in-the-browser version of **I'm out, Jerry!** (aka *Rat*, aka
*The Leech Lake Game*), a trick-taking elimination card game. Play against computer
opponents. The in-game rules screen still calls the game Rat, which is what most
people at the table call it.

The folder is still `theleechlakegame/` and always will be — the URL is what is on
phone home screens, and `localStorage` is per-origin-and-path, so moving it would
silently reset everyone's name and settings.

## How it plays

- Each hand, a **caller** picks the mode for that round:
  - **High** — highest card wins the trick
  - **Low** — lowest card wins
  - **Closest to 8** — the card nearest rank 8 wins
  - **Trump suit** — a chosen suit beats all others
- On the **opening 7-card deal**, every hand must contain at least one **Ace or Face**
  (A, K, Q or J). If any hand doesn't, it's a **misdeal**: that hand is turned face-up
  so the table can see it, and everyone is dealt again. Only the opening deal is
  checked — the hands shrink to two cards, where no-Ace-or-Face is the normal case.
- You must win **at least one trick** each hand. Win zero and you're knocked **OUT**.
- Hand sizes count down each round (7 cards → 2). Whoever takes the most tricks
  calls the next hand; ties are settled by a "first Jack" flip.
- **Last player standing wins.**

## Options

- **Four-color deck** — ♠ black · ♥ red · ♦ blue · ♣ green (on by default).
- **Speed play** — shorter delays for faster hands (on by default).
- **Learning tips** — optional in-game hints, in **Beginner** (plain rules) or
  **Advanced** (strategy) detail. Off by default; the Beginner/Advanced choice is
  only active while tips are on.

## Sound

Sound comes from `../sfx.js`, the shared Game Night sound layer — synthesized with
WebAudio, so there are no audio files to load and it works offline. The setting is stored
once for the whole origin, so muting in any Game Night game mutes them all. iOS won't let
a page make noise before the first touch, so the audio context waits for a gesture.

## Card size

Cards scale with the shared **S / M / L / XL** control (`../cardsize.js`), which sits
next to the four-color deck toggle. The steps are multipliers (0.86 / 1 / 1.2 / 1.4)
rather than pixel sizes, because the games don't share a base card size — a multiplier
scales each game from its own design. The choice is stored once for the whole origin,
like the mute key, so the size you pick here is the size in every Game Night card game.

The hand never wraps. The chosen size is a **maximum**: `fitHand()` measures what one
row of that many cards actually needs and scales the hand down if it doesn't fit, so XL
means "as large as fits on one row" rather than "large enough to wrap". Only the hand is
clamped - the trick area and the opponents' pills never hold seven cards, so they stay
at the size you picked.

At **XL the rank and the suit swap places**: the number moves to the middle of the card
and grows, and the suit moves out to *both* corners - top-left and bottom-right, mirrored,
the way the rank sits in both corners at the smaller sizes. The card is already tinted with
the suit's colour, so a big colour-coded number reads as a suit across the table on its own
and the corner pips only confirm it. Below XL the suit keeps the middle - a big number on a
small card is all number and no card. The swap doesn't apply to the tiny cards in the
opponents' pills, where a centred number that size would be the whole card.

## Running it

Just open `index.html` in a browser — no build step, no dependencies. It also works
offline once loaded, as part of the Game Night home-screen app.
