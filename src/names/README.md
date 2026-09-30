# Name data

Word lists for the character, ship, and world name generators. The data was
moved from TypeScript modules to JSON on 2026-09-26; the source attributions
that used to live in those module headers are preserved below.

| File             | Source                                                                                     | License       |
| ---------------- | ------------------------------------------------------------------------------------------ | ------------- |
| `female.json`    | [Moby Word Lists](https://www.gutenberg.org/files/3201/files/NAMES-F.TXT)                  | Public Domain |
| `male.json`      | [Moby Word Lists](https://www.gutenberg.org/files/3201/files/NAMES-M.TXT)                  | Public Domain |
| `last_name.json` | [markov-namegen-lib](https://github.com/Tw1ddle/markov-namegen-lib/blob/master/word_lists/american_surnames.txt) | CC-BY-SA 3.0 |
| `ships.json`     | Wikipedia: [Royal Navy ship names](https://en.wikipedia.org/wiki/List_of_ship_names_of_the_Royal_Navy), [US Navy ships](https://en.wikipedia.org/wiki/List_of_United_States_Navy_ships) | CC-BY-SA 3.0 |
| `worlds.json`    | [Canon World & System Reference Log](https://wiki.travellerrpg.com/Canon_World_%26_System_Reference_Log) (Traveller RPG Wiki) | CC-BY-NC 3.0 |

The lists can be re-scraped with the scripts in `scripts/`. Licensing and
acknowledgments for the project are collected in the [project
README](../../README.md).
