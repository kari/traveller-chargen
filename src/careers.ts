import { applyEffect, type DmRule, type Effect } from "./career_effects";
import type { Attribute, Character } from "./character";
import type { ItemName } from "./items";
import type { SkillName } from "./skills";

export type D6Table<T> = readonly [T, T, T, T, T, T];

export type D7Table<T> = readonly [T, T, T, T, T, T, T];

export interface Career {
    name: string;
    memberName: string | null;
    military: boolean;
    enlistment: number;
    draft: number;
    survival: number;
    commission: number | null;
    promotion: number | null;
    reenlist: number;
    ranks: readonly (string | null)[] | null;
    cashTable: D7Table<number>;
    skillsTable: D6Table<SkillName>;
    advancedEducationTable: D6Table<SkillName>;
    advancedEducationTable8: D6Table<SkillName>;
    retirementPay: boolean;
    enlistmentDMs: readonly DmRule[];
    survivalDMs: readonly DmRule[];
    commissionDMs: readonly DmRule[];
    promotionDMs: readonly DmRule[];
    personalDevelopment: D6Table<Effect>;
    benefits: D7Table<Effect>;
    rankRewards: Partial<Record<number, readonly Effect[]>>;
}

const strPlus1: Effect = {
    kind: "attribute",
    attribute: "strength",
    amount: 1,
};
const dexPlus1: Effect = {
    kind: "attribute",
    attribute: "dexterity",
    amount: 1,
};
const endPlus1: Effect = {
    kind: "attribute",
    attribute: "endurance",
    amount: 1,
};

const attributeEffect = (attribute: Attribute, amount: number): Effect => ({
    kind: "attribute",
    attribute,
    amount,
});
const skillEffect = (skill: SkillName): Effect => ({ kind: "skill", skill });
const weaponEffect = (weapon: "blade" | "gun"): Effect => ({
    kind: "weapon",
    weapon,
});
const itemEffect = (item: ItemName): Effect => ({ kind: "item", item });

const Navy = {
    name: "Navy",
    memberName: "Navy",
    military: true,
    enlistment: 8,
    draft: 1,
    survival: 5,
    commission: 10,
    promotion: 8,
    reenlist: 6,
    retirementPay: true,
    ranks: [
        "Starman",
        "Ensign",
        "Lieutenant",
        "Lt Cmdr",
        "Commander",
        "Captain",
        "Admiral",
    ],
    cashTable: [1000, 5000, 5000, 10_000, 20_000, 50_000, 50_000],
    skillsTable: [
        "Ship's Boat",
        "Vacc Suit",
        "Fwd Obsvr",
        "Gunnery",
        "Blade Cbt",
        "Gun Cbt",
    ],
    advancedEducationTable: [
        "Vacc Suit",
        "Mechanical",
        "Electronics",
        "Engineering",
        "Gunnery",
        "Jack-o-T",
    ],
    advancedEducationTable8: [
        "Medical",
        "Navigation",
        "Engineering",
        "Computer",
        "Pilot",
        "Admin",
    ],
    enlistmentDMs: [
        { attribute: "intelligence", threshold: 8, bonus: 1 },
        { attribute: "education", threshold: 9, bonus: 2 },
    ],
    survivalDMs: [{ attribute: "intelligence", threshold: 7, bonus: 2 }],
    commissionDMs: [{ attribute: "socialStanding", threshold: 9, bonus: 1 }],
    promotionDMs: [{ attribute: "education", threshold: 8, bonus: 1 }],
    personalDevelopment: [
        strPlus1,
        dexPlus1,
        endPlus1,
        attributeEffect("intelligence", 1),
        attributeEffect("education", 1),
        attributeEffect("socialStanding", 1),
    ],
    benefits: [
        itemEffect("Low Psg"),
        attributeEffect("intelligence", 1),
        attributeEffect("education", 2),
        weaponEffect("blade"),
        itemEffect("Travellers'"),
        itemEffect("High Psg"),
        attributeEffect("socialStanding", 2),
    ],
    rankRewards: {
        5: [attributeEffect("socialStanding", 1)],
        6: [attributeEffect("socialStanding", 1)],
    },
} satisfies Career;

