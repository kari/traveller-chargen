import { Subsector } from "./subsector";
import { SVG } from '@svgdotjs/svg.js';

console.log("Traveller Subsector Generator")

function resetSheets() {
    // note this only clears optional fields, not full sheet
    document.getElementById("world-list")!.replaceChildren();
    document.getElementById("map-grid")!.replaceChildren();

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

    // https://www.redblobgames.com/grids/hexagons/#basics
    function hexCorner(x: number, y: number, size: number, i: number): number[] {
        const angle_deg = 60 * i;
        const angle_rad = Math.PI / 180 * angle_deg;

        return [x + size * Math.cos(angle_rad), y + size * Math.sin(angle_rad)]
    }

    // https://www.redblobgames.com/grids/hexagons/#hex-to-pixel
    function hexToPixel(q: number, r: number) { // odd-q offset
        const x = size * 3 / 2 * q + size
        const y = size * Math.sqrt(3) * (r + 0.5 * (q & 1)) + Math.sqrt(3) / 2 * size

        return [x, y]

    }

    function drawHex(x: number, y: number, size: number) {
        const edges: number[] = [];
        for (let i = 0; i <= 5; i++) {
            edges.push(...hexCorner(x, y, size, i))
        }
        // console.log(edges);
        return edges

    }

    // FIXME: refactor into "drawTemplateGrid" and draw it before new Subsector() and in resetSheets()
    const draw = SVG().addTo("#map-grid").size('100%', '100%');
    const size = 100;
    draw.viewbox(0, 0, size * 3 / 2 * 7 + 2 * size, size * Math.sqrt(3) * (9 + 0.5 * (7 & 1)) + Math.sqrt(3) * size)
    for (let q = 0; q <= 7; q++) { // x index
        const r_init = q == 7 ? -1 : 0; // adds missing line segment in top-right corner
        const r_max = q % 2 == 0 ? 10 : 9; // 11 row for even
        for (let r = r_init; r <= r_max; r++) { // y index
            const [x, y] = hexToPixel(q, r);
            draw.polygon(drawHex(x, y, size)).fill('none').stroke({ width: 1, color: "currentColor"});
            const text = draw.text((('0000' + ((q+1)*100+(r+1))).slice(-4)))
            text.move(x-text.length()/2,y-size+20)
        }
    }
    
    // FIXME: we already iterate over worlds above
    for (const h of s.hexes) {
        if (h.world == undefined) { continue }
        // naval base (star)
        // scout base (triangle)
        // gas giant (circle)
        
        const [x, y] = hexToPixel(h.coordinates[0]-1, h.coordinates[1]-1);
        
        const worldName = draw.text(h.world.name)
        const starportType = draw.text(h.starport)
        // FIXME: if text.length() > side length (= size), decrease font size until fits
        worldName.move(x-worldName.length()/2,y+size-40)
        starportType.move(x-starportType.length()/2, y-size+40)
        
        // world symbol (full = ocean, empty = no ocean, asteroid belt)
        if (h.world.planetarySize == 0) { // Asteroid Belt
            draw.rect(20, 20).move(x-10, y-10) // FIXME: draw asteroid belt icon
        } else if (h.world.hydrographicPercentage > 0) { // has oceans
            draw.circle(20).move(x-10, y-10)
        } else { // desert world
            draw.circle(20).move(x-10, y-10).fill("none").stroke({ width: 1, color: "currentColor"})
        }

        // FIXME: position at consistent radius/angle (from icon center point) from world symbol
        if (h.gasGiant) {
            draw.circle(10).move(x+30,y-30)
        }
        if (h.scoutBase) {
            draw.polygon("0,0 14,0 7,-14").move(x-45,y+15)
        }
        if (h.navalBase) {
            draw.polygon("0,0 14,0 7,-14").move(x-45,y-30) // FIXME: make into star
        }

        /* S12 Forms and charts
        - world name in ALL CAPS if population > 1B
            - subsector capital in red
        - travel zone a circle around world (red or amber)
        - water present in grey/blue
        - 
        */
    }




    return s;
}

if (typeof window == 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const s = new Subsector();
    for (const h of s.hexes) {
        console.log(h.toString())
    }
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
