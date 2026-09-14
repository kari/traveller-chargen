import female_names from "./names/female";
import last_names from "./names/last_name";
import male_names from "./names/male";
import type { Random } from "./random";

const names = {
    male: male_names,
    female: female_names,
    last: last_names,
};

export class Name {
    title?: string | undefined;
    first: string;
    middle?: string;
    prefix?: string | undefined;
    last: string;

    toString(title = true): string {
        if (title) {
            return `${this.title ? `${this.title} ` : ""}${this.first} ${
                this.middle ? `${this.middle} ` : ""
            }${this.prefix ?? ""}${this.last}`;
        }
        return `${this.first} ${this.middle ? `${this.middle} ` : ""}${
            this.prefix ?? ""
        }${this.last}`;
    }

    constructor(
        gender: "male" | "female",
        socialStanding: number,
        random: Random,
    ) {
        this.first = random.pick(names[gender]);
        this.last = random.pick(names.last);

        this.title = this.addTitle(socialStanding, gender, random);
    }

    get middleInitial(): string | null {
        if (this.middle) {
            return `${this.middle.charAt(0)}.`;
        }
        return null;
    }

    addTitle(
        socialStanding: number,
        gender: "male" | "female",
        random: Random,
    ): string | undefined {
        switch (socialStanding) {
            case 11: // Knight
                if (gender === "male") {
                    return "Sir";
                }
                return "Dame";
            case 12:
                if (this.prefix || random.roll(1) <= 3) {
                    if (gender === "male") {
                        return "Baron";
                    }
                    return random.pick(["Baronet", "Baroness"]);
                }
                // in lieu of a title, use prefix in name
                if (!this.prefix) {
                    this.prefix = this.addPrefix(socialStanding, random);
                }
                return undefined;
            case 13:
                if (gender === "male") {
                    return "Marquis";
                }
                return random.pick(["Marquesa", "Marchioness"]);
            case 14:
                if (gender === "male") {
                    return "Count";
                }
                return "Countess";
            case 15:
                if (gender === "male") {
                    return "Duke";
                }
                return "Duchess";
            default:
                return undefined;
        }
    }

    // if character has the nobility of a Baron but doesn't (want to) use the title
    protected addPrefix(
        socialStanding: number,
        random: Random,
    ): string | undefined {
        if (socialStanding === 12) {
            return random.pick(["von ", "hault-", "haut-"]);
        }
        return undefined;
    }
}
