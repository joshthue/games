# Spite & Malice

A single-file, play-in-the-browser **Spite & Malice** (Cat & Mouse / the game
Skip-Bo is based on): race to empty your face-down **goal pile** onto four shared
centre stacks that build Ace → King. Play **solo against a bot**, or **head-to-head
on two phones** in a room — same room model as [`cribbage/`](../cribbage/).

## How it plays

- Two decks plus **four Jokers** (Jokers are wild; Kings are just Kings).
- Each player has a **goal pile** (Short 13 or Standard 20 cards), a hand of **5**,
  and **four personal side stacks** to park cards on.
- On your turn, play as many cards as you can to the four centre stacks — from your
  goal-pile top, your hand, or a side-stack top. A centre stack starts at an Ace (or a
  wild) and climbs to King, then clears and recycles.
- **Empty your goal pile to win.** You end your turn by discarding one hand card onto a
  side stack; if you empty your hand first you draw back up to five and keep going.
- Tap a card to pick it up, tap a green centre to play it; tap a hand card then a side
  stack to discard.

## Options

- **Goal pile**: Short (13) or Standard (20).
- **Bot**: Easy or Normal (solo only).
- **Text size**: S / M / L / XL, applied immediately — handy on a tablet.
- **Move hints** off by default.

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

## How it's put together

Two script blocks, deliberately. The first is the **pure rules engine** (`window.SM`) —
deck, legal-move generation, play/discard/pass, win detection, the bot, and the
network encode/decode/validate helpers — with **no DOM access at all**. The second is the
UI and the net layer. Nothing in the engine knows whether a human, a bot, or a remote
peer is choosing the actions, which is what let the two-phone mode reuse it unchanged.

The engine was soaked over hundreds of bot-vs-bot games (both goal sizes) asserting every
game terminates with a legal sequence, and the multiplayer path was checked over 250 full
two-player simulations where the guest decides purely from its redacted view and the host
validates every move — no desyncs, no information leak, a fresh deal serialising to well
under ntfy's 4 KB message cap.

## Running it

Open `index.html` in a browser — no build step or dependencies. Works offline once
loaded, as part of the Game Night home-screen app. The two-phone relay needs a network
(and the live site) — it won't connect from a `file://` copy.
