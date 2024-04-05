import { expect, test } from 'vitest'
import { ImperialDate } from '../src/imperial_date'

test('convert 2021-01-01 to 001-2021', () => {
    const d = new Date(2021, 0, 1);
    const di = new ImperialDate(d);
    expect(di.toString()).toBe('001-2021');
})

test('convert 2021-31-12 to 365-2021', () => {
    const d = new Date(2021, 11, 31);
    const di = new ImperialDate(d);
    expect(di.toString()).toBe('365-2021');
})

test('convert 2024-31-12 to 365-2021', () => {
    const d = new Date(2024, 11, 31);
    const di = new ImperialDate(d);
    expect(di.toString()).toBe('001-2025');
})

test('convert 1st day of 2021 to 001-2021', () => {
    const di = new ImperialDate(1, 2021);
    expect(di.toString()).toBe('001-2021');
})

test('convert 365th day of 2021 to 365-2021', () => {
    const di = new ImperialDate(365, 2021);
    expect(di.toString()).toBe('365-2021');
})

test('convert 366th day of 2024 to 001-2025', () => {
    const di = new ImperialDate(366, 2024);
    expect(di.toString()).toBe('001-2025');
})
