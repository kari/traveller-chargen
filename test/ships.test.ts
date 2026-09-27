import { expect, test } from "vitest";
import { Random } from "../src/random";
import {
    createFreeTrader,
    createScoutCourier,
    loadShipNames,
    randomShipName,
    shipToString,
} from "../src/ships";

test("loads the ship names lazily and picks deterministically", async () => {
    const names = await loadShipNames();
    expect(names.length).toBeGreaterThan(1_000);
    expect(randomShipName(new Random(12345))).toBe(
        randomShipName(new Random(12345)),
    );
});

test("a new Scout/Courier", () => {
    const name = "SS Test IV";
    const s = createScoutCourier(name);
    expect(shipToString(s)).toBe("SS Test IV (type: S)");
    expect(s.name).toBe(name);
    expect(s.type).toBe("S");
});

test("a new Free Trader", () => {
    const name = "Beowulf";
    const s = createFreeTrader(name);
    expect(shipToString(s)).toBe("Beowulf (type: A)");
    expect(s.name).toBe(name);
    expect(s.type).toBe("A");
    expect(s.mortgage).toBeTruthy();
    expect(s.mortgage?.monthlyPayment).toBe(150_000);
    expect(s.mortgage?.maturity).toBe(40);
    expect(s.mortgage?.totalPayment).toBe(150_000 * 40 * 12);
});
