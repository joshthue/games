# Shut the Box (`shutthebox/`)

The pub dice game: a wooden box of tiles 1-9 (or 1-10, 1-12), two dice, flip them down. Solo,
or you against 1-3 bots.

## Rules
- Roll two dice. Shut any standing tiles that **add up to the roll** (9 = the 9, or 1 + 8, 2 + 3 + 4…).
  Roll again.
- When a roll can't be made, the turn is over: **score = the tiles still standing**. Low is good.
- Shut every tile and you've **shut the box**: score 0, and against bots that wins on the spot.
- **One-die rule** (on by default): once every tile 7 and up is down, you may roll one die.
- Against bots each player plays their own box in turn (you first); lowest score wins.

## On the phone
- Tap tiles to pick them (they lift, gold). When they add up, the button says **Shut 4 + 5**.
  When one die is allowed, there's a **Roll 1 die** button beside **Roll 2 dice**.
- **Hint**: before a roll, it says whether perfect play rolls one die or two. After a roll, it lifts
  the best tiles to shut and gives the average finish from there.
- The tiles fall back flat with a hinge, the dice tumble, and a shut box gets confetti. Bots play
  their boxes on the same board at the speed set in Menu (Relaxed / Normal / Fast).
- Under the box: your best, average and shut count for this box size and rule, plus what perfect
  play averages and how often it shuts the box (1-9 with one die: **11.0** and **9.7%**).
- Saves after every move (`stb_game`) and resumes. Records per box size and rule in `stb_stats`.
- One screen, no scroll. The box centres in the space left: tall tiles and big dice on a tall phone,
  both shrinking together on a short one or a phone on its side. Checked with real insets at
  320, 375, 390 and 430 wide and at 667×375 / 932×430, with 9, 10 and 12 tiles and 1-4 players.

## How it's built
- **Engine** `window.STB`, no DOM. A box is a bitmask (bit i = tile i+1 standing).
  `solve(n, rule)` works out, for every possible box (up to 2^12), the expected final score with
  perfect play and whether to roll one die. `best()` picks the shut with the lowest expected finish.
  Also: `rollDice`, `shut`, `endTurn`, `winners`.
- **Bots**: Normal plays the solver (perfect). Easy shuts the biggest single tile it can, otherwise
  a random way, and always takes one die when allowed (about 14.4 average vs 11.0 on 1-9).
- `node shutthebox/rules.test.js`: rules, the solver against hand-worked boxes, the published
  averages, and 3000 four-bot rounds.
