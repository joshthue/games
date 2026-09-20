# Blackjack

A single-file, play-in-the-browser **Blackjack** — you against the dealer, with a
persistent bankroll and casino table rules. Part of the Game Night home-screen app.

## House rules

- **Single deck**, dealer **hits soft 17**, **Blackjack pays 3:2**.
- **Split** up to 4 hands, **double** any two cards, **double after split** allowed,
  split aces get one card each and can't be re-split. Insurance is off.
- Chips are $5 / $25 / $100 / $500; spread bets across up to **six spots**, laid out
  in two rows. Settings offers 3 / 6 / 9 spots (one, two, or three rows).
- Your **bankroll persists** between sessions (stored on the device). Rebuy from
  Settings if you bust out.

## How it plays

Pick a chip, tap a betting spot to place it, then **Deal**. On your turn:
**Hit**, **Stand**, **Double**, or **Split** when available. The dealer then plays
out and pays the winners. Keyboard shortcuts on desktop: `Enter` deal, `H` hit,
`S` stand, `D` double, `P` split, `R` repeat bet, `C` clear, `1–4` pick a chip.

## Options

- **Card size** (A± in the top bar) cycles **S / M / L / XL**. It now comes from the shared
  `../cardsize.js`, on the same scale and the same origin-wide key as every other Game Night
  card game — a size picked here is the size in all of them. It used to be a private S/M/L on
  its own key, which meant Blackjack drifted out of step with the rest. Other preferences live
  in **Settings** (⚙). Hand totals, the dealer's line, the chip denominations and the bet
  amounts all scale with the cards, so they stay readable on a desktop monitor and grow when
  you size the cards up.
- The Settings footer shows the `build vNN` stamp — the quick way to confirm a
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
