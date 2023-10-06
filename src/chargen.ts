import { Navy, Marines, Army, Scouts, Merchants, Other } from "./careers";
import type { Career } from "./careers";

class Character {
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


    constructor() {
        this.age = 18;

        this.attributes = {
            strength: roll(2),
            dexterity: roll(2),
            endurance: roll(2),
            intelligence: roll(2),
            education: roll(2),
            socialStanding: roll(2)
        };

        console.log(`UPP ${this.upp}`);

        this.gender = getRandomFromArray([Gender.Male, Gender.Female]);
        this.title = this.generateTitle();

        // name

        this.career = this.enlist();

        this.age += 4;
        this.terms += 1;
        // survival
        if (roll() + this.career.survivalDM(this) < this.career.survival) {
            const dead = true;
            console.log("YOU DIED");
        }

        // commission
        if (this.commissioned == false && (this.drafted == false || this.terms > 1) && this.career.commission !== null && roll() + this.career.commissionDM(this) >= this.career.commission) {
            this.commissioned = true;
            this.rank = 1;
            console.log(`Character was commissioned to ${this.career.ranks![this.rank-1]}`);
        }
        
        // promotion
        if (this.commissioned == true && this.rank < this.career.ranks!.length && roll() + this.career.promotionDM(this) >= this.career.promotion!) {
            this.rank += 1;
            console.log(`Character was promoted to rank ${this.rank} (${this.career.ranks![this.rank-1]})`);
        }
        
        // skills and training
        
        // reenlistment
        let reenlistmentThrow = roll(2);
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

        const preferredCareer = careers[(preferredCareerIndexes.length > 1) ? getRandomFromArray(preferredCareerIndexes) : preferredCareerIndexes[0]];

        if (roll() + preferredCareer.enlistmentDM(this) >= preferredCareer.enlistment) {
            console.log(`Character was accepted to ${preferredCareer.name}`);

            return preferredCareer;
        } else {
            this.drafted = true;
            let draft = roll();
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
            return getRandomFromArray(["von ", "hault-", "haut-"]);
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
                if (getRandomInt(1, 2) <= 2) {
                    if (this.gender == Gender.Male) {
                        return "Baron";
                    } else {
                        return getRandomFromArray(["Baronet", "Baroness"]);
                    }
                } else {
                    // in lieu of title, use prefix in name
                    return ""
                }
            case 13:
                if (this.gender == Gender.Male) {
                    return "Marquis";
                } else {
                    return getRandomFromArray(["Marquesa", "Marchioness"]);
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


// FIXME: switch to random.js for seeds
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_number_between_two_values
function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min) + min);
}

function getRandomFromArray<Type>(arr: Type[]): Type {
    const i = getRandomInt(1, arr.length);

    return arr[i - 1];
}

function roll(dice: number = 1): number {
    let sum = 0;
    for (let i = 0; i < dice; i++) {
        sum += getRandomInt(1, 7);
    }

    return sum;
}

const careers: Career[] = [Navy, Marines, Army, Scouts, Merchants, Other];

console.log("Traveller Chargen");
let c = new Character();

export { Character };