import { NameGenerator } from "@ksilvennoinen/markov-namegen";
import names from "./names/worlds";
import { Random } from "./random";
import { clamp, ehex } from "./utils";

export const TravelZoneType = {
    Amber: "A",
    Red: "R",
} as const;
export type TravelZoneType =
    (typeof TravelZoneType)[keyof typeof TravelZoneType];

export const TradeClassification = {
    Agricultural: "Ag",
    NonAgricultural: "Na",
    Industrial: "In",
    NonIndustrial: "Ni",
    Rich: "Ri",
    Poor: "Po",
    Water: "Wa",
    Desert: "De",
    Vacuum: "Va",
    AsteroidBelt: "As",
    IceCapped: "Ic",
    SubsectorCapital: "Cp",
} as const;
export type TradeClassification =
    (typeof TradeClassification)[keyof typeof TradeClassification];

export type Starport = "A" | "B" | "C" | "D" | "E" | "X";

const starportRank: Record<Starport, number> = {
    A: 5,
    B: 4,
    C: 3,
    D: 2,
    E: 1,
    X: 0,
};

const scoutBaseDMs: Record<Starport, number> = {
    A: -3,
    B: -2,
    C: -1,
    D: 0,
    E: 0,
    X: 0,
};

export interface WorldProfile {
    starport: Starport;
    planetaryAthmosphere: number;
    population: number;
    planetaryGovernment: number;
    lawLevel: number;
    rollForAmber?: () => number;
}

/**
 * Whether a world profile looks dangerous enough for an Amber zone
 * (corrosive/insidious atmosphere, no/charismatic/impersonal rule,
 * no law or extreme law). Mirrors the post-CT codified predicate.
 */
export function hasDangerousProfile(world: WorldProfile): boolean {
    return (
        world.planetaryAthmosphere >= 10 ||
        world.planetaryGovernment === 0 ||
        world.planetaryGovernment === 7 ||
        world.planetaryGovernment === 10 ||
        world.lawLevel === 0 ||
        world.lawLevel >= 9
    );
}

/**
 * Whether a world profile has a functioning government and law, as
 * preferred for a subsector capital.
 */
export function isWellGoverned(world: WorldProfile): boolean {
    return !(
        world.planetaryGovernment === 0 ||
        world.planetaryGovernment === 7 ||
        world.planetaryGovernment === 10 ||
        world.lawLevel === 0 ||
        world.lawLevel >= 9
    );
}

/**
 * Assigns a travel zone to a world: Red for an interdicted sizable
 * population with no starport, Amber for dangerous profiles confirmed
 * by a rarity roll (2d6 >= 11, ~8%), nothing otherwise. Red takes
 * precedence over Amber. The rarity gate keeps Amber zones exceptional
 * rather than every third world.
 */
export function assignTravelZone(
    world: WorldProfile,
    random: Random,
): TravelZoneType | undefined {
    if (world.starport === "X" && world.population >= 4) {
        return TravelZoneType.Red;
    }
    const rarityRoll = world.rollForAmber?.() ?? random.roll();
    if (hasDangerousProfile(world) && rarityRoll >= 11) {
        return TravelZoneType.Amber;
    }
    return undefined;
}

class World {
    readonly name: string;
    readonly starport: Starport;
    readonly planetarySize: number;
    readonly planetaryAthmosphere: number;
    readonly hydrographicPercentage: number;
    readonly population: number;
    readonly planetaryGovernment: number;
    readonly lawLevel: number;
    readonly technologicalLevel: number;
    readonly tradeClassifications: readonly TradeClassification[];

    /**
     * Adds a trade classification to the world (used post-construction for
     * derived remarks such as the subsector capital). Duplicate additions
     * are ignored.
     */
    addTradeClassification(classification: TradeClassification): void {
        if (!this.mutableTradeClassifications().includes(classification)) {
            this.mutableTradeClassifications().push(classification);
        }
    }

    private mutableTradeClassifications(): TradeClassification[] {
        return this.tradeClassifications as TradeClassification[];
    }

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
        const namegen = new NameGenerator(names, 3, 0.01, true, () =>
            random.real(0, 1),
        );
        const generatedName = namegen.generateNames(
            1,
            4,
            12,
            "",
            "",
            "",
            "",
        )[0];
        if (generatedName === undefined) {
            throw new Error("World name generation failed");
        }
        this.name = generatedName;
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
        switch (this.starport) {
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

        const tradeClassifications: TradeClassification[] = [];

        // Define trade classifications based on world's attributes
        if (
            this.planetaryAthmosphere >= 4 &&
            this.planetaryAthmosphere <= 9 &&
            this.hydrographicPercentage >= 4 &&
            this.hydrographicPercentage <= 8 &&
            this.population >= 5 &&
            this.population <= 7
        ) {
            tradeClassifications.push(TradeClassification.Agricultural);
        }
        if (
            this.planetaryAthmosphere <= 3 &&
            this.hydrographicPercentage <= 3 &&
            this.population >= 6
        ) {
            tradeClassifications.push(TradeClassification.NonAgricultural);
        }
        if (
            [0, 1, 2, 4, 7, 9].includes(this.planetaryAthmosphere) &&
            this.population >= 9
        ) {
            tradeClassifications.push(TradeClassification.Industrial);
        }
        if (this.population <= 6) {
            tradeClassifications.push(TradeClassification.NonIndustrial);
        }
        if (
            this.planetaryGovernment >= 4 &&
            this.planetaryGovernment <= 9 &&
            [6, 8].includes(this.planetaryAthmosphere) &&
            [6, 7, 8].includes(this.population)
        ) {
            tradeClassifications.push(TradeClassification.Rich);
        }
        if (
            [2, 3, 4, 5].includes(this.planetaryAthmosphere) &&
            this.hydrographicPercentage <= 3
        ) {
            tradeClassifications.push(TradeClassification.Poor);
        }
        if (this.hydrographicPercentage === 10) {
            tradeClassifications.push(TradeClassification.Water);
        }
        if (this.hydrographicPercentage === 0) {
            tradeClassifications.push(TradeClassification.Desert);
        }
        if (this.planetaryAthmosphere === 0) {
            tradeClassifications.push(TradeClassification.Vacuum);
        }
        if (this.planetarySize === 0) {
            tradeClassifications.push(TradeClassification.AsteroidBelt);
        }
        if (
            [0, 1].includes(this.planetaryAthmosphere) &&
            this.hydrographicPercentage >= 1
        ) {
            tradeClassifications.push(TradeClassification.IceCapped);
        }

        this.tradeClassifications = tradeClassifications;
        assertWorldBounds(this);
    }
}

