import { Navy, Marines, Army, Scouts, Merchants, Other } from "./careers";
import type { Career } from "./careers";
import type { Ship } from "./ships";
import { Random, MersenneTwister19937, createEntropy, nativeMath } from "random-js";

type Attributes = {
    strength: number,
    dexterity: number,
    endurance: number,
    intelligence: number,
    education: number,
    socialStanding: number
};

type Attribute = keyof Attributes;

class Character {
    seed: number;
    random: Random;

    age: number;
    dead = false;
    retired = false;
    retirementPay = 0;

    attributes: Attributes;

    gender: Gender;

    // name: string;
    title: string;

    career: Career;
    rank = 0;
    terms = 0;
    drafted = false;
    commissioned = false;

    skills: Record<string, number> = {};
    items: Record<string, number> = {};
    ship: Ship | null = null;
    credits = 0;

    toString(): string {
        return `${this.career.name}${this.career.ranks && this.rank > 0 ? " " + this.career.ranks[this.rank - 1] : ""} Alexander Jamison ${this.upp} Age ${this.age} ${this.terms} terms Cr${new Intl.NumberFormat("en-us").format(this.credits)}`;
    }

    get skillAvg(): number {
        return (this.attributes.strength+this.attributes.dexterity+this.attributes.endurance+this.attributes.intelligence+this.attributes.education+this.attributes.socialStanding)/6;
    }

    constructor(seed?: number) {
        this.seed = seed ? seed : createEntropy(nativeMath, 1)[0];
        console.debug(`Using seed ${this.seed} to generate the character`);
        this.random = new Random(MersenneTwister19937.seed(this.seed));

        this.age = 18;

        this.attributes = {
            strength: this.roll(),
            dexterity: this.roll(),
            endurance: this.roll(),
            intelligence: this.roll(),
            education: this.roll(),
            socialStanding: this.roll()
        };

        console.debug(`Initial UPP ${this.upp}`);

        // FIXME: name, gender title
        this.gender = this.random.pick([Gender.Male, Gender.Female]);
        this.title = this.generateTitle();

        // generate career for the character
        this.career = this.enlist();
        this.career.rankAndServiceSkills(this); // add automatic skills for service (rank = 0)
        this.doCareer();

        console.log(this.toString());
        if (Object.keys(this.skills).length > 0) { console.log(this.skills) }
        if (Object.keys(this.items).length > 0) { console.log(this.items) }
        if (this.ship) { console.log(this.ship) }
    }
    

