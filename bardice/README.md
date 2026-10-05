# Bar Dice (`bardice/`)

Two Minnesota bar dice games at the Lake Uffda VFW, on one page with a tab for each. Money comes out
of the **same wallet as Pull Tabs and Horse Race** (`pt_bank_v1`, `pt_name`), ATM included.

## 🎲 Shake of the Day
- $1 gets you **three shakes** of five dice. Hold what you like between shakes (the day's number is
  held for you automatically; tap a die to hold or release it; hold all five to stand).
- **The number of the day** changes at local midnight and is the same on every phone
  (`BD.dayNumber`, an FNV hash of the date).
- **All five showing the number = the jackpot.** Four of them = a Hamm's on Darlene, **+$2**.
  Holding the number, a try hits all five about **1 in 75** and four about **1 in 11** (200,000
  simulated tries).
- **One jackpot for everybody** with Bar Dice open. Every try adds $1; after a win it restarts at $25.
  The **Today at the bar** board lists the day's tries — who, their dice, how many of the number.

### The shared jar — no server
Each finished try is posted to one ntfy topic, `jtbd-v1-lakeuffda` on `ntfy.envs.net` (`?bar=` overrides
it for tests), carrying `(epoch, count)`: epoch goes up by one with every jackpot win, count is tries
since. Every phone keeps the largest `(epoch, count)` it has seen, so the jackpot is $25 + count.
The relay only remembers 12 hours, so each phone also stores the jar (`bd_jp`) and re-posts it as a
`jar` message when the feed has been quiet for 6 hours. Two phones finishing in the same instant can
both claim the same count — the jar is a dollar light then, never wrong about who won. One message
per try (not per shake), well under the relay's rate limit. Wins pop a toast on everyone else's phone.

## ⚓ Ship, Captain & Crew
- You and 1–3 regulars (bots; rename them in the Menu) ante **$1 or $5** into the pot.
- On your turn, three rolls of five dice. You need a **6 (ship)**, then a **5 (captain)**, then a
  **4 (crew)** — in that order, though several can land in one roll; they're set aside automatically
  (`BD.sccTake`). Once crewed, the other two dice are the **cargo**: stand on their total, or roll the
  cargo again if you have rolls left.
- No crew after three rolls: you **sink** with nothing (about 46% of turns, never re-rolling cargo).
- Best cargo takes the pot; a tie splits it. If everybody sinks, the pot carries to the next round.
- Who goes first rotates each round. Bots roll until crewed, then re-roll cargo that can't beat the
  table's best or is under 8.

