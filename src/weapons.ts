import type { SkillName } from "./domain_types";
import type { Items } from "./items";
import type { Random } from "./random";
import type { Skills } from "./skills";

export type WeaponCategory = "blade" | "pistol" | "weapon" | "gun";

const bladeSkills: readonly SkillName[] = [
    "Dagger",
    "Blade",
    "Foil",
    "Sword",
    "Cutlass",
    "Broadsword",
    "Bayonet",
    "Spear",
    "Halberd",
    "Pike",
    "Cudgel",
];

const longGunSkills: readonly SkillName[] = [
    "Carbine",
    "Rifle",
    "Auto Rifle",
    "Shotgun",
    "SMG",
    "Laser Carbine",
    "Laser Rifle",
];

const pistolSkills: readonly SkillName[] = [
    "Body Pistol",
    "Auto Pistol",
    "Revolver",
];

export const weaponSkills: Record<WeaponCategory, readonly SkillName[]> = {
    blade: bladeSkills,
    weapon: longGunSkills,
    pistol: pistolSkills,
    gun: [...longGunSkills, ...pistolSkills],
};

export const vehicleSkills: readonly SkillName[] = [
    "Ground Car",
    "Watercraft",
    "Winged Craft",
    "Hovercraft",
    "Grav Belt",
];

export interface WeaponPreferences {
    avoid: SkillName[];
    prefer: SkillName[];
    known: SkillName[];
    owned: SkillName[];
}

export function weaponPreferences(
    type: "blade" | "gun",
    strength: number,
    skills: Skills,
    items: Items,
): WeaponPreferences {
    const avoid: SkillName[] = [];
    const weapons = weaponSkills[type];

    // FIXME: convert for loops into filters
    for (const w of weapons) {
        const [, penalty] = weaponStrRequirements(w);
        if (strength <= penalty) {
            avoid.push(w);
        }
    }
    const prefer: SkillName[] = [];
    for (const w of weapons) {
        const [bonus] = weaponStrRequirements(w);
        if (strength >= bonus) {
            prefer.push(w);
        }
    }
    const known: SkillName[] = [];
    for (const skill of skills.list) {
        if (weapons.includes(skill)) {
            known.push(skill);
        }
    }
    const owned: SkillName[] = [];
    for (const w of weapons) {
        if (items.list.includes(w)) {
            owned.push(w);
        }
    }
    // console.group();
    // console.debug(`Avoid: ${avoid.join(", ")}`);
    // console.debug(`Prefer: ${prefer.join(", ")}`);
    // console.debug(`Known: ${known.join(", ")}`);
    // console.debug(`Owned: ${owned.join(", ")}`);
    // console.groupEnd();

    return { avoid: avoid, prefer: prefer, known: known, owned: owned };
}

export function chooseWeaponSkill(
    type: "blade" | "gun",
    strength: number,
    skills: Skills,
    items: Items,
    random: Random,
): SkillName {
    const prefs = weaponPreferences(type, strength, skills, items);

    // FIXME: will always increase skill in known (good) skills, and doesn't allow for range of skills
    // probably shouldn't level skill above -3
    if (prefs.known.length > 0) {
        const knownAndPrefer = prefs.known.filter((x) =>
            prefs.prefer.includes(x),
        );
        if (knownAndPrefer.length > 0) {
            // increase skill in a random preferred and known weapon
            return random.pick(knownAndPrefer);
        }
        const knownAndProficient = prefs.known.filter(
            (x) => !prefs.avoid.includes(x),
        );
        if (knownAndProficient.length > 0) {
            // increase skill in a random weapon that doesn't incur STR penalty
            return random.pick(knownAndProficient);
        }
        // else know only weapons that incur penalty, fall through
    }
    // player either knowns no weapon skills or all known incur penalty
    if (prefs.prefer.length > 0) {
        // get random skill in a preferred weapon
        return random.pick(prefs.prefer);
    } else {
        const proficient = weaponSkills[type].filter(
            (x) => !prefs.avoid.includes(x),
        );
        if (proficient.length > 0) {
            // get random skill in a random weapon that doesn't incur STR penalty
            return random.pick(proficient);
        }
    }
    return random.pick(weaponSkills[type]); // pick random weapon, even if use incurs STR penalty
    // FIXME: choose the one(s) with lowest STR requirement!
}

