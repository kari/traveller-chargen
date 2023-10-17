import { Navy, Marines, Army, Scouts, Merchants, Other } from "./careers";
import type { Career } from "./careers";
import type { Ship } from "./ships";
import { Random, MersenneTwister19937, createEntropy, nativeMath } from "random-js";

class Character {
    seed: number;
    random: Random;

    age: number;
    dead = false;
    retired = false;
    retirementPay = 0;

    attributes: {
        strength: number,
        dexterity: number,
        endurance: number,
        intelligence: number,
        education: number,
        socialStanding: number
    }

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
        return `${this.career.name}${this.career.ranks && this.rank > 0 ? " " + this.career.ranks[this.rank - 1] : ""} Alexander Jamison ${this.upp} Age ${this.age} ${this.terms} terms Cr${this.credits}`;
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

        console.log(`UPP ${this.upp}`);

        this.gender = this.random.pick([Gender.Male, Gender.Female]);
        this.title = this.generateTitle();

        // name

        this.career = this.enlist();
        this.career.rankAndServiceSkills(this); // add automatic skills for service (rank = 0)

        let activeDuty = true;
        do {
            console.debug('Starting a term of service');

            this.age += 4;
            this.terms += 1;
            let eligibleSkills = 0;

            if (this.terms == 1) {
                eligibleSkills += 2;
                console.debug(`Earned 2 skill eligibility from first service term`);
            } else if (this.career.name == "Scouts") {
                eligibleSkills += 2;
                console.debug(`Earned 2 skill eligibility from Scouts service term`);
            } else {
                eligibleSkills += 1;
                console.debug(`Earned 1 skill eligibility from service term`);
            }

            // survival
            if (this.roll() + this.career.survivalDM(this) < this.career.survival) {
                this.dead = true;
                activeDuty = false;
                console.warn("Character didn't survive the term of service");
                break;
            }

            // commission
            if (this.commissioned == false && (this.drafted == false || this.terms > 1) && this.career.commission !== null && this.roll() + this.career.commissionDM(this) >= this.career.commission) {
                this.commissioned = true;
                this.rank = 1;
                console.debug(`Character was commissioned to ${this.career.ranks![this.rank - 1]}`);
                this.career.rankAndServiceSkills(this); // automatic skills for rank = 1
                eligibleSkills += 1;
            }

            // promotion
            if (this.commissioned == true && this.rank < this.career.ranks!.length && this.roll() + this.career.promotionDM(this) >= this.career.promotion!) {
                this.rank += 1;
                console.debug(`Character was promoted to rank ${this.rank} (${this.career.ranks![this.rank - 1]})`);
                this.career.rankAndServiceSkills(this);
                eligibleSkills += 1;
            }

            // skills and training
            while (eligibleSkills > 0) {
                eligibleSkills -= 1;
                // FIXME: pick a skill from tables
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
                            if (this.roll(1) >= 4) {
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

            // reenlistment
            const reenlistmentThrow = this.roll();
            if (reenlistmentThrow < this.career.reenlist) {
                activeDuty = false;
                console.log('Character failed reenlistment')
                // failed reenlistment
            }

            // retiring
            if ((this.terms >= 7 && reenlistmentThrow != 12) || this.terms >= 10) { // forced retirement
                console.log(`Character was forced to retire after ${this.terms} terms of service`);
                activeDuty = false;
                this.retired = true;
            }
            // voluntary retirement terms >= 5

            // retirement pay
            if (this.retired && this.career.retirementPay) {
                const retirementPay = [4_000, 6_000, 8_000, 10_000]; // retirement pay is 2_000 + 2_000 * terms 5+
                this.retirementPay = retirementPay[this.terms - 5];
                if (this.terms > 8) {
                    this.retirementPay += (this.terms - 8) * 2_000;
                }
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
                while (benefits > 0) {
                    benefits -= 1;
                    if (this.roll(1) >= 4) {
                        // benefits
                        this.career.benefitsTable(this, this.roll(1) + benefitsDM - 1);
                    } else {
                        // cash table
                        // FIXME: probably should hit cash table at least once
                        this.credits += this.career.cashTable[this.roll(1) + cashDM - 1];
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
            }
        } while (activeDuty == true)

        console.log(`${this.career.name}${this.career.ranks && this.rank > 0 ? " " + this.career.ranks[this.rank - 1] : ""} Alexander Jamison ${this.upp} Age ${this.age} ${this.terms} terms Cr${this.credits}`);
        console.log(this.skills)
    }

    roll(dice: number = 2): number { // default roll is two dice
        return this.random.dice(6, dice).reduce((a, b) => a + b, 0);
    }

    addSkill(skill: string) {
        if (skill == "Blade Cbt") {
            this.addBladeSkill();
            return;
        } else if (skill == "Gun Cbt") {
            this.addGunSkill();
            return;
        }

        if (skill in this.skills) {
            this.skills[skill] += 1;
        } else {
            this.skills[skill] = 1;
        }
    }

    addItem(item: string) {
        if (item in this.items) {
            this.items[item] += 1;
        } else {
            this.items[item] = 1;
        }
    }

    addBladeSkill() {
        const avoidBlades: string[] = [];
        for (const blade of bladeSkills) {
            if (this.attributes.strength <= weaponStrDM[blade][1]) {
                avoidBlades.push(blade);
            }
        }
        const preferBlades: string[] = [];
        for (const blade of bladeSkills) {
            if (this.attributes.strength >= weaponStrDM[blade][0]) {
                preferBlades.push(blade);
            }
        }
        const knownBlades: string[] = [];
        for (const skill in this.skills) {
            if (skill in bladeSkills) {
                knownBlades.push(skill);
            }
        }
        if (knownBlades.length > 0) {
            const knownAndPrefer = knownBlades.filter(x => preferBlades.includes(x));
            if (knownAndPrefer.length > 0) {
                this.addSkill(this.random.pick(knownAndPrefer)); // increase skill in a random preferred weapon
                return;
            } else {
                const knownAndProficient = knownBlades.filter(x => !avoidBlades.includes(x));
                if (knownAndProficient.length > 0) {
                    this.addSkill(this.random.pick(knownAndProficient)); // increase skill in a random weapon that doesn't incur STR penalty
                    return;
                } // know only blades that incur penalty, fall through
            }
        }
        // player either knowns no blade skills or all known incur penalty
        if (preferBlades.length > 0) {
            this.addSkill(this.random.pick(preferBlades)); // get random skill in a preferred blade
        } else {
            const proficient = bladeSkills.filter(x => !avoidBlades.includes(x));
            if (proficient.length > 0) {
                this.addSkill(this.random.pick(proficient)); // get random skill in a random weapon that doesn't incur STR penalty
                return;
            } else {
                this.addSkill(this.random.pick(bladeSkills)); // pick random blade, even if use incurs STR penalty
                // FIXME: choose the one(s) with lowest STR requirement
                return;
            }
        }
        // NOTE: should not be reachable
    }

    addGunSkill() {
        const avoidGuns: string[] = [];
        for (const gun of gunSkills) {
            if (this.attributes.strength <= weaponStrDM[gun][1]) {
                avoidGuns.push(gun);
            }
        }
        const preferGuns: string[] = [];
        for (const gun of gunSkills) {
            if (this.attributes.strength >= weaponStrDM[gun][0]) {
                preferGuns.push(gun);
            }
        }
        const knownGuns: string[] = [];
        for (const skill in this.skills) {
            if (skill in gunSkills) {
                knownGuns.push(skill);
            }
        }
        if (knownGuns.length > 0) {
            const knownAndPrefer = knownGuns.filter(x => preferGuns.includes(x));
            if (knownAndPrefer.length > 0) {
                this.addSkill(this.random.pick(knownAndPrefer)); // increase skill in a random preferred weapon
                return;
            } else {
                const knownAndProficient = knownGuns.filter(x => !avoidGuns.includes(x));
                if (knownAndProficient.length > 0) {
                    this.addSkill(this.random.pick(knownAndProficient)); // increase skill in a random weapon that doesn't incur STR penalty
                    return;
                } // know only guns that incur penalty, fall through
            }
        }
        // player either knowns no gun skills or all known incur penalty
        if (preferGuns.length > 0) {
            this.addSkill(this.random.pick(preferGuns)); // get random skill in a preferred blade
        } else {
            const proficient = gunSkills.filter(x => !avoidGuns.includes(x));
            if (proficient.length > 0) {
                this.addSkill(this.random.pick(proficient)); // get random skill in a random weapon that doesn't incur STR penalty
                return;
            } else {
                this.addSkill(this.random.pick(gunSkills)); // pick random blade, even if use incurs STR penalty
                // FIXME: choose the one(s) with lowest STR requirement
                return;
            }
        }
        // NOTE: should not be reachable
    }

    addBlade() {
        const avoidBlades: string[] = [];
        for (const blade of bladeSkills) {
            if (this.attributes.strength <= weaponStrDM[blade][1]) {
                avoidBlades.push(blade);
            }
        }
        const preferBlades: string[] = [];
        for (const blade of bladeSkills) {
            if (this.attributes.strength >= weaponStrDM[blade][0]) {
                preferBlades.push(blade);
            }
        }
        const knownBlades: string[] = [];
        for (const skill in this.skills) {
            if (skill in bladeSkills) {
                knownBlades.push(skill);
            }
        }
        const ownedBlades: string[] = [];
        for (const blade of bladeSkills) {
            if (blade in this.items) {
                ownedBlades.push(blade);
            }
        }
        const preferAndKnown = knownBlades.filter(x => preferBlades.includes(x));
        const preferAndKnownAndNotOwned = preferAndKnown.filter(x => !ownedBlades.includes(x));
        if (preferAndKnownAndNotOwned.length > 0) {
            this.addItem(this.random.pick(preferAndKnownAndNotOwned)); // add a weapon that is preferred and skilled but not owned
            return;
        } else {
            const proficientAndKnown = knownBlades.filter(x => !avoidBlades.includes(x));
            const proficientAndKnownAndNotOwned = proficientAndKnown.filter(x => !ownedBlades.includes(x));
            if (proficientAndKnownAndNotOwned.length > 0) {
                this.addItem(this.random.pick(proficientAndKnownAndNotOwned)); // add a weapon that doesn't incur STR penalty and skilled but not owned
                return;
            }
        }
        // no known good weapons, pick a preferred or proficient weapon
        const preferAndNotOwned = preferBlades.filter(x => !ownedBlades.includes(x));
        if (preferAndNotOwned.length > 0) {
            this.addItem(this.random.pick(preferAndNotOwned));
            // FIXME: gives weapon-0 skill
        } else {
            const proficientAndNotOwned = knownBlades.filter(x => !avoidBlades.includes(x) && !ownedBlades.includes(x));
            if (proficientAndNotOwned.length > 0) {
                this.addItem(this.random.pick(preferAndNotOwned));
                // FIXME: gives weapon-0 skill
            }
        }
        // give a random weapon not owned
        this.addItem(this.random.pick(bladeSkills.filter(x => !ownedBlades.includes(x))));
        // FIXME: gives weapon-0 skill
    }

    addGun() {
        const avoidGuns: string[] = [];
        for (const gun of gunSkills) {
            if (this.attributes.strength <= weaponStrDM[gun][1]) {
                avoidGuns.push(gun);
            }
        }
        const preferGuns: string[] = [];
        for (const gun of gunSkills) {
            if (this.attributes.strength >= weaponStrDM[gun][0]) {
                preferGuns.push(gun);
            }
        }
        const knownGuns: string[] = [];
        for (const skill in this.skills) {
            if (skill in gunSkills) {
                knownGuns.push(skill);
            }
        }
        const ownedGuns: string[] = [];
        for (const gun of gunSkills) {
            if (gun in this.items) {
                ownedGuns.push(gun);
            }
        }
        const preferAndKnown = knownGuns.filter(x => preferGuns.includes(x));
        const preferAndKnownAndNotOwned = preferAndKnown.filter(x => !ownedGuns.includes(x));
        if (preferAndKnownAndNotOwned.length > 0) {
            this.addItem(this.random.pick(preferAndKnownAndNotOwned)); // add a weapon that is preferred and skilled but not owned
            return;
        } else {
            const proficientAndKnown = knownGuns.filter(x => !avoidGuns.includes(x));
            const proficientAndKnownAndNotOwned = proficientAndKnown.filter(x => !ownedGuns.includes(x));
            if (proficientAndKnownAndNotOwned.length > 0) {
                this.addItem(this.random.pick(proficientAndKnownAndNotOwned)); // add a weapon that doesn't incur STR penalty and skilled but not owned
                return;
            }
        }
        // no known good weapons, pick a preferred or proficient weapon
        const preferAndNotOwned = preferGuns.filter(x => !ownedGuns.includes(x));
        if (preferAndNotOwned.length > 0) {
            this.addItem(this.random.pick(preferAndNotOwned));
            // FIXME: gives weapon-0 skill
        } else {
            const proficientAndNotOwned = knownGuns.filter(x => !avoidGuns.includes(x) && !ownedGuns.includes(x));
            if (proficientAndNotOwned.length > 0) {
                this.addItem(this.random.pick(preferAndNotOwned));
                // FIXME: gives weapon-0 skill
            }
        }
        // give a random weapon not owned
        this.addItem(this.random.pick(gunSkills.filter(x => !ownedGuns.includes(x))));
        // FIXME: gives weapon-0 skill
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
                this.attributes.strength -= 1;
            }
            if (this.roll() < 7) {
                this.attributes.dexterity -= 1;
            }
            if (this.roll() < 8) {
                this.attributes.endurance -= 1;
            }
        } else if (this.age < 66) {
            if (this.roll() < 9) {
                this.attributes.strength -= 1;
            }
            if (this.roll() < 8) {
                this.attributes.dexterity -= 1;
            }
            if (this.roll() < 9) {
                this.attributes.endurance -= 1;
            }
        } else {
            if (this.roll() < 9) {
                this.attributes.strength -= 2;
            }
            if (this.roll() < 9) {
                this.attributes.dexterity -= 2;
            }
            if (this.roll() < 9) {
                this.attributes.endurance -= 2;
            }
            if (this.roll() < 9) {
                this.attributes.intelligence -= 1;
            }
        }
        // FIXME: add availability of slow drug / incapacity, DM for medical skill of service
        if (this.attributes.strength <= 0) {
            if (this.roll() >= 8) {
                this.attributes.strength = 1;
            } else {
                this.attributes.strength = 0;
                this.dead = true;
            }
        }
        if (this.attributes.dexterity <= 0) {
            if (this.roll() >= 8) {
                this.attributes.dexterity = 1;
            } else {
                this.attributes.dexterity = 0;
                this.dead = true;
            }
        }
        if (this.attributes.endurance <= 0) {
            if (this.roll() >= 8) {
                this.attributes.endurance = 1;
            } else {
                this.attributes.endurance = 0;
                this.dead = true;
            }
        }
        if (this.attributes.intelligence <= 0) {
            if (this.roll() >= 8) {
                this.attributes.intelligence = 1;
            } else {
                this.attributes.intelligence = 0;
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
const bladeSkills = ["Dagger", "Blade", "Foil", "Sword", "Cutlass", "Broadsword", "Bayonet", "Spear", "Halberd", "Pike", "Cudgel"];
const gunSkills = ["Body Pistol", "Auto Pistol", "Revolver", "Carbine", "Rifle", "Auto Rifle", "Shotgun", "SMG", "Laser Carbine", "Laser Rifle"];
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

