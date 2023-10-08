import { Navy, Marines, Army, Scouts, Merchants, Other } from "./careers";
import type { Career } from "./careers";
import { Random, MersenneTwister19937, createEntropy, nativeMath } from "random-js";

class Character {
    seed: number;
    random: Random;
    
    age: number;

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

    constructor(seed?: number) {
        this.seed = seed ? seed : createEntropy(nativeMath, 1)[0];
        this.random = new Random(MersenneTwister19937.seed(this.seed));

        this.age = 18;

        this.attributes = {
            strength: this.roll(2),
            dexterity: this.roll(2),
            endurance: this.roll(2),
            intelligence: this.roll(2),
            education: this.roll(2),
            socialStanding: this.roll(2)
        };

        console.log(`UPP ${this.upp}`);

        this.gender = this.random.pick([Gender.Male, Gender.Female]);
        this.title = this.generateTitle();

        // name

        this.career = this.enlist();
        this.career.rankAndServiceSkills(c); // add automatic skills for service (rank = 0)

        this.age += 4;
        this.terms += 1;
        let eligibleSkills = 0;

        if (this.terms == 1) {
            eligibleSkills += 2;
        } else {
            eligibleSkills = 1;
        }

        // survival
        if (this.roll() + this.career.survivalDM(this) < this.career.survival) {
            const dead = true;
            console.log("YOU DIED");
        }

        // commission
        if (this.commissioned == false && (this.drafted == false || this.terms > 1) && this.career.commission !== null && this.roll() + this.career.commissionDM(this) >= this.career.commission) {
            this.commissioned = true;
            this.rank = 1;
            console.log(`Character was commissioned to ${this.career.ranks![this.rank-1]}`);
            this.career.rankAndServiceSkills(c); // automatic skills for rank = 1
            eligibleSkills += 1;
        }
        
        // promotion
        if (this.commissioned == true && this.rank < this.career.ranks!.length && this.roll() + this.career.promotionDM(this) >= this.career.promotion!) {
            this.rank += 1;
            console.log(`Character was promoted to rank ${this.rank} (${this.career.ranks![this.rank-1]})`);
            this.career.rankAndServiceSkills(c);
            eligibleSkills += 1;
        }
        
        // skills and training
        while (eligibleSkills > 0) {
            eligibleSkills -= 1;
        }
        
        // reenlistment
        let reenlistmentThrow = this.roll(2);
        if (reenlistmentThrow < this.career.reenlist) {
            // failed reenlistment
        }

        // retiring
        if (this.terms >= 7 && reenlistmentThrow != 12) {
            // forced retirement
        }

        if (this.terms >= 10) {
            // too old for this shit even if mandatory reenlistment
        }

        // mustering out, if leaving

        // aging

        


    }

    roll(dice: number = 1):number {
        return this.random.dice(6, dice).reduce((a,b) => a+b, 0);
    }

    addSkill(skill: string) {
        if (skill in this.skills) {
            this.skills[skill] += 1;
        } else {
            this.skills[skill] = 1;
        }
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
            let draft = this.roll();
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

console.log("Traveller Chargen");
let c = new Character(106671514);

export { Character };
