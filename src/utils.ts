/**
 * Set of general utilites
 */

/**
 * Shared formatter for credit and tonnage amounts.
 */
export const numberFormat = new Intl.NumberFormat("en-us", {
    maximumFractionDigits: 2,
});

/**
 * Returns a value between min and max (inclusive)
 *
 * @param value - Value to be clamped
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns value if its between min/max, or min/max if outside
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
}

/**
 * Returns number as a EHex value
 *
 * @see {@link https://wiki.travellerrpg.com/Hexadecimal_Notation}
 *
 * @param value - input value to be converted (between 0 - 33)
 * @returns an extended hexadecimal notation
 */
export function ehex(value: number): string {
    const symbols = [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "J",
        "K",
        "L",
        "M",
        "N",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
    ];
    const symbol = symbols[value];
    if (symbol === undefined) {
        throw new RangeError(`EHex value must be between 0 and 33: ${value}`);
    }
    return symbol;
}
