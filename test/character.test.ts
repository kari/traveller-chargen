import { expect, test } from "vitest";
import {
    Character,
    generateCharacter,
    Items,
    Name,
    Skills,
} from "../src/character";
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

test("Add a skill", () => {
    const s = new Skills();
    s.increase("Gambling");
    expect(s.toString()).toBe("Gambling-1");
    expect(s.list).toContain("Gambling");
    expect(s.filter(["Gambling"])).toContain("Gambling");
    s.increase("Gambling");
    expect(s.toString()).toBe("Gambling-2");
});

test("Add a zero skill", () => {
    const s = new Skills();
    s.addZeroSkill("Brawling");
    expect(s.toString()).toBe("Brawling-0");
    expect(s.list).toContain("Brawling");
    expect(s.filter(["Brawling"])).toContain("Brawling");
    s.increase("Brawling");
    expect(s.toString()).toBe("Brawling-1");
    s.increase("Brawling", 2);
    expect(s.toString()).toBe("Brawling-3");
});

test("Test skill sorting and filtering", () => {
    const s = new Skills();
    s.increase("Gambling");
    s.increase("Brawling");
    expect(s.list.length).toBe(2);
    expect(s.list).toContain("Gambling");
    expect(s.list).toContain("Brawling");
    expect(s.filter(["Gambling"])).toContain("Gambling");
    expect(s.filter(["Gambling"]).length).toBe(1);
    s.increase("Gambling");
    expect(s.sorted()).toEqual(["Gambling", "Brawling"]);
    s.increase("Forgery");

    const s2 = s.filter(["Gambling", "Forgery"]);
    expect(s2.length).toBe(2);
});

test("Add items", () => {
    const i = new Items();
    i.add("Low Psg");
    expect(i.list.length).toBe(1);
    expect(i.list).toContain("Low Psg");
    expect(i.toString()).toBe("1 Low Psg");
    expect(i.hasTravellers).toBeFalsy();
    i.add("Low Psg");
    expect(i.list.length).toBe(1);
    expect(i.toString()).toBe("2 Low Psg");
    i.add("Mid Psg");
    expect(i.list.length).toBe(2);
});

test("Add Travellers", () => {
    const i = new Items();
    expect(i.hasTravellers).toBeFalsy();
    i.add("Travellers'");
    expect(i.hasTravellers).toBeTruthy();
    expect(i.toString()).toBe("1 Travellers'");
    i.add("Travellers'");
    expect(i.toString()).toBe("1 Travellers'");
});

test("Convert passages", () => {
    const i = new Items();
    expect(i.convertPassages()).toBe(0);

    i.add("Low Psg");
    expect(i.convertPassages()).toBe(900);

    i.add("Low Psg");
    i.add("Low Psg");
    expect(i.convertPassages()).toBe(1800);

    i.add("Mid Psg");
    expect(i.convertPassages()).toBe(7200);

    i.add("Mid Psg");
    i.add("Low Psg");
    expect(i.convertPassages()).toBe(8100);

    i.add("High Psg");
    expect(i.convertPassages()).toBe(9000);

    i.add("High Psg");
    i.add("Mid Psg");
    i.add("Low Psg");
    expect(i.convertPassages()).toBe(17100);
});

test("Create a simple name", () => {
    const n = new Name("First", "Last");
    expect(n.first).toBe("First");
    expect(n.last).toBe("Last");
    expect(n.prefix).toBeUndefined();
    expect(n.title).toBeUndefined();
    expect(n.middleInitial).toBeNull();
    expect(n.middle).toBeUndefined();
    expect(n.toString()).toBe("First Last");
});

test("Test a name with a middle name", () => {
    const n = new Name("First", "Last");
    n.middle = "Middle";
    expect(n.first).toBe("First");
    expect(n.last).toBe("Last");
    expect(n.prefix).toBeUndefined();
    expect(n.title).toBeUndefined();
    expect(n.middleInitial).toBe("M.");
    expect(n.middle).toBe("Middle");
    expect(n.toString()).toBe("First Middle Last");
});

test("Test name with a prefix", () => {
    const n = new Name("First", "Last");
    n.middle = "Middle";
    n.prefix = "von ";
    expect(n.prefix).toBe("von ");
    expect(n.toString()).toBe("First Middle von Last");
});

test("Test name with a title", () => {
    const n = new Name("First", "Last");
    n.middle = "Middle";
    n.title = "Baron";
    expect(n.title).toBe("Baron");
    expect(n.toString()).toBe("Baron First Middle Last");
});

test("Test name with a title and prefix", () => {
    const n = new Name("First", "Last");
    n.middle = "Middle";
    n.title = "Baron";
    n.prefix = "von ";
    expect(n.title).toBe("Baron");
    expect(n.prefix).toBe("von ");
    expect(n.toString()).toBe("Baron First Middle von Last");
});
