# Classic Traveller Chargen

[![CI](https://github.com/kari/traveller-chargen/actions/workflows/ci.yml/badge.svg)](https://github.com/kari/traveller-chargen/actions/workflows/ci.yml)

This is a character and subsector generator for [the 1981 edition of the classic Traveller role-playing game](https://preview.drivethrurpg.com/en/product/355200/classic-traveller-facsimile-edition), following the three core rulebooks (Books 1-3), with additional details from Supplement 1 (1001 Characters), Supplement 12 (Forms and Charts), and The Traveller Book.

A live instance runs at [ctgen.kalifi.org](https://ctgen.kalifi.org).

The generator is opinionated because character generation includes multiple decision points. Its choices are not necessarily optimized, but should produce reasonable characters.

## Features

- Character generation based on Classic Traveller Book 1
- Starship generation for eligible Scout and Merchant characters
- Subsector and world generation based on Book 3, drawn as a hex map
- Printable TAS-style character, ship, and subsector forms
- Fully seed-reproducible: the seed used is printed on the generated forms
- Rule fidelity verified end-to-end against Book 1's own worked character example

The generators automate the decisions a player would normally make; the procedures, house rules, and deviations from the books are documented in [docs/chargen.md](docs/chargen.md) and [docs/worldgen.md](docs/worldgen.md).

## Development

Requires Node 24 (see `.node-version`).

```bash
npm install
```

Start the local development server with [Vite](https://vite.dev/):

```bash
npm start
```

The development server serves the character generator at `/`, the world generator at `/worldgen.html`, and project information at `/about.html`.

Create a production build with:

```bash
npm run build
```

This builds the project to `dist/`.

Run the test suite and coverage report with:

```bash
npm test
npm run coverage
```

Run all CI quality checks locally with:

```bash
npm run check
```

The generators use seeded pseudo-randomness internally, so generated results can be reproduced in code by supplying the same seed.

## See also

- <https://github.com/makhidkarun/travellercharactergenerator>
- <https://travellertoolsdemo.azurewebsites.net/character>
- <https://donjon.bin.sh/scifi/tsg/>
- <https://zhodani.space/stuff/generators/random-subsector-generator/>
- <https://travellermap.com>, whose [Second Survey document](https://travellermap.com/doc/secondsurvey#remarks) describes the canonical sector data format

## License

Distributed under the MPL 2.0 License. See `LICENSE` for more information.

First name data in `src/names/` is from [Moby Word Lists](https://www.gutenberg.org/ebooks/3201) (Public Domain) and surnames are from [Markov Namegen's word lists](https://github.com/Tw1ddle/markov-namegen-lib) (CC-BY-SA 3.0). Ship names are from Wikipedia (CC-BY-SA 3.0). World names are from [Traveller RPG Wiki](https://wiki.travellerrpg.com/Canon_World_%26_System_Reference_Log) (CC-BY-NC 3.0)

The Traveller game in all forms is owned by Far Future Enterprises. Copyright 1977 - 2023 Far Future Enterprises. Traveller is a registered trademark of Far Future Enterprises. Far Future permits web sites and fanzines for this game, provided it contains this notice, that Far Future is notified, and subject to a withdrawal of permission on 90 days notice. The contents of this site are for personal, non-commercial use only. Any use of Far Future Enterprises's copyrighted material or trademarks anywhere on this web site and its files should not be viewed as a challenge to those copyrights or trademarks. In addition, any program/articles/file on this site cannot be republished or distributed without the consent of the author who contributed it.