const Marines = {
    name: "Marines",
    memberName: "Marine",
    military: true,
    enlistment: 9,
    draft: 2,
    survival: 6,
    commission: 9,
    promotion: 9,
    reenlist: 6,
    retirementPay: true,
    ranks: [
        "Marine",
        "Lieutenant",
        "Captain",
        "Force Cmdr",
        "Lt Colonel",
        "Colonel",
        "Brigadier",
    ],
    cashTable: [2000, 5000, 5000, 10_000, 20_000, 30_000, 40_000],
    skillsTable: [
        "Vehicle",
        "Vacc Suit",
        "Blade Cbt",
        "Gun Cbt",
        "Blade Cbt",
        "Gun Cbt",
    ],
    advancedEducationTable: [
        "Vehicle",
        "Mechanical",
        "Electronics",
        "Tactics",
        "Blade Cbt",
        "Gun Cbt",
    ],
    advancedEducationTable8: [
        "Medical",
        "Tactics",
        "Tactics",
        "Computer",
        "Leader",
        "Admin",
    ],
    enlistmentDMs: [
        { attribute: "intelligence", threshold: 8, bonus: 1 },
        { attribute: "strength", threshold: 8, bonus: 2 },
    ],
    survivalDMs: [{ attribute: "endurance", threshold: 8, bonus: 2 }],
    commissionDMs: [{ attribute: "education", threshold: 7, bonus: 1 }],
    promotionDMs: [{ attribute: "socialStanding", threshold: 8, bonus: 1 }],
    personalDevelopment: [
        strPlus1,
        dexPlus1,
        endPlus1,
        skillEffect("Gambling"),
        skillEffect("Brawling"),
        skillEffect("Blade Cbt"),
    ],
    benefits: [
        itemEffect("Low Psg"),
        attributeEffect("intelligence", 2),
        attributeEffect("education", 1),
        weaponEffect("blade"),
        itemEffect("Travellers'"),
        itemEffect("High Psg"),
        attributeEffect("socialStanding", 2),
    ],
    rankRewards: {
        0: [skillEffect("Cutlass")],
        1: [skillEffect("Revolver")],
    },
} satisfies Career;

const Army = {
    name: "Army",
    memberName: "Army",
    military: true,
    enlistment: 5,
    draft: 3,
    survival: 5,
    commission: 5,
    promotion: 6,
    reenlist: 7,
    retirementPay: true,
    ranks: [
        "Trooper",
        "Lieutenant",
        "Captain",
        "Major",
        "Lt Colonel",
        "Colonel",
        "General",
    ],
    cashTable: [2000, 5000, 10_000, 10_000, 10_000, 20_000, 30_000],
    skillsTable: [
        "Vehicle",
        "Air/Raft",
        "Gun Cbt",
        "Fwd Obsvr",
        "Blade Cbt",
        "Gun Cbt",
    ],
    advancedEducationTable: [
        "Vehicle",
        "Mechanical",
        "Electronics",
        "Tactics",
        "Blade Cbt",
        "Gun Cbt",
    ],
    advancedEducationTable8: [
        "Medical",
        "Tactics",
        "Tactics",
        "Computer",
        "Leader",
        "Admin",
    ],
    enlistmentDMs: [
        { attribute: "dexterity", threshold: 6, bonus: 1 },
        { attribute: "endurance", threshold: 5, bonus: 2 },
    ],
    survivalDMs: [{ attribute: "education", threshold: 6, bonus: 2 }],
    commissionDMs: [{ attribute: "endurance", threshold: 7, bonus: 1 }],
    promotionDMs: [{ attribute: "education", threshold: 7, bonus: 1 }],
    personalDevelopment: [
        strPlus1,
        dexPlus1,
        endPlus1,
        skillEffect("Gambling"),
        attributeEffect("education", 1),
        skillEffect("Brawling"),
    ],
    benefits: [
        itemEffect("Low Psg"),
        attributeEffect("intelligence", 1),
        attributeEffect("education", 2),
        weaponEffect("gun"),
        itemEffect("High Psg"),
        itemEffect("Mid Psg"),
        attributeEffect("socialStanding", 1),
    ],
    rankRewards: {
        0: [skillEffect("Rifle")],
        1: [skillEffect("SMG")],
    },
} satisfies Career;

const Scouts = {
    name: "Scouts",
    memberName: "Scout",
    military: false,
    enlistment: 7,
    draft: 4,
    survival: 7,
    commission: null,
    promotion: null,
    reenlist: 3,
    ranks: null,
    retirementPay: false,
    cashTable: [20_000, 20_000, 30_000, 30_000, 50_000, 50_000, 50_000],
    skillsTable: [
        "Vehicle",
        "Vacc Suit",
        "Mechanical",
        "Navigation",
        "Electronics",
        "Jack-o-T",
    ],
    advancedEducationTable: [
        "Vehicle",
        "Mechanical",
        "Electronics",
        "Jack-o-T",
        "Gunnery",
        "Medical",
    ],
    advancedEducationTable8: [
        "Medical",
        "Navigation",
        "Engineering",
        "Computer",
        "Pilot",
        "Jack-o-T",
    ],
    enlistmentDMs: [
        { attribute: "intelligence", threshold: 6, bonus: 1 },
        { attribute: "strength", threshold: 8, bonus: 2 },
    ],
    survivalDMs: [{ attribute: "endurance", threshold: 9, bonus: 2 }],
    commissionDMs: [],
    promotionDMs: [],
    personalDevelopment: [
        strPlus1,
        dexPlus1,
        endPlus1,
        attributeEffect("intelligence", 1),
        attributeEffect("education", 1),
        skillEffect("Gun Cbt"),
    ],
    benefits: [
        itemEffect("Low Psg"),
        attributeEffect("intelligence", 2),
        attributeEffect("education", 2),
        weaponEffect("blade"),
        weaponEffect("gun"),
        { kind: "ship", ship: "scoutCourier" },
        { kind: "none" },
    ],
    rankRewards: {
        0: [skillEffect("Pilot")],
    },
} satisfies Career;

