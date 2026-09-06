# On Patrol Live BINGO

A single-file bingo game you play along with the show — on your own or with the
couch/group chat crowd. Tap squares as they happen and chase a line (or a full card).

## Playing together

- Everyone types their **name** and the **same room code** on the setup screen.
  Capitalization, spaces and dashes don't matter: `Couch Night`, `couch-night`
  and `COUCH NIGHT` all land in the same room.
- Each player gets their own card. The room code is shown next to the player
  list so you can check everyone matched.
- **In the room** sits right under your own card — every other player's name,
  their live mini board, and how many lines they have. No tab to switch to.
- Sync runs over [ntfy.sh](https://ntfy.sh) with ordinary HTTPS requests, so it
  works over cell data and across networks — you don't have to share Wi-Fi.
  The room code is a shared password, not private.

## The card

- 5×5 card drawn from the show's greatest-hits pool, with **★ FREE ★** in the middle.
- **The centre square is tapped like any other square** — it doesn't count toward
  a line until you claim it.
- First to a full line — across, down, or diagonal — wins. 🎉 fires for you and
  toasts the rest of the room.
- Each player's pill shows how they're doing — marks, **2 away**, **1 away 👀**,
  then lines — so you can see who to worry about.

## Reading another player's board

Their boards are shown as compact mark-only grids. **Tap any of their squares**
and the full text appears in the open area right below their board, along with
whether they've marked it. Tap it again (or another square) to change it.

## Suggestions

- **💡 Add a suggestion** — either a **square idea** (a call to consider for the
  card pool) or an **app idea**. It's broadcast to everyone in the room and kept
  on your phone.
- **📋 Copy all** puts the whole list on the clipboard as plain text, tagged
  `[SQUARE]` / `[APP]`, ready to paste somewhere durable.
- A square idea has **➕ Add to my pool** — tap it and that call joins your
  personal pool, so it can land on your next 🔀 New card (it doesn't change the
  card you're holding). Tap again to remove it. The pool lives on your phone;
  good ones still get folded into the shared pool in `index.html` by hand.
- Joining late still gets you the night's ideas: whoever's already in the room
  replays their recent suggestions when you arrive.

## Running it

Open `index.html` in a browser — no build step or dependencies. Works offline once
loaded (solo play), as part of the Game Night home-screen app.
