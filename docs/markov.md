# Markov Name Generators

There's a nice model at https://github.com/Tw1ddle/markov-namegen-lib but it's in Haxe, but has nice corpuses https://github.com/Tw1ddle/markov-namegen-lib/tree/master/word_lists

There's a javascript name generator at https://donjon.bin.sh/code/name/

List of names https://www.gutenberg.org/ebooks/3201

Lists of ship names:

- https://en.wikipedia.org/wiki/Lists_of_shipss
- https://en.wikipedia.org/wiki/List_of_United_States_Navy_ships
- https://en.wikipedia.org/wiki/List_of_ship_names_of_the_Royal_Navy

## RN

- Remove [A-Z]+[0-9]+\n ships

## USN

- remove prefix ^(USS|MV|SS|USNS|USCGC|RV|HSV|USRC|VADM)\s+
- remove suffix  \(.+\)$
  - another pass \s\(.+\)$
- remove short [A-Z]+-[0-9]+\n
- remove:
  - List of sub chasers
  - Eagle class patrol craft
  - .*hip No\. \d\n
  - Patrol #.+\n
  - SDTS