    doCareer() {
        let activeDuty = true;
        do {
            console.debug(`Starting term ${this.terms+1} of service`);

            this.age += 4;
            this.terms += 1;
            let eligibleSkills = 0;

            if (this.terms == 1) {
                eligibleSkills += 2;
                console.debug(`Earned 2 skill eligibility from first service term (total ${eligibleSkills})`);
            } else if (this.career.name == "Scouts") {
                eligibleSkills += 2;
                console.debug(`Earned 2 skill eligibility from Scouts service term (total ${eligibleSkills})`);
            } else {
                eligibleSkills += 1;
                console.debug(`Earned 1 skill eligibility from service term (total ${eligibleSkills})`);
            }

            // survival
            console.debug(`Survival throw ${this.career.survival}, DM ${this.career.survivalDM(this)}, need to roll ${this.career.survival-this.career.survivalDM(this)}+`);
            if (this.roll() + this.career.survivalDM(this) < this.career.survival) {
                this.dead = true;
                activeDuty = false;
                console.warn("Character didn't survive the term of service");
                return;
            }

            // commission
            if (this.commissioned == false && (this.drafted == false || this.terms > 1) && this.career.commission !== null && this.roll() + this.career.commissionDM(this) >= this.career.commission) {
                this.commissioned = true;
                this.rank = 1;
                console.debug(`Character was commissioned to ${this.career.ranks![this.rank - 1]}`);
                this.career.rankAndServiceSkills(this); // automatic skills for rank = 1
                eligibleSkills += 1;
                console.debug(`Earned 1 skill eligibility from commission (total ${eligibleSkills})`);
            }

            // promotion
            if (this.commissioned == true && this.rank < this.career.ranks!.length && this.roll() + this.career.promotionDM(this) >= this.career.promotion!) {
                this.rank += 1;
                console.debug(`Character was promoted to rank ${this.rank} (${this.career.ranks![this.rank - 1]})`);
                this.career.rankAndServiceSkills(this);
                eligibleSkills += 1;
                console.debug(`Earned 1 skill eligibility from promotion (total ${eligibleSkills})`);
            }

            // skills and training
            while (eligibleSkills > 0) {
                eligibleSkills -= 1;
                if (this.skillAvg <= 7) {
                    console.debug(`Avg. skill ${this.skillAvg.toFixed(2)}, focusing on personal development`);
                    this.career.personalDevelopment(this, this.roll(1));
                } else {
                    switch (this.roll(1)) {
                        case 1:
                        case 2:
                            this.career.personalDevelopment(this, this.roll(1));
                            break;
                        case 3:
                        case 4:
                            this.addSkill(this.career.skillsTable[this.roll(1) - 1]);
                            break;
                        case 5:
                        case 6:
                            if (this.attributes.education >= 8) {
                                if (this.roll(1) >= 3) {
                                    this.addSkill(this.career.advancedEducationTable8[this.roll(1) - 1]);
                                } else {
                                    this.addSkill(this.career.advancedEducationTable[this.roll(1) - 1]);
                                }
                            } else {
                                this.addSkill(this.career.advancedEducationTable[this.roll(1) - 1]);
                            }
                            break;
                    }
                }
            }

            // reenlistment
            const reenlistmentThrow = this.roll();
            if (reenlistmentThrow < this.career.reenlist) {
                activeDuty = false;
                console.debug(`Character failed reenlistment throw ${this.career.reenlist}+, career is over`);
                // failed reenlistment
            }

            // retiring
            if ((this.terms >= 7 && reenlistmentThrow != 12) || this.terms >= 10) { // forced retirement
                console.log(`Character was forced to retire after ${this.terms} terms of service`);
                activeDuty = false;
                this.retired = true;
            }
            // voluntary retirement terms >= 5
            if (this.terms >= 5 && reenlistmentThrow != 12 && !this.retired && activeDuty) {
                console.debug("Character is eligible for voluntary retirement");
            }

            // retirement pay
            if (this.retired && this.career.retirementPay) {
                const retirementPay = [4_000, 6_000, 8_000, 10_000]; // retirement pay is 2_000 + 2_000 * terms 5+
                this.retirementPay = retirementPay[this.terms - 5];
                if (this.terms > 8) {
                    this.retirementPay += (this.terms - 8) * 2_000;
                }
                console.debug(`Character is eligible to retirement pay of ${this.retirementPay}`);
            }

            // mustering out, if leaving
            if (activeDuty == false) {
                let benefits = this.terms;
                switch (this.rank) {
                    case 1:
                    case 2:
                        benefits += 1;
                        break;
                    case 3:
                    case 4:
                        benefits += 2;
                        break;
                    case 5:
                    case 6:
                        benefits += 3;
                        break;
                }
                const benefitsDM = (this.rank >= 5) ? 1 : 0;
                const cashDM = ('Gambling' in this.skills) ? 1 : 0;
                console.debug(`Character is eligible to ${benefits} benefits, with benefits DM ${benefitsDM} and cash table DM ${cashDM}`);
                while (benefits > 0) {
                    benefits -= 1;
                    if (this.credits >= 0 && (this.skillAvg <= 7 || this.roll(1) >= 3)) {
                        // benefits
                        this.career.benefitsTable(this, this.roll(1) + benefitsDM - 1);
                    } else {
                        // cash table
                        this.credits += this.career.cashTable[this.roll(1) + cashDM - 1];
                        console.debug('Character took cash table');
                    }
                }
                if (this.ship) {
                    // FIXME: convert passages to money if the player has a ship.
                }

            }

            // aging
            this.aging();
            if (this.dead) {
                console.log(`Character died of old age at ${this.age}`)
                activeDuty = false;
                return;
            }
        } while (activeDuty == true)
    }

    roll(dice: number = 2): number { // default roll is two dice
        return this.random.dice(6, dice).reduce((a, b) => a + b, 0);
    }

    modifyAttribute(attribute: Attribute, amount: number = 1): number {
        this.attributes[attribute] += amount;
        if (this.attributes[attribute] > 15) {
            console.warn(`${attribute} went above 15, capped`);
            this.attributes[attribute] = 15;
        } else if (this.attributes[attribute] < 0) {
            console.warn(`${attribute} went below zero, capped`);
            this.attributes[attribute] = 0;
        }

        return this.attributes[attribute];
    }
    
