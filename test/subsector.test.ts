import { expect, test } from "vitest";
import { Subsector, World, Hex } from "../src/subsector";
import { Random } from "../src/random";


test('create a random world', () => {
    const r = new Random();
    const w = new World(r);
});

test('create a hex', () => {
    const r = new Random();
    const h = new Hex(1, 1, r);
    expect(h.hexNumber).toBe(101);
});

test('create a subsector', () => {
    const s = new Subsector();
    expect(s.hexes.length).toBe(80);
});
