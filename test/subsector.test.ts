import { expect, test } from "vitest";
import { Random } from "../src/random";
import { Hex, Subsector, World } from "../src/subsector";

test("create a random world", () => {
    const r = new Random();
    const w = new World(r);
    expect(w.tradeClassificationsToString()).toBeTypeOf("string");
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
