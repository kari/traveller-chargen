import { expect, test } from "vitest";
import { Character, generateCharacter } from "../src/character";
import { Random } from "../src/random";

test("Create a character", () => {
    const c = new Character();
    expect(c).toBeInstanceOf(Character);
});

test("uses an injected random source", () => {
    const random = new Random(12345);
    const character = new Character(random);

    expect(character.random).toBe(random);
});

test("generates a character through the public generation API", () => {
    const random = new Random(12345);
    const character = generateCharacter(random);

    expect(character).toBeInstanceOf(Character);
    expect(character.random).toBe(random);
});

test("records important life events in the history", () => {
    const c = new Character(new Random(12345));

    expect(c.history.length).toBeGreaterThan(3);
    expect(c.history.join("\n")).toContain("Starting term 1 of service");
    expect(c.history.join("\n")).toContain(c.name.toString());
});

test("history is deterministic for the same seed", () => {
    const first = new Character(new Random(4242));
    const second = new Character(new Random(4242));

    expect(second.history).toEqual(first.history);
});

test("pays a pension to retired characters of pension careers", () => {
    // regression guard: the pension was returned but never assigned,
    // so retired characters always displayed Cr0.00
    const navy = new Character(new Random(1));
    expect(navy.career.name).toBe("Navy");
    expect(navy.terms).toBe(6);
    expect(navy.retired).toBe(true);
    expect(navy.retirementPay).toBe(6_000);

    const merchant = new Character(new Random(8));
    expect(merchant.career.name).toBe("Merchants");
    expect(merchant.terms).toBe(5); // pension floor: exactly five terms
    expect(merchant.retired).toBe(true);
    expect(merchant.retirementPay).toBe(4_000);
});

test("pays no pension to retired characters of non-pension careers", () => {
    const c = new Character(new Random(32));
    expect(c.career.name).toBe("Other");
    expect(c.terms).toBe(5);
    expect(c.retired).toBe(true);
    expect(c.retirementPay).toBe(0);
});

test("pays no pension when leaving service early or dying", () => {
    const early = new Character(new Random(4));
    expect(early.career.name).toBe("Navy");
    expect(early.terms).toBe(2);
    expect(early.retired).toBe(false);
    expect(early.retirementPay).toBe(0);

    const dead = new Character(new Random(7));
    expect(dead.dead).toBe(true);
    expect(dead.retirementPay).toBe(0);
});
