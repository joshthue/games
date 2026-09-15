# Game Night — read this first

Josh Thue. A set of single-file web games served from GitHub Pages at
**https://joshthue.github.io/games/**, installable as one home-screen PWA
("Game Night"). Repo `joshthue/games`, branch `main`, deploys on push.

No build step, no dependencies, no framework. Every game is one `index.html`.

---

## ⚠ READ THIS BEFORE YOU TOUCH GIT: you are probably not the only chat in here

Josh runs several Claude chats at once, from a Mac mini, a MacBook Pro, an
iPhone and an iPad. They share this one working copy and this one `.git/index`.
**Assume another session is working in this repo right now.**

What that means in practice:

- **Never `git add` and then do something else.** Stage-and-commit is one step or
  it is a trap. On 2026-09-15 a session ran `git add stratego index.html sw.js`,
  hit an unrelated failure, and left those paths staged. Half an hour later a
  different chat ran its own commit and swallowed all of it under its own
  message. Nothing was lost, but the authorship and the message were wrong and
  neither session could tell.

  Commit explicit paths instead — this ignores whatever else is in the index:

  ```
  git commit --only <paths...> -m "Game: what changed; vNN"
  ```

  `--only` commits exactly those paths and ignores whatever else is in the
  index. **Caveat for a NEW file:** git won't commit a path it has never seen,
  so it needs an `add` first — chain them in one command so there is no window
  where your work sits staged:

  ```
  git add <new paths...> && git commit --only <all paths...> -m "..."
  ```

- **Re-read state before you act, especially after a pause.** A directory
  listing taken at the top of a long conversation can be hours stale by the time
  Josh answers from his phone. In the same incident the repo gained three
  commits and a whole new game between "here's what I built" and "yes, push it."
  `git --no-optional-locks log --oneline -5` before you commit anything.

- **`git status` lies in this environment.** The sandbox cannot delete files, so
  every git command creates `.git/index.lock` and fails to remove it. A leftover
  lock makes `git status` return *nothing at all* while the repo is anything but
  clean. Use `git --no-optional-locks <cmd>` for reads, and if a lock is
  wedging things, move it aside rather than deleting it:

  ```
  mv -n .git/index.lock _to_delete/stale-git-locks/l.$(date +%s)
  ```

  `_to_delete/` is gitignored. Tell Josh what you parked there; he deletes it.

---

## Layout

```
index.html              the hub — GAMES array drives the tile list
sw.js                   one service worker for the whole app; ASSETS lists every game
manifest.webmanifest    PWA manifest
icon-180/192/512.png    shared icons
<game>/index.html       the entire game, one file
<game>/README.md        what it is, how it plays, how it's built, how it's tested
```

`onpatrolbingo/` is a legacy stub kept for old links; `bingo/` superseded it.
`golf/` is the game called **Links** — folder and title differ, don't "fix" it.

---

## Adding a game — all four steps, or it half-works

1. `<game>/index.html` and `<game>/README.md`.
2. One line in the `GAMES` array in the hub `index.html`.
3. Two entries in `ASSETS` in `sw.js`: `"<game>/", "<game>/index.html"`.
4. Bump the version stamps (below).

Miss 3 and it won't work offline. Miss 2 and nobody can find it.

---

## The version stamp — there are 13 of them and they are spelled 5 different ways

Every commit bumps a global build number: `sw.js` cache name, the hub, and every
game. The stamp is what tells Josh on his phone whether he's looking at the build
he just pushed, so it is not decoration.

The spellings drifted over time. **Do not sed for one pattern — you will miss
some.** This finds all of them, exactly one per file:

```
grep -rn "V *= *[\"']v[0-9]\+[\"']\|build v[0-9]\+\|gamenight-v[0-9]\+" index.html sw.js */index.html
```

The five shapes in the wild: `var V="v73"`, `var V = "v73"` (spaced),
`const BUILD_V="v73"`, `var BUILD_V = "v73"`, and a bare `'build v73'` inside a
template string in `blackjack/`.

They are not currently all in sync, and that's fine — a game only needs bumping
when the commit touches it, plus the hub and `sw.js`.

**A commit that ships nothing to the browser (this file, a README on its own)
does not bump anything and has no `vNN` on its message.** Bumping the cache name
makes every installed phone re-download the whole app, so don't spend that on a
doc edit.

---

## Commit messages

House style, one line, always ending in the build number:

```
Game: what changed; vNN
```

Real examples: `Hold'em: tappable relay diagnostic in the online lobby; v73` ·
`Spite & Malice: Either way leaves the top card when a stack scoops; v62` ·
`sw: stop precaching the previous build out of the HTTP cache; v64`

**Update the game's README in the same commit.** Josh's standing rule — docs
don't get to drift.

---

## How a game is built

Separate the rules from the screen, in script blocks in one file:

1. **The engine** — a global like `window.STRAT` or `window.SM`. Deck or board,
   legal-move generation, scoring, win detection, the bot, and the network
   encode/decode helpers. **No DOM access at all.**
2. **The UI** — the only block that touches the page. Knows none of the rules.

Nothing in the engine should know whether a human, a bot, or a remote peer is
choosing the moves. That is what lets two-phone mode reuse it unchanged, and it
is what lets the tests run the engine in node.

**Tests, where a game has them,** pull the script blocks straight out of
`index.html` and `eval` them — never a copied second implementation, which would
drift. See `stratego/rules.test.js` and `stratego/soak.test.js` for the pattern;
soak the engine over hundreds of bot-vs-bot games asserting it always terminates
legally and state stays consistent.

---

## Two phones

Host-authoritative, no backend, over two public **ntfy** relays:

```
https://ntfy.sh    https://ntfy.envs.net
```

Topic is per-game and per-room: `jtcrib-v1-<code>` (cribbage),
`jtsm-v1-<code>` (spite & malice) — lowercase the 4-letter room code. One player
creates and reads out the code, the other joins.

The guest sends moves to the host; the host owns the deal and the shared state
and broadcasts a **redacted** view back. The guest must never receive the host's
hidden information — don't send it and filter on the client, don't send it.
Because the host device holds the full deal, this isn't cryptographically
secret: fine for friends, not for money. Say so in the README.

Keep a fresh state serialising well under ntfy's **4 KB** message cap.

---

## Things that have already gone wrong

- **GitHub Pages serves `cache-control: max-age=600`.** A plain `fetch` in the
  service worker can be answered from the browser's HTTP cache with the
  *previous* build, so two deploys inside ten minutes precached stale files and
  looked exactly like "the update didn't take." `sw.js` now requests
  `{cache:"reload"}` / `{cache:"no-cache"}` deliberately. Don't simplify it back.
- **HTML is network-first, everything else cache-first**, so a killed-and-
  reopened app never serves yesterday's game.
- Build stamps take their date from `document.lastModified` (Pages sends the
  deploy time), not a hardcoded constant.

---

## Tone

Josh is a developer. Be direct, show the numbers, don't narrate, don't pitch.
When you're wrong, say so plainly and move on.
