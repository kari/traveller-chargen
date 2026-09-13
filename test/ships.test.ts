import { expect, test } from "vitest";
import {
    createFreeTrader,
    createScoutCourier,
    shipToString,
} from "../src/ships";

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
