# I'm out, Jerry! — The Leech Lake Game

A single-file, play-in-the-browser version of **I'm out, Jerry!** (aka *Rat*, aka
*The Leech Lake Game*), a trick-taking elimination card game. Play against computer
opponents. The in-game rules screen still calls the game Rat, which is what most
people at the table call it.

The folder is still `theleechlakegame/` and always will be — the URL is what is on
phone home screens, and `localStorage` is per-origin-and-path, so moving it would
silently reset everyone's name and settings.

## How it plays

- Each hand, a **caller** picks the mode for that round:
  - **High** — highest card wins the trick
  - **Low** — lowest card wins
  - **Closest to 8** — the card nearest rank 8 wins
  - **Trump suit** — a chosen suit beats all others
- On the **opening 7-card deal**, every hand must contain at least one **Ace or Face**
  (A, K, Q or J). If any hand doesn't, it's a **misdeal**: that hand is turned face-up
  so the table can see it, and everyone is dealt again. Only the opening deal is
  checked — the hands shrink to two cards, where no-Ace-or-Face is the normal case.
- You must win **at least one trick** each hand. Win zero and you're knocked **OUT**.
- Hand sizes count down each round (7 cards → 2). Whoever takes the most tricks
  calls the next hand; ties are settled by a "first Jack" flip.
- **Last player standing wins.**

## Options

- **Four-color deck** — ♠ black · ♥ red · ♦ blue · ♣ green (on by default).
- **Speed play** — shorter delays for faster hands (on by default).
- **Learning tips** — optional in-game hints, in **Beginner** (plain rules) or
  **Advanced** (strategy) detail. Off by default; the Beginner/Advanced choice is
  only active while tips are on.

## Sound

Sound comes from `../sfx.js`, the shared Game Night sound layer — synthesized with
WebAudio, so there are no audio files to load and it works offline. The setting is stored
once for the whole origin, so muting in any Game Night game mutes them all. iOS won't let
a page make noise before the first touch, so the audio context waits for a gesture.

## Card size

Cards scale with the shared **S / M / L / XL** control (`../cardsize.js`), which sits
next to the four-color deck toggle. The steps are multipliers (0.86 / 1 / 1.2 / 1.4)
rather than pixel sizes, because the games don't share a base card size — a multiplier
scales each game from its own design. The choice is stored once for the whole origin,
like the mute key, so the size you pick here is the size in every Game Night card game.

**One size for the whole board** (v80). There used to be three on screen at once: the
opponents' pills at a hard-coded 30x44, the table at whatever the size control said, and
the hand at whatever was left after fitting seven across. The card you were about to play
was smaller than the card it would land next to, and the copy of it in the pill was smaller
again. There is now a single `--cardw`/`--cardh` pair and no `.card.sm`.

**The pills no longer show a card at all** (v81). Making them full size proved the point
the small card had been hiding: it was always a second copy of a card the Table row below
already shows, labelled with the same player's name. A pill is now just name, cards left
and tricks. At 390px with six players that took the board from 684px to **547px** - it
fits one phone screen instead of scrolling, and it is 108px shorter than the three-size
layout it replaced.

The hand never wraps. The chosen size is a **maximum**: `fitBoard()` measures what one row
of that many cards needs and, if it doesn't fit, scales `--size` down **on `.wrap`** - so
the pills and the table come down with the hand instead of towering over it. The hand is
the only row that can't wrap, so it's the only row worth measuring; `.opps` and `.trick`
both wrap and can never be the binding constraint.

`fitBoard()` solves for the **card** width, not the row width. Scaling by `avail/need`
shrinks the 4px gaps along with the cards, but the gaps are fixed - so the row came out a
couple of pixels over at 320px and the hand quietly scrolled inside its own box while the
page itself looked fine. Take the gaps out first, then divide, and keep a 1px margin for
sub-pixel rounding across seven cards:

```js
const target = (avail - (n-1)*gap - 1) / n;
```

Measured at 320 / 390 / 430px x S / M / L / XL with a 7-card hand and a full table: table
and hand widths identical in all twelve, hand inside its box in all twelve, no page
overflow. XL clamps to 1.019 at 320px and 1.282 at 390px; below that the chosen step is
what you get.

At **XL the rank and the suit swap places**: the number moves to the middle of the card
and grows, and the suit moves out to *both* corners - top-left and bottom-right, mirrored,
the way the rank sits in both corners at the smaller sizes. The card is already tinted with
the suit's colour, so a big colour-coded number reads as a suit across the table on its own
and the corner pips only confirm it. Below XL the suit keeps the middle - a big number on a
small card is all number and no card. It applies to every card on the board - since v80
there is only one card size, so there is nothing to exclude.

The centred rank is 24px rather than the 27px it looks like it could be, and `10` is
smaller again at 19px, because the corner pips are deliberately large: at a 38px base card
a bigger centre put the numeral's ink underneath the top-left pip on 10/Q/K/A at phone
widths. If you change either number, check the wide ranks at 320px - single digits clear
easily and hide the problem.

## The bots

`cpuPlay()` splits into two decisions, and they are not the same decision.

**Following** is unchanged and deliberately greedy: if the bot can win the trick and it
hasn't won one yet this hand, it takes it with its cheapest winning card. Ducking a
winnable trick early is how a bot gets shut out, and being shut out is elimination.

**Leading** goes through `chooseLead()`, which was split out in v79 because the old code
led the top trump on essentially every opening hand. Two things caused that. The urgency
test was `p.tricks===0`, which is true for *every* seat on trick 1 of *every* hand, so the
leader always took the "play my very best card" branch and never the middling one. And
`strength()` adds **+100** for a trump — a bonus written to rank cards *inside* a trick,
where trumps really do beat everything — so "best card" meant "highest trump" in the 86.7%
of opening 7-card hands that hold one. Measured over 20k deals: it led a trump in 100% of
the hands that held one.

What replaced it:

- `leadPressure()` scales with the hand: no tricks yet **and** `hand.length <= max(2,
  ceil(handSize/3))`. Needing a trick isn't urgent with seven still to come; it is with
  two. When it does fire the bot plays its outright best card, trump included — that is
  what the +100 is for, and now it only applies when it's true.
- Otherwise in Suits, leading trump is its own judgement: **two trump honours (Q/K/A), or
  one plus three-card length**. That is the strip-trumps play the in-game tips describe,
  and it fires on about 14% of opening hands.
- Failing that it leads the top of its longest side suit, picking at random between that
  card, the next one down, and the top of its second suit — so the same hand doesn't open
  the same way twice.

Opening trump leads went **86.7% → 13.3%**. Strength is unchanged: at a mixed table over
40k hands each policy averages 1.75 tricks of a 1.750 fair share, and a table of new bots
shuts out 10.8–12.1% of seats against the old code's 12.7–13.9% — tricks spread a little
more evenly, so fewer players go out early.

`lead.test.js` and `headtohead.js` sit beside `index.html` and are not served — they pull the
functions straight out of the shipped `index.html` with a brace-matching `grab()` rather than
keeping a second copy, so they can't drift. Run them with `node theleechlakegame/lead.test.js`.
`lead.test.js` measures the trump-lead rate at each hand size, `headtohead.js` seats the
two policies at one table with rotating positions.

## Running it

Just open `index.html` in a browser — no build step, no dependencies. It also works
offline once loaded, as part of the Game Night home-screen app.
