import type { Gender } from "./character";
import female_names from "./names/female";
import last_names from "./names/last_name";
import male_names from "./names/male";
import type { Random } from "./random";

const names = {
    male: male_names,
    female: female_names,
    last: last_names,
} satisfies Record<"male" | "female" | "last", readonly string[]>;

/** Character name with noble title/prefix from social standing (Book 1). */
export class Name {
    title?: string | undefined;
    first: string;
    middle?: string;
    prefix?: string | undefined;
    last: string;

    /**
     * Full name with noble title and prefix (set `title` false for the
     * plain name, e.g. TAS Form 2 box 2).
     */
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

    constructor(gender: Gender, socialStanding: number, random: Random) {
        this.first = random.pick(names[gender]);
        // FIXME: generate middle initial?
        this.last = random.pick(names.last);

        this.addTitle(socialStanding, gender, random);
    }

    get middleInitial(): string | null {
        if (this.middle) {
            return `${this.middle.charAt(0)}.`;
        }
        return null;
    }

    /** Assigns the noble title for SOC 11+ (Baron prefix fallback at SOC 12). */
    addTitle(socialStanding: number, gender: Gender, random: Random): void {
        switch (socialStanding) {
            case 11: // Knight
                if (gender === "male") {
                    this.title = "Sir";
                } else {
                    this.title = "Dame";
                }
                break;
            case 12:
                if (this.prefix || random.roll(1) <= 3) {
                    if (gender === "male") {
                        this.title = "Baron";
                    } else {
                        this.title = random.pick(["Baronet", "Baroness"]);
                    }
                } else {
                    // in lieu of a title, use prefix in name
                    if (!this.prefix) {
                        this.addPrefix(socialStanding, random);
                    }
                    this.title = undefined;
                }
                break;
            case 13:
                if (gender === "male") {
                    this.title = "Marquis";
                } else {
                    this.title = random.pick(["Marquesa", "Marchioness"]);
                }
                break;
            case 14:
                if (gender === "male") {
                    this.title = "Count";
                } else {
                    this.title = "Countess";
                }
                break;
            case 15:
                if (gender === "male") {
                    this.title = "Duke";
                } else {
                    this.title = "Duchess";
                }
                break;
            default:
                this.title = undefined;
        }
    }

    // if character has the nobility of a Baron but doesn't (want to) use the title
    protected addPrefix(socialStanding: number, random: Random): void {
        if (socialStanding === 12) {
            this.prefix = random.pick(["von ", "hault-", "haut-"]);
        }
    }
}
