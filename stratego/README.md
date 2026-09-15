# Stratego

A single-file, play-in-the-browser **Stratego** — the hidden-information game where
both armies are identical, nothing is face up, and every attack you make is a
trade: you spend information to buy information. Forty pieces a side on a 10×10
board with two lakes in the middle. Take the enemy flag, or leave them with
nothing that can move.

Right now it's **you against a bot**. The engine is built so that a two-phone
mode drops in later without touching the rules — see *What's next*.

## The numbering

This uses the **classic Milton Bradley numbering: 1 is the Marshal and the lowest
number wins.** That's the box most people over 35 grew up with. Modern Jumbo
editions invert it so 10 is the Marshal; if that's the one you know, mentally
subtract from eleven.

| | | |
|---|---|---|
| 1 | Marshal ×1 | Beaten only by the Spy, and only when the Spy strikes first. |
| 2 | General ×1 | |
| 3 | Colonel ×2 | |
| 4 | Major ×3 | |
| 5 | Captain ×4 | |
| 6 | Lieutenant ×4 | |
| 7 | Sergeant ×4 | |
| 8 | Miner ×5 | The only piece that survives a Bomb. |
| 9 | Scout ×8 | Moves any distance in a straight line, and may strike at the end of the run. |
| S | Spy ×1 | Kills the Marshal **on the attack**. Defending, it dies to anything. |
| 💣 | Bomb ×6 | Never moves. Kills everything but a Miner. |
| 🚩 | Flag ×1 | Never moves. Lose it and you lose. |

Equal ranks kill each other. Pieces move one square orthogonally — never
diagonally, never into a lake, never onto your own piece.

## How it plays

Tap one of your pieces to select it; gold dots are where it can go, a red outline
means an attack. Attack and both ranks are shown, the loser comes off, and the
survivor's rank is now public — to both of you, exactly as it is across a table.

Two win conditions, and the second one catches people out: take the flag, **or**
leave your opponent with no legal move. Wall yourself in behind your own bombs and
you lose.

## Options

- **Opponent** — Easy or Normal. Easy plays a third of its moves at random and
  doesn't track much; Normal wins about **73%** of the games between them.
- **Your setup** — *Set up for me*, or place all forty by hand (tap a piece, tap a
  square; tap a placed piece to pick it back up; **Fill the rest** finishes the job).
- **Memory aid** — on by default: once you've seen an enemy piece's rank in a
  fight, it stays labelled with a gold ring. Switch it to **Pure memory** and the
  piece goes back to being a blank blue back the moment the fight is over, which
  is how the cardboard game actually works and is much harder.

## Sound

Uses the suite's shared `../sfx.js`, so muting here mutes every game. A trade you
won and a trade you lost deliberately sound different — that read is worth having
before your eyes reach the strike panel. The flag stays quiet on impact so the
win or loss lands on its own.

## Setups

The generated setups deliberately avoid the setup everyone builds. A flag jammed
in a back corner behind four bombs is the most-attacked square in the game, so
these put it in a **varied file, sometimes off the back row**, behind a screen of
two or three bombs rather than a full box — and scatter the remaining bombs
elsewhere as decoys, so a corner rush gets punished instead of rewarded. Scouts go
forward, Miners stay back where the bombs will be, the Spy loiters near the Marshal.

## The bot

The bot plays from a **redacted view of the board and nothing else** — a real,
playable state object in which every enemy rank it hasn't earned is *absent*, not
hidden behind a flag it could peek past. It cannot cheat even by accident, and the
test suite asserts that the view handed to it on every single ply contains no
unearned rank.

What it does with that view is roughly what a person does:

- **Narrows down what each piece can still be.** Start from the full army,
  subtract every rank already accounted for, spread the rest over the pieces it
  can't name. A piece that has *moved* is not a Bomb and not the Flag — the most
  reliable free read in the game. A piece that has sat perfectly still while
  everything around it moved gets steadily more suspicious the longer the game runs.
- **Prices every attack** as an expected value over that distribution, so it
  won't throw a Marshal at an unmoved piece that is one-in-four a Bomb.
- **Sends the right piece knocking.** A never-moved piece deep in your territory,
  hemmed in by other never-moved pieces, is either a Bomb or the thing the bombs are
  guarding. It sends Miners and spends Scouts to find out, and keeps the Marshal away.
- **Stalks with the Spy.** Once your Marshal has shown itself, the Spy stops
  hiding and starts closing. It lands the shot in about one game in six.

It looks one ply ahead for known threats before stepping anywhere, and won't let a
single piece do all the work.

## How it's put together

Three script blocks, deliberately:

1. **`window.STRAT` — the rules engine.** Board, movement, the combat table, the
   two-squares rule, win detection, setup generation, and `redact()`. **No DOM
   access at all.**
2. **`window.STRATAI` — the bot.** Beliefs and move scoring. Takes a redacted
   view, returns a move. Knows nothing about the DOM either.
3. **The UI.** The only block that touches the page. Knows none of the rules.

Nothing in the engine knows whether a human, a bot, or a remote peer is choosing
the moves — which is the whole point, and what will let two-phone mode reuse all
of it unchanged.

## Testing

The engine and the bot are pulled **straight out of this HTML file** by the test
scripts and run in node — the same code the page runs, not a copy.

- **28 rules checks**: the full combat table including all three trick cases
  (Miner/Bomb, Spy attacking vs defending, equal ranks); Scouts running open lines
  and *not* jumping lakes or wrapping rows; Bombs and Flags immobile; the
  two-squares rule actually biting; flag capture ending the game; a long move
  giving the Scout away and a one-square move giving nothing away; 400 generated
  setups all legal, with the flag landing in a dozen-plus different places.
- **300 bot-vs-bot games** asserting every game terminates, the board and the
  piece list never disagree, each side always holds exactly the 40-piece army,
  nothing ever stands in a lake, no bot proposes an illegal move, and — on a deep
  audit of the first 25 games, every ply — **the redacted view never leaks a rank**.

Current numbers: games run ~310 plies, **~75% end at the flag**, ~23% because a side
ran out of moves, ~2% hit the 400-quiet-move stalemate cap. Red and blue win about
equally often, so there's no side bias.

```
node rules.test.js       # the rules checks
node soak.test.js 300    # the bot-vs-bot soak
```

Both read `index.html` from their own directory, so they always test the file
that ships — there is no second copy of the rules to drift out of sync.

## What's next

**Two phones over ntfy**, the same room model as `cribbage/` and
`spiteandmalice/`. The seam is already in: `STRAT.redact(state, side)` produces
exactly the view a remote player is allowed to hold, so the host can broadcast it
without the guest ever receiving a rank it hasn't earned. Unlike the card games,
Stratego's hidden information survives a host-authoritative design cleanly — the
guest genuinely cannot see the host's army, because it was never sent.

## Running it

Open `index.html` in a browser — no build step, no dependencies. Works offline once
loaded, as part of the Game Night home-screen app.
