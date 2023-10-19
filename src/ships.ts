
abstract class Ship {
    name?: string;
    type!: string;
    tonnage!: number;
    age: number = 0;
    mortgage?: Mortgage;

    constructor(name?: string) {
        this.name = name;
    }

    toString(): string {
        return `${this.name} (type: ${this.type})`;
    }
}

class ScoutCourier extends Ship {
    type = 'S';
    tonnage = 100;
}

class FreeTrader extends Ship {
    type = 'A';
    tonnage = 200;
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