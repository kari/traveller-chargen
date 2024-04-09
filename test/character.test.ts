import { expect, test } from "vitest";
import { Character, Skills, Items, Name } from "../src/character";

test("Create a character", () => {
    const c = new Character();
});

test("Add a skill", () => {
    const s = new Skills();
    s.increase("Skill");
    expect(s.toString()).toBe("Skill-1");
    expect(s.list).toContain("Skill");
    expect(s.filter(["Skill"])).toContain("Skill");
    s.increase("Skill");
    expect(s.toString()).toBe("Skill-2");
});

test("Add a zero skill", () => {
    const s = new Skills();
    s.addZeroSkill("Skill");
    expect(s.toString()).toBe("Skill-0");
    expect(s.list).toContain("Skill");
    expect(s.filter(["Skill"])).toContain("Skill");
    s.increase("Skill");
    expect(s.toString()).toBe("Skill-1");
    s.increase("Skill", 2);
    expect(s.toString()).toBe("Skill-3");
});

test("Test skill sorting and filtering", () => {
    const s = new Skills();
    s.increase("A");
    s.increase("B");
    expect(s.list.length).toBe(2);
    expect(s.list).toContain("A");
    expect(s.list).toContain("B");
    expect(s.filter(["A"])).toContain("A");
    expect(s.filter(["A"]).length).toBe(1);
    s.increase("A");
    expect(s.sorted()).toEqual(["A", "B"]);
    s.increase("C");

    const s2 = s.filter(["A", "C"]);
    expect(s2.length).toBe(2);
});

test("Add items", () => {
    const i = new Items();
    i.add("Item");
    expect(i.list.length).toBe(1);
    expect(i.list).toContain("Item");
    expect(i.toString()).toBe("1 Item");
    expect(i.hasTravellers).toBeFalsy();
    i.add("Item");
    expect(i.list.length).toBe(1);
    expect(i.toString()).toBe("2 Item");
    i.add("AnotherItem");
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
    expect(i.convertPassges()).toBe(0);

    i.add("Low Psg");
    expect(i.convertPassges()).toBe(900);

    i.add("Low Psg");
    i.add("Low Psg");
    expect(i.convertPassges()).toBe(1800);

    i.add("Mid Psg");
    expect(i.convertPassges()).toBe(7200);

    i.add("Mid Psg");
    i.add("Low Psg");
    expect(i.convertPassges()).toBe(8100);

    i.add("High Psg");
    expect(i.convertPassges()).toBe(9000);

    i.add("High Psg");
    i.add("Mid Psg");
    i.add("Low Psg");
    expect(i.convertPassges()).toBe(17100);
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
