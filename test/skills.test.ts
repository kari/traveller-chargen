import { expect, test } from "vitest";
import { Skills } from "../src/skills";

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
