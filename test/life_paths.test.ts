import { beforeAll, expect, test } from "vitest";
import { Character } from "../src/character";
import { loadShipNames } from "../src/ships";
import { ScriptedRandom } from "./scripted_random";

beforeAll(async () => {
    // mustering out can grant weapons and ships
    await loadShipNames();
});

function scriptedCharacter(rolls: number[]): Character {
    return new Character(new ScriptedRandom(7, rolls));
}

/**
 * Rule-outcome tests for life paths the Book 1 worked example does not
 * cover. Each scenario scripts the full RNG consumption order; the Other
 * career is the usual vehicle (no commission/promotion rolls, no DMs).
 * Career eligibility for the attribute blocks used here is
 * [Army, Scouts, Merchants, Other]; pick index 3 selects Other.
 */

test("dies on a failed survival throw and does not muster out", () => {
    const c = scriptedCharacter([
        4,
        4,
        4,
        4,
        4,
        4, // UPP 444444
        0, // gender
        0,
        0, // names
        7,
        7,
        7,
        7,
        7,
        7,
        7,
        3, // birthworld
        7,
        7,
        7,
        7,
        7,
        7,
        7,
        3, // discharge world
        3, // career pick: Other
        4, // enlistment 4 >= 3
        2, // survival throw 2 < 5: dead
        1, // birth date
    ]);

    expect(c.dead).toBe(true);
    expect(c.terms).toBe(1);
    expect(c.retired).toBe(false);
    expect(c.retirementPay).toBe(0);
    expect(c.credits).toBe(0);
    expect(c.ship).toBeUndefined();
    expect(c.skills.list).toEqual([]);
    expect(c.history).toContain("Character didn't survive the term of service");
});

test("dies of old age when a reduced attribute fails its zero save", () => {
    const c = scriptedCharacter([
        2,
        5,
        5,
        5,
        5,
        4, // UPP 255541, average <= 7: personal development only
        0,
        0,
        0, // gender, names
        7,
        7,
        7,
        7,
        7,
        7,
        7,
        3, // birthworld
        7,
        7,
        7,
        7,
        7,
        7,
        7,
        3, // discharge world
        3,
        4, // Other career, enlistment
        // Term 1 (age 22): survival, Brawling x2, reenlist + voluntary-leave check
        6,
        5,
        5,
        6,
        6,
        // Term 2 (age 26)
        6,
        5,
        6,
        6,
        // Term 3 (age 30)
        6,
        5,
        6,
        6,
        // Term 4 (age 34): aging strength throw 3 (< 8) reduces 2 -> 1
        6,
        5,
        3,
        10,
        10,
        6,
        6,
        // Term 5 (age 38): strength 1 -> 0, zero save 3 (< 8): dead
        6,
        5,
        3,
        10,
        10,
        3,
        1, // birth date
    ]);

    expect(c.dead).toBe(true);
    expect(c.age).toBe(38);
    expect(c.terms).toBe(5);
    expect(c.attributes.strength).toBe(0);
    expect(c.retired).toBe(false);
    expect(c.credits).toBe(0); // a dead character does not muster out
    expect(c.history).toContain("Character died of old age at 38");
    // aging rolls for dexterity and endurance passed (no losses)
    expect(c.attributes.dexterity).toBe(5);
    expect(c.attributes.endurance).toBe(5);
});

test("a failed enlistment leads to the draft", () => {
    const c = scriptedCharacter([
        7,
        7,
        7,
        7,
        7,
        7, // UPP 777777
        0,
        0,
        0, // gender, names
        7,
        7,
        7,
        7,
        7,
        7,
        7,
        3, // birthworld
        7,
        7,
        7,
        7,
        7,
        7,
        7,
        3, // discharge world
        1, // career pick: Scouts
        5, // enlistment 5 + 1 (INT DM) = 6 < 7: rejected
        2, // draft roll 2: Marines
        6, // survival
        4,
        4, // personal development: Gambling x2
        3, // reenlistment 3 < 6: career over after one term
        3, // mustering out: cash roll 3 = Cr10,000
        1, // birth date
    ]);

    expect(c.drafted).toBe(true);
    expect(c.career.name).toBe("Marines");
    expect(c.terms).toBe(1);
    expect(c.retired).toBe(false);
    expect(c.commissioned).toBe(false); // drafted characters skip the first commission
    expect(c.history).toContain(
        "Character was rejected from Scouts and was drafted to Marines (draft roll 2)",
    );
    // Marines rank 0 reward plus personal development
    expect(c.skills.level("Cutlass")).toBe(1);
    expect(c.skills.level("Gambling")).toBe(2);
});

