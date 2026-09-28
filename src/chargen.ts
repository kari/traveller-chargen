// Traveller Character Generator: fills TAS Form 2 (+ Form 3 for ships) in the browser, prints history on the CLI.

import type { Character } from "./character";
import { generateCharacter } from "./character";
import { DomView } from "./dom";
import { ImperialDate } from "./imperial_date";
import type { SkillName } from "./skills";
import { loadShipNames } from "./ships";
import { ehex, numberFormat } from "./utils";
import { weaponSkills } from "./weapons";

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

/** Fills the weapons-qualification and skill boxes of TAS Form 2. */
function renderSkills(c: Character, view: DomView): void {
    // identify weapons & devices qualified on
    const equipmentSkills: SkillName[] = c.skills.filter(
        weaponSkills.gun.concat(weaponSkills.blade),
    );
    const additionalSkills: SkillName[] = c.skills.list.filter(
        (x) => !equipmentSkills.includes(x),
    );
    view.text("box-17", c.skills.toString(equipmentSkills));

    if (additionalSkills.length > 0) {
        const sortedSkills = c.skills.sorted(additionalSkills);

        view.text("box-18a", c.skills.toString(sortedSkills[0]));
        if (sortedSkills.length > 1) {
            view.text("box-18b", c.skills.toString(sortedSkills[1]));
        }
        if (sortedSkills.length > 2) {
            view.text("box-18c", c.skills.toString(sortedSkills.slice(2)));
        }
    }

    function preferredWeapon(
        type: "weapon" | "pistol" | "blade",
    ): SkillName | null {
        const skills: SkillName[] = c.skills.sorted(weaponSkills[type]);
        if (skills.length > 0) {
            const skill = skills[0];
            if (skill === undefined) throw new RangeError(`Skill out of range`);
            return skill;
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
}

/** Fills TAS Form 2: personal data, career, skills and benefits. */
function renderFormTwo(c: Character, view: DomView, today: ImperialDate): void {
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
            view.text("box-14b", `Cr${numberFormat.format(c.retirementPay)}`);
        }
    } else {
        view.checked("retired-no", true);
    }

    // ADD: box-15 (Special Assignments)
    // ADD: box-16 (Awards and Decorations)

    renderSkills(c, view);

    if (c.items.hasTravellers) {
        view.checked("tas-yes", true);
    } else {
        view.checked("tas-no", true);
    }

    if (c.credits > 0) {
        view.text("box-26", `Cr${numberFormat.format(c.credits)}`);
    }

    view.text("box-27", c.items.toString());
}

/** Fills TAS Form 3 for a mustered-out ship. */
function renderFormThree(
    c: Character,
    view: DomView,
    today: ImperialDate,
): void {
    const ship = c.ship;
    if (ship === undefined) {
        return;
    }
    view.hidden("tas-form-3", false);

    view.text("s-box-1", today.toString());
    view.text("s-box-2", ship.name || "");
    // 3: Registration number

    view.text("s-box-4", ship.type);
    // 5: Builder
    // 6: Homeworld
    // 7: Laid Down
    // 8: First Flight

    view.text("s-box-9", `MCr${numberFormat.format(ship.cost)}`);
    // 10: Occupation

    view.text("s-box-11a", numberFormat.format(ship.tonnage));

    if (ship.hullStandard) {
        view.checked("std-hull-yes", true);
    } else {
        view.checked("std-hull-no", true);
    }

    if (ship.streamlined) {
        view.checked("streamlined-yes", true);
    } else {
        view.checked("streamlined-no", true);
    }

    // 11c. Max Atmosphere

    view.text("s-box-12", `${ship.acceleration}-G`);
    view.text("s-box-13", ship.jump.toString());
    view.text("s-box-14", ship.powerPlant);
    view.text("s-box-15", ship.cargoCapacity.toString());
    view.text("s-box-16", ship.staterooms.toString());
    view.text("s-box-17", ship.lowBerths.toString());
    view.text("s-box-19", ship.minCrew.toString());
    view.text("s-box-20", ship.vehicles.join(", "));
    view.text("s-box-22", c.name.toString());

    // FIXME: Reverse side of TAS Form 3 (Computer, turrets, ...)
}

function rollCharacter(): Character {
    const c = generateCharacter();
    const view = new DomView(document);
    const today = new ImperialDate();

    if (c.dead) {
        view.toggleClass("tas-form-2", "deceased", true);
        view.toggleClass("tas-form-2-reverse", "deceased", true);
    }

    renderFormTwo(c, view, today);
    if (c.ship !== undefined) {
        renderFormThree(c, view, today);
    }

    return c;
}

if (typeof window === "undefined") {
    void (async () => {
        await loadShipNames(); // a mustered-out ship needs a name
        const c = generateCharacter();
        console.log(c.history.join("\n"));
    })();
} else {
    void loadShipNames(); // start fetching alongside the page, off the critical path

    document
        .getElementById("reroll")
        ?.addEventListener("click", async (_event) => {
            await loadShipNames();
            resetSheets();
            rollCharacter();
        });
    document
        .getElementById("roll-ship")
        ?.addEventListener("click", async (_event) => {
            await loadShipNames();
            let c: Character;
            do {
                resetSheets();
                c = rollCharacter();
            } while (!c.ship);
        });
    window.addEventListener("load", async (_event) => {
        await loadShipNames();
        rollCharacter(); // FIXME: preferably roll an alive character
    });
}
