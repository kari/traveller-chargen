import { expect, test } from 'vitest'
import * as utils from '../src/utils'

test('test clamp', () => {
    expect(utils.clamp(1, 2, 9)).toBe(2);
    expect(utils.clamp(10, 2, 9)).toBe(9);
    expect(utils.clamp(2, 2, 9)).toBe(2);
    expect(utils.clamp(9, 2, 9)).toBe(9);
    expect(utils.clamp(3, 2, 9)).toBe(3);
    expect(utils.clamp(-1, -5, 0)).toBe(-1);
});

test('test ehex', () => {
    expect(utils.ehex(0)).toBe('0');
    expect(utils.ehex(9)).toBe('9');
    expect(utils.ehex(10)).toBe('A');
    expect(utils.ehex(15)).toBe('F');
    expect(utils.ehex(33)).toBe('Z');
    // bun:test fails on .toThrow
    expect(utils.ehex(-1)).toThrow(Error);
    expect(utils.ehex(34)).toThrow(Error);
});