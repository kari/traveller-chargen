import { expect, test } from "vitest";
import { Random } from "../src/random";
import { FreeTrader, ScoutCourier } from "../src/ships";

test("a new Scout/Courier", () => {
    const name = "SS Test IV";
    const s = new ScoutCourier(new Random(1), name);
    expect(s.toString()).toBe("SS Test IV (type: S)");
    expect(s.name).toBe(name);
    expect(s.type).toBe("S");
});

test("a new unnamed Scout/Courier", () => {
    const s = new ScoutCourier(new Random(1));
    expect(s.type).toBe("S");
    expect(s.name).toBeTruthy();
    expect(s.name?.length).toBeGreaterThan(0);
});

test("a new Free Trader", () => {
    const name = "Beowulf";
    const s = new FreeTrader(new Random(1), name);
    expect(s.toString()).toBe("Beowulf (type: A)");
    expect(s.name).toBe(name);
    expect(s.type).toBe("A");
    expect(s.mortgage).toBeTruthy();
    expect(s.mortgage.monthly_payment).toBe(150_000);
    expect(s.mortgage.maturity).toBe(40);
    expect(s.mortgage.total_payment).toBe(150_000 * 40 * 12);
});

test("a new unnamed Free Trader", () => {
    const s = new FreeTrader(new Random(1));
    expect(s.type).toBe("A");
    expect(s.name).toBeTruthy();
    expect(s.name?.length).toBeGreaterThan(0);
});