## Screen
- **Header**: the standard Game Night header, with the **jackpot** (compact: small label, amount
  never wraps) and the **ATM** right-aligned on the name's line (`.gn-namerow` from `gn-header.js`).
  At the Ship, Captain & Crew table the jackpot doesn't apply, so that line shows the ATM only
  (the pot is on the table's caption).
- **Cash** gets its own full-width row, so "CASH · PULL TABS WALLET" is never truncated; the jackpot
  ticker ("Nobody's hit it yet · 88 tries so far") sits under it.
- **One source for the shake count**: `sodProgress()` feeds both the caption ("shake 1 of 3", the
  shake just taken) and the button ("Shake 2 of 3 · 4 dice", the next one). The old button read
  "Shake 4 · 2 left", where the 4 was a dice count that looked like a fourth shake.
- **Die-face names** come from the engine, `BD.faceName(v, n)` / `BD.faceCount(v, n)`:
  1 five, 2 fives, 0 fives, 1 six. Every line that names the number of the day uses them.

## The dice tray
- **One render function** for every die, `dieHTML(v, cls, id, px)`: the trays and the winning-shake
  strip share it. Each die carries a **stable id** (`sd0`–`sd4` in Shake of the Day, `sc0`–`sc4` at
  the Ship table, `sw0`–`sw4` in the strip). Holds, outlines, the roll reveal and the near-miss shake
  all find dice by id (`dieEl(box, id)`), never by position.
- **Layout** (`fitDice(box)`, on every render and on resize): five across in a CSS grid, as big as
  the tray allows (up to 58px; 72px on a wide screen) with even 9px gaps. If five across would drop a
  die under **56px**, the tray goes **3 on top + 2 centred below** at full size. Never 4 + 1. Same
  rule while rolling and at round end. On a 375-wide iPhone it's one row; on a 320-wide one, 3 + 2.
- **Ship, Captain & Crew groups its tray** (`.dice.grp`): ship, captain and crew always sit together on
  the left and the two cargo dice together on the right, with an ~18px split between the groups (7px
  inside a group, via a spacer column). When that's too tight for 56px dice it's ship/captain/crew on
  top and the cargo below. The winning-shake strip splits the same way. One row on 375 and up.

## Ship, Captain & Crew round end
- The tray keeps **your final shake**, exactly as it landed (set-aside dice first, cargo outlined
  green). The Ship / Captain / Crew chips light only for what you actually got.
- Caption: **"Your shake · cargo N"** or **"Your shake · sank"**. If you won: **"You take it with 12 —
  $4"** (or "You split it with…" on a tie) in gold, and the tray gets a gold win ring.
- **Winning-shake strip**, between the tray and Next round: "🏆 Darrell's winning shake · cargo 12"
  with the winner's five dice in one row at about 57% of the tray's die size, cargo outlined green.
  Skipped when you won outright. A tie says who split it and for how much; when everybody sank it says
  the pot rides to the next round. No dice in either case.
- At round end Darlene's line steps aside (the caption and strip say who won). On short phones
  (under 740px tall) spacing tightens so a four-player round fits an iPhone SE without scrolling.

## The roll
Results are rolled **before** anything moves; the animation only reveals them
(`revealRoll(box, slots, finals, opts, done)`, shared by both games).
- Rolling dice **tumble** (faces cycle every 70ms, with a rock and bounce). Held dice never move.
- They **land one at a time, left to right** (first at 380ms, then every 190ms), each with a thud
  and a clack (`SFX "place"`). A five-die roll is done in about 1.3s.
- **Suspense**: if the last die decides something big, it hangs about 1.3s more, slowing down and
  teetering before it lands. Shake of the Day: the other four all show the number (one die from the
  jackpot). Ship, Captain & Crew: your last roll, no crew yet, and the last die could bring one aboard.
- **Payoff**: the jackpot glows the dice, counts the amount up on a banner, throws confetti and
  plays the win sting; five of a kind on the wrong number still glows. A hang that misses gets a
  shake of the die and a "So close!" beat (`SFX "bad"`); a crew that arrives on the hang gets
  "Crew's aboard!".
- The Shake / Roll button is disabled and reads "Shaking…" / "Rolling…" until every die is down.
- **Tap anywhere to skip** to the results. That tap is swallowed, so it can't also press whatever
  was under your finger.
- **Reduce Motion**: results appear at once, no tumble, no hang; the banner shows the amount.

## Built
One file, two script blocks: the engine `window.BD` (dice, day number, scoring, ship-captain-crew
set-aside, the bot's stand rule — no DOM) and the UI + relay. `../sfx.js` for sound; respects
Reduce Motion.

## Tested
v123, headless, forced dice, at 390×844, 375×667 and 320×568: you win (no strip, gold caption), a
bot wins (you stood on 3; the strip shows its five dice in one row, 33px, cargo outlined), you sank
(chips off, "Your shake · sank"), ship and captain then sank (only those two chips), everybody sank
(strip says the pot rides), and a tie (strip says who split it). Tray is one row at 390 and 375,
3 + 2 at 320 with 58px dice, both mid-roll and at round end; tapping the bottom-right die at 320 holds
that die. Content fits without scrolling at 390×844 and 375×667 (four players, plus the status bar);
a 320×568 first-generation SE still scrolls. The v122 roll suite still passes.

Earlier (v122):
v122, headless at 390, 320, 430 and 834 wide: the name, jackpot and ATM on one line, the amount and
the cash label never clipped, no horizontal scroll, Ship mode shows the ATM alone. With forced dice:
a normal five-die roll settles left to right in 1.36s with no result shown early; a near miss hangs
the last die and says "So close!" (about 2.4s); the jackpot banner counts up to the amount; a tap
mid-roll lands everything at once without starting another shake; Reduce Motion is instant; a Ship,
Captain & Crew near miss on the last roll hangs and the round finishes. Caption and button agree on
every shake.

Earlier (v116):
Headless at 390×844 and 1133×744: 40 Shake of the Day tries each (wallet moves by exactly −$1 a try,
+$2 for four, + the jackpot on five; jar count and epoch track it), six Ship, Captain & Crew rounds
(sinks, ties splitting the pot, carry-over when everyone sinks), no horizontal overflow, no errors.
Live relay: two phones see each other's tries and the same jar; a third phone opened later picks up
the jar and the day's board from the feed.
