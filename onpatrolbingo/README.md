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

## Win pattern

**Cover all is the default** — the whole card. Change it from the setup screen or
the 🎯 chip next to your name during a game:

| Pattern | Wins on |
| --- | --- |
| Cover all *(default)* | every square |
| Any line | one line — across, down or diagonal |
| Two lines | any two complete lines |
| Four corners | the four corner squares |
| X | both diagonals |

The pattern is a **house rule, not a personal setting**: whoever changes it sets
it for everyone in the room (last change wins) and the others get a toast saying
who changed it to what. Someone joining mid-game picks it up from the room.

## Text size

The **🔠 chip** beside your name cycles **S → M → L → XL** and is remembered per
phone (**L** is the default — these cards get read across a room). Only the card,
the tapped-square readout and the suggestion text scale; the mini boards stay
mark-only.

Bigger sizes grow the cells **downward** — `aspect-ratio` is dropped in favour of
`min-height`, since keeping the square ratio would widen the cells past the screen.
Each square then auto-fits: a canvas measures the longest word against the cell's
inner width and steps the text down until it fits, only breaking a word when one
is genuinely too long (paraphernalia, windshield) rather than mangling every call.

## The card

- 5×5 card drawn from the **call packs** that are switched on (🎴 chip next to
  your name): Traffic stops, Things people say, Pursuits & action, On scene,
  The broadcast, and Cabin night — ~126 calls in all — plus any tag packs grown
  from accepted suggestions. Packs are a room rule like the pattern: whoever
  changes them changes them for everyone, and at least one has to stay on. The centre is the one square
  **every player shares** — set by `CENTER_SQUARE` at the top of the script
  (currently `Gran falls asleep`; `★ FREE ★` is the classic). Change that string
  and every card picks it up on the next load, in-progress cards included, without
  losing any marks.
- **The centre is tapped like any other square** — it doesn't count toward the
  pattern until someone claims it, and ♻️ Fresh squares leaves it in place.
- First to complete the chosen pattern wins. 🎉 fires for you and toasts the rest
  of the room.
- Each player's pill shows how they're doing — marks, **2 away**, **1 away 👀**,
  then lines — so you can see who to worry about.

## Who else saw it

Your own squares show a **👥 count** of how many people in the room have that
same call marked — instant "we all saw that" without looking up. The opponent
readout also says whether the call is on your card and whether you've marked it.

## Reading another player's board

Their boards are shown as compact mark-only grids. **Tap any of their squares**
and the full text appears in the open area right below their board, along with
whether they've marked it. Tap it again (or another square) to change it.

## Suggestions

- **💡 Add a suggestion** — either a **square idea** (a call to consider for the
  card pool) or an **app idea**. It's broadcast to everyone in the room and kept
  on your phone.
- **📋 Copy all** / **💬 Text the list** / **✉️ Email the list** get the ideas off
  the phone as plain text tagged `[SQUARE]` / `[APP]`. Worth doing before bed —
  suggestions live in localStorage and on a relay that only keeps messages ~12h.
- **📌 Everyone** on a square idea pushes it into *every* phone's packs at once,
  instead of each person opting in with ➕.
- **Tag a suggestion** (optional field — "IHOP", "catchphrase", "Oklahoma") and
  accepting it creates a **pack of that name**, switchable on and off with the
  built-ins. Untagged ideas land in "Room ideas". An older flat list of accepted
  ideas migrates into that pack automatically.
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
safe to hit mid-game. **🔀 My card** is still the full wipe.

It isn't free: after a refresh the button sits out a **90-second cooldown**,
counting down on the button face with a gold progress line. The timer is stored
per room, so reloading the page doesn't dodge it — but **starting a new round
clears it**.

## Rounds and the scoreboard

- **🆕 New round (everyone)** deals a fresh card to every phone in the room and
  bumps the round number. Wins carry over; cards don't.
- **🏆 Round N · name 2 · name 1** above the player list is the night's tally.
  A win is recorded against the round the *player* was in when they sent that
  board, so a stale card arriving after a new round can't score twice.
- **↩︎ Undo** takes back your last tap (up to 60 deep) — mis-taps on a phone-sized
  grid are inevitable, and on cover-all one bad tap hides for a long time.
- A **progress bar** under your card and each opponent's board fills toward the
  active pattern, turning gold at one away and red/blue on the win.
- **🔊 / 🔇** next to 🎯 toggles the siren audio (a generated two-tone wail, no
  audio files). Muting is remembered per phone; audio unlocks on the tap that
  starts the game, so the first siren isn't silent.

## Show-off bits

- Player list is sorted **closest to bingo first**, with 👑 on whoever's leading.
- Pills escalate: `9 to go` → `🔥 2 away` → `👀 1 away` (pulsing) → `🚨 BINGO!`
  (`🚨 COVER ALL!` on the default pattern) — counted against whatever pattern is set.
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
