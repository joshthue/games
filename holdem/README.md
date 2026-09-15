# Hold'em — 6-Player Sit & Go

A single-file, play-in-the-browser **Texas Hold'em tournament**: you against five
computer opponents, six-max, rising blinds, last one standing wins. This is real
Hold'em against a table — not the casino you-vs-the-dealer game in
[`ultimatetexasholdem/`](../ultimatetexasholdem/).

## How it plays

- **6, 8 or 9 players**, 5,000 chips each. Blinds start at 10/20 and go up every few hands.
- Two hole cards each, five community cards: **preflop → flop → turn → river → showdown**.
- Bust and you're out. When you're knocked out the rest of the table plays on so the
  finishing order you're shown is the real one.
- Finishes are kept locally — games played, wins, top-3s, average finish.

## The rules it actually implements

The betting engine is the point of this one; the fiddly cases are all handled:

- **Side pots** — every all-in creates its own pot with its own eligibility list, built
  from each player's total contribution. Folded players' chips stay in the pots they paid into.
- **Min-raise re-opening** — a raise must be at least the size of the last one, and an
  all-in *short* of a full raise does **not** re-open the betting for anyone who already acted.
  They can call or fold, nothing else.
- **Uncalled bets** are returned before the board runs out.
- **Heads-up** — the button posts the small blind, acts first preflop and last after the flop.
- **Split pots** — odd chips go to the first player left of the button.
- **Dead button** — as players bust, the big blind always advances one live player, so the
  small blind and the button can land on an empty seat.

## The opponents

Each bot is drawn from a pool of personalities — The Rock, Nitwit, Tag, Grinder,
Wildcard, Calls-a-Lot and Maniac — that differ in opening range, aggression and how
often they bluff. They open by position, tighten against big raises, and switch to
push-or-fold once they're short-stacked. After the flop they estimate their equity by
Monte Carlo against a range and weigh it against the pot odds.

Measured over ~58,000 hands of bots-versus-bots, they play like their labels: The Rock
runs about 16% VPIP / 10% PFR, Calls-a-Lot 37% / 7%, Maniac 44% / 42%.

## Options

- **Table size**: 6, 8 or 9 players, picked before a tournament starts. A fuller table
  plays tighter and runs longer (roughly 84, 92 and 99 hands respectively).
- **Blind speed**: Turbo (~20 min), Standard (~30), Marathon (~40). Turbo is the default.
- **Text size**: S / M / L / XL, applied immediately — useful on a tablet, where the
  felt gets much bigger and the default type can look small.
- **Felt logo**: Birch & Gran, Loonatic Cannabis, a plain Hold'em wordmark, or none.
  Loonatic is split across the table — the loon roundel above the pot, the lettering below the board.
