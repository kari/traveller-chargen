import { Random } from "./random";
import names from "./names/worlds";
import { NameGenerator } from "@ksilvennoinen/markov-namegen";
import { clamp, ehex } from "./utils";

enum TravelZoneType {
    Amber = "A",
    Red = "R",
}

enum TradeClassification {
    Agricultural = "Ag",
    NonAgricultural = "Na",
    Industrial = "In",
    NonIndustrial = "Ni",
    Rich = "Ri",
    Poor = "Po",
    Water = "Wa",
    Desert = "De",
    Vacuum = "Va",
    AsteroidBelt = "As",
    IceCapped = "Ic",
    SubsectorCapital = "Cp",
}

type Starport = "A" | "B" | "C" | "D" | "E" | "X";

class World {
    name: string;
    starport: Starport;
    planetarySize: number;
    planetaryAthmosphere: number;
    hydrographicPercentage: number;
    population: number;
    planetaryGovernment: number;
    lawLevel: number;
    technologicalLevel: number;
    tradeClassifications: TradeClassification[] = [];

    get uwp(): string {
        return `${this.starport}${[
            this.planetarySize,
            this.planetaryAthmosphere,
            this.hydrographicPercentage,
            this.population,
            this.planetaryGovernment,
            this.lawLevel,
        ]
            .map(ehex)
            .join("")}-${ehex(this.technologicalLevel)}`;
    }

    tradeClassificationsToString(): string {
        return this.tradeClassifications.join(" ");
    }

