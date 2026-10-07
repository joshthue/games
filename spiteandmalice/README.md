# Spite & Malice

A single-file, play-in-the-browser **Spite & Malice** (Cat & Mouse / the game
Skip-Bo is based on): race to empty your face-down **goal pile** onto four shared
centre stacks. They build **Ace → King**, **King → Ace**, or **either way** — your
choice on the deal screen. Play **solo against a bot**, or **head-to-head
on two phones** in a room — same room model as [`cribbage/`](../cribbage/).

## Screen

The standard Game Night header: **‹ Games**, **Rules**, **Menu**, the name, and the
dedication line *Grandma Jo's game*, on flat felt like the other games (no glow
behind the header — removed in v132). The deal screen is the shared setup sheet
(`gn-setup.js`): goal pile, centre stacks (with a one-line explainer of the chosen
direction) and opponent up front; bot difficulty, move hints, sound, card size and card
text under **More options**; **Deal** pinned at the bottom. With **Two phones** picked the
button becomes **Create game** and a **Join with code** button appears under it, both
opening the existing room panels. **Menu** has Back to all games, New game (back to the
sheet), Rules, and the in-game options.

## How it plays

- Two decks plus **four Jokers** (Jokers are wild; Kings are just Kings).
- Each player has a **goal pile** (Short 13 or Standard 20 cards), a hand of **5**,
  and **four personal side stacks** to park cards on.
- On your turn, play as many cards as you can to the four centre stacks — from your
  goal-pile top, your hand, or a side-stack top.
- **A centre stack is scooped to the shuffler the moment it holds 13 cards**, whatever
  rank it ends on. That pile is the only thing that refills the stock. In `A → K` and
  `K → A` all 13 go and the stack reopens empty; in `Either way` the **top card stays
  behind** and only the 12 beneath it are recycled.
- **Empty your goal pile to win.** You end your turn by discarding one hand card onto a
  side stack; if you empty your hand first you draw back up to five and keep going.
- **Drag a card** (goal-pile top, hand card or side-stack top) onto a green centre to play it,
  or drag a hand card onto one of your side stacks to discard and end your turn. Near a legal
  drop the card **snaps** onto it (the stack glows) — let go anywhere in that zone and it lands.
  Dropped anywhere else, it flies back to where it came from.
- Tapping still works: tap a card to pick it up, tap a green centre to play it; tap a hand
  card then a side stack to discard.

## Options

