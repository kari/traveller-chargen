import { expect, test } from "vitest";
import { Random } from "../src/random";
import {
    assignTravelZone,
    generateSubsector,
    hasDangerousProfile,
    Hex,
    isWellGoverned,
    selectCapital,
    Subsector,
    TradeClassification,
    TravelZoneType,
    World,
} from "../src/subsector";

test("create a random world", () => {
    const r = new Random();
    const w = new World(r);
    expect(w.tradeClassificationsToString()).toBeTypeOf("string");
    expect(w.uwp).toMatch(/^[A-X][0-9A-Z]{6}-[0-9A-Z]$/);
});

test("generates the same world name from the same seed", () => {
    const first = new World(new Random(12345));
    const second = new World(new Random(12345));

    expect(first.name).toBe(second.name);
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

test("generates the same subsector names from the same seed", () => {
    const first = new Subsector(12345);
    const second = new Subsector(12345);

    expect(first.name).toBe(second.name);
    expect(first.sectorName).toBe(second.sectorName);
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

test("selects exactly one subsector capital with the Cp classification", () => {
    const subsector = new Subsector(12345);
    const capitals = subsector.hexes.filter((hex) =>
        hex.world?.tradeClassifications.includes(
            TradeClassification.SubsectorCapital,
        ),
    );

    expect(capitals.length).toBe(1);
    expect(subsector.capital).toBe(capitals[0]);
});

test("capital is the inhabited world with highest population, tech, starport", () => {
    const subsector = new Subsector(12345);
    const starportRank: Record<string, number> = {
        A: 5,
        B: 4,
        C: 3,
        D: 2,
        E: 1,
        X: 0,
    };
    const inhabited = subsector.hexes.filter(
        (hex) => hex.world !== undefined && hex.world.population > 0,
    );
    const governed = inhabited.filter(
        (hex) =>
            hex.world !== undefined &&
            ![0, 7, 10].includes(hex.world.planetaryGovernment) &&
            hex.world.lawLevel > 0 &&
            hex.world.lawLevel < 9,
    );
    const candidates = governed.length > 0 ? governed : inhabited;
    const expected = candidates.reduce((a, b) => {
        if (a.world === undefined || b.world === undefined) return a;
        return (b.world.population - a.world.population ||
            b.world.technologicalLevel - a.world.technologicalLevel ||
            (starportRank[b.world.starport] ?? -1) -
                (starportRank[a.world.starport] ?? -1)) > 0
            ? b
            : a;
    });

    expect(subsector.capital).toBe(expected);
});

test("selects the same capital from the same seed", () => {
    const first = new Subsector(4242);
    const second = new Subsector(4242);

    expect(first.capital?.hexNumber).toBe(second.capital?.hexNumber);
});

test("adding the same trade classification twice is ignored", () => {
    const world = new World(new Random(12345));

    world.addTradeClassification(TradeClassification.SubsectorCapital);
    world.addTradeClassification(TradeClassification.SubsectorCapital);

    expect(
        world.tradeClassifications.filter(
            (c) => c === TradeClassification.SubsectorCapital,
        ).length,
    ).toBe(1);
});

test("returns undefined when no inhabited world exists", () => {
    const subsector = new Subsector(12345);
    const emptyHexes = subsector.hexes.filter((hex) => hex.world === undefined);
    expect(emptyHexes.length).toBeGreaterThan(0);

    expect(selectCapital(emptyHexes, new Random(1))).toBeUndefined();
});

test("dangerous profiles match the post-CT codified predicate", () => {
    const safe = {
        starport: "C" as const,
        planetaryAthmosphere: 6,
        population: 5,
        planetaryGovernment: 5,
        lawLevel: 5,
    };
    expect(hasDangerousProfile(safe)).toBe(false);
    expect(isWellGoverned(safe)).toBe(true);

    expect(hasDangerousProfile({ ...safe, planetaryAthmosphere: 10 })).toBe(
        true,
    );
    expect(hasDangerousProfile({ ...safe, planetaryGovernment: 0 })).toBe(true);
    expect(hasDangerousProfile({ ...safe, planetaryGovernment: 7 })).toBe(true);
    expect(hasDangerousProfile({ ...safe, planetaryGovernment: 10 })).toBe(
        true,
    );
    expect(hasDangerousProfile({ ...safe, lawLevel: 0 })).toBe(true);
    expect(hasDangerousProfile({ ...safe, lawLevel: 9 })).toBe(true);
    expect(isWellGoverned({ ...safe, planetaryGovernment: 0 })).toBe(false);
    expect(isWellGoverned({ ...safe, lawLevel: 9 })).toBe(false);
});

test("assigns Red to sizable populations with no starport", () => {
    const interdicted = {
        starport: "X" as const,
        planetaryAthmosphere: 6,
        population: 5,
        planetaryGovernment: 5,
        lawLevel: 5,
    };
    expect(assignTravelZone(interdicted, new Random(1))).toBe(
        TravelZoneType.Red,
    );
    // small X-port populations stay clear
    expect(
        assignTravelZone({ ...interdicted, population: 3 }, new Random(1)),
    ).toBeUndefined();
});

test("gates Amber behind a rarity roll for dangerous profiles", () => {
    const dangerous = {
        starport: "C",
        planetaryAthmosphere: 12,
        population: 5,
        planetaryGovernment: 5,
        lawLevel: 5,
        rollForAmber: () => 11,
    } as const;
    expect(assignTravelZone(dangerous, new Random(1))).toBe(
        TravelZoneType.Amber,
    );

    // the same profile stays clear when the rarity roll fails
    const unlucky = { ...dangerous, rollForAmber: () => 7 } as const;
    expect(assignTravelZone(unlucky, new Random(1))).toBeUndefined();

    // safe profiles never get Amber regardless of the roll
    const safe = {
        starport: "C",
        planetaryAthmosphere: 6,
        population: 5,
        planetaryGovernment: 5,
        lawLevel: 5,
        rollForAmber: () => 12,
    } as const;
    expect(assignTravelZone(safe, new Random(1))).toBeUndefined();

    // Red takes precedence over Amber even for dangerous profiles
    const interdictedDangerous = {
        ...dangerous,
        starport: "X",
        population: 5,
    } as const;
    expect(assignTravelZone(interdictedDangerous, new Random(1))).toBe(
        TravelZoneType.Red,
    );
});

test("keeps travel zones exceptional in a generated subsector", () => {
    const subsector = new Subsector(12345);
    const zones = subsector.hexes.flatMap((hex) =>
        hex.travelZone === undefined ? [] : [hex.travelZone],
    );
    const ambers = zones.filter((z) => z === TravelZoneType.Amber);
    const reds = zones.filter((z) => z === TravelZoneType.Red);

    expect(ambers.length).toBeLessThanOrEqual(6);
    expect(reds.length).toBeLessThanOrEqual(2);
    // Red takes precedence: no hex carries both (single field) and every
    // Red hex matches the interdiction rule
    for (const hex of subsector.hexes) {
        if (hex.travelZone === TravelZoneType.Red) {
            expect(hex.world?.starport).toBe("X");
            expect(hex.world?.population ?? 0).toBeGreaterThanOrEqual(4);
        }
    }
});
