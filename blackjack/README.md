# Blackjack

A single-file, play-in-the-browser **Blackjack** — you against the dealer, with a
persistent bankroll and casino table rules. Part of the Game Night home-screen app.

## House rules

- **Single deck**, dealer **hits soft 17**, **Blackjack pays 3:2**.
- **Split** up to 4 hands, **double** any two cards, **double after split** allowed,
  split aces get one card each and can't be re-split. Insurance is off.
- Chips are $5 / $25 / $100 / $500; spread bets across up to **six spots**, laid out
  in two rows. The Menu offers 3 / 6 / 9 spots (one, two, or three rows).
- Your **bankroll persists** between sessions (stored on the device). Rebuy from
  the Menu if you bust out.

## How it plays

Pick a chip, tap a betting spot to place it, then **Deal**. On your turn:
**Hit**, **Stand**, **Double**, or **Split** when available. The dealer then plays
out and pays the winners. Keyboard shortcuts on desktop: `Enter` deal, `H` hit,
`S` stand, `D` double, `P` split, `R` repeat bet, `C` clear, `1–4` pick a chip.

## Screen

No setup screen — you sit straight down at the table. The header is the standard Game Night
one: **‹ Games**, **Rules**, **Menu**, and the name, with the **bankroll** right-aligned on the
name's line. **Rules** opens a rules sheet written from the live house rules (it updates when
you change them). **Menu** is the old ⚙ settings sheet: Back to all games, Rules, card size and
card text, then the table options and the bankroll reset.

## Options

- **Card size** and **Card text** are the two standard **S / M / L / XL** rows at the top of
  the Menu (the old A± header button is gone). Card text scales only the printed rank and pip
  (`--cardtext`), not the card. At **L and XL text** a card shows only its top-left index
  (rank over suit) — hands are fanned, so that corner is the part that always shows, and at
  big print the two corners and the centre pip overlapped. Card size comes from the shared
  `../cardsize.js`, on the same scale and the same origin-wide key as every other Game Night
  card game — a size picked here is the size in all of them. It used to be a private S/M/L on
  its own key, which meant Blackjack drifted out of step with the rest. Other preferences live
  in the **Menu**. Hand totals, the dealer's line, the chip denominations and the bet
  amounts all scale with the cards, so they stay readable on a desktop monitor and grow when
  you size the cards up.
- The Menu footer shows the `build vNN` stamp — the quick way to confirm a
  refresh actually took.

## Notes

Type is set in **Oswald**, embedded in the page as a subset WOFF2 data URI
(variable 200-700, SIL Open Font License 1.1). Nothing is fetched at runtime, so the
game looks identical offline — this was the only file in the repo that reached out to
the network, and on a plane it used to silently fall back to a system font. Don't
replace it with a Google Fonts `<link>`.

## Sound

Sound comes from `../sfx.js`, the shared Game Night sound layer — synthesized with
WebAudio, so there are no audio files to load and it works offline. The setting is stored
once for the whole origin, so muting in any Game Night game mutes them all. iOS won't let
a page make noise before the first touch, so the audio context waits for a gesture.

## Running it

Open `index.html` in a browser — no build step or dependencies. Home button (🏠)
returns to the Game Night launcher.
