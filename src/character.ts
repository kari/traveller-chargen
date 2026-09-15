import { type Career, careers } from "./careers";
import type { SkillName } from "./domain_types";
import { ImperialDate } from "./imperial_date";
import { Items } from "./items";
import { Name } from "./name";
import { Random } from "./random";
import { type Ship, shipToString } from "./ships";
import { Skills } from "./skills";
import { World } from "./subsector";
import { clamp, ehex, numberFormat } from "./utils";
import { chooseWeaponItem, resolveSkill } from "./weapons";

interface Attributes {
    strength: number;
    dexterity: number;
    endurance: number;
    intelligence: number;
    education: number;
    socialStanding: number;
}

type Attribute = keyof Attributes;

export type Gender = "male" | "female";

export class Character {
    /** Important life events, in generation order. */
    readonly history: string[] = [];

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

    skills = new Skills();
    items = new Items();
    ship?: Ship;
    credits = 0;

    constructor(seedOrRandom?: number | Random) {
        this.random =
            seedOrRandom instanceof Random
                ? seedOrRandom
                : new Random(seedOrRandom);
        this.age = 18;

        this.attributes = {
            strength: this.random.roll(),
            dexterity: this.random.roll(),
            endurance: this.random.roll(),
            intelligence: this.random.roll(),
            education: this.random.roll(),
            socialStanding: this.random.roll(),
        };

        this.gender = this.random.pick(["male", "female"]);
        this.name = new Name(
            this.gender,
            this.attributes.socialStanding,
            this.random,
        );

        this.birthworld = new World(this.random);
        this.dischargeworld = new World(this.random);

        // generate career for the character
        this.career = this.enlist();
        this.career.rankAndServiceSkills(this); // add automatic skills for service (rank = 0)
        this.doCareer();

        this.birthDate = new ImperialDate(
            this.random.integer(1, 365),
            1105 - this.age,
        ); // FIXME: this might not always be correct, should ensure date of preparation - birthdate >= age

        this.record((this.dead ? "✝ " : "") + this.toString());
        if (this.ship) {
            this.record(shipToString(this.ship));
        }
    }

    /** Records an important life event in the generation history. */
    record(message: string): void {
        this.history.push(message);
    }

    toString(): string {
        return `${this.retired ? "Retired " : ""}${
            this.career.memberName
                ? `${
                      this.retired
                          ? this.career.memberName
                          : `Ex-${this.career.memberName.toLowerCase()}`
                  } `
                : ""
        }${
            this.career.ranks?.[this.rank] &&
            this.career.memberName !== this.career.ranks[this.rank]
                ? `${this.career.ranks[this.rank]} `
                : ""
        }${this.name.toString()} ${this.upp} Age ${this.age} ${
            this.terms
        } terms Cr${numberFormat.format(this.credits)}`;
    }

    get attrAvg(): number {
        return (
            (this.attributes.strength +
                this.attributes.dexterity +
                this.attributes.endurance +
                this.attributes.intelligence +
                this.attributes.education +
                this.attributes.socialStanding) /
            6
        );
    }

