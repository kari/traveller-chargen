import type { ItemName } from "./domain_types";
import type { Random } from "./random";
import { type Skills, weaponSkills } from "./skills";

export class Items {
    private items: Partial<Record<ItemName, number>> = {};

    toString(): string {
        return Object.keys(this.items)
            .map((i) => `${this.items[i as ItemName] ?? 0} ${i}`)
            .join(", ");
    }

    get list(): ItemName[] {
        return Object.keys(this.items) as ItemName[];
    }

    convertPassages(): number {
        const passagePrices: Record<
            Extract<ItemName, "Low Psg" | "Mid Psg" | "High Psg">,
            number
        > = {
            "Low Psg": 1_000,
            "Mid Psg": 8_000,
            "High Psg": 10_000,
        };
        const passages = this.list.filter((x) =>
            Object.keys(passagePrices).includes(x),
        );
        let credits = 0;

        for (const p of passages) {
            console.debug(`Converted ${this.items[p]} ${p} to credits`);
            const price = passagePrices[p as keyof typeof passagePrices];
            const quantity = this.items[p];
            if (price !== undefined && quantity !== undefined) {
                credits += (price * quantity * 9) / 10;
            }
            delete this.items[p]; // FIXME: rebuild map instead
        }

        return credits;
    }

    add(item: ItemName) {
        console.debug(`Character earned item ${item}`);
        if (this.list.includes(item) && item !== "Travellers'") {
            this.items[item] = (this.items[item] ?? 0) + 1;
        } else {
            this.items[item] = 1;
        }
    }

    addWeapon(
        type: "blade" | "gun",
        strength: number,
        skills: Skills,
        random: Random,
    ) {
        // Note: will never pick a weapon twice
        const prefs = skills.weaponPreferences(type, strength, this);

        const preferAndKnown = prefs.known.filter((x) =>
            prefs.prefer.includes(x),
        );
        const preferAndKnownAndNotOwned = preferAndKnown.filter(
            (x) => !prefs.owned.includes(x),
        );

        if (preferAndKnownAndNotOwned.length > 0) {
            this.add(random.pick(preferAndKnownAndNotOwned)); // add a weapon that is preferred and skilled but not owned

            return;
        }
        const proficientAndKnown = prefs.known.filter(
            (x) => !prefs.avoid.includes(x),
        );
        const proficientAndKnownAndNotOwned = proficientAndKnown.filter(
            (x) => !prefs.owned.includes(x),
        );
        if (proficientAndKnownAndNotOwned.length > 0) {
            this.add(random.pick(proficientAndKnownAndNotOwned)); // add a weapon that doesn't incur STR penalty and skilled but not owned

            return;
        }

        // no known good weapons, pick a preferred or proficient weapon
        const preferAndNotOwned = prefs.prefer.filter(
            (x) => !prefs.owned.includes(x),
        );
        if (preferAndNotOwned.length > 0) {
            const randomWeapon = random.pick(preferAndNotOwned);
            this.add(randomWeapon);
            skills.addZeroSkill(randomWeapon);

            return;
        }
        const proficientAndNotOwned = prefs.known.filter(
            (x) => !prefs.avoid.includes(x) && !prefs.owned.includes(x),
        );
        if (proficientAndNotOwned.length > 0) {
            const randomWeapon = random.pick(proficientAndNotOwned);
            this.add(randomWeapon);
            skills.addZeroSkill(randomWeapon);

            return;
        }
        // give a random weapon not owned
        const randomWeapon = random.pick(
            weaponSkills[type].filter((x) => !prefs.owned.includes(x)),
        );
        this.add(randomWeapon);
        skills.addZeroSkill(randomWeapon);

        return;
    }

    get hasTravellers(): boolean {
        if (this.list.includes("Travellers'")) {
            return true;
        }
        return false;
    }
}
