import { Random, MersenneTwister19937, createEntropy, nativeMath } from "random-js";

enum TravelZoneType { Amber = "A", Red = "R" }

enum TradeClassification { Agricultural = "Agricultural", NonAgricultural = "Non-agricultural", Industrial = "Industrial", NonIndustrial = "Non-indisturial", Rich = "Rich", Poor = "Poor", Water = "Water", Desert = "Desert", Vacuum = "Vacuum", AsteroidBelt = "Asteroid Belt", IceCapped = "Ice-capped", SubsectorCapital = "Subsector Capital" }

class World {
    hex: Hex;
    name: string;
    planetarySize: number;
    planetaryAthmosphere: number;
    hydrographicPercentage: number;
    population: number;
    planetaryGovernment: number;
    lawLevel: number;
    technologicalLevel: number;
    tradeClassifications: TradeClassification[] = [];

    get uwp(): string {
        return (this.hex.starport + this.planetarySize.toString(16) + this.planetaryAthmosphere.toString(16) + this.hydrographicPercentage.toString(16) + this.population.toString(16) + this.planetaryGovernment.toString(16) + this.lawLevel.toString(16) + '-' + ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'][this.technologicalLevel]).toUpperCase();
    }

    tradeClassificationsToString(): string {
        return this.tradeClassifications.join(", ");
    }

    constructor(hex: Hex, random: Random) {
        // FIXME: this function should probably defined in an extended Random (see chargen for identical function on Character class)
        function roll(dice: number = 2): number { // default roll is two dice
            return random.dice(6, dice).reduce((a, b) => a + b, 0);
        }

        function clamp(value: number, min: number, max: number): number {
            return Math.max(min, Math.min(value, max));
        }

        this.hex = hex;
        this.name = "Betelguese V"; // FIXME: random world name

        this.planetarySize = clamp(roll(2) - 2, 0, 10);

        if (this.planetarySize == 0) {
            this.planetaryAthmosphere = 0;
        } else {
            this.planetaryAthmosphere = roll(2) - 7 + this.planetarySize;
        }
        this.planetaryAthmosphere = clamp(this.planetaryAthmosphere, 0, 12);

        if (this.planetarySize == 0) {
            this.hydrographicPercentage = 0;
        } else if (this.planetaryAthmosphere <= 1 || this.planetaryAthmosphere >= 10) { // 0, 1, A+
            this.hydrographicPercentage = roll(2) - 7 - 4 + this.planetaryAthmosphere;
        } else {
            this.hydrographicPercentage = roll(2) - 7 + this.planetaryAthmosphere;
        }
        this.hydrographicPercentage = clamp(this.hydrographicPercentage, 0, 10);

        this.population = clamp(roll(2) - 2, 0, 10);

        this.planetaryGovernment = clamp(roll(2) - 7 + this.population, 0, 13);

        this.lawLevel = clamp(roll(2) - 7 + this.planetaryGovernment, 0, 9);

        let techLevelDM = 0;
        switch (hex.starport) {
            case "A":
                techLevelDM += 6;
                break;
            case "B":
                techLevelDM += 4;
                break;
            case "C":
                techLevelDM += 2;
                break;
            case "X":
                techLevelDM -= 4;
                break;
        }

        if (this.planetarySize <= 1) {
            techLevelDM += 2;
        } else if (this.planetarySize <= 4) {
            techLevelDM += 1;
        }

        if (this.planetaryAthmosphere <= 3 || this.planetaryAthmosphere >= 10) {
            techLevelDM += 1;
        }

        if (this.hydrographicPercentage == 9) {
            techLevelDM += 1;
        } else if (this.hydrographicPercentage == 10) {
            techLevelDM += 2;
        }

        if (this.population > 0 && this.population <= 5) {
            techLevelDM += 1;
        } else if (this.population == 9) {
            techLevelDM += 2;
        } else if (this.population == 10) {
            techLevelDM += 4;
        }

        switch (this.planetaryGovernment) {
            case 0:
                techLevelDM += 1;
                break;
            case 5:
                techLevelDM += 5;
                break;
            case 13:
                techLevelDM -= 2;
                break;
        }

        this.technologicalLevel = clamp(roll(1) + techLevelDM, 0, 20);

        // trade classifications
        if (this.planetaryAthmosphere >= 4 && this.planetaryAthmosphere <= 9 && this.hydrographicPercentage >= 4 && this.hydrographicPercentage <= 8 && this.population >= 5 && this.population <= 7) {
            this.tradeClassifications.push(TradeClassification.Agricultural);
        }
        if (this.planetaryAthmosphere <= 3 && this.hydrographicPercentage <= 3 && this.population >= 6) {
            this.tradeClassifications.push(TradeClassification.NonAgricultural);
        }
        if (this.planetaryAthmosphere in [0, 1, 2, 4, 7, 9] && this.population >= 9) {
            this.tradeClassifications.push(TradeClassification.Industrial);
        }
        if (this.population <= 6) {
            this.tradeClassifications.push(TradeClassification.NonIndustrial);
        }
        if (this.planetaryGovernment >= 4 && this.planetaryGovernment <= 9 && this.planetaryAthmosphere in [6, 8] && this.population in [6, 7, 8]) {
            this.tradeClassifications.push(TradeClassification.Rich);
        }
        if (this.planetaryAthmosphere in [2, 3, 4, 5] && this.hydrographicPercentage <= 3) {
            this.tradeClassifications.push(TradeClassification.Poor);
        }
        if (this.hydrographicPercentage == 10) {
            this.tradeClassifications.push(TradeClassification.Water);
        }
        if (this.hydrographicPercentage == 0) {
            this.tradeClassifications.push(TradeClassification.Desert);
        }
        if (this.planetaryAthmosphere == 0) {
            this.tradeClassifications.push(TradeClassification.Vacuum);
        }
        if (this.planetarySize == 0) {
            this.tradeClassifications.push(TradeClassification.AsteroidBelt);
        }
        if (this.planetaryAthmosphere in [0, 1] && this.hydrographicPercentage >= 1) {
            this.tradeClassifications.push(TradeClassification.IceCapped);
        }       

        // travel advisory, https://www.traveller-srd.com/core-rules/world-creation/
        if (this.planetaryAthmosphere >= 10 || this.planetaryGovernment in [0, 7, 10] || this.lawLevel == 0 || this.lawLevel >= 9) {
            this.hex.travelZone = TravelZoneType.Amber;
        }
    }

}

class Hex {
    coordinates: Coordinate;
    world?: World;
    starport: string = "X";
    navalBase: boolean = false;
    scoutBase: boolean = false;
    gasGiant: boolean = false;
    travelZone?: TravelZoneType;
    systemName?: string;