    addSkill(skill: string) {
        if (skill == "Blade Cbt") {
            this.addWeaponSkill("blade");
            return;
        } else if (skill == "Gun Cbt") {
            this.addWeaponSkill("gun");
            return;
        } else if (skill == "Vehicle") {
            this.addVehicleSkill();
            return;
        }

        if (skill in this.skills) {
            this.skills[skill] += 1;
        } else {
            this.skills[skill] = 1;
        }
        console.debug(`Character earned skill ${skill}-${this.skills[skill]}`);
    }

    addVehicleSkill() {
        const known: string[] = [];
        for (const skill of Object.keys(this.skills)) {
            if (vehicleSkills.includes(skill)) {
                known.push(skill);
            }
        }
        // FIXME: don't level a single skill above 2-3
        if (known.length > 0) {
            this.addSkill(this.random.pick(known));
        } else {
            this.addSkill(this.random.pick(vehicleSkills));
        }
    }

    addZeroSkill(skill: string) {
        if (skill in this.skills) {
            console.warn(`Skill already exists at level ${skill}-${this.skills[skill]}`);
            return;
        } else {
            this.skills[skill] = 0;
        }
    }

    addItem(item: string) {
        console.debug(`Character earned item ${item}`);
        if (item in this.items) {
            this.items[item] += 1;
        } else {
            this.items[item] = 1;
        }
    }

    weaponPreferences(type: "blade" | "gun") {
        const avoid: string[] = [];
        const weapons = weaponSkills[type];

        // FIXME: convert for loops into filters
        for (const w of weapons) {
            if (this.attributes.strength <= weaponStrDM[w][1]) {
                avoid.push(w);
            }
        }
        const prefer: string[] = [];
        for (const w of weapons) {
            if (this.attributes.strength >= weaponStrDM[w][0]) {
                prefer.push(w);
            }
        }
        const known: string[] = [];
        for (const skill of Object.keys(this.skills)) {
            if (weapons.includes(skill)) {
                known.push(skill);
            }
        }
        const owned: string[] = [];
        for (const w of weapons) {
            if (Object.keys(this.items).includes(w)) {
                owned.push(w);
            }
        }
        console.group();
        console.debug(`Avoid: ${avoid.join(", ")}`);
        console.debug(`Prefer: ${prefer.join(", ")}`);
        console.debug(`Known: ${known.join(", ")}`);
        console.debug(`Owned: ${owned.join(", ")}`);
        console.groupEnd();

        return {avoid: avoid, prefer: prefer, known: known, owned: owned}
    }

    addWeaponSkill(type: "blade" | "gun") {
        const prefs = this.weaponPreferences(type);

        // FIXME: will always increase skill in known (good) skills, and doesn't allow for range of skills
        // probably shouldn't level skill above -3
        if (prefs.known.length > 0) {
            const knownAndPrefer = prefs.known.filter(x => prefs.prefer.includes(x));
            if (knownAndPrefer.length > 0) {
                this.addSkill(this.random.pick(knownAndPrefer)); // increase skill in a random preferred and known weapon
                return;
            } else {
                const knownAndProficient = prefs.known.filter(x => !prefs.avoid.includes(x));
                if (knownAndProficient.length > 0) {
                    this.addSkill(this.random.pick(knownAndProficient)); // increase skill in a random weapon that doesn't incur STR penalty
                    return;
                } // know only weapons that incur penalty, fall through
            }
        }
        // player either knowns no weapon skills or all known incur penalty
        if (prefs.prefer.length > 0) {
            this.addSkill(this.random.pick(prefs.prefer)); // get random skill in a preferred weapon
        } else {
            const proficient = weaponSkills[type].filter(x => !prefs.avoid.includes(x));
            if (proficient.length > 0) {
                this.addSkill(this.random.pick(proficient)); // get random skill in a random weapon that doesn't incur STR penalty
                return;
            }
        }
        this.addSkill(this.random.pick(weaponSkills[type])); // pick random weapon, even if use incurs STR penalty
        // FIXME: choose the one(s) with lowest STR requirement!
    }

