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
- Sync runs over two public relays — [ntfy.sh](https://ntfy.sh) and
  ntfy.envs.net. Each phone publishes to both and listens to both, so a relay
  that's blocked or rate-limited on one network doesn't break the room; you only
  need to share **one** working relay. The room code is a shared password, not private.
- Transport is a long-lived SSE stream per relay (instant, one request), falling
  back to slow HTTPS polling when a stream is blocked.
- **Tap the status line** (top-right, next to the dot) for a per-relay diagnosis —
  connected / blocked / rate-limited — plus the room topic. Tapping also retries.
  If both relays say blocked, that network is filtering them: try cell data or a hotspot.

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

## Fresh squares

**♻️ Fresh squares** re-deals only the squares you haven't marked, drawing from
the pool *as it stands right now*. Calls added since the deal (yours or ones you
accepted from someone's suggestion) can come in; anything removed from your pool
drops out. Marked squares, and any line you've built, are untouched — so it's
safe to hit mid-game. **🔀 New card** is still the full wipe.

## Show-off bits

- Player list is sorted **closest to bingo first**, with 👑 on whoever's leading.
- Pills escalate: `3 marked` → `🔥 2 away` → `👀 1 away` (pulsing) → `🚨 BINGO!`
- Anyone reaching one square out sets off a short **red/blue siren sweep**, a
  wig-wag on the header 🚨, a toast and a buzz — everyone in the room sees it.
- A bingo runs the sirens longer plus confetti.

## Build stamp

The bottom of the setup screen and the suggestions panel show `build vNN · <date>`
in your local time — the quickest way to confirm a refresh actually took.
`BUILD_V` / `BUILD_ISO` sit at the top of the script and are bumped together with
the `sw.js` cache version.

## Running it

Open `index.html` in a browser — no build step or dependencies. Works offline once
loaded (solo play), as part of the Game Night home-screen app.