- **Four-color deck** and **Speed play** on by default; **Tips** (pot odds and each
  opponent's playing style) off by default.
- A tournament in progress is saved between hands, so you can close the app and come back.

## The felt watermark

Two brand marks ship with the game, both built to read as watermarks on a dark ground
rather than as pasted-on images.

**Birch & Gran** is drawn as inline SVG straight from the brand kit's own rules: on a dark
field the wordmark and birch go paper cream and the ornament gold *lifts* to `#C6A868`,
because lichen is unreadable on a dark ground and gold is never set as text. Birch above,
wordmark, gold rule and diamond, tagline — the letterhead lockup, vertically stacked.

**Loonatic Cannabis** is the real artwork, not a redrawing — the loon has far too much in
it to reproduce by hand and still be the same mark. It comes from the brand sheet's own
**reversed-for-dark-grounds** panel rather than the hero image, which matters: keying the
hero image by luminance drops the loon's black body and leaves only its white speckling,
whereas the reversed lockup is already solid cream and survives keying intact.

That panel's background measures 21 on max-channel, so the key uses a **black point of 30** —
below it the panel floor survives and leaves a visible box on the felt; far above it and
CANNABIS, the arch and the leaf start to disappear. The result is tinted paper cream and
split into two WebP data URIs (12 KB + 10 KB), because the mark reads better wrapped around
the action than stacked in one corner: **the roundel sits above the pot, the lettering below
the board.**

A felt logo is defined as up to two pieces — `top` above the pot, `bot` below the board —
each with a width and a vertical position as percentages of the felt, so a new mark is a
data entry rather than new layout code.

## Dealing the board

The five community slots are **reconciled, not rebuilt**. Each slot carries the card it is
currently showing, and a repaint only replaces the slots whose card actually changed —
so a card already on the felt keeps its DOM node, and its deal animation cannot replay.
Rebuilding the row instead (the original approach) made **the flop slide down again
alongside the turn, and again on the river**, because every card was recreated with the
deal class on it. `render()` also paints only what has actually been revealed rather than
the whole of `T.board`, or the turn would appear an instant before its own animation.

## Playing against other people

**Play with friends** on the start screen. Everyone opens the page and types the same
room name; whoever taps **Create the room** deals. Bots can fill the empty seats, so
three people plus two bots is a five-handed table.

**The dealer's device runs the game.** There is no backend to be the house, so the
room's creator holds the engine: it deals, validates every action and broadcasts the
table. Everyone else renders what the dealer sends and sends back only their own
action. That phone has to stay open — if it closes, the table goes with it.

**Hole cards are encrypted to each player individually.** The relay topic is public:
anyone who knows the room name can read every message on it, and so could everyone at
your own table. So on joining, each device generates an ECDH P-256 key pair and
publishes the public half; the dealer derives a shared secret per player and AES-GCM
encrypts that player's two cards to them alone. Broadcast state carries no hole cards
at all until a showdown, where they are public anyway. This is the part not to
"simplify" later — without it the game is unplayable, not merely insecure.

**Transport** is the same two public ntfy relays BINGO uses (`ntfy.sh`,
`ntfy.envs.net`), a long-lived SSE stream per relay with plain-GET polling as the
fallback. Rate limits are per IP and a cabin puts a whole table behind one, so only
the dealer broadcasts, clients speak only when they act, and the polling fallback is
slower here than in BINGO for the same reason.

**Diagnosing it in the air.** The room line in the lobby is tappable and reports each
relay separately — receiving / not connected / rate-limited — because on a plane there
is no console to open. Only one of the two relays has to work. Both blocked means the
network is filtering them, and a phone hotspot is the way out.

**When things go wrong.** A player who goes quiet for 45 seconds is checked if it's
free and folded otherwise, so one asleep phone can't stall the table. Reconnecting
with the same device id drops you back into your seat with your cards — the id is
kept in `localStorage`, so a reload or a locked phone is survivable. Someone arriving
mid-tournament is told to wait and is dealt in when it ends, because the table size
is fixed when the engine is created.

## Playing offline

The whole game is one self-contained file and the service worker caches it, so solo
play against the bots needs no network at all. Open the page once while online and it
is cached; documents are fetched network-first with the fresh copy written back to the
cache, so simply loading it online is also how you *update* the offline copy. Verified
by loading the site, cutting the network entirely, and playing five hands.

Multiplayer, of course, needs a network — the dealer has to reach the others.

## Playing on a monitor

At 1024px and up the felt becomes a **wide oval** (1.58:1) sized from the window height
rather than its width, so the whole table always fits without scrolling and grows to fill
a large screen instead of sitting at phone width in the middle of it. The seat ellipse
widens with it — a radius tuned for a phone-shaped table leaves big empty lobes at each
end of a wide one — and type, cards, chips and the felt art all get their own sizes at
that breakpoint, since the container-query units that scale a phone table would make a
1200px one enormous.

This is the one place the game uses `vh`, and deliberately: the breakpoint is desktop
browsers only, never the iOS PWA, which is where `vh` sizing misbehaves.

**Keyboard** (hints appear on the buttons at this size):

| key | action |
|---|---|
| `F` | fold |
| `C` | check or call |
| `R` | open the raise panel; `R` or `Enter` again confirms |
| `↑` `↓` | size the raise · `A` sets all in |
| `Esc` | close the raise panel or a sheet |

## Laying out the table

Seats aren't a hand-maintained coordinate table — they're placed on an ellipse with the
player pinned at the bottom, so 6, 8 and 9 all fall out of one formula. The widest a seat
can be without overhanging the felt is computed from the same geometry, so no table size
can produce horizontal scroll.

Everything on the felt is sized in container-query units against the table's own width,
so the whole table scales together from a 320px phone to a tablet; the text-size setting
is a multiplier on top of that. With 8 or 9 seats the side seats sit level with the board,
so the board narrows and anything that would land on it — bet chips, the dealer button —
is pushed to the near edge.

## How it's put together

Two script blocks. The first is the pure rules engine — card evaluator, betting engine,
bots — with no DOM access at all; the second is the table UI. Nothing in the first block
knows who is choosing the actions, which is what would let a networked table reuse it
unchanged.

The evaluator was checked exhaustively against an independently written brute-force
reference over all 2,598,960 five-card hands, producing exactly the 7,462 distinct hand
values a correct evaluator must. The betting engine was soaked over tens of thousands of
hands asserting chips are conserved, no stack goes negative, every hand terminates, the
pots always equal what was committed, and side-pot eligibility is properly nested.

## Sound

Sound comes from `../sfx.js`, the shared Game Night sound layer — synthesized with
WebAudio, so there are no audio files to load and it works offline. The setting is stored
once for the whole origin, so muting in any Game Night game mutes them all. iOS won't let
a page make noise before the first touch, so the audio context waits for a gesture.

## Running it

Open `index.html` in a browser — no build step or dependencies. Works offline once
loaded, as part of the Game Night home-screen app.
