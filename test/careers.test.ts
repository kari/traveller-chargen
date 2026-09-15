import { expect, test } from "vitest";
import { dm } from "../src/career_effects";
import { careers } from "../src/careers";
import type { Attribute } from "../src/character";

const attributes = (
    values: Partial<Record<Attribute, number>>,
): Record<Attribute, number> => ({
    strength: 0,
    dexterity: 0,
    endurance: 0,
    intelligence: 0,
    education: 0,
    socialStanding: 0,
    ...values,
});

test("dm sums the rules whose attributes meet the thresholds", () => {
    const rules = [
        { attribute: "intelligence", threshold: 8, bonus: 1 },
        { attribute: "education", threshold: 9, bonus: 2 },
    ] as const;

    expect(dm(rules, attributes({ intelligence: 8, education: 9 }))).toBe(3);
    // thresholds are inclusive
    expect(dm(rules, attributes({ intelligence: 7, education: 9 }))).toBe(2);
    expect(dm(rules, attributes({}))).toBe(0);
});

test("every career has complete tables and unique draft numbers", () => {
    const drafts = careers.map((career) => career.draft);
    expect(new Set(drafts).size).toBe(careers.length);

    for (const career of careers) {
        expect(career.personalDevelopment.length).toBe(6);
        expect(career.benefits.length).toBe(7);
        expect(career.cashTable.length).toBe(7);
        expect(career.skillsTable.length).toBe(6);
        expect(career.advancedEducationTable.length).toBe(6);
        expect(career.advancedEducationTable8.length).toBe(6);

        for (const rank of Object.keys(career.rankRewards)) {
            const rankNumber = Number(rank);
            expect(rankNumber).toBeGreaterThanOrEqual(0);
            if (career.ranks) {
                expect(rankNumber).toBeLessThan(career.ranks.length);
            }
        }
    }
});

test("careers without officers have no commission or promotion DMs", () => {
    for (const career of careers) {
        if (career.commission === null) {
            expect(career.commissionDMs).toEqual([]);
        }
        if (career.promotion === null) {
            expect(career.promotionDMs).toEqual([]);
        }
    }
});
