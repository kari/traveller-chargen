# TODO

Roadmap of planned features and larger refactors. Smaller in-place debt
lives in `FIXME` comments in the code.

This project has three parts:

- CHARGEN — character (and their possible ship) generation
- WORLDGEN — subsector and world generation
- NAMEGEN — generating names using Markov chains, <https://github.com/kari/markov-namegen>

Possibly along the road there's a need for SHIPGEN as well.

## CHARGEN

### Features

- [ ] UI renders the character's history
- [ ] Personal history
  - random charts for lore, look at throw / roll difference
  - random stuff in TAS Form 2?
- [ ] Dice icon to re-roll certain aspects (name, etc.)
- [ ] Option to specify what to look for in generation
  - async function
  - timeout
- [ ] Go through character generation in the book to find missing details
- [ ] Fix checkboxes, <https://www.htmhell.dev/adventcalendar/2023/2/>

## WORLDGEN

### Features

- [ ] Create communication routes
  - trade routes using gravity algorithm
- [ ] Look into Book 7 for trade codes?
  - also the [trade code statistics thread](https://forum.mongoosepublishing.com/threads/traveller-trade-code-statistics.32998/) for clarifications
- [ ] Generate possible ships to encounter when entering system?

## NAMEGEN

Consumer side of the separately developed
[markov-namegen](https://github.com/kari/markov-namegen) library; these
start upstream.

- [x] Model serialization support in the library (shipped in 2.1.0; verified
  here that a serialize/deserialize round-trip generates byte-identical names)
- [x] Per-call random source injection in the library (shipped in 2.2.0);
  the swappable-random workaround in `subsector.ts` is gone — the shared
  generator now takes each caller's seeded source per `generateNames` call

Evaluating serialization for precomputing the worlds model: round-trips are
byte-identical (200/200 seeds) on both formats. The 2.1.0 dense model was
1.3 MB raw / 82 kB gzipped; the 2.2.0 sparse model (format v2) is 94 kB raw /
22 kB gzipped against the 11.4 kB (5.2 kB gzipped) word list, and
deserialization (2.3 ms) is faster than training (7.1 ms) — but both happen
once per session, so shipping the model still grows the worldgen payload
~4x gzipped to save ~5 ms. Word list + training stays.
