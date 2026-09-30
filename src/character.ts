import { applyEffect } from "./career_effects";
import {
    agingEffects,
    chooseAdvancedEducationTable,
    chooseBenefitTable,
    chooseTrainingTable,
    draftService,
    eligibleCareerIndexes,
    enlistmentSucceeds,
    resolveReenlistment,
    rollAttributes,
    rollTable,
    survivesTerm,
    winsCommission,
    winsPromotion,
} from "./character_generation";
import { applyRankRewards, type Career, careers } from "./careers";
import { ImperialDate } from "./imperial_date";
import { Items } from "./items";
import { Name } from "./name";
import { Random } from "./random";
import { type Ship, shipToString } from "./ships";
import { type SkillName, Skills } from "./skills";
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

export type Attribute = keyof Attributes;

export type Gender = "male" | "female";

/**
 * A Classic Traveller (Books 1-3) character, generated on construction:
 * attributes, name, homeworld, career terms, skills, mustering-out
 * benefits, and possibly a ship. Milestone life events accumulate in
 * history in generation order.
 */
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

        this.attributes = rollAttributes(this.random);

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
        applyRankRewards(this); // add automatic skills for service (rank = 0)
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

    /** TAS Form 2 one-line summary (rank title, name, UPP, age, terms). */
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

    /**
     * Runs the term loop of the character's career: survival, commission,
     * promotion, skills and training, aging, reenlistment and retirement,
     * followed by retirement pay and mustering out.
     */
    private doCareer() {
        let activeDuty = true;
        do {
            this.startTerm();
            let eligibleSkills = this.skillEligibility();

            if (!this.surviveTerm()) {
                return; // a dead character does not muster out
            }

            eligibleSkills += this.commissionTerm();
            eligibleSkills += this.promoteTerm();
            this.train(eligibleSkills);

            if (!this.ageAndMaybeDie()) {
                return; // a dead character does not muster out
            }

            activeDuty = this.resolveReenlistment() === "continue";
        } while (activeDuty === true);

        this.receiveRetirementPay();
        this.musterOut();
    }

    /** Starts a new term of service: ages the character by four years. */
    private startTerm() {
        this.age += 4;
        this.terms += 1;
        this.record(`Starting term ${this.terms} of service`);
    }

    /** First term and Scouts service grant an extra skill eligibility. */
    private skillEligibility(): number {
        if (this.terms === 1) {
            return 2;
        }
        if (this.career.name === "Scouts") {
            return 2;
        }
        return 1;
    }

    /**
     * Survival throw with the career DM: failure kills the character and
     * ends the career immediately.
     *
     * @returns false when the character died
     */
    private surviveTerm(): boolean {
        if (!survivesTerm(this.random, this.career, this.attributes)) {
            this.dead = true;
            this.record("Character didn't survive the term of service");
            return false;
        }
        return true;
    }

    /**
     * Commission phase: a first commission grants rank 1. A commission
     * grants an extra skill eligibility.
     */
    private commissionTerm(): number {
        if (
            this.commissioned ||
            (this.drafted && this.terms <= 1) ||
            this.career.commission === null
        ) {
            return 0;
        }
        if (winsCommission(this.random, this.career, this.attributes)) {
            this.commissioned = true;
            this.rank = 1;
            this.record(
                `Character was commissioned to ${
                    this.career.ranks?.[this.rank]
                }`,
            );
            applyRankRewards(this); // automatic skills for rank = 1
            return 1;
        }
        return 0;
    }

    /**
     * Promotion phase: promotes the character one rank. A promotion grants
     * an extra skill eligibility.
     */
    private promoteTerm(): number {
        if (
            !this.commissioned ||
            !this.career.promotion ||
            !this.career.ranks ||
            this.rank >= this.career.ranks.length - 1
        ) {
            return 0;
        }
        if (winsPromotion(this.random, this.career, this.attributes)) {
            this.rank += 1;
            this.record(
                `Character was promoted to rank ${this.rank} (${
                    this.career.ranks?.[this.rank]
                })`,
            );
            applyRankRewards(this);
            return 1;
        }
        return 0;
    }

    /**
     * Changes an attribute by amount, re-checking the noble title when
     * social standing changes (Book 1: SOC 11+ confers a title).
     *
     * @returns the new attribute value
     */
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

    /**
     * Tries to enlist, applying the -1 DM per prior career; falls back to
     * the draft (which always succeeds) when rejected everywhere. The
     * first career is chosen by preference order, later ones at random.
     */
    protected enlist(): Career {
        const preferredCareerIndexes = eligibleCareerIndexes(this.attributes);

        const preferredCareer =
            careers[this.random.pick(preferredCareerIndexes)];
        if (preferredCareer === undefined) {
            throw new Error("No eligible career found");
        }

        if (enlistmentSucceeds(this.random, preferredCareer, this.attributes)) {
            this.record(`Character was accepted to ${preferredCareer.name}`);

            return preferredCareer;
        }
        this.drafted = true;
        const { service: draftedService, draft } = draftService(this.random);

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

    /**
     * Training phase: spends each eligibility on personal development,
     * service skills, or advanced education (EDU 8+), then trains the rank
     * skill for the term's commission or promotion.
     */
    private train(eligibleSkills: number) {
        while (eligibleSkills > 0) {
            eligibleSkills -= 1;
            const table = chooseTrainingTable(this.random, this.attrAvg);
            switch (table) {
                case "personal":
                    applyEffect(
                        this,
                        rollTable(
                            this.career.personalDevelopment,
                            this.random.roll(1),
                        ),
                    );
                    break;
                case "service":
                    this.addSkill(
                        rollTable(this.career.skillsTable, this.random.roll(1)),
                    );
                    break;
                case "advanced":
                    this.trainAdvancedEducation();
                    break;
            }
        }
    }

    /** Advanced education roll: EDU 8+ picks a table, EDU 12+ may use table 8. */
    private trainAdvancedEducation() {
        const table = chooseAdvancedEducationTable(
            this.random,
            this.attributes.education,
        );
        this.addSkill(
            rollTable(
                table === "eight"
                    ? this.career.advancedEducationTable8
                    : this.career.advancedEducationTable,
                this.random.roll(1),
            ),
        );
    }

    /**
     * Aging phase: from term four on, an 8+ throw avoids attribute loss;
     * saves against aging death start at term eight (Book 1).
     *
     * @returns false when the character died
     */
    private ageAndMaybeDie(): boolean {
        const { effects, died } = agingEffects(
            this.random,
            this.age,
            this.attributes,
        );
        for (const effect of effects) {
            this.modifyAttribute(effect.attribute, effect.amount);
        }
        if (died) {
            this.dead = true;
        }
        if (this.dead) {
            this.record(`Character died of old age at ${this.age}`);
            return false;
        }
        return true;
    }

    /**
     * Reenlistment phase: a throw of 12 forces another term; a failed
     * throw ends service (retiring with a pension when eligible, else
     * mustering out). The character may also leave voluntarily.
     *
     * @returns "continue" when another term is served
     */
    private resolveReenlistment(): "continue" | "leaveService" {
        const result = resolveReenlistment(
            this.random,
            this.career,
            this.terms,
        );
        for (const message of result.messages) {
            this.record(message);
        }
        if (result.retired) {
            this.retired = true;
        }
        return result.outcome;
    }

    /**
     * Retirement pay phase: pension careers pay retired characters by
     * terms served (Book 1: Cr2000 + Cr2000 per term from term five).
     */
    private receiveRetirementPay(): void {
        if (!this.retired || !this.career.retirementPay || this.terms < 5) {
            return;
        }
        this.retirementPay = 2_000 + (this.terms - 4) * 2_000;
    }

    /**
     * Mustering-out phase: rank bonus rolls split between the cash and
     * benefits tables (max three cash rolls, +1 benefits DM at rank 5+),
     * then passages convert to cash when the character owns a ship.
     */
    private musterOut() {
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
        const cashDM = this.skills.has("Gambling") ? 1 : 0;

        let cashTableRolls = 0;
        while (benefits > 0) {
            benefits -= 1;
            if (
                chooseBenefitTable(
                    this.random,
                    cashTableRolls,
                    this.attrAvg,
                ) === "benefits"
            ) {
                // benefits
                applyEffect(
                    this,
                    rollTable(
                        this.career.benefits,
                        this.random.roll(1) + benefitsDM,
                    ),
                );
            } else {
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

    /**
     * Improves a skill, resolving career-table pseudo-skills ("Blade Cbt",
     * "Gun Cbt", "Vehicle") to concrete skills first.
     */
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

    /**
     * Grants a weapon benefit, adding the weapon skill at level 0 when the
     * character doesn't know it yet.
     */
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