    addWeapon(type: "blade" | "gun") {
        // Note: will never pick a weapon twice
        const prefs = this.weaponPreferences(type);

        const preferAndKnown = prefs.known.filter(x => prefs.prefer.includes(x));
        const preferAndKnownAndNotOwned = preferAndKnown.filter(x => !prefs.owned.includes(x));

        if (preferAndKnownAndNotOwned.length > 0) {
            this.addItem(this.random.pick(preferAndKnownAndNotOwned)); // add a weapon that is preferred and skilled but not owned

            return;
        } else {
            const proficientAndKnown = prefs.known.filter(x => !prefs.avoid.includes(x));
            const proficientAndKnownAndNotOwned = proficientAndKnown.filter(x => !prefs.owned.includes(x));
            if (proficientAndKnownAndNotOwned.length > 0) {
                this.addItem(this.random.pick(proficientAndKnownAndNotOwned)); // add a weapon that doesn't incur STR penalty and skilled but not owned

                return;
            }
        }

        // no known good weapons, pick a preferred or proficient weapon
        const preferAndNotOwned = prefs.prefer.filter(x => !prefs.owned.includes(x));
        if (preferAndNotOwned.length > 0) {
            const randomWeapon = this.random.pick(preferAndNotOwned);
            this.addItem(randomWeapon);
            this.addZeroSkill(randomWeapon);
            
            return;
        } else {
            const proficientAndNotOwned = prefs.known.filter(x => !prefs.avoid.includes(x) && !prefs.owned.includes(x));
            if (proficientAndNotOwned.length > 0) {
                const randomWeapon = this.random.pick(proficientAndNotOwned);
                this.addItem(randomWeapon);
                this.addZeroSkill(randomWeapon);

                return;
            }
        }
        // give a random weapon not owned
        const randomWeapon = this.random.pick(weaponSkills[type].filter(x => !prefs.owned.includes(x)))
        this.addItem(randomWeapon);
        this.addZeroSkill(randomWeapon);

        return;
    }

    protected enlist(): Career {
        const throws = careers.map((c) => c.enlistment - c.
            enlistmentDM(this));
        const preferredCareerIndexes: number[] = [];

        // filter off "too difficult" (throw > 7) and randomly choose one
        throws.forEach((el, i) => {
            if (el <= 7) {
                preferredCareerIndexes.push(i);
            }
        });

        const preferredCareer = careers[(preferredCareerIndexes.length > 1) ? this.random.pick(preferredCareerIndexes) : preferredCareerIndexes[0]];

        if (this.roll() + preferredCareer.enlistmentDM(this) >= preferredCareer.enlistment) {
            console.log(`Character was accepted to ${preferredCareer.name}`);

            return preferredCareer;
        } else {
            this.drafted = true;
            const draft = this.roll(1);
            const draftedService = careers.filter((c) => c.draft == draft)[0];
            console.log(`Character was rejected from ${preferredCareer.name} and was drafted to ${draftedService.name}`);

            return draftedService;

        }
    }

    get upp() {
        return (this.attributes.strength.toString(16) + this.attributes.dexterity.toString(16) + this.attributes.endurance.toString(16) + this.attributes.intelligence.toString(16) + this.attributes.education.toString(16) + this.attributes.socialStanding.toString(16)).toUpperCase();

    }

    // if character has the nobility of a Baron but doesn't use the title
    protected prefix(): string {
        if (this.attributes.socialStanding == 12 && this.title == "") {
            return this.random.pick(["von ", "hault-", "haut-"]);
        } else {
            return "";
        }
    }

