/**
 * Set of general utilites
 */

/**
 * Returns a value between min and max (inclusive)
 * 
 * @param value - Value to be clamped
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns value if its between min/max, or min/max if outside
 */
function clamp(value: number, min: number, max: number): number {
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
function ehex(value: number): string {
    const symbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    return symbols[value];
}

/**
 * Sets an element's textContent property if element exists
 * 
 * @param box - element ID to look for
 * @param text - set element's value to this
 */
function setBoxContent(box: string, text: string) {
    const el = document.getElementById(box);
    if (el) {
        el.textContent = text;
    }
}

export { clamp, ehex, setBoxContent }
