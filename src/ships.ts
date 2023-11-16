import names from "./names/ships";
import { Random } from "./random";

abstract class Ship {
    name?: string;
    type!: string;
    tonnage!: number;
    hullStandard!: boolean;
    age: number = 0;
    mortgage?: Mortgage;
    minCrew!: number;
    streamlined!: boolean;
    cargoCapacity!: number;
    cost!: number;
    vehicles: string[] = [];
    acceleration!: number;
    jump!: number;
    powerPlant!: string;
    staterooms!: number;
    lowBerths!: number;


    constructor(name?: string) {
        const random = new Random();
        this.name = name ? name : random.pick(names);
    }

    toString(): string {
        return `${this.name} (type: ${this.type})`;
    }

}

class ScoutCourier extends Ship {
    type = 'S';
    tonnage = 100;
    hullStandard = true;
    minCrew = 1;
    streamlined = true;
    cargoCapacity = 3;
    cost = 29.43;
    vehicles = ["Air/Raft"];
    jump = 2;
    powerPlant = "A";
    acceleration = 2;
    staterooms = 4;
    lowBerths = 0;
}

class FreeTrader extends Ship {
    type = 'A';
    tonnage = 200;
    hullStandard = true;
    minCrew = 4;
    streamlined = true;
    cargoCapacity = 82;
    cost = 37.08;
    jump = 1;
    powerPlant = 'A';
    acceleration = 1;
    staterooms = 10;
    lowBerths = 20;
    mortgage = new Mortgage(150_000, 40);
}

class Mortgage {
    monthly_payment: number;
    maturity: number;

    constructor(monthly_payment: number, maturity: number) {
        this.monthly_payment = monthly_payment;
        this.maturity = maturity;
    }

    get total_payment(): number {
        return this.monthly_payment * 12 * this.maturity;
    }
}

export { ScoutCourier, FreeTrader, Ship }