    protected aging() {
        if (this.age < 34) {
            return;
        } else if (this.age < 50) {
            if (this.roll() < 8) {
                this.modifyAttribute("strength", -1);
                console.debug(`Character fails aging STR throw (-1)`)
            }
            if (this.roll() < 7) {
                console.debug("Character fails aging DEX throw (-1)")
                this.modifyAttribute("dexterity", -1);
            }
            if (this.roll() < 8) {
                console.debug("Character fails aging END throw (-1)")
                this.modifyAttribute("endurance", -1);
            }
        } else if (this.age < 66) {
            if (this.roll() < 9) {
                console.debug("Character fails aging STR throw (-1)")
                this.modifyAttribute("strength", -1);
            }
            if (this.roll() < 8) {
                console.debug("Character fails aging DEX throw (-1)")
                this.modifyAttribute("dexterity", -1);
            }
            if (this.roll() < 9) {
                console.debug("Character fails aging END throw (-1)")
                this.modifyAttribute("endurance", -1);
            }
        } else {
            if (this.roll() < 9) {
                console.debug("Character fails aging STR throw (-2)")
                this.modifyAttribute("strength", -2);
            }
            if (this.roll() < 9) {
                console.debug("Character fails aging DEX throw (-2)")
                this.modifyAttribute("dexterity", -2);
            }
            if (this.roll() < 9) {
                console.debug("Character fails aging END throw (-2)")
                this.modifyAttribute("endurance", -2);
            }
            if (this.roll() < 9) {
                console.debug("Character fails aging INT throw (-1)")
                this.modifyAttribute("intelligence", -1);
            }
        }
        // FIXME: add availability of slow drug / incapacity, DM for medical skill of service
        if (this.attributes.strength == 0) {
            if (this.roll() >= 8) {
                this.modifyAttribute("strength", 1);
            } else {
                this.dead = true;
            }
        }
        if (this.attributes.dexterity == 0) {
            if (this.roll() >= 8) {
                this.modifyAttribute("dexterity", 1);
            } else {
                this.dead = true;
            }
        }
        if (this.attributes.endurance == 0) {
            if (this.roll() >= 8) {
                this.modifyAttribute("endurance", 1);
            } else {
                this.dead = true;
            }
        }
        if (this.attributes.intelligence <= 0) {
            if (this.roll() >= 8) {
                this.modifyAttribute("intelligence", 1);
            } else {
                this.dead = true;
            }
        }
    }

    // NOTE: character's social standing can increase/change during creation
    protected generateTitle(): string {
        switch (this.attributes.socialStanding) {
            case 11: // Knight
                if (this.gender == Gender.Male) {
                    return "Sir";
                } else {
                    return "Dame";
                }
            case 12:
                if (this.random.integer(1, 2) <= 2) {
                    if (this.gender == Gender.Male) {
                        return "Baron";
                    } else {
                        return this.random.pick(["Baronet", "Baroness"]);
                    }
                } else {
                    // in lieu of title, use prefix in name
                    return ""
                }
            case 13:
                if (this.gender == Gender.Male) {
                    return "Marquis";
                } else {
                    return this.random.pick(["Marquesa", "Marchioness"]);
                }
            case 14:
                if (this.gender == Gender.Male) {
                    return "Count";
                } else {
                    return "Countess";
                }
            case 15:
                if (this.gender == Gender.Male) {
                    return "Duke";
                } else {
                    return "Duchess";
                }
            default:
                return "";
        }
    }
}

enum Gender {
    Male = 1,
    Female
}

// for weapons, add strength requirements for DM, only choose skills in weapons for which strength+ is met or at least strength- is not met 
const weaponSkills: { [key: string]: string[] } = {
    blade: ["Dagger", "Blade", "Foil", "Sword", "Cutlass", "Broadsword", "Bayonet", "Spear", "Halberd", "Pike", "Cudgel"],
    gun: ["Body Pistol", "Auto Pistol", "Revolver", "Carbine", "Rifle", "Auto Rifle", "Shotgun", "SMG", "Laser Carbine", "Laser Rifle"],
}
const vehicleSkills = ["Ground Car", "Watercraft", "Winged Craft", "Hovercraft", "Grav Belt"];

const weaponStrDM: Record<string, [bonus: number, penalty: number]> = {
    "Dagger": [8, 3],
    "Blade": [9, 4],
    "Foil": [10, 4],
    "Sword": [10, 5],
    "Cutlass": [11, 6],
    "Broadsword": [12, 7],
    "Bayonet": [9, 4],
    "Spear": [9, 4],
    "Halberd": [10, 5],
    "Pike": [10, 6],
    "Cudgel": [8, 4],
    "Body Pistol": [11, 7],
    "Auto Pistol": [10, 6],
    "Revolver": [9, 6],
    "Carbine": [9, 4],
    "Rifle": [8, 5],
    "Auto Rifle": [10, 6],
    "Shotgun": [9, 3],
    "SMG": [9, 5],
    "Laser Carbine": [10, 5],
    "Laser Rifle": [11, 6],
}
const careers: Career[] = [Navy, Marines, Army, Scouts, Merchants, Other];

export { Character };

