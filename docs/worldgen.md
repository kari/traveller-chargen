# Subsector and World Generation

## Note on data sources

The world names are generated from a training set of canonical world listing on Traveller RPG Wiki. It is possible that the generator outputs one of these original world names.

## Procedure

The generation procedure aims to follow the one defined in the Classic Traveller Facsimile Edition (2021), with additional details from the online [Traveller SRD](https://www.traveller-srd.com/core-rules/world-creation/) (which derives from the Mongoose edition) and Supplement 12 (Forms and Charts). This document will explain what decisions the generator makes that would normally be done by the player and what deviations are done.

The generator will create a subsector and populate it with worlds, outputting TAS Forms 6 and 7. For each system, this process creates only the single most important world in the star system and only considers basic solid matter sphere worlds (and asteroid belts).

Following the World Generation Checklist in Book 3:

### 1. Determine world occurence

As described in the rules, on 4+ a world occurs on a hex.

### 2. Check system contents table

Starport, naval base, scout base and gas giant are checked for as in rules.

### 3. Name world

A name is generated.

### 4. Decide if travel zone coded

Red zones are set for interdicted worlds: a starport X world with population 4+.

Amber zones follow the rules from [Traveller SRD](https://www.traveller-srd.com/core-rules/world-creation/):

> A world with an Atmosphere of 10+, a government of 0, 7 or 10, or a Law Level of 0 or 9+ should be considered for Amber status.

As a deviation, the generator doesn't mark every dangerous world: a dangerous profile is only confirmed Amber on a rarity throw of 2D6 11+ (roughly 8%), keeping Amber zones exceptional.

### 5. Establish communication routes

TBD. The Subsector Capital is chosen: the inhabited world with the highest population, then highest technological level, then best starport. Worlds with extreme government (0, 7, 10) or law level (0, 9+) are excluded when better-governed candidates exist, and exact ties are broken randomly. The capital gains the Cp trade classification.

### 6. Generate universal planetary profile for world

These are calculated as in rules.

### 7. Note trade classifications

The generator adds the trade classifications mentioned in Book 3.

### 8. Note statistics for reference

These are listed on TAS Form 7 (Subsector World Data) from Supplement 12 and The Traveller Book.
