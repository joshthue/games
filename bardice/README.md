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

## Built
One file, two script blocks: the engine `window.BD` (dice, day number, scoring, ship-captain-crew
set-aside, the bot's stand rule — no DOM) and the UI + relay. `../sfx.js` for sound; respects
Reduce Motion.

## Tested
Headless at 390×844 and 1133×744: 40 Shake of the Day tries each (wallet moves by exactly −$1 a try,
+$2 for four, + the jackpot on five; jar count and epoch track it), six Ship, Captain & Crew rounds
(sinks, ties splitting the pot, carry-over when everyone sinks), no horizontal overflow, no errors.
Live relay: two phones see each other's tries and the same jar; a third phone opened later picks up
the jar and the day's board from the feed.
