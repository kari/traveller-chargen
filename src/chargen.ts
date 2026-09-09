import type { Character } from "./character";
import { generateCharacter, weaponSkills } from "./character";
import { DomView } from "./dom";
import { ImperialDate } from "./imperial_date";
import { ehex } from "./utils";

console.log("Traveller Chargen");

function resetSheets() {
    const view = new DomView(document);
    // note this only clears optional fields, not full sheet
    view.toggleClass("tas-form-2", "deceased", false);
    view.toggleClass("tas-form-2-reverse", "deceased", false);
    view.hidden("tas-form-3", true);

    const boxes = [
        "box-4",
        "box-5",
        "box-13",
        "box-14b",
        "box-17",
        "box-18a",
        "box-18b",
        "box-18c",
        "box-19a",
        "box-19b",
        "box-19c",
        "box-26",
        "box-27",
        "box-28",
        "s-box-20",
    ];
    for (const box of boxes) {
        view.clear(box);
    }

    const checkboxes = [
        "retired-yes",
        "retired-no",
        "tas-no",
        "tas-yes",
        "std-hull-yes",
        "std-hull-no",
        "streamlined-yes",
        "streamlined-no",
    ];
    for (const box of checkboxes) {
        view.checked(box, false);
    }
}

function rollCharacter(): Character {
    const c = generateCharacter();
    const view = new DomView(document);
    const today = new ImperialDate();

    if (c.dead) {
        view.toggleClass("tas-form-2", "deceased", true);
        view.toggleClass("tas-form-2-reverse", "deceased", true);
    }

    view.text("box-1", today.toString());
    view.data("seed", "seed", c.random.seed.toString());

    view.text("box-2", c.name.toString(false));
    view.text("box-25", c.name.toString(false));

    view.text("strength", ehex(c.attributes.strength));
    view.text("dexterity", ehex(c.attributes.dexterity));
    view.text("endurance", ehex(c.attributes.endurance));
    view.text("intelligence", ehex(c.attributes.intelligence));
    view.text("education", ehex(c.attributes.education));
    view.text("social-standing", ehex(c.attributes.socialStanding));

    if (c.name.title) {
        view.text("box-4", c.name.title);
    }

    if (c.career.military && c.career.ranks) {
        view.text("box-5", c.career.ranks[c.rank] ?? "");
    }

    view.text("box-6", c.birthDate.toString());
    view.text("box-8", c.birthworld.name);
    view.text("box-9", c.career.name);

    // NOTE: box-10 (Branch) not in Books 1-3

    view.text("box-11", c.dischargeworld.name);
    view.text("box-12", c.terms.toString());

    if (c.career.ranks) {
        view.text("box-13", c.career.ranks[c.rank] ?? "");
    }

    if (c.retired) {
        view.checked("retired-yes", true);
        if (c.career.retirementPay) {
            view.text(
                "box-14b",
                `Cr${new Intl.NumberFormat().format(c.retirementPay)}`,
            );
        }
    } else {
        view.checked("retired-no", true);
    }

    // ADD: box-15 (Special Assignments)
    // ADD: box-16 (Awards and Decorations)

    // identify weapons & devices qualified on
    const equipmentSkills: string[] = c.skills.filter(
        weaponSkills.gun.concat(weaponSkills.blade),
    );
    const additionalSkills: string[] = c.skills.list.filter(
        (x) => !equipmentSkills.includes(x),
    );
    view.text("box-17", c.skills.toString(equipmentSkills));

    if (Object.keys(additionalSkills).length > 0) {
        const sortedSkills = c.skills.sorted(additionalSkills);

        view.text("box-18a", c.skills.toString(sortedSkills[0]));
        if (sortedSkills.length > 1) {
            view.text("box-18b", c.skills.toString(sortedSkills[1]));
        }
        if (sortedSkills.length > 2) {
            view.text("box-18c", c.skills.toString(sortedSkills.slice(2)));
        }
    }

    function preferredWeapon(type: string): string | null {
        const skills: string[] = c.skills.sorted(weaponSkills[type]);
        if (skills.length > 0) {
            return skills[0];
        }

        return null;
    }

    // box-19a-c identify preferred weapons
    // a weapon
    const preferredRifle = preferredWeapon("weapon");
    if (preferredRifle) {
        view.text("box-19a", preferredRifle);
    }

    // b pistol
    const preferredPistol = preferredWeapon("pistol");
    if (preferredPistol) {
        view.text("box-19b", preferredPistol);
    }

    // c blade
    const preferredBlade = preferredWeapon("blade");
    if (preferredBlade) {
        view.text("box-19c", preferredBlade);
    }

    if (c.items.hasTravellers) {
        view.checked("tas-yes", true);
    } else {
        view.checked("tas-no", true);
    }

    if (c.credits > 0) {
        view.text("box-26", `Cr${new Intl.NumberFormat().format(c.credits)}`);
    }

    view.text("box-27", c.items.toString());

    if (c.ship) {
        view.hidden("tas-form-3", false);

        view.text("s-box-1", today.toString());
        view.text("s-box-2", c.ship.name || "");
        // 3: Registration number

        view.text("s-box-4", c.ship.type);
        // 5: Builder
        // 6: Homeworld
        // 7: Laid Down
        // 8: First Flight

        view.text(
            "s-box-9",
            `MCr${new Intl.NumberFormat().format(c.ship.cost)}`,
        );
        // 10: Occupation

        view.text("s-box-11a", new Intl.NumberFormat().format(c.ship.tonnage));

        if (c.ship.hullStandard) {
            view.checked("std-hull-yes", true);
        } else {
            view.checked("std-hull-no", true);
        }

        if (c.ship.streamlined) {
            view.checked("streamlined-yes", true);
        } else {
            view.checked("streamlined-no", true);
        }

        // 11c. Max Atmosphere

        view.text("s-box-12", `${c.ship.acceleration}-G`);
        view.text("s-box-13", c.ship.jump.toString());
        view.text("s-box-14", c.ship.powerPlant);
        view.text("s-box-15", c.ship.cargoCapacity.toString());
        view.text("s-box-16", c.ship.staterooms.toString());
        view.text("s-box-17", c.ship.lowBerths.toString());
        view.text("s-box-19", c.ship.minCrew.toString());
        view.text("s-box-20", c.ship.vehicles.join(", "));
        view.text("s-box-22", c.name.toString());

        // FIXME: Reverse side of TAS Form 3 (Computer, turrets, ...)
    }

    return c;
}

if (typeof window === "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _c = generateCharacter();
} else {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    document.getElementById("reroll")?.addEventListener("click", (_event) => {
        resetSheets();
        rollCharacter();
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    document
        .getElementById("roll-ship")
        ?.addEventListener("click", (_event) => {
            let c: Character;
            do {
                resetSheets();
                c = rollCharacter();
            } while (!c.ship);
        });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    window.addEventListener("load", (_event) => {
        rollCharacter(); // FIXME: preferably roll an alive character
    });
}
