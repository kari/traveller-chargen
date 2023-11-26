import { Subsector } from "./subsector";

console.log("Traveller Subsector Generator")

function resetSheets() {
    // note this only clears optional fields, not full sheet
}

function rollSubsector(): Subsector {
    const s = new Subsector();

    const today = new Date();
    today.setFullYear(1105);

    document.getElementById("box-1")!.textContent = today.toLocaleDateString();
    document.getElementById("seed")!.setAttribute("data-seed", s.seed.toString());

    document.getElementById("box-2")!.textContent = s.name;
    document.getElementById("box-3")!.textContent = s.sector.name;
    


    return s;
}

if (typeof window == 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const s = new Subsector();
} else {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    document.getElementById("reroll")?.addEventListener("click", (_event) => {
        resetSheets();
        rollSubsector();
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    window.addEventListener("load", (_event) => {
        rollSubsector();
    });
}
