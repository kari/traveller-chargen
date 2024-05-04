import { expect, test } from 'vitest'
import { Random } from '../src/random'

test('construct without seed', () => {
    const r = new Random();
    expect(r.seed).toBeTypeOf("number");
    const roll = r.roll(1);
    expect(roll).toBeGreaterThanOrEqual(1);
    expect(roll).toBeLessThanOrEqual(6);
    expect(r.pick(['me'])).toBe('me');
})

test('construct with seed', () => {
    const r = new Random(12345);
    expect(r.seed).toBe(12345);
})

test("test seeded random", () => {
    const r = new Random(123456);
    expect(r.roll(1)).toBe(2);
    expect(r.roll(2)).toBe(10);    
    expect(r.pick([1,2,3,4])).toBe(2);
    expect(r.integer(1,100)).toBe(29);
    expect(r.real(0,10)).toBeCloseTo(5.821340698085646);
    expect(r.date(new Date(2021,0,1), new Date(2021,11,31))).toStrictEqual(new Date('2021-01-03T14:54:38.085Z')); // bun:test has two hour offset?
})
