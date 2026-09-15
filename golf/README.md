# Links

A nine-hole golf game you play from behind the ball, with a three-tap swing and a
course that is nothing but data — which is the point. The course architect comes next,
and it will write exactly the same format the shipped course is written in.

## The swing

Three taps. The first starts the meter, the second sets power at the top, the third sets
accuracy as the marker comes back down through the window at the left edge. Stop it early
and the ball leaks right; stop it late and you pull it left; miss the window entirely and
you get the worst of it.

Past 100% the bar turns red. You get real yards there, but the marker moves half again as
fast and every mistake is amplified — the honest trade the old games made. Run clean off
the end and it is an **overswing**: the bar flashes red, the button says so, you swing at
106% with no say in it — and you still get your accuracy tap.

The bar *decelerates* into 100% rather than accelerating through it. Accelerating at
exactly the mark every player aims for left a 68ms window on the most wanted stop in the
game; easing in makes it about 200ms. The red zone past full still runs away, because
that is the point of the red.

Drag the view to aim. On a desktop: space swings, arrow keys change club and aim.

## What the engine actually models

- **Fourteen clubs**, each with its own carry, roll, dispersion and loft. Loft drives the
  flight arc, how much the wind pushes it around, and how much it runs on landing.
- **Lies that matter.** The rough takes 15% off your carry and most of your roll; deep
  rough takes a third; a bunker takes nearly 40% and refuses anything longer than a
  7-iron — swing a driver out of sand and you will find out why.
- **Wind** with a head/tail component that shortens or lengthens the carry and a crosswind
  that drifts the ball in proportion to how long it is in the air. A high wedge suffers
  more than a driver.
- **Water and out of bounds.** Water is a stroke and a drop at the margin of the hazard on
  the line you came in on. Out of bounds is stroke and distance — you really do play it
  again from where you stood.
- **Putting** on its own model: feet rather than yards, a break that scales with how far
  the ball rolls, and a cup that only catches a ball whose *path* crosses it slowly
  enough. Ram a three-footer and it lips out. The putting meter is **scaled to the putt**
  (roughly 1.7× its length, floor 9 feet) and runs at 62% speed, so dead weight always sits
  near two thirds of the bar whatever the distance; the cup and the inside-two-feet band are
  drawn on the meter. You can also drag to aim on the green, at a quarter of the sensitivity
  of a full swing, which is how you play break.

## The course

**Birch Hollow**, nine holes, par 36 — a straight opener, a reachable par 5, an all-carry
par 3 over the pond, a dogleg left around the pines, and a long one home with water on the
left of the green.

Courses are plain data: a centreline, fairway widths, a green with a slope vector, and
lists of bunkers, water and trees. `GOLF.encodeCourse()` packs one into a URL-safe string
and `GOLF.decodeCourse()` unpacks it — and validates it, because a course that arrives in
a link is untrusted input, and a missing green would take the renderer down with it. Open
`?c=<code>` to play a course someone sent you.

## Sound

From the shared `../sfx.js` — synthesized, offline, one mute setting across every Game
Night game.

## Notes for whoever edits this next

The file is two script blocks on purpose. **Block 1 is the rules engine** (`window.GOLF`)
and touches no DOM at all; **block 3 is the renderer**. That split is what lets the tests
run the real engine in node, and it is what a future two-player mode would reuse.

The camera is pitched down and rises with the distance left, because a true eye-level
projection puts a 400-yard green two pixels below the horizon. The focal length is derived
from the canvas **height**, not its width — deriving it from width put the horizon above
the top of the screen on a wide desktop window and the sky vanished entirely.

**The swing meter must never skip a tap.** It used to flip from the power phase to the
accuracy phase the instant the bar ran off the end. A power tap eight milliseconds late was
then read as the *accuracy* tap: the shot fired on the spot at 112% power with the worst
accuracy value on the dial, and the player saw their second click do nothing and the ball
leave for a bunker. Topping out is now a held, visible state of its own; a tap inside 150ms
of any phase change is swallowed rather than misread; and the button listens on
`pointerdown`, not `click` — a click fires on *release*, so every tap reached the meter one
press-length after the player decided to stop it.

Three bugs found by simulating rounds rather than by playing, all worth not reintroducing:
shots ignored the aim angle and flew straight up the hole's axis (every dogleg averaged 12
strokes); a water ball was replayed from the same spot with the same aim, so the sim could
sit in a pond forever; and the putting capture test only looked at where the ball *stopped*,
so a putt rolling over the cup at dead weight was scored a miss — from 1.3 feet it putted
eleven times in a row without holing out.

`/root/golf/test_engine.js` (29 assertions) and `test_play.js` (a 200-round simulation at
three skill levels) extract block 1 straight out of the shipped HTML, so they test what
actually ships. The simulation is the fitness function: every hole should average a little
over its par and the field should spread by skill. If you retune clubs, greens or hole
lengths, re-run it.
