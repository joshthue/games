# Gin Rummy

Two-handed. Draw and discard to build melds (sets and runs); get your leftover deadwood
to 10 or less and knock, or clear it for gin. First to 100. Play **vs the bot** or **two
phones** online.

Single-file PWA. Pure engine (`window.GIN`, no DOM) + separate UI, sharing `gn-header`,
`gn-setup`, `sfx`.

## Engine
- `bestMelds(hand)` — the minimum-deadwood partition via a set-packing solver over all
  candidate melds (so four of a kind that would be better split into 3-of-a-kind + a run is
  resolved correctly). Returns melds, deadwood, and the leftover cards.
- `layoff(knockerMelds, defenderDead)` — extends the knocker's melds with the defender's
  dead cards to compute the reduced deadwood.
- `knock()` resolves gin (+25, no lay-offs), a normal knock (difference), or an **undercut**
  (defender ties or beats → +25 plus the difference).
- Bot: draws the discard only when it lowers deadwood; discards to the minimum; knocks at
  ≤10.

## UI
Melded cards wear a gold bar; a live deadwood readout shows what you'd knock with; the Knock
button lights (and reads "Gin!") only when a discard gets you to ≤10 (0). **Sort** cycles the
hand through three orderings — by suit (spot runs), by rank (spot sets), and melds-first
(your melds grouped, then deadwood). The card you just drew wears a **ring** so you can spot it
in your sorted hand — teal for a stock draw, red for the upcard you took off the discard — and
**rides raised** until you select another card. **Tap** a card to select it (it rises and the
just-drawn card drops out of the way); tap it again, or **flick it up**, to throw it to the
discard — the card flies to the pile. The discard pile sits **hand-tossed** — the top card at a
slight angle with a card or two peeking out beneath, so it never looks machine-stacked; the tilt
is derived from the card itself, so it holds steady between redraws. When you draw that upcard you
**can't discard it the same turn** (the standard Gin rule): it wears a red ring, taps and flicks
on it are refused, and the knock/deadwood readouts exclude it. Hand cards slide to their new
spots as the hand reorders; animations honor `prefers-reduced-motion`. The
start screen and the in-game menu both carry a **four-color deck** (clubs green, diamonds blue)
to tell the suits apart at a glance, plus **Card size** and **Card text** (S/M/L/XL, the shared
`cardsize.js` control used across the card games) that scale the cards and the printed rank/pip —
the hand re-fans to fit, so it never overflows. On the start screen all options show at once (no
"More options" fold), and on a tablet the sheet centers; on a tall phone the rows spread down the body to fill the
screen rather than leaving a gap above Deal (short screens stay top-aligned and scrollable).

## Online — two phones
Pick **Two phones** on the start screen. One player taps **Create game** and reads out the
4-letter code; the other taps **Join with code**. Host-authoritative over the free `ntfy`
relay (`jtgin-v1-<code>`, no accounts), the same transport Spite & Malice uses. The host
runs the engine (seat 0) and publishes a **per-seat view** that carries only the receiver's
hand plus the opponent's card count and the stock count — the opponent's hand and the stock
order never go on the wire. The guest renders that view and sends its moves (`drawStock`,
`drawDiscard`, `discard`, `knock`, `next`) back for the host to apply. No bot in online mode;
a netbar shows the room code and connection. **Reconnect:** both seats persist the session
(`gin_online`) from the moment you create or join — the host's code-sharing wait included — so
if a phone reloads or iOS discards the backgrounded PWA it rejoins the same room instead of
dropping to the menu. A host with a hand in progress restores its authoritative game and
re-publishes; before the deal it reopens the same room code and keeps waiting. The guest re-pings
`join` and takes the next state. (The one exception is the update that first installs this: the
previous build saved nothing, so that single reload can still land on the menu.) An injected
`window.__GIN_TX` replaces the relay for headless tests.

