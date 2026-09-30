import type { Attribute } from "./character";
import { dm } from "./career_effects";
import { type Career, careers } from "./careers";
import { clamp } from "./utils";
import type { Random } from "./random";

/**
 * Pure decision steps of Classic Traveller character generation (Book 1).
 * Each function takes explicit inputs (a random source, career data,
 * attributes) and returns a result without touching character state; the
 * Character class applies results, mutates state and records history. RNG
 * consumption order matches the book's checklist and must stay stable:
 * existing seed-pinned tests and generated characters depend on it.
 */

/** Attribute block as it leaves the initial 2D6 rolls. */
export type AttributeBlock = Record<Attribute, number>;

/**
 * Rolls the six personal characteristics in UPP order (strength,
 * dexterity, endurance, intelligence, education, social standing).
 */
export function rollAttributes(random: Random): AttributeBlock {
    return {
        strength: random.roll(),
        dexterity: random.roll(),
        endurance: random.roll(),
        intelligence: random.roll(),
        education: random.roll(),
        socialStanding: random.roll(),
    };
}

/**
 * Careers whose enlistment throw is reachable at all (throw 8 or less
 * after DMs); the preferred career is picked among these.
 */
export function eligibleCareerIndexes(attributes: AttributeBlock): number[] {
    const indexes: number[] = [];
    careers.forEach((career, i) => {
        if (career.enlistment - dm(career.enlistmentDMs, attributes) <= 7) {
            indexes.push(i);
        }
    });
    return indexes;
}

/** The enlistment throw proper: 2D6 + DMs against the career target. */
export function enlistmentSucceeds(
    random: Random,
    career: Career,
    attributes: AttributeBlock,
): boolean {
    return (
        random.roll() + dm(career.enlistmentDMs, attributes) >=
        career.enlistment
    );
}

/** The draft roll: 1D6 selects the service that takes the character. */
export function draftService(random: Random): {
    service: Career;
    draft: number;
} {
    const draft = random.roll(1);
    const draftedService = careers.find((c) => c.draft === draft);
    if (draftedService === undefined) {
        throw new Error(`No service for draft roll ${draft}`);
    }
    return { service: draftedService, draft: draft };
}

/** Survival throw with the career DM: false means the character died. */
export function survivesTerm(
    random: Random,
    career: Career,
    attributes: AttributeBlock,
): boolean {
    return (
        random.roll() + dm(career.survivalDMs, attributes) >= career.survival
    );
}

/** Commission throw with the career DM. */
export function winsCommission(
    random: Random,
    career: Career,
    attributes: AttributeBlock,
): boolean {
    return (
        random.roll() + dm(career.commissionDMs, attributes) >=
        (career.commission ?? Number.POSITIVE_INFINITY)
    );
}

/** Promotion throw with the career DM. */
export function winsPromotion(
    random: Random,
    career: Career,
    attributes: AttributeBlock,
): boolean {
    return (
        random.roll() + dm(career.promotionDMs, attributes) >=
        (career.promotion ?? Number.POSITIVE_INFINITY)
    );
}

/** Which training table an eligibility is spent on. */
export type TrainingTable = "personal" | "service" | "advanced";

/**
 * Table choice for one skill eligibility: low average attributes force
 * personal development; otherwise 1-2 personal, 3-4 service skills,
 * 5-6 advanced education.
 */
export function chooseTrainingTable(
    random: Random,
    attrAvg: number,
): TrainingTable {
    if (attrAvg <= 7) {
        return "personal";
    }
    const choice = random.roll(1);
    if (choice <= 2) {
        return "personal";
    }
    return choice <= 4 ? "service" : "advanced";
}

/** Which advanced education table applies. */
export type AdvancedEducationTable = "standard" | "eight";

/**
 * Advanced education table choice: EDU 8+ throws for the better table 8
 * (3+), lower education always uses the standard table (no throw).
 */
export function chooseAdvancedEducationTable(
    random: Random,
    education: number,
): AdvancedEducationTable {
    if (education >= 8) {
        return random.roll(1) >= 3 ? "eight" : "standard";
    }
    return "standard";
}

/** One attribute change from the aging tables. */
export interface AgingEffect {
    attribute: Attribute;
    amount: number;
}

/** The aging tables' outcome: attribute losses/saves and whether the character died. */
export interface AgingResult {
    effects: AgingEffect[];
    died: boolean;
}

/**
 * Aging throws (Book 1): from age 34, attribute saving throws per four-year
 * band, then a character reduced to 0 in a physical attribute (or INT) makes
 * a final save or dies. All throws happen in book order even after a death;
 * effects are returned, not applied.
 *
 * FIXME: add availability of slow drug / incapacity, DM for medical skill of service
 */
