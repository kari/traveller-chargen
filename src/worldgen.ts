import { Subsector } from "./subsector";

console.log("Traveller Subsector Generator")

function resetSheets() {
    // note this only clears optional fields, not full sheet
    document.getElementById("world-list")!.replaceChildren();

}

function rollSubsector(): Subsector {
    const s = new Subsector();

    const today = new Date();
    today.setFullYear(1105);

    document.getElementById("box-1")!.textContent = today.toLocaleDateString();
    document.getElementById("t6-box-2")!.textContent = today.toLocaleDateString();

    document.getElementById("seed")!.setAttribute("data-seed", s.seed.toString());

    document.getElementById("box-2")!.textContent = s.name;
    document.getElementById("t6-box-1")!.textContent = s.name;
    document.getElementById("box-3")!.textContent = s.sector.name;


    function addWorldNode(text: string) {
        const worlds = document.getElementById("world-list")!;
        const div = document.createElement("div");
        const divText = document.createTextNode(text);
        div.appendChild(divText);
        worlds.appendChild(div);
    }

    function addBoxedWorldNode(text: string) {
        const worlds = document.getElementById("world-list")!;
        const div = document.createElement("div");
        div.classList.add("boxed");
        for (const l of text) {
            const box = document.createElement("div");
            const boxText = document.createTextNode(l);
            box.appendChild(boxText);
            div.appendChild(box);
        }
        worlds.appendChild(div);
    }

    for (const h of s.hexes) {
        if (h.world == undefined) {
            continue;
        }
        addWorldNode(h.world.name);
        addBoxedWorldNode(('0000' + h.hexNumber).slice(-4))
        addBoxedWorldNode(h.world.uwp);
        addWorldNode(""); // FIXME: remarks
    }

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
