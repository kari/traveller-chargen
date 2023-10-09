import { Navy, Marines, Army, Scouts, Merchants, Other } from "./careers";
import type { Career } from "./careers";
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
            console.debug('Strating a term of service');

            this.age += 4;
            this.terms += 1;
            let eligibleSkills = 0;

            if (this.terms == 1) {
                eligibleSkills += 2;
                console.debug(`Earned 2 skill eligibility from first service term`);
            } else {
                eligibleSkills += 1;
                console.debug(`Earned 1 skill eligibility from service term`);
            }

            // survival
            if (this.roll() + this.career.survivalDM(this) < this.career.survival) {
                this.dead = true;
                activeDuty = false;
                console.warn("YOU DIED");
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
                // pick a skill from tables
            }

            // reenlistment
            let reenlistmentThrow = this.roll();
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
                const retirementPay = [4_000, 6_000, 8_000, 10_000];
                this.retirementPay = retirementPay[this.terms-5];
                if (this.terms > 8) {
                    this.retirementPay += (this.terms-8) * 2_000;
                }
            }

            // mustering out, if leaving

            // aging
            this.aging();
            if (this.dead) {
                console.log(`Character died of old age at ${this.age}.`)
                activeDuty = false;
            }
        } while (activeDuty == true)
    }

    roll(dice: number = 2): number { // default roll is two dice
        return this.random.dice(6, dice).reduce((a, b) => a + b, 0);
    }

    addSkill(skill: string) {
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

    addBlade() {

    }

    addGun() {

    }

    protected enlist(): Career {
        const throws = careers.map((c) => c.enlistment - c.
            enlistmentDM(this));
        // const minThrow = Math.min(...throws);
        let preferredCareerIndexes: number[] = [];

        // FIXME: Army and Other are dominating if looking for easiest
        // either just filter off "too difficult" (throw > 7) or do something else
        throws.forEach((el, i) => {
            // if (el == minThrow) { // choose easiest
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
            let draft = this.roll(1);
            let draftedService = careers.filter((c) => c.draft == draft)[0];
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
                console.warn('YOU DIED');
                this.dead = true;
            }
        }
        if (this.attributes.dexterity <= 0) {
            if (this.roll() >= 8) {
                this.attributes.dexterity = 1;
            } else {
                this.attributes.dexterity = 0;
                console.warn('YOU DIED');
                this.dead = true;
            }
        }
        if (this.attributes.endurance <= 0) {
            if (this.roll() >= 8) {
                this.attributes.endurance = 1;
            } else {
                this.attributes.endurance = 0;
                console.warn('YOU DIED');
                this.dead = true;
            }
        }
        if (this.attributes.intelligence <= 0) {
            if (this.roll() >= 8) {
                this.attributes.intelligence = 1;
            } else {
                this.attributes.intelligence = 0;
                console.warn('YOU DIED');
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
const careers: Career[] = [Navy, Marines, Army, Scouts, Merchants, Other];

abstract class Ship {
    name?: string;
    type!: string;
    tonnage!: number;
    age: number = 0;
    mortgage?: Mortgage;

    constructor(name?: string) {
        this.name = name;
    }
}

class ScoutCourier extends Ship {
    type = 'S';
    tonnage = 100;
}

class FreeTrader extends Ship {
    type = 'A';
    tonnage = 200;
    mortgage = new Mortgage(150_000, 40);
}

class Mortgage {
    monthly_payment: number;
    maturity: number;

    constructor(monthly_payment: number, maturity: number) {
        this.monthly_payment = monthly_payment;
        this.maturity = maturity;
    }

    get total_payment(): number {
        return this.monthly_payment * 12 * this.maturity;
    }
}

console.log("Traveller Chargen");
let c = new Character();

export { Character };
export { FreeTrader, ScoutCourier };
