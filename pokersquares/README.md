# Poker Squares (`pokersquares/`)

Solitaire poker on a 5×5 grid — a.k.a. **Poker Solitaire / Poker Patience**. Self-contained single `index.html`, no backend.

## How it plays
- 25 cards are dealt **one at a time** into a 5×5 grid. Tap any empty square to drop the card in the tray.
- A placed card **can't be moved** — `↩ Undo` reverses only your most recent placement.
- When all 25 squares are full, each of the **5 rows and 5 columns** is scored as a poker hand; the total is the sum of all ten.
- Aces play high or low, `A-2-3-4-5` is a straight, `10-J-Q-K-A` suited is a royal flush.
- Best score is kept per device in `localStorage` (`pokersquares.v1`).

## Scoring
Two point systems, switchable in the Menu (persisted):

| Hand | American | English |
| --- | --- | --- |
| Royal flush | 100 | 30 |
| Straight flush | 75 | 30 |
| Four of a kind | 50 | 16 |
| Full house | 25 | 10 |
| Flush | 20 | 5 |
| Straight | 15 | 12 |
| Three of a kind | 10 | 6 |
| Two pair | 5 | 3 |
| One pair | 2 | 1 |

American mirrors real-poker rarity; English rewards how hard each hand is to build inside the grid. Both reproduce the canonical Wikipedia example totals (197 American / 66 English).

## Conventions (shared with the hub)
- Felt-and-gold theme via the same `:root` vars + component classes (`.btn`, `.seg`, `.switch`/`.toggle`, `.panel`/`.overlay`, `.setup-opt`, `.tip-block`).
- Header has 🏠 (→ `../`), Rules, Menu. Settings default: **tips off, four-color deck on**.
- Build stamp `build vNN · <local time>` at the bottom (`V`/`ISO` consts) — bump with the `sw.js` cache version.
- In-game asset refs point up one level (`../manifest.webmanifest`, `../icon-180.png`, `../sw.js`).