**The host's setup sheet (v203).** When the guest's first `join` arrives, the host closes the
wait dialog *and* hides the setup sheet (`GNSETUP.hide`). Until v203 only the guest hid it, so
the host's hand was dealt underneath the start screen: connected, game running, but the host saw
the menu, and tapping Deal there started a solo game and abandoned the room. The two reconnect
commits above looked like fixes because a reload goes through `resumeOnline`, which does hide
the sheet. The online tests below checked state on both pages, not what was on screen. They now
have to assert that `#setup` is hidden on both phones after the join.

**Drawn-card lift and a turn chime (v231).** The `.fresh` lift (the just-drawn card rides up)
is driven by `justDrew`, which the bot game sets at draw time. Online, a draw round-trips through
the host, so the guest never set it and the card stayed flat. The guest now derives `justDrew`
from each incoming state: the taken discard (`tookFromDiscard`) if there is one, otherwise the
single card its hand gained since the last state. Both phones also play the `turn` chime (and a
short `navigator.vibrate`) when a state hands the turn back to them — so you hear it when the
other phone finishes while yours is face-down.

**Rematch keeps the room (v232).** On game over, “Play again” used to call `netStop` and
drop both players back to setup, so a new two-phone game meant re-pairing. Now either player’s
“Play again” starts a fresh game on the same connection: the host re-deals (`newGame` + `startHand`
→ `publishState`) directly; the guest sends `{t:'act',kind:'rematch'}`, which the host handles the
same way. The other phone’s new state closes its over-modal automatically, so one tap from either
side restarts both. “Change settings” is now the explicit leave-the-room path (it calls `netStop`).

## Testing
`scratchpad/gin-test.js` — meld detection, min-deadwood on known hands, gin, lay-off,
undercut scoring, + a 120-game bot soak all reaching 100 with a winner.
`scratchpad/gin-pw.js` — Playwright full game to a winner across four viewports, no
overflow, no console errors.
`scratchpad/gin-online-pw.js` — solo regression + a two-page online game over a mocked
relay: connect, hidden-hand deal, turn/stock/discard sync, a knock to a consistent result on
both pages, and a check that no host-hand ever appears in a published message.
`scratchpad/gin-reconnect-pw.js` — host and guest in isolated contexts (independent
localStorage); the host reloads right after the deal (iOS-discard scenario) and must restore the
game — not the menu — then both sides re-converge and keep syncing; a guest reload recovers too.

## Test door
`window.__GIN` exposes `G`, `H`, `drawStock()`, `drawDiscard()`, `discard(c)`, `knock(c)`,
`start()`, plus `hostCreate()`, `guestJoin(code)`, `net()`, `mode()`, `encodeView`/`decodeView`.

## Drag the stock card to draw (v233)
The stock is now draggable instead of tap-only. Press the stock pile and the top card **flips face up**
into a ghost that follows your finger (`stockPointerDown` → a fixed-position `.stockghost` with a
`stockflip` reveal). Drop it on **your hand** to keep it (`drawStock`, then discard normally) or on the
**discard pile** to throw it away (`drawStock` then immediately discard that card — legal because a
stock draw sets no `tookFromDiscard` lock). Release anywhere else cancels. A plain tap still draws into
the hand. Drop targets glow while hovering (`.drophot`); `touch-action:none` on the pile stops the page
scrolling mid-drag. Online falls back to the existing tap path (`stockTap`).

## Stock drag: face-down when the card is hidden (v234)
v233's stock drag rendered the ghost face-up from `H.stock[0]`. Online as **Guest** you don't hold the
real deck — the host does — so the top stock card is a hidden placeholder with no rank, and the ghost
showed the literal text "undefined". A guest must not see the stock card before drawing anyway. Now the
ghost only flips face-up when the top card is actually known (`typeof top.r==='number'` — solo, and the
host); otherwise it drags a face-**down** back. Drop-on-hand still sends the draw to the host.