    private doCareer() {
        let activeDuty = true;
        do {
            this.age += 4;
            this.terms += 1;
            this.record(`Starting term ${this.terms} of service`);
            let eligibleSkills = 0;

            if (this.terms === 1) {
                eligibleSkills += 2;
            } else if (this.career.name === "Scouts") {
                eligibleSkills += 2;
            } else {
                eligibleSkills += 1;
            }

            // survival
            if (
                this.random.roll() + this.career.survivalDM(this) <
                this.career.survival
            ) {
                this.dead = true;
                activeDuty = false;
                this.record("Character didn't survive the term of service");
                return;
            }

            // commission
            if (
                this.commissioned === false &&
                (this.drafted === false || this.terms > 1) &&
                this.career.commission !== null &&
                this.random.roll() + this.career.commissionDM(this) >=
                    this.career.commission
            ) {
                this.commissioned = true;
                this.rank = 1;
                this.record(
                    `Character was commissioned to ${
                        this.career.ranks?.[this.rank]
                    }`,
                );
                this.career.rankAndServiceSkills(this); // automatic skills for rank = 1
                eligibleSkills += 1;
            }

            // promotion
            if (
                this.commissioned === true &&
                this.career.promotion &&
                this.career.ranks &&
                this.rank < this.career.ranks.length - 1 &&
                this.random.roll() + this.career.promotionDM(this) >=
                    this.career.promotion
            ) {
                this.rank += 1;
                this.record(
                    `Character was promoted to rank ${this.rank} (${
                        this.career.ranks?.[this.rank]
                    })`,
                );
                this.career.rankAndServiceSkills(this);
                eligibleSkills += 1;
            }

            // skills and training
            while (eligibleSkills > 0) {
                eligibleSkills -= 1;
                if (this.attrAvg <= 7) {
                    this.career.personalDevelopment(this, this.random.roll(1));
                } else {
                    switch (this.random.roll(1)) {
                        case 1:
                        case 2:
                            this.career.personalDevelopment(
                                this,
                                this.random.roll(1),
                            );
                            break;
                        case 3:
                        case 4:
                            this.addSkill(
                                rollTable(
                                    this.career.skillsTable,
                                    this.random.roll(1),
                                ),
                            );
                            break;
                        case 5:
                        case 6:
                            if (this.attributes.education >= 8) {
                                if (this.random.roll(1) >= 3) {
                                    this.addSkill(
                                        rollTable(
                                            this.career.advancedEducationTable8,
                                            this.random.roll(1),
                                        ),
                                    );
                                } else {
                                    this.addSkill(
                                        rollTable(
                                            this.career.advancedEducationTable,
                                            this.random.roll(1),
                                        ),
                                    );
                                }
                            } else {
                                this.addSkill(
                                    rollTable(
                                        this.career.advancedEducationTable,
                                        this.random.roll(1),
                                    ),
                                );
                            }
                            break;
                    }
                }
            }

            // aging
            this.aging();
            if (this.dead) {
                this.record(`Character died of old age at ${this.age}`);
                activeDuty = false;
                return;
            }

            // reenlistment throw
            const reenlistmentThrow = this.random.roll();
            if (reenlistmentThrow === 12) {
                this.record(
                    `Reenlistment throw 12: compulsory reenlistment after ${this.terms} terms`,
                );
            }

            // failed reenlistment
            if (reenlistmentThrow < this.career.reenlist) {
                activeDuty = false;
                this.record(
                    `Character failed reenlistment throw ${this.career.reenlist}+, career is over after ${this.terms} terms of service`,
                );
            } else if (
                reenlistmentThrow !== 12 &&
                this.terms < 7 &&
                this.random.roll() >= 10
            ) {
                activeDuty = false;
                this.record(
                    `Character chose not to reenlist after ${this.terms} terms.`,
                );
            }

            // retiring
            if (
                (this.terms >= 7 && reenlistmentThrow !== 12) ||
                this.terms >= 10
            ) {
                // forced retirement
                this.record(
                    `Character was forced to retire after ${this.terms} terms of service`,
                );
                activeDuty = false;
                this.retired = true;
            } else if (!activeDuty && this.terms >= 5) {
                // failed reenlistment, but eligible for retirement
                this.retired = true;
                this.record(
                    `Character chose to retire after ${this.terms} terms of service.`,
                );
            } else if (
                this.terms >= 5 &&
                reenlistmentThrow !== 12 &&
                activeDuty
            ) {
                // voluntary retirement terms >= 5
                // FIXME: add behavior for voluntary retirement
                if (this.random.roll() + (this.terms - 7) >= 10) {
                    this.retired = true;
                    activeDuty = false;
                    this.record(
                        `Character voluntarily retired after ${this.terms} terms.`,
                    );
                }
            }
        } while (activeDuty === true);

        // retirement pay
        if (this.retired && this.career.retirementPay) {
            const retirementPay = [4_000, 6_000, 8_000, 10_000]; // retirement pay is 2_000 + 2_000 * terms 5+
            if (this.terms <= 8) {
                const pay = retirementPay[this.terms - 5];
                if (pay === undefined)
                    throw new RangeError(`Invalid retirementPay index`);
                this.retirementPay = pay;
            } else {
                this.retirementPay += 10_000 + (this.terms - 8) * 2_000;
            }
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
        const benefitsDM = this.rank >= 5 ? 1 : 0;
        const cashDM = this.skills.list.includes("Gambling") ? 1 : 0;

        let cashTableRolls = 0;
        while (benefits > 0) {
            benefits -= 1;
            if (
                cashTableRolls > 0 &&
                (cashTableRolls >= 3 ||
                    this.attrAvg <= 7 ||
                    this.random.roll(1) >= 3)
            ) {
                // benefits
                this.career.benefitsTable(
                    this,
                    this.random.roll(1) + benefitsDM,
                );
            } else if (cashTableRolls < 3) {
                // cash table
                this.credits += rollTable(
                    this.career.cashTable,
                    this.random.roll(1) + cashDM,
                );
                cashTableRolls += 1;
            }
        }

        if (this.ship) {
            this.credits += this.items.convertPassages();
        }
    }

    modifyAttribute(attribute: Attribute, amount = 1): number {
        const oldValue = this.attributes[attribute];
        this.attributes[attribute] = clamp(oldValue + amount, 0, 15);

        if (
            attribute === "socialStanding" &&
            (oldValue >= 11 || this.attributes.socialStanding >= 11)
        ) {
            this.name.addTitle(
                this.attributes.socialStanding,
                this.gender,
                this.random,
            );
        }

        return this.attributes[attribute];
    }

    protected enlist(): Career {
        const throws = careers.map((c) => c.enlistment - c.enlistmentDM(this));
        const preferredCareerIndexes: number[] = [];

        // filter off "too difficult" (throw > 7) and randomly choose one
        throws.forEach((el, i) => {
            if (el <= 7) {
                preferredCareerIndexes.push(i);
            }
        });

        const preferredCareer =
            careers[this.random.pick(preferredCareerIndexes)];
        if (preferredCareer === undefined) {
            throw new Error("No eligible career found");
        }

        const enlistmentRoll = this.random.roll();
        if (
            enlistmentRoll + preferredCareer.enlistmentDM(this) >=
            preferredCareer.enlistment
        ) {
            this.record(`Character was accepted to ${preferredCareer.name}`);

            return preferredCareer;
        }
        this.drafted = true;
        const draft = this.random.roll(1);
        const draftedService = careers.find((c) => c.draft === draft);
        if (draftedService === undefined)
            throw new Error(`No service for draft roll ${draft}`);

        this.record(
            `Character was rejected from ${preferredCareer.name} and was drafted to ${draftedService.name} (draft roll ${draft})`,
        );

        return draftedService;
    }

    get upp() {
        return `${ehex(this.attributes.strength)}${ehex(
            this.attributes.dexterity,
        )}${ehex(this.attributes.endurance)}${ehex(
            this.attributes.intelligence,
        )}${ehex(this.attributes.education)}${ehex(
            this.attributes.socialStanding,
        )}`;
    }

    protected aging() {
        if (this.age < 34) {
            return;
        }
        if (this.age < 50) {
            if (this.random.roll() < 8) {
                this.modifyAttribute("strength", -1);
            }
            if (this.random.roll() < 7) {
                this.modifyAttribute("dexterity", -1);
            }
            if (this.random.roll() < 8) {
                this.modifyAttribute("endurance", -1);
            }
        } else if (this.age < 66) {
            if (this.random.roll() < 9) {
                this.modifyAttribute("strength", -1);
            }
            if (this.random.roll() < 8) {
                this.modifyAttribute("dexterity", -1);
            }
            if (this.random.roll() < 9) {
                this.modifyAttribute("endurance", -1);
            }
        } else {
            if (this.random.roll() < 9) {
                this.modifyAttribute("strength", -2);
            }
            if (this.random.roll() < 9) {
                this.modifyAttribute("dexterity", -2);
            }
            if (this.random.roll() < 9) {
                this.modifyAttribute("endurance", -2);
            }
            if (this.random.roll() < 9) {
                this.modifyAttribute("intelligence", -1);
            }
        }
        // FIXME: add availability of slow drug / incapacity, DM for medical skill of service
        if (this.attributes.strength === 0) {
            if (this.random.roll() >= 8) {
                this.modifyAttribute("strength", 1);
            } else {
                this.dead = true;
            }
        }
        if (this.attributes.dexterity === 0) {
            if (this.random.roll() >= 8) {
                this.modifyAttribute("dexterity", 1);
            } else {
                this.dead = true;
            }
        }
        if (this.attributes.endurance === 0) {
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

    addSkill(name: SkillName) {
        this.skills.increase(
            resolveSkill(
                name,
                this.attributes.strength,
                this.skills,
                this.items,
                this.random,
            ),
        );
    }

    addWeapon(type: "blade" | "gun") {
        const { item, hasSkill } = chooseWeaponItem(
            type,
            this.attributes.strength,
            this.skills,
            this.items,
            this.random,
        );
        this.items.add(item);
        if (!hasSkill) {
            this.skills.addZeroSkill(item);
        }
    }
}

export function generateCharacter(seedOrRandom?: number | Random): Character {
    return new Character(seedOrRandom);
}

function rollTable<T>(table: readonly T[], roll: number): T {
    const value = table[roll - 1];
    if (value === undefined)
        throw new RangeError(`Table roll ${roll} out of range`);
    return value;
}
