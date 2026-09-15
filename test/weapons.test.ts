import { expect, test } from "vitest";
import { Character } from "../src/character";
import type { SkillName } from "../src/domain_types";
import { Items } from "../src/items";
import { Random } from "../src/random";
import { Skills } from "../src/skills";
import {
    chooseVehicleSkill,
    chooseWeaponItem,
    chooseWeaponSkill,
    resolveSkill,
    vehicleSkills,
    weaponPreferences,
    weaponSkills,
    weaponStrRequirements,
} from "../src/weapons";

/** Reads a single skill's level; null when the skill is unknown. */
function levelOf(skills: Skills, skill: SkillName): number | null {
    const value = Number(skills.toString(skill).split("-").at(-1));
    return Number.isNaN(value) ? null : value;
}

function skillLevels(skills: Skills): Map<SkillName, number> {
    const levels = new Map<SkillName, number>();
    for (const skill of skills.list) {
        levels.set(skill, levelOf(skills, skill) ?? 0);
    }
    return levels;
}

// --- weaponStrRequirements ---

test("weaponStrRequirements returns bonus and penalty thresholds", () => {
    expect(weaponStrRequirements("Sword")).toEqual([10, 5]);
});

test("weaponStrRequirements throws for non-weapon skills", () => {
    expect(() => weaponStrRequirements("Gambling")).toThrow(RangeError);
});

// --- weaponPreferences ---

test("weaponPreferences avoids all blades at low strength", () => {
    const prefs = weaponPreferences("blade", 3, new Skills(), new Items());
    expect(prefs.avoid).toEqual(weaponSkills.blade);
    expect(prefs.prefer).toEqual([]);
    expect(prefs.known).toEqual([]);
    expect(prefs.owned).toEqual([]);
});

test("weaponPreferences prefers all blades at high strength", () => {
    const prefs = weaponPreferences("blade", 12, new Skills(), new Items());
    expect(prefs.prefer).toEqual(weaponSkills.blade);
    expect(prefs.avoid).toEqual([]);
});

test("weaponPreferences lists known weapon skills and owned weapons", () => {
    const skills = new Skills();
    skills.increase("Sword");
    skills.increase("Gambling"); // not a weapon skill
    const items = new Items();
    items.add("Dagger");
    items.add("Low Psg"); // not a weapon
    const prefs = weaponPreferences("blade", 12, skills, items);
    expect(prefs.known).toEqual(["Sword"]);
    expect(prefs.owned).toEqual(["Dagger"]);
});

// --- chooseWeaponSkill ---
// STR tables used to force branches: Sword 10/5, Foil 10/4, Dagger 8/3,
// Cutlass 11/6, Broadsword 12/7, Halberd 10/5, Pike 10/6.

test("chooseWeaponSkill increases a known preferred weapon", () => {
    const skills = new Skills();
    skills.increase("Sword"); // STR 10/5: preferred and proficient at strength 12
    const random = new Random(42);
    expect(chooseWeaponSkill("blade", 12, skills, new Items(), random)).toBe(
        "Sword",
    );
});

test("chooseWeaponSkill increases a known proficient weapon when it is not preferred", () => {
    const skills = new Skills();
    skills.increase("Foil"); // STR 10/4: not preferred at strength 9, not avoided
    const random = new Random(42);
    expect(chooseWeaponSkill("blade", 9, skills, new Items(), random)).toBe(
        "Foil",
    );
});

test("chooseWeaponSkill picks a preferred weapon when none are known", () => {
    const random = new Random(42);
    const weapon = chooseWeaponSkill(
        "blade",
        12,
        new Skills(),
        new Items(),
        random,
    );
    expect(weaponSkills.blade).toContain(weapon);
});

test("chooseWeaponSkill picks a proficient weapon when nothing is preferred", () => {
    // strength 5: prefers nothing (all bonuses >= 8), avoids Sword/Cutlass/
    // Broadsword/Halberd/Pike (penalties >= 5)
    const avoided: SkillName[] = [
        "Sword",
        "Cutlass",
        "Broadsword",
        "Halberd",
        "Pike",
    ];
    const random = new Random(42);
    const weapon = chooseWeaponSkill(
        "blade",
        5,
        new Skills(),
        new Items(),
        random,
    );
    expect(weaponSkills.blade).toContain(weapon);
    expect(avoided).not.toContain(weapon);
});

test("chooseWeaponSkill falls back to any weapon when all are avoided", () => {
    // strength 3 avoids every blade (lowest penalty is Dagger 3)
    const random = new Random(42);
    const weapon = chooseWeaponSkill(
        "blade",
        3,
        new Skills(),
        new Items(),
        random,
    );
    expect(weaponSkills.blade).toContain(weapon);
});

// --- chooseVehicleSkill ---

test("chooseVehicleSkill returns a known vehicle skill when one exists", () => {
    const skills = new Skills();
    skills.increase("Grav Belt");
    const random = new Random(42);
    expect(chooseVehicleSkill(skills, random)).toBe("Grav Belt");
});

test("chooseVehicleSkill picks from all vehicle skills when none are known", () => {
    const random = new Random(42);
    const skill = chooseVehicleSkill(new Skills(), random);
    expect(vehicleSkills).toContain(skill);
});

