# TODO

This project has three parts,

- CHARGEN - for character (and their possible ship) generation
- WORLDGEN - for subsector and world generation
- NAMEGEN - for generating names using Markov chains, <https://github.com/kari/markov-namegen>

Possibly there's a need for SHIPGEN as well.

## CHARGEN

### References

- <https://github.com/makhidkarun/travellercharactergenerator>
- <https://travellertoolsdemo.azurewebsites.net/character>

### Todo

- Personal history
  - random charts for lore, look at throw / roll difference
  - random stuff in TAS Form 2?
- Dice icon to re-roll certain aspects (name, etc.)
- Go through character generation in the book to find missing details
- Option to specify what to look for in generation
  - async function
  - timeout
- fix checkboxes, <https://www.htmhell.dev/adventcalendar/2023/2/>

## WORLDGEN

### References

- <https://www.traveller-srd.com/core-rules/world-creation/>
- <https://forum.mongoosepublishing.com/threads/traveller-trade-code-statistics.32998/>
- <https://donjon.bin.sh/scifi/tsg/>
- <https://zhodani.space/stuff/generators/random-subsector-generator/>
- <https://travellermap.com>
  - <https://travellermap.com/doc/secondsurvey#remarks>

### Todo

- Create communication routes
  - trade routes using ant colony optimization, <https://en.wikipedia.org/wiki/Ant_colony_optimization_algorithms>
- Select subsector capital world
- Look into Book 7 for trade codes?
  - Also look at the thread for some clarifications
- Generate possible ships to encounter when entering system?
- Spin out to its own project?