    toString(): string {
        if (this.world) {
            // name, hex location, UPP, bases, trade classifications, travel zones (A/R), gas giant (G/-)
            return `${this.systemName} ${('0000' + this.hexNumber).slice(-4)} ${this.world.uwp} ${this.basesToString()} ${this.world.tradeClassificationsToString()} ${this.travelZone ? this.travelZone : '-'} ${this.gasGiant ? 'G' : '-'}`;
        } else {
            return "- " + ('0000' + this.hexNumber).slice(-4);
        }
    }

    basesToString(): string {
        if (this.navalBase && this.scoutBase) {
            return '2';
        } else if (this.navalBase) {
            return 'N';
        } else if (this.scoutBase) {
            return 'S';
        } else {
            return '-';
        }
    }

    get hexNumber(): number {
        return this.coordinates[0] * 100 + this.coordinates[1];
    }

    constructor(column: number, row: number, random: Random) {
        // FIXME: this function should probably defined in an extended Random (see chargen for identical function on Character class)
        function roll(dice: number = 2): number { // default roll is two dice
            return random.dice(6, dice).reduce((a, b) => a + b, 0);
        }

        this.coordinates = [column, row];
        if (roll(1) >= 4) { // this hex has a world

            let scoutBaseDM = 0;
            // Starport
            switch (roll(2)) {
                case 2:
                case 3:
                case 4:
                    this.starport = "A";
                    scoutBaseDM = -3;
                    break;
                case 5:
                case 6:
                    this.starport = "B";
                    scoutBaseDM = -2;
                    break;
                case 7:
                case 8:
                    this.starport = "C";
                    scoutBaseDM = -1;
                    break;
                case 9:
                    this.starport = "D";
                    break;
                case 10:
                case 11:
                    this.starport = "E";
                    break;
                case 12:
                    this.starport = "X";
                    break;
            }
            // Naval base presence
            if (!(this.starport in ["C", "D", "E", "X"]) && roll(2) >= 8) {
                this.navalBase = true;
            }
            // Scout base presence
            if (roll(2) + scoutBaseDM >= 7) {
                this.scoutBase = true;
            }
            // gas giant presence
            if (roll(2) <= 9) {
                this.gasGiant = true;
            }

            // world creation
            this.world = new World(this, random);
            this.systemName = this.world.name;


        } // else an empty hex
        console.log(this.toString());
    }
}

type Coordinate = [column: number, row: number];

class Subsector {
    seed: number;
    random: Random;
    hexes: Hex[] = [];

    constructor(seed?: number) {
        this.seed = seed ? seed : createEntropy(nativeMath, 1)[0];
        console.debug(`Using seed ${this.seed} to generate a new subsector`);
        this.random = new Random(MersenneTwister19937.seed(this.seed));

        // create subsector 8x10 hexes
        for (let i = 1; i <= 8; i++) {
            for (let j = 1; j <= 10; j++) {
                this.hexes.push(new Hex(i, j, this.random));
            }
        }

        // FIXME: create communication routes

        // FIXME: choose subsector capital (add trade classification to that world)
        // capital has high population, high tech level, some government and some law and is a hub of communication routes
    }

}

export { Subsector }