function assertWorldBounds(world: World): void {
    const boundedValues: Array<[string, number, number, number]> = [
        ["planetary size", world.planetarySize, 0, 10],
        ["planetary atmosphere", world.planetaryAthmosphere, 0, 12],
        ["hydrographic percentage", world.hydrographicPercentage, 0, 10],
        ["population", world.population, 0, 10],
        ["planetary government", world.planetaryGovernment, 0, 13],
        ["law level", world.lawLevel, 0, 9],
        ["technological level", world.technologicalLevel, 0, 20],
    ];

    for (const [name, value, minimum, maximum] of boundedValues) {
        if (!Number.isInteger(value) || value < minimum || value > maximum) {
            throw new RangeError(
                `${name} must be an integer between ${minimum} and ${maximum}: ${value}`,
            );
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
    travelZone: TravelZoneType | undefined;
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
        this.travelZone = undefined;
        if (random.roll(1) >= 4) {
            // this hex has a world

            this.starport = Hex.rollStarport(random);

            // Scout base presence
            if (random.roll(2) + scoutBaseDMs[this.starport] >= 7) {
                this.scoutBase = true;
            }
            // Naval base presence
            if (
                !["C", "D", "E", "X"].includes(this.starport) &&
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
            // Red for interdicted sizable populations; Amber for dangerous
            // profiles confirmed by a rarity roll (Red takes precedence).
            // NOTE: further Red codes remain at the discretion of the Referee.
            this.travelZone = assignTravelZone(this.world, random);
        } // else an empty hex
    }
}

type Coordinate = [column: number, row: number];

/**
 * Compares two inhabited hexes for capital candidacy: highest population,
 * then highest tech level, then best starport. Returns a positive number
 * when `a` outranks `b`.
 */
function compareCapitalCandidates(a: Hex, b: Hex): number {
    const worldA = a.world;
    const worldB = b.world;
    if (worldA === undefined || worldB === undefined) {
        throw new Error("Capital candidates must have worlds");
    }
    return (
        worldA.population - worldB.population ||
        worldA.technologicalLevel - worldB.technologicalLevel ||
        starportRank[worldA.starport] - starportRank[worldB.starport]
    );
}

/**
 * Selects the subsector capital: the inhabited world with the highest
 * population, breaking ties by tech level then starport quality. Worlds
 * with extreme government (0, 7, 10) or law (0, 9+) are excluded when
 * better-governed candidates exist. Exact ties are broken with the
 * provided random source. Returns undefined when no inhabited world exists.
 */
export function selectCapital(hexes: Hex[], random: Random): Hex | undefined {
    const inhabited = hexes.filter(
        (h) => h.world !== undefined && h.world.population > 0,
    );
    if (inhabited.length === 0) {
        return undefined;
    }
    const governed = inhabited.filter(
        (h) => h.world !== undefined && isWellGoverned(h.world),
    );
    const candidates = governed.length > 0 ? governed : inhabited;
    const best = candidates.reduce((a, b) =>
        compareCapitalCandidates(b, a) > 0 ? b : a,
    );
    const tied = candidates.filter(
        (h) => compareCapitalCandidates(h, best) === 0,
    );
    return random.pick(tied);
}

class Subsector {
    seed: number;
    random: Random;
    hexes: Hex[] = [];
    name: string;
    sectorName: string;
    capital?: Hex;

    constructor(seedOrRandom?: number | Random) {
        this.random =
            seedOrRandom instanceof Random
                ? seedOrRandom
                : new Random(seedOrRandom);
        this.seed = this.random.seed;

        const namegen = new NameGenerator(names, 3, 0.01, true, () =>
            this.random.real(0, 1),
        );
        const sector_names = namegen.generateNames(2, 4, 12, "", "", "", "");
        const [subsectorName, sectorName] = sector_names;
        if (subsectorName === undefined || sectorName === undefined)
            throw new Error("Subsector name generation failed");

        this.name =
            subsectorName.substring(0, 1).toUpperCase() +
            subsectorName.substring(1);
        this.sectorName =
            sectorName.substring(0, 1).toUpperCase() + sectorName.substring(1);

        // create subsector 8x10 hexes
        for (let i = 1; i <= 8; i++) {
            for (let j = 1; j <= 10; j++) {
                this.hexes.push(new Hex(i, j, this.random));
            }
        }

        // FIXME: create communication routes

        // Subsector capital: highest population, then highest tech level,
        // then best starport (some government and some law preferred).
        const capital = selectCapital(this.hexes, this.random);
        if (capital?.world !== undefined) {
            capital.world.addTradeClassification(
                TradeClassification.SubsectorCapital,
            );
            this.capital = capital;
        }
    }
}

function generateSubsector(seedOrRandom?: number | Random): Subsector {
    return new Subsector(seedOrRandom);
}

export { generateSubsector, Hex, Subsector, World };
