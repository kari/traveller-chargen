import type { Items } from "./items";
import type { Random } from "./random";
import type { Skills, SkillName } from "./skills";

/**
 * Weapon skill groupings. "weapon" means long guns; "gun" is the union of
 * long guns and pistols (Book 1 "Gun Cbt" covers both).
 */
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

/** Vehicle skills granted by the "Vehicle" pseudo-skill table entry. */
export const vehicleSkills: readonly SkillName[] = [
    "Ground Car",
    "Watercraft",
    "Winged Craft",
    "Hovercraft",
    "Grav Belt",
];

/**
 * How a character's strength and experience relate to a weapon group:
 * weapons too heavy to use well, weapons light enough to prefer, weapons
 * already known, and weapons already owned.
 */
export interface WeaponPreferences {
    avoid: SkillName[];
    prefer: SkillName[];
    known: SkillName[];
    owned: SkillName[];
}

/**
 * Classifies each weapon in the group by usability (from STR requirements)
 * and familiarity (known skills, owned items).
 */
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
        if (items.has(w)) {
            owned.push(w);
        }
    }

    return { avoid: avoid, prefer: prefer, known: known, owned: owned };
}

/**
 * Picks which weapon skill a training roll improves: known preferred
 * weapons first, then known usable ones, then unknown preferred or usable
 * weapons, falling back to any weapon in the group. Returns exactly one skill.
 */
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

/**
 * Picks a vehicle skill: a known one when the character has any, otherwise
 * a random vehicle skill.
 */
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
/**
 * Picks which weapon a benefit grants, preferring skilled usable weapons
 * the character doesn't own yet. Never picks a weapon twice (throws when
 * every weapon in the group is already owned). hasSkill tells the caller
 * whether the skill is already known, so it can add it at level 0 if not.
 */
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

/**
 * Resolves pseudo-skills from career tables ("Blade Cbt", "Gun Cbt",
 * "Vehicle") to concrete skills; concrete skills pass through unchanged.
 */
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

const weaponStrDM: Partial<Record<SkillName, [number, number]>> = {
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

/**
 * STR thresholds for a weapon as [bonus, penalty]: strength at or above
 * bonus makes it a preferred weapon, at or below penalty incurs the
 * Book 1 -1 to hit. Throws for non-weapon skills.
 */
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
