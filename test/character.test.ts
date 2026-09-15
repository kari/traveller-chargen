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