test("is force-retired after seven terms", () => {
    const c = scriptedCharacter([
        7,
        7,
        7,
        7,
        7,
        7, // UPP 777777
        0,
        0,
        0, // gender, names
        7,
        7,
        7,
        7,
        7,
        7,
        7,
        3, // birthworld
        7,
        7,
        7,
        7,
        7,
        7,
        7,
        3, // discharge world
        3,
        4, // Other career, enlistment
        // Terms 1-3 (ages 22-30): survival, Brawling, reenlist + leave check
        6,
        5,
        5,
        6,
        6,
        6,
        5,
        6,
        6,
        6,
        5,
        6,
        6,
        // Terms 4-6 (ages 34-42): + passing aging throws (10, 10, 10);
        // from term 5 on a reenlisted character also throws for voluntary
        // retirement (6 + (terms - 7) < 10: stays)
        6,
        5,
        10,
        10,
        10,
        6,
        6,
        6,
        5,
        10,
        10,
        10,
        6,
        6,
        6,
        6,
        5,
        10,
        10,
        10,
        6,
        6,
        6,
        // Term 7 (age 46): reenlistment throw 6 at 7 terms forces retirement
        6,
        5,
        10,
        10,
        10,
        6,
        // Mustering out: 7 rolls (terms 7, rank 0)
        1, // cash: Cr1,000
        1, // benefits roll 1: Low Passage (average attribute 7: no table check)
        2, // benefits roll 2: +1 Intelligence (average rises above 7)
        4,
        4,
        0, // table check, roll 4: gun -> Carbine (zero skill)
        4,
        5, // roll 5: High Passage
        4,
        6, // roll 6: nothing
        4,
        6, // roll 7: nothing
        1, // birth date
    ]);

    expect(c.terms).toBe(7);
    expect(c.retired).toBe(true);
    expect(c.rank).toBe(0);
    expect(c.retirementPay).toBe(0); // the Other career pays no pension
    expect(c.history).toContain(
        "Character was forced to retire after 7 terms of service",
    );
    expect(c.credits).toBe(1_000);
    expect(c.skills.level("Carbine")).toBe(0); // benefit weapon at zero skill
    expect(c.items.has("High Psg")).toBe(true); // no ship: passages stay items
});

test("chooses not to reenlist and leaves after one term", () => {
    const c = scriptedCharacter([
        7,
        7,
        7,
        7,
        7,
        7, // UPP 777777
        0,
        0,
        0, // gender, names
        7,
        7,
        7,
        7,
        7,
        7,
        7,
        3, // birthworld
        7,
        7,
        7,
        7,
        7,
        7,
        7,
        3, // discharge world
        3,
        4, // Other career, enlistment
        6,
        5,
        5, // survival, Brawling x2
        7,
        10, // reenlistment 7 (passed), voluntary-leave check 10: leaves
        3, // mustering out: cash roll 3 = Cr10,000
        1, // birth date
    ]);

    expect(c.terms).toBe(1);
    expect(c.retired).toBe(false);
    expect(c.history).toContain(
        "Character chose not to reenlist after 1 terms.",
    );
    expect(c.credits).toBe(10_000); // mustered out with one cash roll
});

test("voluntarily retires at six terms", () => {
    const c = scriptedCharacter([
        7,
        7,
        7,
        7,
        7,
        7, // UPP 777777
        0,
        0,
        0, // gender, names
        7,
        7,
        7,
        7,
        7,
        7,
        7,
        3, // birthworld
        7,
        7,
        7,
        7,
        7,
        7,
        7,
        3, // discharge world
        3,
        4, // Other career, enlistment
        // Terms 1-3 (ages 22-30)
        6,
        5,
        5,
        6,
        6,
        6,
        5,
        6,
        6,
        6,
        5,
        6,
        6,
        // Terms 4-5 (ages 34-38): + passing aging throws; term 5 also
        // throws for voluntary retirement (6 + (5 - 7) < 10: stays)
        6,
        5,
        10,
        10,
        10,
        6,
        6,
        6,
        5,
        10,
        10,
        10,
        6,
        6,
        6,
        // Term 6 (age 42): reenlistment 11, leave check 6, voluntary
        // retirement throw 11 + (6 - 7) = 10
        6,
        5,
        10,
        10,
        10,
        11,
        6,
        11,
        // Mustering out: 6 rolls
        2, // cash: Cr5,000
        1, // Low Passage
        2, // +1 Intelligence
        4,
        3, // +1 Education
        4,
        4,
        0, // gun -> Carbine (zero skill)
        4,
        6, // nothing
        1, // birth date
    ]);

    expect(c.terms).toBe(6);
    expect(c.retired).toBe(true);
    expect(c.retirementPay).toBe(0);
    expect(c.history).toContain("Character voluntarily retired after 6 terms.");
    expect(c.credits).toBe(5_000);
});
