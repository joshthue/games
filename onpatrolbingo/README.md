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

## Running it

Open `index.html` in a browser — no build step or dependencies. Works offline once
loaded (solo play), as part of the Game Night home-screen app.