- **Goal pile**: Short (13) or Standard (20).
- **Centre stacks build**: `A → K` (standard), `K → A` (the mirror), or `Either way`.
- **Bot**: Easy or Normal (solo only).
- **Card size** and **Card text**: S / M / L / XL each — the shared Game Night card size (`cardsize.js`), so a size
  picked here is the size in every card game. Cards scale to the screen: `fitBoard()` measures
  the largest card the board can take (width *and* height) and **XL fills the screen**, M is
  ~70% of it. On an iPad mini, XL fills the whole display. Before v82 this was a text-only
  setting inside a fixed 44px card, so the steps were barely visible. **Card text** (`--cardtext`)
  scales only the printed rank and suit (the card's base font-size), not the card; cards clip with
  `overflow:hidden` so XL text can't print past the edge.
- **Tablet / landscape**: labels and buttons step up from 700px wide; in landscape (900px+)
  your hand moves up beside your piles so the board is three card-rows tall, not four.
  Leftover height is spread between the rows rather than pooling under the buttons.
- **Phone sideways (v109)**: an iPhone in landscape is only ~390px tall, and the four-row board
  scrolled — the centre stacks above the fold, your hand below it, so you couldn't drag one onto the
  other. Any landscape screen under 540px tall now goes **two card-rows tall**: the bot's piles beside
  the four centre stacks, your piles beside your hand, turn banner and stock count between. `fitBoard()`
  sizes the cards for that row and never lets the board scroll there. The standard header folds to one
  row there (name and dedication left, pills right) so the cards keep their height (66px cards on an iPhone 15,
  80px on a Pro Max). Checked dragging by touch and mouse at 844×390, and in iPad mini portrait
  (744×1133) and landscape (1133×744).
- **Move hints** off by default.

### Either way

A stack opens with an Ace *or* a King, and from then on every card may go **one up or one
down**, wrapping King→Ace and Ace→King. Nothing ever reaches a dead end, so rank can no
longer end a stack — which is exactly why scooping is depth-based. Without the 13-card
rule a wrapping stack would grow forever, nothing would return to the shuffler, and the
stock would starve; with it, every stack still recycles on roughly the rhythm of the
standard game.

**The top card is left behind when a stack is scooped**, so the stack carries straight on
from wherever it landed instead of waiting for a fresh Ace or King. Only the single-
direction modes scoop all 13: their leftover would be a King (or an Ace) with no legal
card to follow it, and that stack would be dead for the rest of the game.

Two consequences worth knowing before you pick it:

- Far more of your cards play, so goal piles empty much faster — bot-vs-bot games run
  **under half the length** of `A → K` (≈24 turns against ≈51 at goal 13). Leaving the top
  card is most of that: a stack never needs an opener twice. The bot gets the same gift, so
  it is not easier, just much looser and faster. Pick Standard · 20 if it ends too quickly.
- You can't read how close a stack is from its top card any more. Watch the card count
  instead; it turns red at 11, two from clearing.

Jokers are still wild, but a stack usually needs one of two values, so playing one asks
which value it should take.

## Two phones (head-to-head)

Pick **Two phones** on the deal screen, then one player taps **Create game** and reads out
the 4-letter code; the other taps **Join with code**. You each play on your own phone.

It's **host-authoritative with no backend**, exactly like Cribbage: the guest sends its
moves to the host, the host owns the deal and the shared state and broadcasts a redacted
view back over two public **ntfy** relays (`jtsm-v1-<code>`). The guest never receives the
host's hand or the stock order. Because the host device holds the full deal, hidden
information isn't cryptographically secret — fine for friends, not for money.

The **loser of a game deals in first** on the next one, and the win screen's **Rematch**
button re-deals in place without kicking anyone back to setup.

**The host's settings are the game's settings** — goal size and build direction ride in
the state the host broadcasts, so the guest plays the host's choice whatever its own deal
screen says. A view without a direction (a phone still on an older build) is read as
`A → K`.

## Drag and drop (v104)

Drag is layered on top of tap-to-select rather than replacing it, so every move still goes
through `onCenterTap` / `onSideTap` and the same legality checks:

- A press that moves less than 7px is a tap. Past that, the card becomes a fixed-position
  ghost under the finger and `render()` runs with it selected, so the legal drops light up
  exactly as they do for a tap.
- Snapping: the nearest legal drop whose centre is within ~0.85 of a card width of the ghost's
  centre captures it (a bit stickier — 1.15 — once snapped, so it doesn't flicker on the edge).
  Android gives a tiny haptic tick on snap.
- Pointer events, so mouse, finger and pencil all work; draggable cards are `touch-action:none`
  so a drag doesn't scroll the page. The click a drag release generates is swallowed so it
  can't re-select the card.
- Works the same in two-phone games — a drop just commits the move like a tap would.

## How it's put together

Two script blocks, deliberately. The first is the **pure rules engine** (`window.SM`) —
deck, legal-move generation, play/discard/pass, win detection, the bot, and the
network encode/decode/validate helpers — with **no DOM access at all**. The second is the
UI and the net layer. Nothing in the engine knows whether a human, a bot, or a remote
peer is choosing the actions, which is what let the two-phone mode reuse it unchanged.

The engine was soaked over hundreds of bot-vs-bot games (both goal sizes, all three build
directions) asserting every game terminates with a legal sequence, that the 108 cards are
always all accounted for, that no centre stack ever survives a play at 13 cards, and that a
scoop leaves exactly one card in `Either way` and none in the other two. The
multiplayer path was checked over 250 full two-player simulations where the guest decides
purely from its redacted view and the host validates every move — no desyncs, no
information leak, a fresh deal serialising to well under ntfy's 4 KB message cap.

The bot's discard heuristic is direction-aware: it stacks its side piles low-card-up for
`A → K`, high-card-up for `K → A`, and keeps neighbours together in `Either way`. Getting
that wrong is not cosmetic — leaving the `A → K` ordering in place for `K → A` buried the
cards the bot needed and pushed the draw rate from 5% to 22%.

## Sound

Card, scoop and win sounds come from `../sfx.js`, the shared Game Night sound layer —
synthesized with WebAudio, so there are no audio files to load and it works offline. The
**Sound** toggle sits under More options on the deal screen and in the menu; the setting is stored once for
the whole origin, so muting here mutes every Game Night game. iOS won't let a page make
noise before the first touch, so the audio context is created on the first gesture.

## Running it

Open `index.html` in a browser — no build step or dependencies (it does load `../sfx.js`
for sound, and falls silent rather than breaking if that file is missing). Works offline
once loaded, as part of the Game Night home-screen app. The two-phone relay needs a network
(and the live site) — it won't connect from a `file://` copy.
