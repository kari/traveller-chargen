function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
}

function ehex(value: number): string {
    const symbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    return symbols[value];
}

function setBoxContent(box: string, text: string) {
    const el = document.getElementById(box);
    if (el) {
        el.textContent = text;
    }
}

export { clamp, ehex, setBoxContent }
