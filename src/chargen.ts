import { Character, weaponSkills } from "./character";

console.log("Traveller Chargen");

if (typeof window == 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _c = new Character();
} else {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    window.addEventListener("load", (_event) => {
        const c = new Character();
        const today = new Date();

        if (c.dead) {
            document.getElementById("tas-form-2")!.classList.add("deceased");
            document.getElementById("tas-form-2-reverse")!.classList.add("deceased");
        }

        document.getElementById("box-1")!.textContent = today.toLocaleDateString();

        document.getElementById("box-2")!.textContent = c.name.toString(); // FIXME: includes title
        document.getElementById("box-25")!.textContent = c.name.toString(); // FIXME: includes title
        document.getElementById("s-box-22")!.textContent = c.name.toString(); // FIXME: includes title

        document.getElementById("strength")!.textContent = c.attributes.strength.toString(16).toUpperCase();
        document.getElementById("dexterity")!.textContent = c.attributes.dexterity.toString(16).toUpperCase();
        document.getElementById("endurance")!.textContent = c.attributes.endurance.toString(16).toUpperCase();
        document.getElementById("intelligence")!.textContent = c.attributes.intelligence.toString(16).toUpperCase();
        document.getElementById("education")!.textContent = c.attributes.education.toString(16).toUpperCase();
        document.getElementById("social-standing")!.textContent = c.attributes.socialStanding.toString(16).toUpperCase();

        if (c.name.title) {
            document.getElementById("box-4")!.textContent = c.name.title;
        }

        if (c.career.military && c.career.ranks) {
            document.getElementById("box-5")!.textContent = c.career.ranks[c.rank];
        }

        // FIXME: box-6 calculate birthdate in character.ts, current year is 1105

        // FIXME: box-8, box-11, create worlds from subsector.ts

        document.getElementById("box-9")!.textContent = c.career.name;

        document.getElementById("box-12")!.textContent = c.terms.toString();

        if (c.career.ranks) {
            document.getElementById("box-13")!.textContent = c.career.ranks[c.rank];
        }

        if (c.retired) {
            document.getElementById("retired-yes")!.setAttribute("checked", "");
            if (c.career.retirementPay) {
                document.getElementById("box-14b")!.textContent = "Cr" + new Intl.NumberFormat().format(c.retirementPay);
            }
        } else {
            document.getElementById("retired-no")!.setAttribute("checked", "");
        }

        // FIXME: identify weapons & devices qualified on
        const equipmentSkills: string[] = Object.keys(c.skills).filter(s => weaponSkills["gun"].concat(weaponSkills["blade"]).includes(s));
        document.getElementById("box-17")!.textContent = c.skillsToString(equipmentSkills); 
        const additionalSkills: string[] = Object.keys(c.skills).filter(s => !weaponSkills["gun"].concat(weaponSkills["blade"]).includes(s));
        document.getElementById("box-17")!.textContent = c.skillsToString(equipmentSkills); 

        if (Object.keys(additionalSkills).length > 0) {
            const sortedSkills = c.sortSkills(additionalSkills);
            document.getElementById("box-18a")!.textContent = sortedSkills[0]+"-"+c.skills[sortedSkills[0]];
            if (sortedSkills.length > 1) {
                document.getElementById("box-18b")!.textContent = sortedSkills[1]+"-"+c.skills[sortedSkills[1]];
            }
            if (sortedSkills.length > 2) {
                document.getElementById("box-18c")!.textContent = c.skillsToString(sortedSkills.slice(2));
            }
        }


        function preferredWeapon(type: string): string | null {
            const skills: string[] = c.sortSkills(Object.keys(c.skills).filter(s => weaponSkills[type].includes(s)));
            if (skills.length > 0) {
                return skills[0];
            }

            return null;
        }

        // box-19a-c identify preferred weapons
        // a weapon
        const preferredRifle = preferredWeapon("weapon");
        if (preferredRifle) {
            document.getElementById("box-19a")!.textContent = preferredRifle;
        }

        // b pistol
        const preferredPistol = preferredWeapon("pistol");
        if (preferredPistol) {
            document.getElementById("box-19b")!.textContent = preferredPistol;
        }

        // c blade
        const preferredBlade = preferredWeapon("blade");
        if (preferredBlade) {
            document.getElementById("box-19c")!.textContent = preferredBlade;
        }

        if (c.hasTravellers) {
            document.getElementById("tas-yes")!.setAttribute("checked", "");
        } else {
            document.getElementById("tas-no")!.setAttribute("checked", "");
        }

        if (c.credits > 0) {
            document.getElementById("box-26")!.textContent = "Cr" + new Intl.NumberFormat().format(c.credits);
        }

        document.getElementById("box-27")!.textContent = c.itemsToString();

        if (c.ship) {
            document.getElementById("tas-form-3")!.hidden = false;

            document.getElementById("s-box-1")!.textContent = today.toLocaleDateString();
            document.getElementById("s-box-2")!.textContent = c.ship.name || ""; 
            // 3: Registration number

            document.getElementById("s-box-4")!.textContent = c.ship.type;
            // 5: Builder
            // 6: Homeworld
            // 7: Laid Down
            // 8: First Flight

            document.getElementById("s-box-9")!.textContent = "MCr" + new Intl.NumberFormat().format(c.ship.cost);
            // 10: Occupation

            document.getElementById("s-box-11a")!.textContent = new Intl.NumberFormat().format(c.ship.tonnage);

            if (c.ship.hullStandard) {
                document.getElementById("std-hull-yes")!.setAttribute("checked", "");
            } else {
                document.getElementById("std-hull-no")!.setAttribute("checked", "");
            }
    
            if (c.ship.streamlined) {
                document.getElementById("streamlined-yes")!.setAttribute("checked", "");
            } else {
                document.getElementById("streamlined-no")!.setAttribute("checked", "");
            }

            // 11c. Max Atmosphere

            document.getElementById("s-box-12")!.textContent = c.ship.acceleration + "-G";

            document.getElementById("s-box-13")!.textContent = c.ship.jump.toString();

            document.getElementById("s-box-14")!.textContent = c.ship.powerPlant;

            document.getElementById("s-box-15")!.textContent = c.ship.cargoCapacity.toString();

            document.getElementById("s-box-16")!.textContent = c.ship.staterooms.toString();

            document.getElementById("s-box-17")!.textContent = c.ship.lowBerths.toString();

            document.getElementById("s-box-19")!.textContent = c.ship.minCrew.toString();

            document.getElementById("s-box-20")!.textContent = c.ship.vehicles.join(", ");

            // FIXME: Reverse side of TAS Form 3 (Computer, turrets, ...)

        }

    });
}
