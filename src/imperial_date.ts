import { Temporal } from "temporal-polyfill";

/**
 * Format a Date in Imperial Calendar format
 *
 * @remarks
 * Uses Temporal API because Date doesn't have dayOfYear. Doesn't implement
 * Imperial Calendar arithmetic or conversions, only extracts day of year
 * and year for formatting purposes.
 *
 * @see {@link https://wiki.travellerrpg.com/Imperial_Calendar}
 */
export class ImperialDate {
    dayOfYear: number;
    year: number;

    constructor();
    constructor(date: Date);
    constructor(dayOfYear: number, year: number);
    constructor(dateOrDay?: number | Date, year?: number) {
        if (dateOrDay instanceof Date) {
            const temporal = new Temporal.PlainDate(
                dateOrDay.getFullYear(),
                dateOrDay.getMonth() + 1,
                dateOrDay.getDate(),
            );
            this.dayOfYear = temporal.dayOfYear;
            this.year = temporal.year;
        } else if (dateOrDay !== undefined && year !== undefined) {
            this.dayOfYear = dateOrDay;
            this.year = year;
        } else {
            const temporal = Temporal.Now.plainDateISO();
            this.dayOfYear = temporal.dayOfYear;
            this.year = 1105; // note that other constructors use given year, here we set year to Milieu 1105 for Classic Traveller.
        }
        if (this.dayOfYear > 365) {
            // crude way to handle leap years, as IC doesn't have them
            this.dayOfYear = 1;
            this.year += 1;
        }
    }

    toString() {
        return `${`000${this.dayOfYear.toString()}`.slice(
            -3,
        )}-${this.year.toString()}`;
    }
}
