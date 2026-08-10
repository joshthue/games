# Rat — The Leech Lake Game

A single-file, play-in-the-browser version of **Rat** (aka *The Leech Lake Game*),
a trick-taking elimination card game. Play against computer opponents.

## How it plays

- Each hand, a **caller** picks the mode for that round:
  - **High** — highest card wins the trick
  - **Low** — lowest card wins
  - **Closest to 8** — the card nearest rank 8 wins
  - **Trump suit** — a chosen suit beats all others
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

## Running it

Just open `index.html` in a browser — no build step, no dependencies. It also works
offline once loaded, as part of the Game Night home-screen app.