export function agingEffects(
    random: Random,
    age: number,
    attributes: AttributeBlock,
): AgingResult {
    const values: AttributeBlock = { ...attributes };
    const effects: AgingEffect[] = [];
    let died = false;

    const lose = (attribute: Attribute, threshold: number, amount: number) => {
        if (random.roll() < threshold) {
            values[attribute] = clamp(values[attribute] - amount, 0, 15);
            effects.push({ attribute: attribute, amount: -amount });
        }
    };

    if (age >= 34) {
        if (age < 50) {
            lose("strength", 8, 1);
            lose("dexterity", 7, 1);
            lose("endurance", 8, 1);
        } else if (age < 66) {
            lose("strength", 9, 1);
            lose("dexterity", 8, 1);
            lose("endurance", 9, 1);
        } else {
            lose("strength", 9, 2);
            lose("dexterity", 9, 2);
            lose("endurance", 9, 2);
            lose("intelligence", 9, 1);
        }
    }

    // final saves at zero: an 8+ survives with the attribute restored to 1
    const zeroSave = (attribute: Attribute) => {
        if (random.roll() >= 8) {
            values[attribute] = 1;
            effects.push({ attribute: attribute, amount: 1 });
        } else {
            died = true;
        }
    };
    if (values.strength === 0) {
        zeroSave("strength");
    }
    if (values.dexterity === 0) {
        zeroSave("dexterity");
    }
    if (values.endurance === 0) {
        zeroSave("endurance");
    }
    if (values.intelligence <= 0) {
        zeroSave("intelligence");
    }

    return { effects: effects, died: died };
}

/** How the term ended at the reenlistment phase. */
export interface ReenlistmentResult {
    outcome: "continue" | "leaveService";
    retired: boolean;
    /** History lines, in the order they were learned. */
    messages: string[];
}

/**
 * Reenlistment phase (Book 1 with house rules): a throw of 12 forces
 * reenlistment, a failed throw ends the career, below seven terms the
 * character may voluntarily leave, and from five terms on a failed
 * reenlistment or a successful voluntary throw retires the character.
 */
export function resolveReenlistment(
    random: Random,
    career: Career,
    terms: number,
): ReenlistmentResult {
    const reenlistmentThrow = random.roll();
    const messages: string[] = [];

    if (reenlistmentThrow === 12) {
        messages.push(
            `Reenlistment throw 12: compulsory reenlistment after ${terms} terms`,
        );
    }

    let reenlisted = true;

    // failed reenlistment
    if (reenlistmentThrow < career.reenlist) {
        reenlisted = false;
        messages.push(
            `Character failed reenlistment throw ${career.reenlist}+, career is over after ${terms} terms of service`,
        );
    } else if (reenlistmentThrow !== 12 && terms < 7 && random.roll() >= 10) {
        reenlisted = false;
        messages.push(`Character chose not to reenlist after ${terms} terms.`);
    }

    // retiring
    if ((terms >= 7 && reenlistmentThrow !== 12) || terms >= 10) {
        // forced retirement
        messages.push(
            `Character was forced to retire after ${terms} terms of service`,
        );
        return {
            outcome: "leaveService",
            retired: true,
            messages: messages,
        };
    }
    if (!reenlisted) {
        if (terms >= 5) {
            // failed reenlistment, but eligible for retirement
            messages.push(
                `Character chose to retire after ${terms} terms of service.`,
            );
            return {
                outcome: "leaveService",
                retired: true,
                messages: messages,
            };
        }
        return { outcome: "leaveService", retired: false, messages: messages };
    }
    if (terms >= 5 && reenlistmentThrow !== 12) {
        if (random.roll() + (terms - 7) >= 10) {
            messages.push(
                `Character voluntarily retired after ${terms} terms.`,
            );
            return {
                outcome: "leaveService",
                retired: true,
                messages: messages,
            };
        }
    }
    return { outcome: "continue", retired: false, messages: messages };
}

/**
 * Decides whether a mustering-out roll goes to the cash or the benefits
 * table: cash first, at most three cash rolls, benefits only when the
 * average attribute is 8+ or the 1D6 check passes.
 */
export function chooseBenefitTable(
    random: Random,
    cashTableRolls: number,
    attrAvg: number,
): "cash" | "benefits" {
    if (
        cashTableRolls > 0 &&
        (cashTableRolls >= 3 || attrAvg <= 7 || random.roll(1) >= 3)
    ) {
        return "benefits";
    }
    return "cash";
}

/**
 * Looks up a 1-based table entry by die roll (throws when out of range).
 */
export function rollTable<T>(table: readonly T[], roll: number): T {
    const value = table[roll - 1];
    if (value === undefined)
        throw new RangeError(`Table roll ${roll} out of range`);
    return value;
}
