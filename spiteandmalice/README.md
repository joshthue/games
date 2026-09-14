# Spite & Malice

A single-file, play-in-the-browser **Spite & Malice** (Cat & Mouse / the game
Skip-Bo is based on): race to empty your face-down **goal pile** onto four shared
centre stacks. They build **Ace → King**, **King → Ace**, or **either way** — your
choice on the deal screen. Play **solo against a bot**, or **head-to-head
on two phones** in a room — same room model as [`cribbage/`](../cribbage/).

## How it plays

- Two decks plus **four Jokers** (Jokers are wild; Kings are just Kings).
- Each player has a **goal pile** (Short 13 or Standard 20 cards), a hand of **5**,
  and **four personal side stacks** to park cards on.
- On your turn, play as many cards as you can to the four centre stacks — from your
  goal-pile top, your hand, or a side-stack top.
- **A centre stack is cleared away to the shuffler the moment it holds 13 cards**,
  whatever rank it ends on. That pile is the only thing that refills the stock.
- **Empty your goal pile to win.** You end your turn by discarding one hand card onto a
  side stack; if you empty your hand first you draw back up to five and keep going.
- Tap a card to pick it up, tap a green centre to play it; tap a hand card then a side
  stack to discard.

## Options

- **Goal pile**: Short (13) or Standard (20).
- **Centre stacks build**: `A → K` (standard), `K → A` (the mirror), or `Either way`.
- **Bot**: Easy or Normal (solo only).
- **Text size**: S / M / L / XL, applied immediately — handy on a tablet.
- **Move hints** off by default.

### Either way

A stack opens with an Ace *or* a King, and from then on every card may go **one up or one
down**, wrapping King→Ace and Ace→King. Nothing ever reaches a dead end, so rank can no
longer end a stack — which is exactly why clearing is depth-based. Without the 13-card
rule a wrapping stack would grow forever, nothing would return to the shuffler, and the
stock would starve; with it, every stack still recycles on the same rhythm as the
standard game.

Two consequences worth knowing before you pick it:

- Far more of your cards play, so goal piles empty faster — bot-vs-bot games run about
  a fifth shorter than `A → K`. The bot gets the same gift, so it is not easier, just looser.
- You can't read how close a stack is from its top card any more. Watch the card count
  instead; it turns red at 11, two from clearing.

Jokers are still wild, but a stack usually needs one of two values, so playing one asks
which value it should take.

## Two phones (head-to-head)

Pick **Two phones**, then one player taps **Create game** and reads out the 4-letter
code; the other taps **Join with code**. You each play on your own phone.

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

## How it's put together

Two script blocks, deliberately. The first is the **pure rules engine** (`window.SM`) —
deck, legal-move generation, play/discard/pass, win detection, the bot, and the
network encode/decode/validate helpers — with **no DOM access at all**. The second is the
UI and the net layer. Nothing in the engine knows whether a human, a bot, or a remote
peer is choosing the actions, which is what let the two-phone mode reuse it unchanged.

The engine was soaked over hundreds of bot-vs-bot games (both goal sizes, all three build
directions) asserting every game terminates with a legal sequence, that the 108 cards are
always all accounted for, and that no centre stack ever survives a play at 13 cards. The
multiplayer path was checked over 250 full two-player simulations where the guest decides
purely from its redacted view and the host validates every move — no desyncs, no
information leak, a fresh deal serialising to well under ntfy's 4 KB message cap.

The bot's discard heuristic is direction-aware: it stacks its side piles low-card-up for
`A → K`, high-card-up for `K → A`, and keeps neighbours together in `Either way`. Getting
that wrong is not cosmetic — leaving the `A → K` ordering in place for `K → A` buried the
cards the bot needed and pushed the draw rate from 5% to 22%.

## Running it

Open `index.html` in a browser — no build step or dependencies. Works offline once
loaded, as part of the Game Night home-screen app. The two-phone relay needs a network
(and the live site) — it won't connect from a `file://` copy.
