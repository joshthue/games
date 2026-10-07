# Cribbage

A single-file, play-in-the-browser game of **Cribbage** — the classic race to **121**.
**Two, three or four handed** (v115). Every seat is you, a bot, or a friend on their own phone —
you set the table up before the deal.

## Set up your game
The game opens on the standard Game Night setup sheet (`../gn-setup.js`) under the standard
header (‹ Games, Log, Rules, Menu). Name, **Players** and **Game to** are the key rows; the
**Seats** rows stay on the sheet itself (not under More options) because choosing Phone for a
seat is how you start a two-phone game. Tips, four-color deck, speed, card size and card text
are under **More options**. **Deal** is pinned at the bottom (it reads **Create the room** when
any seat is a phone); **Join a friend's game with a code** under it opens the join screen.
Menu → *New game / change players* brings the sheet back.

- **Players: 2, 3 or 4.** Four handed is **Partners** (across from each other, one shared score;
  your partner's crib is yours) or **Every player** for themselves.
- **Game to 121** (standard) or **61** (short). Skunk lines move with it: under 91 / 61 in a 121
  game, under 31 in a 61 game.
- **Seats:** each seat besides yours is a 🤖 bot (rename them — Ole, Lena, Sven by default) or a
  📱 phone. Any phone seat makes it an online game: you host, read out the 4-letter code, friends
  join and take the open phone seats in order. It deals itself when every phone is in, or tap
  **Deal now** and bots take the empty seats. The setup is remembered (`crib_setup`).

## How it plays
- 2 players: 6 cards each, throw 2. 3 players: 5 each, throw 1, plus one card off the deck to the
  crib. 4 players: 5 each, throw 1. The crib is always 4 cards; the deal passes left.
- Play goes round to the dealer's left. A player who can't go under 31 says **Go** and is skipped
  until the count resets; when nobody can play, the last card pegs 1. Last card of the hand pegs 1.
- The show counts left of the dealer round to the dealer, then the crib. Points go to the seat's
  side (the partnership in a partners game).
- Standard cribbage scoring: fifteens, pairs, runs, flushes, nobs, his heels, and the pegging.

## Online — any number of phones (v115)
Host-authoritative over **ntfy.envs.net** (ntfy.sh's 250 messages a day per IP isn't enough for a
game). Topics:
- `jtcrib-v2-<code>` — the host's `room` (lobby) and `state` (the table), and the guests' `join` /
  `act` / `name`.
- `jtcrib-v2-<code>-<guest id>` — that guest's own cards (`you`), and nothing else.

The public `state` never carries a live hand, the crib or the deck: hands go out as face-down
placeholders until the show (when they're face up anyway). A guest gets its cards on its own topic
when they're dealt and again after the throw; after that every card it plays appears in the public
pile, so its phone works out what's left. Guests send moves; the host checks them (right seat,
legal card) and applies them. The host phone still holds the full deal, so this is fine for
friends, not for money.

Rate limits: envs.net allows a burst of 60 requests then one per 5 s per IP. The host coalesces
table updates to the latest and spends a send budget against that limit; a refused send is retried
with the newest state. State messages trim the log to fit ntfy's 4 KB cap; guests stitch the full
log back together by sequence number. Advice lines ("✓ Best keep…") are private to the seat they're
about and never published.

Not compatible with the v78 two-phone game (`jtcrib-v1`): everyone needs v115+.

## Tested
Headless full games: 2, 3, 4-partners and 4-every-player against bots (cards always conserved,
count never over 31, scores never past the target, every game finishes); a four-handed partners
game with two guest phones and a bot over an in-memory relay (all phones end on the same score,
each guest's hand matches the host's, **no public message ever carried a hidden card**, largest
message 3.5 KB); three-handed with one phone, **Deal now** filling the empty seat with a bot, and a
late phone told the table is full.

## Sound

Sound comes from `../sfx.js`, the shared Game Night sound layer — synthesized with
WebAudio, so there are no audio files to load and it works offline. The setting is stored
once for the whole origin, so muting in any Game Night game mutes them all. iOS won't let
a page make noise before the first touch, so the audio context waits for a gesture.

## Card size

Cards scale with the shared **S / M / L / XL** control (`../cardsize.js`), the **Card size**
row in Menu and under More options. **Card text** (S / M / L / XL, `--cardtext`) scales just
the printed rank and pip. At **XL text** the card switches to an index face (rank top-left,
suit bottom-right, no mirrored corner), because the centre pip ran into the corner rank on
S and M cards. Measured clean at every size × text step at 320 and 390. The steps are multipliers (0.86 / 1 / 1.2 / 1.4)
rather than pixel sizes, because the games don't share a base card size — a multiplier
scales each game from its own design. The choice is stored once for the whole origin,
like the mute key, so the size you pick here is the size in every Game Night card game.

XL is deliberately larger than a 7-card hand fits on one row on a small phone: past
about 390px wide the hand wraps to two rows instead of overflowing, which is the
trade-off XL is for.

## Running it

Open `index.html` in a browser — no build step or dependencies. Works offline once
loaded, as part of the Game Night home-screen app.