    constructor(random: Random, starport?: Starport) {
        this.starport = starport ?? Hex.rollStarport(random);
        const namegen = new NameGenerator(names, 3, 0.01, true);
        this.name = namegen.generateNames(1, 4, 12, "", "", "", "")[0];
        this.name =
            this.name.substring(0, 1).toUpperCase() + this.name.substring(1); // FIXME: add capitalization function to handle spaces etc.

        this.planetarySize = clamp(random.roll(2) - 2, 0, 10);

        if (this.planetarySize === 0) {
            this.planetaryAthmosphere = 0;
        } else {
            this.planetaryAthmosphere = random.roll(2) - 7 + this.planetarySize;
        }
        this.planetaryAthmosphere = clamp(this.planetaryAthmosphere, 0, 12);

        if (this.planetarySize === 0) {
            this.hydrographicPercentage = 0;
        } else if (
            this.planetaryAthmosphere <= 1 ||
            this.planetaryAthmosphere >= 10
        ) {
            // 0, 1, A+
            this.hydrographicPercentage =
                random.roll(2) - 7 - 4 + this.planetaryAthmosphere;
        } else {
            this.hydrographicPercentage =
                random.roll(2) - 7 + this.planetaryAthmosphere;
        }
        this.hydrographicPercentage = clamp(this.hydrographicPercentage, 0, 10);

        this.population = clamp(random.roll(2) - 2, 0, 10);

        this.planetaryGovernment = clamp(
            random.roll(2) - 7 + this.population,
            0,
            13,
        );

        this.lawLevel = clamp(
            random.roll(2) - 7 + this.planetaryGovernment,
            0,
            9,
        );

        let techLevelDM = 0;
        switch (starport) {
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

        if (this.hydrographicPercentage === 9) {
            techLevelDM += 1;
        } else if (this.hydrographicPercentage === 10) {
            techLevelDM += 2;
        }

        if (this.population > 0 && this.population <= 5) {
            techLevelDM += 1;
        } else if (this.population === 9) {
            techLevelDM += 2;
        } else if (this.population === 10) {
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

        this.technologicalLevel = clamp(random.roll(1) + techLevelDM, 0, 20);

        // Define trade classifications bsaed on world's attributes
        if (
            this.planetaryAthmosphere >= 4 &&
            this.planetaryAthmosphere <= 9 &&
            this.hydrographicPercentage >= 4 &&
            this.hydrographicPercentage <= 8 &&
            this.population >= 5 &&
            this.population <= 7
        ) {
            this.tradeClassifications.push(TradeClassification.Agricultural);
        }
        if (
            this.planetaryAthmosphere <= 3 &&
            this.hydrographicPercentage <= 3 &&
            this.population >= 6
        ) {
            this.tradeClassifications.push(TradeClassification.NonAgricultural);
        }
        if (
            [0, 1, 2, 4, 7, 9].includes(this.planetaryAthmosphere) &&
            this.population >= 9
        ) {
            this.tradeClassifications.push(TradeClassification.Industrial);
        }
        if (this.population <= 6) {
            this.tradeClassifications.push(TradeClassification.NonIndustrial);
        }
        if (
            this.planetaryGovernment >= 4 &&
            this.planetaryGovernment <= 9 &&
            [6, 8].includes(this.planetaryAthmosphere) &&
            [6, 7, 8].includes(this.population)
        ) {
            this.tradeClassifications.push(TradeClassification.Rich);
        }
        if (
            [2, 3, 4, 5].includes(this.planetaryAthmosphere) &&
            this.hydrographicPercentage <= 3
        ) {
            this.tradeClassifications.push(TradeClassification.Poor);
        }
        if (this.hydrographicPercentage === 10) {
            this.tradeClassifications.push(TradeClassification.Water);
        }
        if (this.hydrographicPercentage === 0) {
            this.tradeClassifications.push(TradeClassification.Desert);
        }
        if (this.planetaryAthmosphere === 0) {
            this.tradeClassifications.push(TradeClassification.Vacuum);
        }
        if (this.planetarySize === 0) {
            this.tradeClassifications.push(TradeClassification.AsteroidBelt);
        }
        if (
            [0, 1].includes(this.planetaryAthmosphere) &&
            this.hydrographicPercentage >= 1
        ) {
            this.tradeClassifications.push(TradeClassification.IceCapped);
        }
    }
}

class Hex {
    coordinates: Coordinate;
    world?: World;
    starport: Starport = "X";
    navalBase = false;
    scoutBase = false;
    gasGiant = false;
    travelZone?: TravelZoneType;
    systemName?: string;

    toString(): string {
        if (this.world) {
            // name, hex location, UPP, bases, trade classifications, travel zones (A/R), gas giant (G/-)
            return `${this.systemName} ${`0000${this.hexNumber}`.slice(-4)} ${
                this.world.uwp
            } ${this.basesToString()} ${
                this.world.tradeClassifications.length > 0
                    ? `${this.world.tradeClassificationsToString()} `
                    : ""
            }${this.travelZone ? this.travelZone : "-"} ${
                this.gasGiant ? "G" : "-"
            }`;
        }
        return `- ${`0000${this.hexNumber}`.slice(-4)}`;
    }

    basesToString(): string {
        if (this.navalBase && this.scoutBase) {
            return "A";
        }
        if (this.navalBase) {
            return "N";
        }
        if (this.scoutBase) {
            return "S";
        }
        return "-";
    }

    get hexNumber(): number {
        return this.coordinates[0] * 100 + this.coordinates[1];
    }

    static rollStarport(random: Random): Starport {
        switch (random.roll(2)) {
            case 2:
            case 3:
            case 4:
                return "A";
            case 5:
            case 6:
                return "B";
            case 7:
            case 8:
                return "C";
            case 9:
                return "D";
            case 10:
            case 11:
                return "E";
            case 12:
                return "X";
            default:
                return "X";
        }
    }

    constructor(column: number, row: number, random: Random) {
        this.coordinates = [column, row];
        if (random.roll(1) >= 4) {
            // this hex has a world

            this.starport = Hex.rollStarport(random);

            // Scout base presence
            let scoutBaseDM = 0;
            switch (this.starport) {
                case "A":
                    scoutBaseDM = -3;
                    break;
                case "B":
                    scoutBaseDM = -2;
                    break;
                case "C":
                    scoutBaseDM = -1;
                    break;
            }
            if (random.roll(2) + scoutBaseDM >= 7) {
                this.scoutBase = true;
            }
            // Naval base presence
            if (
                !(["C", "D", "E", "X"].includes(this.starport)) &&
                random.roll(2) >= 8
            ) {
                this.navalBase = true;
            }
            // gas giant presence
            if (random.roll(2) <= 9) {
                this.gasGiant = true;
            }

            // world creation
            this.world = new World(random, this.starport);
            this.systemName = this.world.name;

            // travel advisory, https://www.traveller-srd.com/core-rules/world-creation/
            if (
                this.world.planetaryAthmosphere >= 10 ||
                [0, 7, 10].includes(this.world.planetaryGovernment) ||
                this.world.lawLevel === 0 ||
                this.world.lawLevel >= 9
            ) {
                this.travelZone = TravelZoneType.Amber;
            }
        } // else an empty hex
        // console.log(this.toString());
    }
}

type Coordinate = [column: number, row: number];

class Subsector {
    seed: number;
    random: Random;
    hexes: Hex[] = [];
    name: string;
    sector: {
        name: string;
    };

    constructor(seed?: number) {
        this.random = new Random(seed);
        this.seed = this.random.seed;
        console.debug(`Using seed ${this.seed} to generate a new subsector`);

        const namegen = new NameGenerator(names, 3, 0.01, true);
        const sector_names = namegen.generateNames(2, 4, 12, "", "", "", "");
        this.name =
            sector_names[0].substring(0, 1).toUpperCase() +
            sector_names[0].substring(1);
        this.sector = {
            name:
                sector_names[1].substring(0, 1).toUpperCase() +
                sector_names[1].substring(1),
        };

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

export { Subsector, World, Hex, TravelZoneType };
