import { Temporal } from "temporal-polyfill";

// @see https://wiki.travellerrpg.com/Imperial_Calendar
class ImperialDate {
    dayOfYear: number;
    year: number;

    constructor()
    constructor(date: Date)
    constructor(dayOfYear: number, year:number)
    constructor(dateOrDay?: number | Date, year?:number) {
        if (year != undefined && dateOrDay != undefined) {
            this.dayOfYear = dateOrDay as number
            this.year = year
        } else if (dateOrDay != undefined) {
            const date = dateOrDay as Date;
            const temporal = new Temporal.PlainDate(date.getFullYear(), date.getMonth()+1, date.getDate())
            this.dayOfYear = temporal.dayOfYear
            this.year = temporal.year
        } else {
            const temporal = Temporal.Now.plainDateISO()
            this.dayOfYear = temporal.dayOfYear
            this.year = 1105;
        }
        if (this.dayOfYear > 365) { // crude way to handle leap years
            this.dayOfYear = 1;
            this.year += 1;
        }
    }

    toString() {
        return ('000' + this.dayOfYear.toString()).slice(-3) + "-" + this.year.toString()
    }
}

export { ImperialDate }
