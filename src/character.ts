import { Navy, Marines, Army, Scouts, Merchants, Other } from "./careers";
import type { Career } from "./careers";
import { type Ship } from "./ships";
import { names } from "./names";
import { Random } from "./random";
import { clamp } from "./utils";
import { World } from "./subsector";
import { ImperialDate } from "./imperial_date";

const numberFormat = new Intl.NumberFormat("en-us", { maximumFractionDigits: 2 });

type Attributes = {
    strength: number,
    dexterity: number,
    endurance: number,
    intelligence: number,
    education: number,
    socialStanding: number
};

type Attribute = keyof Attributes;

class Name {
    title?: string;
    first: string;
    middle?: string;
    prefix?: string;
    last: string;

    toString(title: boolean = true): string {
        if (title) {
            return `${this.title ? this.title + ' ' : ''}${this.first} ${this.middle ? this.middle + ' ' : ''}${this.prefix ?? ''}${this.last}`;
        } else {
            return `${this.first} ${this.middle ? this.middle + ' ' : ''}${this.prefix ?? ''}${this.last}`;
        }
    }

    constructor(first: string, last: string) {
        this.first = first;
        this.last = last;
    }

    get middleInitial(): string | null {
        if (this.middle) {
            return this.middle.charAt(0) + ".";
        } else {
            return null;
        }
    }
}

class Character {
    seed: number;
    random: Random;

    age: number;
    dead = false;
    retired = false;
    retirementPay = 0;

    birthworld: World;
    dischargeworld: World;

    attributes: Attributes;

    gender: Gender;
    birthDate: ImperialDate;

