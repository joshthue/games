# Horse Race (`horserace/`)

The bar game with a deck and two dice, at **Lake Uffda Downs**. One live track for everybody
with Horse Race open — no rooms, no codes — or race the regulars (bots) on your own.

## How it plays
- Aces and Kings come out. The **44 cards** left are the horses: 2–10, Jack = 11, Queen = 12.
  All 44 are dealt round the table, so each card is a share in that horse.
- **Scratches.** The dice go round. The first four *different* totals rolled are scratched at
  **$1, $2, $3, $4** a card: everybody pays that for each card of it they hold. A repeat
  during scratching just rolls again.
- **The race.** Each roll moves that horse one step. Roll a scratched number and *you* pay its
  scratch price into the pot. First horse to the wire wins; the pot splits **four ways, one
  share per card** of the winning number (cents allowed — $20.75 a card is fine).
- Nobody makes a decision in Horse Race except tapping Roll, so that's the whole interface.

## Track lengths (tuned, not the usual ones)
| Horse | Steps | Comes up |
|---|---|---|
| 2 · 12 | 3 | 1 in 36 |
| 3 · 11 | 5 | 2 in 36 |
| 4 · 10 | 6 | 3 in 36 |
| 5 · 9 | 8 | 4 in 36 |
| 6 · 8 | 9 | 5 in 36 |
| 7 | 10 | 6 in 36 |

The common bar lengths (3/6/8/11/14/17) look balanced — steps ÷ chance is roughly equal — but
first-past-the-post rewards variance, and in 60,000 simulated races (with four scratches) the
2 and 12 won **40%** between them while the 7 won 2.5%. These lengths came from a search over
every monotone set of lengths for the flattest win rates: each horse that runs wins **7.4–11.4%**
of races (fair is 9.1%), and a race averages ~44 rolls including ~5 for scratches. The average
pot is ~$83. (`engine.js` comment, and the soak below.)

Horses have names (2 Lutefisk Lightning … 7 Seventh Heaven … 12 Babe the Blue Ox) and silks.

## Money
The **same wallet as Pull Tabs** (`pt_bank_v1`, plus `pt_id` / `pt_name`) — one bar. Read fresh
and written straight back on every change, so the two games never hold stale copies. If a
scratch or a payment would take you below $0, you're walked to the ATM automatically ($100 for
$103, same as the booth). Each race's money is applied once per roll, idempotently
(`hr_applied[raceId]` = rolls already paid), so a reload or a replay never double-charges.

## Live — one track, no host
Same transport as the Pull Tabs booth: every phone posts to **one ntfy topic**,
`jthr-v1-lakeuffda` on `ntfy.envs.net` (`?track=` overrides it for tests), and replays it.

The trick that keeps it simple: **a race is just a seed, the seats, and a count of rolls.** The deal
comes from the seed and roll *k*'s dice come from `(seed, k)` (`HR.dice`). So a roll message is
only `{t:'roll', id, k}`, and every phone that has rolls 0…k−1 computes exactly the same race with
`HR.sim(race, k)`. Rolls can be applied the moment they arrive, in any order, from any phone, and a
duplicate roll *k* (two phones covering for the same slow player) is harmless.

Messages:
- `sit` / `leave` — at the rail for the next race. Walking up sits you. You stay at the rail for
  20 minutes after your last sit or **your own** roll; being rolled-for doesn't count, so a phone
  left in a pocket drops out instead of being dealt in all night.
- `start {id, prev, seed, seats}` — anyone at the rail can call the horses to the gate. Seats are
  the rail (up to 6 humans) plus bots to make four, shuffled. A start is accepted only if `prev` is
  the race in play and that race is finished (or nobody has rolled in 5 minutes). Starts, sits and
  leaves wait ~2.5 s and are applied in (relay time, id) order on every phone, so two people
  tapping Start at once agree on which race runs.
- `roll {id, k}`.

Who rolls: roll *k* belongs to seat `k % seats`. Your turn → **Your roll** button. A human who
doesn't tap is rolled for after ~9 s ("rolling for 'em in 3…"). Anybody can roll for anybody once
it's overdue, so the race finishes as long as any phone is open.

