import names from "./names/ships";
import type { Random } from "./random";

/** A mustering-out ship (Scout/Courier or Free Trader). */
export interface Ship {
    name: string;
    type: string;
    tonnage: number;
    hullStandard: boolean;
    age: number;
    mortgage?: Mortgage | undefined;
    minCrew: number;
    streamlined: boolean;
    cargoCapacity: number;
    cost: number;
    vehicles: string[];
    acceleration: number;
    jump: number;
    powerPlant: string;
    staterooms: number;
    lowBerths: number;
}

/** One-line ship summary for the generation history. */
export function shipToString(ship: Ship): string {
    return `${ship.name} (type: ${ship.type})`;
}

/** Picks a random ship name from the name list. */
export function randomShipName(random: Random) {
    return random.pick(names);
}

/** Standard 100-ton Scout/Courier (Book 2), granted free on mustering out. */
export function createScoutCourier(name: string): Ship {
    return {
        name: name,
        age: 0,
        type: "S",
        tonnage: 100,
        hullStandard: true,
        minCrew: 1,
        streamlined: true,
        cargoCapacity: 3,
        cost: 29.43,
        vehicles: ["Air/Raft"],
        jump: 2,
        powerPlant: "A",
        acceleration: 2,
        staterooms: 4,
        lowBerths: 0,
    };
}

/** Standard 200-ton Free Trader (Book 2) with a 40-year mortgage. */
export function createFreeTrader(name: string): Ship {
    return {
        name: name,
        age: 0,
        type: "A",
        tonnage: 200,
        hullStandard: true,
        minCrew: 4,
        streamlined: true,
        cargoCapacity: 82,
        cost: 37.08,
        jump: 1,
        powerPlant: "A",
        acceleration: 1,
        staterooms: 10,
        lowBerths: 20,
        mortgage: new Mortgage(150_000, 40),
        vehicles: [],
    };
}

/** Ship mortgage: monthly payment with remaining term in years. */
export class Mortgage {
    monthlyPayment: number;
    maturity: number;

    constructor(monthlyPayment: number, maturity: number) {
        this.monthlyPayment = monthlyPayment;
        this.maturity = maturity;
    }

    get totalPayment(): number {
        return this.monthlyPayment * 12 * this.maturity;
    }
}