    name: Name;

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
        return `${this.retired ? 'Retired ' : ''}${this.career.memberName ? (this.retired ? this.career.memberName : 'Ex-' + this.career.memberName.toLowerCase()) + ' ' : ''}${this.career.ranks && this.career.ranks[this.rank] && this.career.memberName != this.career.ranks[this.rank] ? this.career.ranks[this.rank] + " " : ""}${this.name.toString()} ${this.upp} Age ${this.age} ${this.terms} terms Cr${numberFormat.format(this.credits)}`;
    }

    skillsToString(skills: string[] = Object.keys(this.skills)): string {
        return skills.map(s => s + "-" + this.skills[s]).join(", ");
    }

    itemsToString(): string {
        return Object.keys(this.items).map(i => this.items[i] + " " + i).join(", ");
    }

    get skillAvg(): number {
        return (this.attributes.strength + this.attributes.dexterity + this.attributes.endurance + this.attributes.intelligence + this.attributes.education + this.attributes.socialStanding) / 6;
    }

    constructor(seed?: number) {
        this.random = new Random(seed);
        this.seed = this.random.seed;
        console.debug(`Using seed ${this.seed} to generate a character`);

        this.age = 18;

        this.attributes = {
            strength: this.random.roll(),
            dexterity: this.random.roll(),
            endurance: this.random.roll(),
            intelligence: this.random.roll(),
            education: this.random.roll(),
            socialStanding: this.random.roll()
        };

        console.debug(`Initial UPP ${this.upp}`);

        this.gender = this.random.pick([Gender.Male, Gender.Female]);
        if (this.gender == Gender.Female) {
            this.name = new Name(this.random.pick(names["female"]), this.random.pick(names["last"]));
        } else {
            this.name = new Name(this.random.pick(names["male"]), this.random.pick(names["last"]));
        }
        this.name.title = this.addTitle();

        this.birthworld = new World(this.random);
        this.dischargeworld = new World(this.random);

        // generate career for the character
        this.career = this.enlist();
        this.career.rankAndServiceSkills(this); // add automatic skills for service (rank = 0)
        this.doCareer();

        this.birthDate = new ImperialDate(this.random.integer(1, 365), 1105 - this.age); // FIXME: this might not always be correct, should ensure date of preparation - birthdate >= age

        console.log((this.dead ? "✝ " : "") + this.toString());
        if (Object.keys(this.skills).length > 0) { console.log(this.skillsToString()) }
        if (Object.keys(this.items).length > 0) { console.log(this.itemsToString()) }
        if (this.ship) { console.log(this.ship.toString()) }
    }

    sortSkills(skills = Object.keys(this.skills)): string[] {

        return skills.sort((a, b) => (this.skills[a] < this.skills[b]) ? 1 : -1);
    }

    doCareer() {
        let activeDuty = true;
        do {
            console.debug(`Starting term ${this.terms + 1} of service`);

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
            console.debug(`Survival throw ${this.career.survival}, DM ${this.career.survivalDM(this)}, need to roll ${this.career.survival - this.career.survivalDM(this)}+`);
            if (this.random.roll() + this.career.survivalDM(this) < this.career.survival) {
                this.dead = true;
                activeDuty = false;
                console.warn("Character didn't survive the term of service");
                return;
            }

            // commission
            if (this.commissioned == false && (this.drafted == false || this.terms > 1) && this.career.commission !== null && this.random.roll() + this.career.commissionDM(this) >= this.career.commission) {
                this.commissioned = true;
                this.rank = 1;
                console.debug(`Character was commissioned to ${this.career.ranks![this.rank]}`);
                this.career.rankAndServiceSkills(this); // automatic skills for rank = 1
                eligibleSkills += 1;
                console.debug(`Earned 1 skill eligibility from commission (total ${eligibleSkills})`);
            }

            // promotion
            if (this.commissioned == true && this.rank < (this.career.ranks!.length - 1) && this.random.roll() + this.career.promotionDM(this) >= this.career.promotion!) {
                this.rank += 1;
                console.debug(`Character was promoted to rank ${this.rank} (${this.career.ranks![this.rank]})`);
                this.career.rankAndServiceSkills(this);
                eligibleSkills += 1;
                console.debug(`Earned 1 skill eligibility from promotion (total ${eligibleSkills})`);
            }

            // skills and training
            while (eligibleSkills > 0) {
                eligibleSkills -= 1;
                if (this.skillAvg <= 7) {
                    console.debug(`Avg. skill ${numberFormat.format(this.skillAvg)}, focusing on personal development`);
                    this.career.personalDevelopment(this, this.random.roll(1));
                } else {
                    switch (this.random.roll(1)) {
                        case 1:
                        case 2:
                            this.career.personalDevelopment(this, this.random.roll(1));
                            break;
                        case 3:
                        case 4:
                            this.addSkill(this.career.skillsTable[this.random.roll(1) - 1]);
                            break;
                        case 5:
                        case 6:
                            if (this.attributes.education >= 8) {
                                if (this.random.roll(1) >= 3) {
                                    this.addSkill(this.career.advancedEducationTable8[this.random.roll(1) - 1]);
                                } else {
                                    this.addSkill(this.career.advancedEducationTable[this.random.roll(1) - 1]);
                                }
                            } else {
                                this.addSkill(this.career.advancedEducationTable[this.random.roll(1) - 1]);
                            }
                            break;
                    }
                }
            }

            // aging
            this.aging();
            if (this.dead) {
                console.log(`Character died of old age at ${this.age}`)
                activeDuty = false;
                return;
            }

            // reenlistment throw
            const reenlistmentThrow = this.random.roll();

            // failed reenlistment
            if (reenlistmentThrow < this.career.reenlist) {
                activeDuty = false;
                console.log(`Character failed reenlistment throw ${this.career.reenlist}+, career is over after ${this.terms} terms of service`);
            } else if (reenlistmentThrow != 12 && this.terms < 7 && this.random.roll() >= 10) {
                activeDuty = false;
                console.log(`Character chose not to reenlist after ${this.terms} terms.`);
            }

            // retiring
            if ((this.terms >= 7 && reenlistmentThrow != 12) || this.terms >= 10) { // forced retirement
                console.log(`Character was forced to retire after ${this.terms} terms of service`);
                activeDuty = false;
                this.retired = true;
            } else if (!activeDuty && this.terms >= 5) { // failed reenlistment, but eligible for retirement
                this.retired = true;
                console.log(`Character chose to retire after ${this.terms} terms of service.`)
            } else if (this.terms >= 5 && reenlistmentThrow != 12 && activeDuty) { // voluntary retirement terms >= 5
                console.debug("Character is eligible for voluntary retirement");
                // FIXME: add behavior for voluntary retirement
                if (this.random.roll() + (this.terms - 7) >= 10) {
                    this.retired = true;
                    activeDuty = false;
                    console.log(`Character voluntarily retired after ${this.terms} terms.`);
                }
            }

        } while (activeDuty == true)

        // retirement pay
        if (this.retired && this.career.retirementPay) {
            const retirementPay = [4_000, 6_000, 8_000, 10_000]; // retirement pay is 2_000 + 2_000 * terms 5+
            this.retirementPay = retirementPay[this.terms - 5];
            if (this.terms > 8) {
                this.retirementPay += (this.terms - 8) * 2_000;
            }
            console.debug(`Character is eligible to retirement pay of ${numberFormat.format(this.retirementPay)}`);
        }

        // mustering out
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

        let cashTableRolls = 0;
        while (benefits > 0) {
            benefits -= 1;
            if (cashTableRolls > 0 && (cashTableRolls >= 3 || this.skillAvg <= 7 || this.random.roll(1) >= 3)) {
                // benefits
                console.debug("Character rolls for benefits table");
                this.career.benefitsTable(this, this.random.roll(1) + benefitsDM);
            } else if (cashTableRolls < 3) {
                // cash table
                this.credits += this.career.cashTable[this.random.roll(1) + cashDM - 1];
                cashTableRolls += 1;
                console.debug(`Character rolls for cash table (${cashTableRolls})`);
            }
        }

        if (this.ship) {
            const PassagePrices: { [key: string]: number } = {
                "Low Psg": 1000,
                "Mid Psg": 8000,
                "High Psg": 10000,
            }
            const passages = Object.keys(this.items).filter(x => Object.keys(PassagePrices).includes(x));
            for (const p of passages) {
                console.debug(`Converted ${this.items[p]} ${p} to credits`);
                this.credits += PassagePrices[p] * 0.9 * this.items[p];
                delete (this.items[p]);
            }
        }

    }

    modifyAttribute(attribute: Attribute, amount: number = 1): number {
        const oldValue = this.attributes[attribute];
        this.attributes[attribute] = clamp(this.attributes[attribute] += amount, 0, 15);
        console.debug(`Modifying ${attribute} by ${amount > 0 ? '+' : ''}${amount}, new value ${this.attributes[attribute]} ${oldValue + amount != this.attributes[attribute] ? '(clamped)' : ''}`)

        if (attribute == "socialStanding" && (oldValue >= 11 || this.attributes.socialStanding >= 11)) {
            this.name.title = this.addTitle();
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
        if (item in this.items && item != "Travellers'") {
            this.items[item] += 1;
        } else {
            this.items[item] = 1;
        }
    }

    get hasTravellers(): boolean {
        if (Object.keys(this.items).includes("Travellers'")) {
            return true;
        } else {
            return false;
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
        // console.group();
        // console.debug(`Avoid: ${avoid.join(", ")}`);
        // console.debug(`Prefer: ${prefer.join(", ")}`);
        // console.debug(`Known: ${known.join(", ")}`);
        // console.debug(`Owned: ${owned.join(", ")}`);
        // console.groupEnd();

        return { avoid: avoid, prefer: prefer, known: known, owned: owned }
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

        if (this.random.roll() + preferredCareer.enlistmentDM(this) >= preferredCareer.enlistment) {
            console.log(`Character was accepted to ${preferredCareer.name}`);

            return preferredCareer;
        } else {
            this.drafted = true;
            const draft = this.random.roll(1);
            const draftedService = careers.filter((c) => c.draft == draft)[0];
            console.log(`Character was rejected from ${preferredCareer.name} and was drafted to ${draftedService.name}`);

            return draftedService;

        }
    }

    get upp() {
        return (this.attributes.strength.toString(16) + this.attributes.dexterity.toString(16) + this.attributes.endurance.toString(16) + this.attributes.intelligence.toString(16) + this.attributes.education.toString(16) + this.attributes.socialStanding.toString(16)).toUpperCase();

    }

    // if character has the nobility of a Baron but doesn't (want to) use the title
    protected addPrefix(): string | undefined {
        if (this.attributes.socialStanding == 12) {
            return this.random.pick(["von ", "hault-", "haut-"]);
        } else {
            return undefined;
        }
    }

    protected aging() {
        if (this.age < 34) {
            return;
        } else if (this.age < 50) {
            if (this.random.roll() < 8) {
                console.debug(`Character fails aging STR throw`)
                this.modifyAttribute("strength", -1);
            }
            if (this.random.roll() < 7) {
                console.debug("Character fails aging DEX throw")
                this.modifyAttribute("dexterity", -1);
            }
            if (this.random.roll() < 8) {
                console.debug("Character fails aging END throw")
                this.modifyAttribute("endurance", -1);
            }
        } else if (this.age < 66) {
            if (this.random.roll() < 9) {
                console.debug("Character fails aging STR throw")
                this.modifyAttribute("strength", -1);
            }
            if (this.random.roll() < 8) {
                console.debug("Character fails aging DEX throw")
                this.modifyAttribute("dexterity", -1);
            }
            if (this.random.roll() < 9) {
                console.debug("Character fails aging END throw")
                this.modifyAttribute("endurance", -1);
            }
        } else {
            if (this.random.roll() < 9) {
                console.debug("Character fails aging STR throw")
                this.modifyAttribute("strength", -2);
            }
            if (this.random.roll() < 9) {
                console.debug("Character fails aging DEX throw")
                this.modifyAttribute("dexterity", -2);
            }
            if (this.random.roll() < 9) {
                console.debug("Character fails aging END throw")
                this.modifyAttribute("endurance", -2);
            }
            if (this.random.roll() < 9) {
                console.debug("Character fails aging INT throw")
                this.modifyAttribute("intelligence", -1);
            }
        }
        // FIXME: add availability of slow drug / incapacity, DM for medical skill of service
        if (this.attributes.strength == 0) {
            if (this.random.roll() >= 8) {
                this.modifyAttribute("strength", 1);
            } else {
                this.dead = true;
            }
        }
        if (this.attributes.dexterity == 0) {
            if (this.random.roll() >= 8) {
                this.modifyAttribute("dexterity", 1);
            } else {
                this.dead = true;
            }
        }
        if (this.attributes.endurance == 0) {
            if (this.random.roll() >= 8) {
                this.modifyAttribute("endurance", 1);
            } else {
                this.dead = true;
            }
        }
        if (this.attributes.intelligence <= 0) {
            if (this.random.roll() >= 8) {
                this.modifyAttribute("intelligence", 1);
            } else {
                this.dead = true;
            }
        }
    }

    protected addTitle(): string | undefined {
        switch (this.attributes.socialStanding) {
            case 11: // Knight
                if (this.gender == Gender.Male) {
                    return "Sir";
                } else {
                    return "Dame";
                }
            case 12:
                if (this.name.prefix || this.random.roll(1) <= 3) {
                    if (this.gender == Gender.Male) {
                        return "Baron";
                    } else {
                        return this.random.pick(["Baronet", "Baroness"]);
                    }
                } else {
                    // in lieu of a title, use prefix in name
                    if (!this.name.prefix) { this.name.prefix = this.addPrefix(); }
                    return undefined;
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
                return undefined;
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
    weapon: ["Carbine", "Rifle", "Auto Rifle", "Shotgun", "SMG", "Laser Carbine", "Laser Rifle"],
    pistol: ["Body Pistol", "Auto Pistol", "Revolver"],
}
weaponSkills["gun"] = weaponSkills["weapon"].concat(weaponSkills["pistol"]);

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

export { Character, weaponSkills };