const Merchants = {
    name: "Merchants",
    memberName: "Merchant",
    military: false,
    enlistment: 7,
    draft: 5,
    survival: 5,
    commission: 4,
    promotion: 10,
    reenlist: 4,
    retirementPay: true,
    ranks: [
        null,
        "4th Officer",
        "3rd Officer",
        "2nd Officer",
        "1st Officer",
        "Captain",
    ],
    cashTable: [1000, 5000, 10_000, 20_000, 20_000, 40_000, 40_000],
    skillsTable: [
        "Vehicle",
        "Vacc Suit",
        "Jack-o-T",
        "Steward",
        "Electronics",
        "Gun Cbt",
    ],
    advancedEducationTable: [
        "Streetwise",
        "Mechanical",
        "Electronics",
        "Navigation",
        "Gunnery",
        "Medical",
    ],
    advancedEducationTable8: [
        "Medical",
        "Navigation",
        "Engineering",
        "Computer",
        "Pilot",
        "Admin",
    ],
    enlistmentDMs: [
        { attribute: "strength", threshold: 7, bonus: 1 },
        { attribute: "intelligence", threshold: 6, bonus: 2 },
    ],
    survivalDMs: [{ attribute: "intelligence", threshold: 7, bonus: 2 }],
    commissionDMs: [{ attribute: "intelligence", threshold: 6, bonus: 1 }],
    promotionDMs: [{ attribute: "intelligence", threshold: 9, bonus: 1 }],
    personalDevelopment: [
        strPlus1,
        dexPlus1,
        endPlus1,
        attributeEffect("strength", 1),
        skillEffect("Blade Cbt"),
        skillEffect("Bribery"),
    ],
    benefits: [
        itemEffect("Low Psg"),
        attributeEffect("intelligence", 1),
        attributeEffect("education", 1),
        weaponEffect("gun"),
        weaponEffect("blade"),
        itemEffect("Low Psg"),
        { kind: "ship", ship: "freeTrader", mortgagePayments: true },
    ],
    rankRewards: {
        4: [skillEffect("Pilot")],
    },
} satisfies Career;

const Other = {
    name: "Other",
    memberName: null,
    military: false,
    enlistment: 3,
    draft: 6,
    survival: 5,
    commission: null,
    promotion: null,
    reenlist: 5,
    ranks: null,
    retirementPay: false,
    cashTable: [1000, 5000, 10_000, 10_000, 10_000, 50_000, 100_000],
    skillsTable: [
        "Vehicle",
        "Gambling",
        "Brawling",
        "Bribery",
        "Blade Cbt",
        "Gun Cbt",
    ],
    advancedEducationTable: [
        "Streetwise",
        "Mechanical",
        "Electronics",
        "Gambling",
        "Brawling",
        "Forgery",
    ],
    advancedEducationTable8: [
        "Medical",
        "Forgery",
        "Electronics",
        "Computer",
        "Streetwise",
        "Jack-o-T",
    ],
    enlistmentDMs: [],
    survivalDMs: [],
    commissionDMs: [],
    promotionDMs: [],
    personalDevelopment: [
        strPlus1,
        dexPlus1,
        endPlus1,
        skillEffect("Blade Cbt"),
        skillEffect("Brawling"),
        attributeEffect("socialStanding", 1),
    ],
    benefits: [
        itemEffect("Low Psg"),
        attributeEffect("intelligence", 1),
        attributeEffect("education", 1),
        weaponEffect("gun"),
        itemEffect("High Psg"),
        { kind: "none" },
        { kind: "none" },
    ],
    rankRewards: {},
} satisfies Career;

/**
 * Grants the rank rewards of the character's current rank (automatic service
 * skills and similar).
 */
export function applyRankRewards(c: Character): void {
    for (const effect of c.career.rankRewards[c.rank] ?? []) {
        applyEffect(c, effect);
    }
}

export { Army, Marines, Merchants, Navy, Other, Scouts };
export const careers: Career[] = [
    Navy,
    Marines,
    Army,
    Scouts,
    Merchants,
    Other,
];
