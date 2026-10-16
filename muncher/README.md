# Muncher

An original maze-muncher for Game Night. Clear every berry while four wisps
chase you; grab a **glow-cap** to turn them blue and eat them for escalating
points. Levels speed the wisps up and shorten the glow. Side tunnels wrap.

This is an original game — original maze, original critter, original wisp
names (Blink, Shade, Ember, Hush), colours and behaviours. It borrows only the
genre (a maze, pellets, power-pellets, four chasers), which nobody owns. No
trademarked names or layouts appear anywhere.

## Controls
- **Bluetooth controller** — D-pad or left stick to steer, A/Start to begin, B to pause.
  iPadOS exposes a paired pad to the page through the Gamepad API, so it just works
  once the pad is paired in Settings → Bluetooth. The dot on the name line lights up
  when a controller is seen.
- **Touch** — swipe anywhere on the board, or use the on-screen D-pad.
- **Keyboard** — arrows or WASD; Space/Enter to start, P to pause.

## How it's built
Single self-contained `index.html`, like the rest of the suite. Shared header
(`../gn-header.js`), sound (`../sfx.js`) and service worker (`../sw.js`); felt-and-gold
theme via the shared `:root` tokens.

- **Maze** is generated from a compact symmetric spec and validated at load with a
  flood fill — any berry the fill can't reach is cleared, so the board is always
  completable. The shipped layout needs no such rescue.
- **Movement** is tile-centre based with buffered turns and instant mid-corridor
  reverse, so steering feels responsive.
- **Wisps** each have an original target rule (direct chase, ambush ahead, a flanking
  vector, and a shy one that bolts when close), plus scatter/chase phases, a frightened
  mode on a glow-cap, and eyes that return home when eaten.
- **Input** polls the Gamepad API inside the animation loop, **guarded in try/catch** —
  a sandboxed context that blocks the gamepad feature (e.g. an in-app preview) degrades
  to touch/keyboard instead of killing the loop.

A `window.__MAZE` test door exposes live state and the input handlers so a headless
harness reads truth instead of pixels. Verified headless across 320/390/430/834 widths:
no JS errors, maze fully connected, no horizontal overflow, controller-blocked fallback,
and a play-through that eats, triggers fright, and releases the wisps.
