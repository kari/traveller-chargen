# Classic Traveller Chargen

This is a character generator for [the 1981 edition of the classic Traveller role-playing game](https://preview.drivethrurpg.com/en/product/355200/classic-traveller-facsimile-edition) as defined in the Book 1 (and Book 2 if the character is lucky enough to earn a starship).

By necessity, the generator is opionated because the generation process includes multiple decision points. While these are not necessarily the most optimized choices, they should anyway be quite reasonable.

## Roadmap

This project will also include Subsector and World Generation as defined in Book 3. See `src/worldgen.ts`.

## Installation

```bash
npm i
```

## Running

This project uses [Parcel](https://parceljs.org/) and can be run locally using an NPM script

```sh
npm start 
```

## Building

```bash
npm run build
```

This builds the project to `dist/`.

## See also

- <https://github.com/makhidkarun/travellercharactergenerator>

## License

Distributed under the MPL 2.0 License. See `LICENSE` for more information.

Markov name generator `scripts/lib/name_generator.ts` is provided under [CC0](http://creativecommons.org/publicdomain/zero/1.0/).

First name data in `src/names/` is from [Moby Word Lists](https://www.gutenberg.org/ebooks/3201) (Public Domain) and surnames are from [Markov Namegen's word lists](https://github.com/Tw1ddle/markov-namegen-lib) (CC-BY-SA 3.0). Ship names are from Wikipedia (CC-BY-SA 3.0). World names are from [Traveller RPG Wiki](https://wiki.travellerrpg.com/Canon_World_%26_System_Reference_Log) (CC-BY-NC 3.0)

The Traveller game in all forms is owned by Far Future Enterprises. Copyright 1977 - 2023 Far Future Enterprises. Traveller is a registered trademark of Far Future Enterprises. Far Future permits web sites and fanzines for this game, provided it contains this notice, that Far Future is notified, and subject to a withdrawal of permission on 90 days notice. The contents of this site are for personal, non-commercial use only. Any use of Far Future Enterprises's copyrighted material or trademarks anywhere on this web site and its files should not be viewed as a challenge to those copyrights or trademarks. In addition, any program/articles/file on this site cannot be republished or distributed without the consent of the author who contributed it.