**Bots' rolls are never sent (v110).** A bot's roll *k* exists the moment roll *k−1* does — its dice
come from `(seed, k)` like everyone's — so every phone takes it on its own (`Kof()` walks past bot
seats). The screen reveals them one at a time, ~1.3 s apart (`S.shown` lags the decided count), and
only human taps go over the relay. v108 posted every bot roll from the first human's phone: ~50
messages a minute, and ntfy's per-connection limit (a burst of 60, then one request every 5 s)
answered **429** a couple of races in — Josh hit it playing alone with three bots. Now a race costs
about one message per human turn (16 for a 34-roll, two-person race in the test, down from 61 for
59), and a refused post is **retried** with the same message id (6 s after a 429) instead of being
dropped. The live stream's reconnects back off too (2 s, 4 s, 8 s … 30 s), since each one is a
request against the same limit.

The dice being fixed by the seed means a race's whole outcome is decided at the gate. With no
decisions in the game that changes nothing for play — but somebody reading the source could know
the winner early. Play money among friends; fine.

## Odds & stats (v113, Menu → Odds & stats)
Off by default. When on:
- A **WIN %** column on the track for every horse still running.
- In each seat's row, that seat's **chance to cash** (holds at least one card of the winner).
- A stats box: the chance one of your horses wins, your **expected take** at the current pot,
  the favorite, rolls so far, what's gone into the pot (scratches and scratched rolls), what you've
  put in, and **your night** (`hr_stats`: races sat in, races cashed, net, best single take) with a
  reset.

The odds come from 1,500 simulated finishes with **fresh random dice** from where the race stands —
never the race's own seeded dice, which would give the result away. ~10 ms per roll, cached per roll.

**Your horses** never wrap any more: duplicates stack (v111) and the cards shrink to fit one row
(`--hw`, 26–54px), so 22 cards in a 2-seat game still sit on one line on a phone.

## Table & names (v112)
**⚙️ Table & names** (in the lobby and the Menu):
- **Seats at the table: 2–8.** People at the rail sit first (up to 8), bots fill the rest. 44 cards go
  round, so 8 seats is 5–6 cards each and a $1 scratch card costs less; 2 seats is 22 each.
- **Your name** — the same `pt_name` Pull Tabs uses; changing it re-announces you at the rail.
- **The regulars** — seven bot names, used in order.
- **The horses** — a name for each number; blank is the stock name.

Kept per device in `hr_prefs`. In a live race the phone that calls the horses to the gate sends
its bots (as the seats) and its horse names (`start.horses`, only the changed ones) with the start,
so every phone shows the same names for that race. A name change counts from the next race.

## Screen (v111)
- **Wide screens** (any landscape ≥700px: iPad mini either way round is covered by this or the
  portrait rule, iPhone sideways too): two columns — scratches and the **track fill the left side
  top to bottom**, money / rail / dice / announcer / your horses / the table on the right.
  `fitTrack()` sets the lane height (`--cell`, up to 46px) from the height left under the track and
  keeps cells at least as wide as they're tall. Portrait phones and iPads stay one column, lanes
  sized from the width.
- Horses are **round tokens** as tall as the lane (they were stretched ovals filling wide cells).
- Lane labels show **one gold pip per card you hold** of that horse (`••8` = you have two 8s);
  v108–110 put a `★3` in front of the number, which read as "32".
- **Your horses** stack duplicates into one card with a `×2` badge, so an 11-card hand is ~7 cards
  and fits one row.
- The announcer names the horse once: "Bev rolled 8 — **Spam Can** gains a length! 5 to go."

## Solo
Race the regulars: you plus three bots, no network. The race in progress is kept in
`hr_solo` so closing the app doesn't lose it.

## Built
One file, three script blocks: `../sfx.js`, the engine `window.HR` (deal, dice, `sim`, no DOM), and
the UI + network. Sources are assembled from `engine.js`/`ui.js`/`head.html`/`body.html` by a build
script outside the repo; `index.html` is what ships.

## Tested
- Engine soak: 5,000 races at 2–6 seats — every race finishes, all four scratches happen, the
  44 cards are all dealt, money is conserved (sum paid = pot = sum won), the same `(seed, K)`
  always gives the same state.
- Solo at 320 / 390 / 744 wide: full races, wallet moves by exactly the seat's race net, Next race,
  reload resumes the race, no horizontal overflow, no page errors.
- Live with an in-memory relay that hands messages back in random order: two phones tap Start at
  the same instant (one race runs on both), one player never taps (the table rolls for them), a
  third phone walks up mid-race — all three end on the same race, same winner, same pot; each
  wallet moved by exactly its seat's net; the late phone is dealt into the next race.
