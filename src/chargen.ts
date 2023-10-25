import { Character } from "./character";

console.log("Traveller Chargen");

if (typeof window == 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _c = new Character();
} else {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    window.addEventListener("load", (_event) => {
        const c = new Character(); // 348320716); // scout ship: 1201531450
        const today = new Date();

        if (c.dead) {
            document.getElementById("tas-form-2")!.classList.add("deceased");
        }

        document.getElementById("box-1")!.textContent = today.toLocaleDateString();

        document.getElementById("box-2")!.textContent = c.name.toString(); // FIXME: includes title

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

        // FIXME: identify primary/secondary skills
        document.getElementById("box-18c")!.textContent = c.skillsToString();

        // FIXME: box-19a-c identify preferred weapons

        // FIXME: box-20 add TAS membership

        /* FIXME: TAS Form 2 doesn't include stuff like
        - inventory
        - cash balance
        - ship
        */ 


    });
}
