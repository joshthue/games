# Spite Speed (`spitespeed/`)

Real-time Spite & Malice — the turn-based game with the turns taken out. You and the bot
play **at the same time**, racing to empty your goal pile onto the four shared centre stacks
(Ace → King). It reuses Spite & Malice's engine verbatim (`window.SM`), spliced in at build
time, and drives both seats seat-agnostically by setting `T.turn` per action.

## How it plays
- **Tap a card** — your goal-pile top, a hand card, or a side-pile top — then **tap a centre**
  to play it. Only the next rank up fits; a **★ wild** (joker) plays as anything. Fill a stack
  to the King and it's scooped away.
- **Park a card:** tap a hand card, then a **side pile**. Your hand refills to five (from the
  shared stock). Side-pile tops can be played back out to the centres.
- The centres are shared, so grab the rank you need before the bot does. **First goal pile
  empty wins.**

## The bot
- Runs on a timer (`armBot` → `botTick`), one action per tick: Easy 1200 ms, Normal 800 ms,
  Hard 480 ms. It calls the Spite engine's `botAction` with a per-cycle play count (`botCycle`)
  so its budget cap still works without real turns; it resets that count when it discards.

## Deadlock
- If the stock and discard-recycle pile are both empty and neither side has a legal play, the
  game can't progress. `checkDeadlock` ends it then, decided by **fewest goal cards** (tie = a
  wash). Checked after every bot tick and every player move.

## Options (Menu)
- Goal pile 10 / 15 / 20 (default 15), bot speed Easy / Normal / Hard, sound. Stored in
  `localStorage` under `spitespeed.v1` with a best (fewest goal cards left) and win/loss tally.

## Test door
`window.SPEED` exposes `get()`, `play(kind,i,center)`, `discard(handIndex,side)`, `botTick()`,
`reset()`, `T()`. Verified headless: the bot makes real progress and can win (121-iter games),
win detection fires when a goal pile empties, and a stock-out deadlock ends by goal count.
Reuses `../gn-header.js`, `../sfx.js`, `../cardsize.js`, `../sw.js`.
