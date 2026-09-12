# Blackjack

A single-file, play-in-the-browser **Blackjack** — you against the dealer, with a
persistent bankroll and casino table rules. Part of the Game Night home-screen app.

## House rules

- **Single deck**, dealer **hits soft 17**, **Blackjack pays 3:2**.
- **Split** up to 4 hands, **double** any two cards, **double after split** allowed,
  split aces get one card each and can't be re-split. Insurance is off.
- Chips are $5 / $25 / $100 / $500; place bets on any of up to five spots.
- Your **bankroll persists** between sessions (stored on the device). Rebuy from
  Settings if you bust out.

## How it plays

Pick a chip, tap a betting spot to place it, then **Deal**. On your turn:
**Hit**, **Stand**, **Double**, or **Split** when available. The dealer then plays
out and pays the winners. Keyboard shortcuts on desktop: `Enter` deal, `H` hit,
`S` stand, `D` double, `P` split, `R` repeat bet, `C` clear, `1–4` pick a chip.

## Options

- **Card size** (A± in the top bar) and other preferences live in **Settings** (⚙).
- The Settings footer shows the `build vNN` stamp — the quick way to confirm a
  refresh actually took.

## Notes

The card face uses the Oswald web font when online; offline it falls back to the
system font, so the game still plays fully offline as part of the installed app.

## Running it

Open `index.html` in a browser — no build step or dependencies. Home button (🏠)
returns to the Game Night launcher.
