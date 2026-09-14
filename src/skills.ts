import type { ItemName, SkillName, WeaponCategory } from "./domain_types";
import type { Items } from "./items";
import type { Random } from "./random";

export class Skills {
    private skills: Partial<Record<SkillName, number>> = {};

    get list(): SkillName[] {
        return Object.keys(this.skills) as SkillName[];
    }

    filter(subset: readonly SkillName[]): SkillName[] {
        return this.list.filter((s) => subset.includes(s));
    }

    // FIXME: no sorting
    toString(subset?: readonly SkillName[] | SkillName): string {
        if (subset === undefined) {
            return this.list.map((s) => `${s}-${this.skills[s]}`).join(", ");
        }
        if (typeof subset === "string") {
            return `${subset}-${this.skills[subset]}`;
        }
        return this.list
            .filter((s) => subset.includes(s))
            .map((s) => `${s}-${this.skills[s]}`)
            .join(", ");
    }

    // sorts by skill value (descending)
    // FIXME: should return 0 for equal
    // FIXME: mutates array before returning!
    // FIXME: sort secondarily by name
    sorted(subset?: readonly SkillName[]): SkillName[] {
        if (subset === undefined) {
            return this.list.sort((a, b) =>
                (this.skills[a] ?? 0) < (this.skills[b] ?? 0) ? 1 : -1,
            );
        }
        return this.list
            .filter((s) => subset.includes(s))
            .sort((a, b) =>
                (this.skills[a] ?? 0) < (this.skills[b] ?? 0) ? 1 : -1,
            );
    }

    addZeroSkill(skill: SkillName) {
        if (this.list.includes(skill)) {
            console.warn(
                `Skill already exists at level ${skill}-${this.skills[skill]}`,
            );
        }
        this.increase(skill, 0);
    }

    increase(skill: SkillName, by = 1) {
        if (this.list.includes(skill)) {
            this.skills[skill] = (this.skills[skill] ?? 0) + by;
        } else {
            this.skills[skill] = by;
        }
        console.debug(`Character earned skill ${skill}-${this.skills[skill]}`);
    }

    addSkill(skill: SkillName, strength: number, items: Items, random: Random) {
        if (skill === "Blade Cbt") {
            this.addWeaponSkill("blade", strength, items, random);
            return;
        }
        if (skill === "Gun Cbt") {
            this.addWeaponSkill("gun", strength, items, random);
            return;
        }
        if (skill === "Vehicle") {
            this.addVehicleSkill(random, strength, items);
            return;
        }

        this.increase(skill);
    }

    addVehicleSkill(random: Random, strength: number, items: Items) {
        // FIXME: Currently first chooses a random skill and then only ever improves that one.
        const known: SkillName[] = [];
        for (const skill of this.list) {
            if (vehicleSkills.includes(skill)) {
                known.push(skill);
            }
        }
        // FIXME: don't level a single skill above 2-3
        if (known.length > 0) {
            this.addSkill(random.pick(known), strength, items, random);
        } else {
            this.addSkill(random.pick(vehicleSkills), strength, items, random);
        }
    }

    addWeaponSkill(
        type: "blade" | "gun",
        strength: number,
        items: Items,
        random: Random,
    ) {
        const prefs = this.weaponPreferences(type, strength, items);

        // FIXME: will always increase skill in known (good) skills, and doesn't allow for range of skills
        // probably shouldn't level skill above -3
        if (prefs.known.length > 0) {
            const knownAndPrefer = prefs.known.filter((x) =>
                prefs.prefer.includes(x),
            );
            if (knownAndPrefer.length > 0) {
                this.addSkill(
                    random.pick(knownAndPrefer),
                    strength,
                    items,
                    random,
                ); // increase skill in a random preferred and known weapon
                return;
            }
            const knownAndProficient = prefs.known.filter(
                (x) => !prefs.avoid.includes(x),
            );
            if (knownAndProficient.length > 0) {
                this.addSkill(
                    random.pick(knownAndProficient),
                    strength,
                    items,
                    random,
                ); // increase skill in a random weapon that doesn't incur STR penalty
                return;
            } // know only weapons that incur penalty, fall through
        }
        // player either knowns no weapon skills or all known incur penalty
        if (prefs.prefer.length > 0) {
            this.addSkill(random.pick(prefs.prefer), strength, items, random); // get random skill in a preferred weapon
            return;
        } else {
            const proficient = weaponSkills[type].filter(
                (x) => !prefs.avoid.includes(x),
            );
            if (proficient.length > 0) {
                this.addSkill(random.pick(proficient), strength, items, random); // get random skill in a random weapon that doesn't incur STR penalty
                return;
            }
        }
        this.addSkill(random.pick(weaponSkills[type]), strength, items, random); // pick random weapon, even if use incurs STR penalty
        // FIXME: choose the one(s) with lowest STR requirement!
    }

    weaponPreferences(type: "blade" | "gun", strength: number, items: Items) {
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
        for (const skill of this.list) {
            if (weapons.includes(skill)) {
                known.push(skill);
            }
        }
        const owned: ItemName[] = [];
        for (const w of weapons) {
            if (items.list.includes(w)) {
                owned.push(w);
            }
        }
        console.group();
        console.debug(`Avoid: ${avoid.join(", ")}`);
        console.debug(`Prefer: ${prefer.join(", ")}`);
        console.debug(`Known: ${known.join(", ")}`);
        console.debug(`Owned: ${owned.join(", ")}`);
        console.groupEnd();

        return { avoid: avoid, prefer: prefer, known: known, owned: owned };
    }
}

export const weaponSkills: Record<WeaponCategory, SkillName[]> = {
    blade: [
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
    ],
    weapon: [
        "Carbine",
        "Rifle",
        "Auto Rifle",
        "Shotgun",
        "SMG",
        "Laser Carbine",
        "Laser Rifle",
    ],
    pistol: ["Body Pistol", "Auto Pistol", "Revolver"],
    gun: [],
};
weaponSkills.gun = weaponSkills.weapon.concat(weaponSkills.pistol);

const vehicleSkills: SkillName[] = [
    "Ground Car",
    "Watercraft",
    "Winged Craft",
    "Hovercraft",
    "Grav Belt",
];

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
