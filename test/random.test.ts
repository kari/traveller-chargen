import { expect, test } from "vitest";
import { Random } from "../src/random";

test("construct without seed", () => {
    const r = new Random();
    expect(r.seed).toBeTypeOf("number");
    const roll = r.roll(1);
    expect(roll).toBeGreaterThanOrEqual(1);
    expect(roll).toBeLessThanOrEqual(6);
    expect(r.pick(["me"])).toBe("me");
});

test("construct with seed", () => {
    const r = new Random(12345);
    expect(r.seed).toBe(12345);
});

test("test seeded random", () => {
    const first = new Random(123456);
    const second = new Random(123456);
    const start = new Date(2021, 0, 1);
    const end = new Date(2021, 11, 31);

    const firstValues = [
        first.roll(1),
        first.roll(2),
        first.pick([1, 2, 3, 4]),
        first.integer(1, 100),
        first.real(0, 10),
        first.date(start, end),
    ];
    const secondValues = [
        second.roll(1),
        second.roll(2),
        second.pick([1, 2, 3, 4]),
        second.integer(1, 100),
        second.real(0, 10),
        second.date(start, end),
    ];

    expect(firstValues).toEqual(secondValues);
    expect(firstValues[0]).toBeGreaterThanOrEqual(1);
    expect(firstValues[0]).toBeLessThanOrEqual(6);
    expect(firstValues[4]).toBeGreaterThanOrEqual(0);
    expect(firstValues[4]).toBeLessThan(10);
});

test("cannot pick from an empty collection", () => {
    expect(() => new Random(1).pick([])).toThrow(RangeError);
});
