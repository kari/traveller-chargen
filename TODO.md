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

- [ ] UI renders the character's history (the CLI already prints it)
- [ ] Personal history
  - random charts for lore, look at throw / roll difference
  - random stuff in TAS Form 2?
- [ ] Dice icon to re-roll certain aspects (name, etc.)
- [ ] Option to specify what to look for in generation
  - async function
  - timeout
- [ ] Go through character generation in the book to find missing details
- [ ] Fix checkboxes, <https://www.htmhell.dev/adventcalendar/2023/2/>

### References

- <https://github.com/makhidkarun/travellercharactergenerator>
- <https://travellertoolsdemo.azurewebsites.net/character>

## WORLDGEN

### Features

- [ ] Create communication routes
  - trade routes using gravity algorithm
- [ ] Look into Book 7 for trade codes?
  - also the trade code statistics thread under references for clarifications
- [ ] Generate possible ships to encounter when entering system?

### References

- <https://www.traveller-srd.com/core-rules/world-creation/>
- <https://forum.mongoosepublishing.com/threads/traveller-trade-code-statistics.32998/>
- <https://donjon.bin.sh/scifi/tsg/>
- <https://zhodani.space/stuff/generators/random-subsector-generator/>
- <https://travellermap.com>
  - <https://travellermap.com/doc/secondsurvey#remarks>

## NAMEGEN

Consumer side of the separately developed
[markov-namegen](https://github.com/kari/markov-namegen) library; these
start upstream.

- [ ] Model serialization support in the library
- [ ] Precompute the worlds model at build time once models serialize
  (drops the runtime training and the world word list from the bundle)
- [ ] Per-call random source injection in the library, replacing the
  swappable-random workaround in `subsector.ts`
