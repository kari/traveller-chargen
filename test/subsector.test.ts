import { expect, test } from "vitest";
import { Random } from "../src/random";
import { generateSubsector, Hex, Subsector, World } from "../src/subsector";

test("create a random world", () => {
    const r = new Random();
    const w = new World(r);
    expect(w.tradeClassificationsToString()).toBeTypeOf("string");
    expect(w.uwp).toMatch(/^[A-X][0-9A-Z]{6}-[0-9A-Z]$/);
});

test("create a hex", () => {
    const r = new Random();
    const h = new Hex(1, 1, r);
    expect(h.hexNumber).toBe(101);
    expect(h.toString()).toBeTruthy();
    expect(h.basesToString()).toBeTypeOf("string");
});

test("create a subsector", () => {
    const s = new Subsector();
    expect(s.hexes.length).toBe(80);
});

test("uses an injected random source", () => {
    const random = new Random(12345);
    const subsector = new Subsector(random);

    expect(subsector.random).toBe(random);
});

test("generates a subsector through the public generation API", () => {
    const random = new Random(12345);
    const subsector = generateSubsector(random);

    expect(subsector).toBeInstanceOf(Subsector);
    expect(subsector.random).toBe(random);
});

test("keeps generated world profile values within Traveller bounds", () => {
    const subsector = new Subsector(12345);
    const worlds = subsector.hexes.flatMap((hex) =>
        hex.world === undefined ? [] : [hex.world],
    );

    expect(worlds.length).toBeGreaterThan(0);
    for (const world of worlds) {
        expect(world.planetarySize).toBeGreaterThanOrEqual(0);
        expect(world.planetarySize).toBeLessThanOrEqual(10);
        expect(world.planetaryAthmosphere).toBeGreaterThanOrEqual(0);
        expect(world.planetaryAthmosphere).toBeLessThanOrEqual(12);
        expect(world.hydrographicPercentage).toBeGreaterThanOrEqual(0);
        expect(world.hydrographicPercentage).toBeLessThanOrEqual(10);
        expect(world.population).toBeGreaterThanOrEqual(0);
        expect(world.population).toBeLessThanOrEqual(10);
        expect(world.planetaryGovernment).toBeGreaterThanOrEqual(0);
        expect(world.planetaryGovernment).toBeLessThanOrEqual(13);
        expect(world.lawLevel).toBeGreaterThanOrEqual(0);
        expect(world.lawLevel).toBeLessThanOrEqual(9);
        expect(world.technologicalLevel).toBeGreaterThanOrEqual(0);
        expect(world.technologicalLevel).toBeLessThanOrEqual(20);
    }
});
