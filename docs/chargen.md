# Character Generation

## Note on data sources

The names for characters are picked from a list of common American male and female first names, and last names. Regardless of the name, the character can be of any ethnicity or gender. The world names are generated from a training set of canonical world listing on Traveller RPG Wiki. The ship names are picked from a list of both US and Royal Navy ships from Wikipedia. The files in `src/names/` document the exact sources and licenses.

There are potentially "better" datasets for these names, and generation procedures and contributions are welcome.

## Generation procedure

The generation procedure aims to follow the one defined in the Classic Traveller Facsimile Edition (2021), with additional details from Supplement 1 (1001 Characters), Supplement 12 (Forms and Charts), and The Traveller Book. This document will explain what decisions the generator makes that would normally be done by the player and what deviations are done.

Generation is fully deterministic for a given seed, and the seed used is shown on the generated forms.

Following the Character Generation Checklist in Book 1:

### 1. Generate the six personal characteristics

After throwing for the characteristics, the generator picks a random sex and this determines two things:

1. The first name list the character's name is picked from
2. The gender of a possible title (ie. Sir or Dame)

If the character has social standing C (Baron or Baroness), another throw is made to see whether the character uses the title (on 3-) or if they instead have a prefix (on 4+) before their last name (randomly either von, hault or haut). This prefix won't be lost even if social standing changes.

Although the basic generation does not define Birthworld nor Dischargeworld, these are generated here too for flavor.

### 2. Select a branch of service and apply for enlistment

The character won't attempt for services which are too difficult to enter (7+) and picks a random from the rest. If rejected, the character is drafted to a random branch.

This can trigger some automatic skills depending on the branch.

### 3. Determine survival

As described in the rules, character throws for survival and might die as a consequence.

### 4. Officer Rank

As described in the rules, character applies for commission and promotion (if commissioned).

Promotion can trigger some automatic skills depending on the service and rank.

### 5. Determine skills received this term

If the character's attribute average is 7-, they will focus on personal development.

Otherwise they roll D6, and depending on the result:

- 1-2: Roll on Personal Development Table
- 3-4: Roll on Service Skills Table
- 5-6: If the player's Education is 7-, roll on Advanced Education Table. Otherwise, roll D6, and on 3+ roll instead on the 8+ Advanced Education Table.

Repeat the procedure for each acquired skill.

### 6. If completing the 4th or later term of service, check for aging effects

As described in the rules, and might die as a consequence.

### 7. Roll for permission to reenlist

After the character has rolled for permission to reenlist, as described in the rules except when there's a choice to either not reenlist or voluntarily retire:

- If the throw isn't 12 (mandatory reenlistment) and has served less than 7 terms, throws 2D6 and on 10+ chooses not to reenlist.
- If the throw isn't 12 and has served 5+ terms (eligible for voluntary retirement), throws 2D6 with a DM of (terms served - 7) and on 10+ voluntarily retires.

### Retirement pay

A character who retires from a pension-paying career (the military services and Merchants) after five or more terms receives a pension: Cr2,000 plus Cr2,000 for each term served above four.

### 8. Mustering out

The number of benefit rolls equals terms served plus a rank bonus: +1 at ranks 1-2, +2 at ranks 3-4, and +3 at ranks 5-6.

Character will always roll on Cash Table first. After that, if their attribute average is 7- or 1D6 throws 3+, they will roll on Benefits Table. Otherwise, they will roll on Cash Table if they can (at most three Cash rolls). When rolling for benefits at rank 5+, +1 is added to the roll; the Cash Table roll gets +1 if the character has Gambling.

If the character has earned a ship, all passages are converted to credits at 90% of their price. Any further ship results pay off the ship's mortgage by ten years per result.

## Skills

If the character earns a Weapon, Blade or Vehicle skill, they need to make a choice which weapon, blade or vehicle to choose. The prodecure is similar for weapons and blades, and a simpler for vehicle skills.

### Vehicle Skills

Character chooses to improve an already known skill, otherwise chooses a random skill.

Note that this means the character won't learn two vehicle skills. This is unintentional.

## Weapon and Blade Skills

The character considers three groups of weapons

- Avoid: Those that would incur weapon STR penalty
- Prefer: Those that would give weapon STR benefit
- Known: Those that the character already has a skill in

The character will choose a (random) skill in order of preference:

- Weapons which are Known and Preferred
- Weapons which are Known and not Avoided
- Weapons which are Preferred
- Weapons which are not Avoided

Otherwise, a random weapon skill is chosen even if it would incur a STR penalty.

This procedure, like Vehicle, will always increase skill in known skills, and doesn't really allow for a range of skills.

## Weapons and Blades

Similar to skills, four groups of weapons (weapon or blade) are considered.

- Avoid: Those that would incur weapon STR penalty
- Prefer: Those that would give weapon STR benefit
- Known: Those that the character already has a skill in
- Owned: Those that the character owns

A random weapon is picked in order of preference:

- Weapons which are Known, Preferred and not Owned
- Weapons which are Known and not Avoided and not Owned
- Weapons which are Preferred and not Owned (also grants a zero skill)
- Any weapons not Owned (also grants a zero skill)

The last group always matches unless the character owns every weapon in the group, in which case the generator throws.

This procedure will never pick a weapon more than once.

## TAS Form 2

According to The Traveller Book, the basic character generation only fills blocks 3, 4, 5, 9, 12, 13, 14a, 14b, 18a, 18b, 18c, 19a, 19b, 19c and 20. The rest are provided for atmosphere and realism.

### 6. Birthdate

The generator assumes "today" is the current day of the year but in 1105 IC. After finishing the career, character's birthdate is calculated from their age to a random day in their birth year.

### 8. Birthworld

Generated by random.

### 11. Dischargeworld

Generated by random. (Block 10, Branch, is not used as branches are not defined in Books 1-3.)

### 15. Special Assignments

TBD

### 16. Awards and Decorations

TBD

### 17. Equipment Qualified On

Character's skills which relate to weapons and devices are listed here (and not in blocks 18a-c).

## TAS Form 3

If the character has served in either Merchants or Scouts, it's possible they can earn a starship, either a Type A Free Trader or a Type S Scout/Courier. A Free Trader comes with a 40-year mortgage; repeated ship benefits from mustering out pay it down.

## Verification

The Book 1 character generation worked example (Alexander Lascelles Jamison) is replayed die-roll by die-roll as an end-to-end test, down to the book's final character sheet — UPP, credits, pension, skills, and ship mortgage included. The book's own example contains a few errors (its mustering-out benefit rolls are garbled, and it grants a +2 rank bonus where the rules give ranks 5-6 three bonus rolls); the test records these rulings. See `test/book1_example.test.ts` and `test/jamison.ts`.