export function chooseVehicleSkill(skills: Skills, random: Random): SkillName {
    // FIXME: Currently first chooses a random skill and then only ever improves that one.
    const known: SkillName[] = [];
    for (const skill of skills.list) {
        if (vehicleSkills.includes(skill)) {
            known.push(skill);
        }
    }
    // FIXME: don't level a single skill above 2-3
    if (known.length > 0) {
        return random.pick(known);
    } else {
        return random.pick(vehicleSkills);
    }
}

// NOTE: might not need hasSkill if receiving function checks for skill?
export function chooseWeaponItem(
    type: "blade" | "gun",
    strength: number,
    skills: Skills,
    items: Items,
    random: Random,
): { item: SkillName; hasSkill: boolean } {
    // Note: will never pick a weapon twice
    const prefs = weaponPreferences(type, strength, skills, items);

    const preferAndKnown = prefs.known.filter((x) => prefs.prefer.includes(x));
    const preferAndKnownAndNotOwned = preferAndKnown.filter(
        (x) => !prefs.owned.includes(x),
    );

    if (preferAndKnownAndNotOwned.length > 0) {
        // add a weapon that is preferred and skilled but not owned
        return { item: random.pick(preferAndKnownAndNotOwned), hasSkill: true };
    }
    const proficientAndKnown = prefs.known.filter(
        (x) => !prefs.avoid.includes(x),
    );
    const proficientAndKnownAndNotOwned = proficientAndKnown.filter(
        (x) => !prefs.owned.includes(x),
    );
    if (proficientAndKnownAndNotOwned.length > 0) {
        // add a weapon that doesn't incur STR penalty and skilled but not owned
        return {
            item: random.pick(proficientAndKnownAndNotOwned),
            hasSkill: true,
        };
    }

    // no known good weapons, pick a preferred or proficient weapon
    const preferAndNotOwned = prefs.prefer.filter(
        (x) => !prefs.owned.includes(x),
    );
    if (preferAndNotOwned.length > 0) {
        return { item: random.pick(preferAndNotOwned), hasSkill: false };
    }
    const proficientAndNotOwned = prefs.known.filter(
        (x) => !prefs.avoid.includes(x) && !prefs.owned.includes(x),
    );
    if (proficientAndNotOwned.length > 0) {
        return { item: random.pick(proficientAndNotOwned), hasSkill: false };
    }
    // give a random weapon not owned
    const randomWeapon = random.pick(
        weaponSkills[type].filter((x) => !prefs.owned.includes(x)),
    );
    return { item: randomWeapon, hasSkill: false };
}

export function resolveSkill(
    skill: SkillName,
    strength: number,
    skills: Skills,
    items: Items,
    random: Random,
): SkillName {
    switch (skill) {
        case "Blade Cbt":
            return chooseWeaponSkill("blade", strength, skills, items, random);
        case "Gun Cbt":
            return chooseWeaponSkill("gun", strength, skills, items, random);
        case "Vehicle":
            return chooseVehicleSkill(skills, random);
        default:
            return skill;
    }
}

const weaponStrDM: Partial<
    Record<SkillName, [bonus: number, penalty: number] | undefined>
> = {
    Dagger: [8, 3],
    Blade: [9, 4],
    Foil: [10, 4],
    Sword: [10, 5],
    Cutlass: [11, 6],
    Broadsword: [12, 7],
    Bayonet: [9, 4],
    Spear: [9, 4],
    Halberd: [10, 5],
    Pike: [10, 6],
    Cudgel: [8, 4],
    "Body Pistol": [11, 7],
    "Auto Pistol": [10, 6],
    Revolver: [9, 6],
    Carbine: [9, 4],
    Rifle: [8, 5],
    "Auto Rifle": [10, 6],
    Shotgun: [9, 3],
    SMG: [9, 5],
    "Laser Carbine": [10, 5],
    "Laser Rifle": [11, 6],
};

export function weaponStrRequirements(
    weapon: SkillName,
): [bonus: number, penalty: number] {
    const requirements = weaponStrDM[weapon];
    if (requirements === undefined) {
        throw new RangeError(
            `No STR requirements defined for weapon: ${weapon}`,
        );
    }
    return requirements;
}
