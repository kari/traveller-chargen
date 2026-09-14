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