// --- chooseWeaponItem ---
// NOTE: the fourth branch (proficient, known, not owned, after preferred ones
// are exhausted) is unreachable: its candidate set (known - avoid - owned) is
// identical to the second branch's. Not testable; candidate for removal.

test("chooseWeaponItem returns a skilled preferred weapon that is not owned", () => {
    const skills = new Skills();
    skills.increase("Sword");
    const items = new Items();
    const random = new Random(42);
    expect(chooseWeaponItem("blade", 12, skills, items, random)).toEqual({
        item: "Sword",
        hasSkill: true,
    });
});

test("chooseWeaponItem returns a skilled proficient weapon that is not owned", () => {
    const skills = new Skills();
    skills.increase("Foil");
    const random = new Random(42);
    expect(chooseWeaponItem("blade", 9, skills, new Items(), random)).toEqual({
        item: "Foil",
        hasSkill: true,
    });
});

test("chooseWeaponItem returns an unskilled preferred weapon when nothing is known", () => {
    const items = new Items();
    const random = new Random(42);
    const choice = chooseWeaponItem("blade", 12, new Skills(), items, random);
    expect(choice.hasSkill).toBe(false);
    expect(weaponSkills.blade).toContain(choice.item);
    expect(items.list).not.toContain(choice.item);
});

test("chooseWeaponItem never returns an owned weapon", () => {
    const items = new Items();
    for (const owned of [
        "Sword",
        "Cutlass",
        "Broadsword",
        "Halberd",
        "Pike",
    ] as const) {
        items.add(owned);
    }
    const random = new Random(42);
    const choice = chooseWeaponItem("blade", 5, new Skills(), items, random);
    expect(choice.hasSkill).toBe(false);
    const remaining: SkillName[] = [
        "Dagger",
        "Blade",
        "Foil",
        "Bayonet",
        "Spear",
        "Cudgel",
    ];
    expect(remaining).toContain(choice.item);
    expect(items.list).not.toContain(choice.item);
});

test("chooseWeaponItem throws when every weapon of the type is already owned", () => {
    const items = new Items();
    for (const owned of weaponSkills.blade) {
        items.add(owned);
    }
    const random = new Random(42);
    expect(() =>
        chooseWeaponItem("blade", 12, new Skills(), items, random),
    ).toThrow(RangeError);
});

// --- resolveSkill ---

test("resolveSkill returns concrete skills unchanged without consuming randomness", () => {
    const random = new Random(42);
    expect(
        resolveSkill("Gambling", 12, new Skills(), new Items(), random),
    ).toBe("Gambling");
    const expected = new Random(42).integer(1, 6);
    expect(random.integer(1, 6)).toBe(expected);
});

test("resolveSkill dispatches Blade Cbt to a blade weapon skill", () => {
    const random = new Random(42);
    const skill = resolveSkill(
        "Blade Cbt",
        12,
        new Skills(),
        new Items(),
        random,
    );
    expect(weaponSkills.blade).toContain(skill);
});

test("resolveSkill dispatches Gun Cbt to a gun weapon skill", () => {
    const random = new Random(42);
    const skill = resolveSkill(
        "Gun Cbt",
        12,
        new Skills(),
        new Items(),
        random,
    );
    expect(weaponSkills.gun).toContain(skill);
});

test("resolveSkill dispatches Vehicle to a vehicle skill", () => {
    const random = new Random(42);
    const skill = resolveSkill("Vehicle", 7, new Skills(), new Items(), random);
    expect(vehicleSkills).toContain(skill);
});

// --- integration through the Character facade ---

test("Character.addSkill increases exactly one weapon skill by one level", () => {
    const c = new Character(new Random(12345));
    const before = skillLevels(c.skills);
    c.addSkill("Gun Cbt");
    const after = skillLevels(c.skills);
    const changed = weaponSkills.gun.filter(
        (name) => (after.get(name) ?? 0) !== (before.get(name) ?? 0),
    );
    // regression guard: the old addWeaponSkill fall-through granted two skills
    expect(changed).toHaveLength(1);
    const picked = changed[0] as SkillName;
    expect((after.get(picked) ?? 0) - (before.get(picked) ?? 0)).toBe(1);
});

test("Character.addWeapon grants exactly one new weapon, learning it at level 0 if unknown", () => {
    const c = new Character(new Random(12345));
    const before = skillLevels(c.skills);
    const itemsBefore = c.items.list;
    c.addWeapon("blade");
    const newWeapons = c.items.list.filter((x) => !itemsBefore.includes(x));
    expect(newWeapons).toHaveLength(1);
    const weapon = newWeapons[0] as SkillName;
    expect(weaponSkills.blade).toContain(weapon);
    if ((before.get(weapon) ?? 0) > 0) {
        // already skilled: level is unchanged
        expect(levelOf(c.skills, weapon)).toBe(before.get(weapon));
    } else {
        // unskilled: learned at level 0
        expect(levelOf(c.skills, weapon)).toBe(0);
    }
});

// --- determinism ---

test("weapon selection is deterministic for the same seed and state", () => {
    const run = () => {
        const skills = new Skills();
        const items = new Items();
        const random = new Random(42);
        return {
            skill: chooseWeaponSkill("blade", 12, skills, items, random),
            item: chooseWeaponItem("gun", 9, skills, items, random),
            resolved: resolveSkill("Vehicle", 7, skills, items, random),
        };
    };
    expect(run()).toEqual(run());
});
