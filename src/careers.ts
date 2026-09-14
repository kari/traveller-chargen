import type { Character } from "./character";
import type { D6Table, D7Table, SkillName } from "./domain_types";
import { createFreeTrader, createScoutCourier, randomShipName } from "./ships";

interface Career {
    name: string;
    memberName: string | null;
    military: boolean;
    enlistment: number;
    draft: number;
    survival: number;
    commission: number | null;
    promotion: number | null;
    reenlist: number;
    ranks: (string | null)[] | null;
    cashTable: D7Table<number>;
    skillsTable: D6Table<SkillName>;
    advancedEducationTable: D6Table<SkillName>;
    advancedEducationTable8: D6Table<SkillName>;
    retirementPay: boolean;
    enlistmentDM(c: Character): number;
    survivalDM(c: Character): number;
    commissionDM(c: Character): number;
    promotionDM(c: Character): number;
    personalDevelopment(c: Character, i: number): void;
    benefitsTable(c: Character, i: number): void;
    rankAndServiceSkills(c: Character): void;
}

const Navy: Career = {
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
    enlistmentDM(c) {
        let dm = 0;
        if (c.attributes.intelligence >= 8) {
            dm += 1;
        }
        if (c.attributes.education >= 9) {
            dm += 2;
        }
        return dm;
    },
    survivalDM(c) {
        if (c.attributes.intelligence >= 7) {
            return 2;
        }
        return 0;
    },
    commissionDM(c) {
        if (c.attributes.socialStanding >= 9) {
            return 1;
        }
        return 0;
    },
    promotionDM(c) {
        if (c.attributes.education >= 8) {
            return 1;
        }
        return 0;
    },
    personalDevelopment(c, i) {
        switch (i) {
            case 1:
                c.modifyAttribute("strength", 1);
                break;
            case 2:
                c.modifyAttribute("dexterity", 1);
                break;
            case 3:
                c.modifyAttribute("endurance", 1);
                break;
            case 4:
                c.modifyAttribute("intelligence", 1);
                break;
            case 5:
                c.modifyAttribute("education", 1);
                break;
            case 6:
                c.modifyAttribute("socialStanding", 1);
                break;
        }
    },
    benefitsTable(c, i) {
        switch (i) {
            case 1:
                c.items.add("Low Psg");
                break;
            case 2:
                c.modifyAttribute("intelligence", 1);
                break;
            case 3:
                c.modifyAttribute("education", 2);
                break;
            case 4:
                c.items.addWeapon(
                    "blade",
                    c.attributes.strength,
                    c.skills,
                    c.random,
                );
                break;
            case 5:
                c.items.add("Travellers'");
                break;
            case 6:
                c.items.add("High Psg");
                break;
            case 7:
                c.modifyAttribute("socialStanding", 2);
                break;
        }
    },
    rankAndServiceSkills(c) {
        if (c.rank === 5 || c.rank === 6) {
            // Navy Captain / Admiral
            c.modifyAttribute("socialStanding", 1);
        }
    },
};

const Marines: Career = {
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
    enlistmentDM(c) {
        let dm = 0;
        if (c.attributes.intelligence >= 8) {
            dm += 1;
        }
        if (c.attributes.strength >= 8) {
            dm += 2;
        }
        return dm;
    },
    survivalDM(c) {
        if (c.attributes.endurance >= 8) {
            return 2;
        }
        return 0;
    },
    commissionDM(c) {
        if (c.attributes.education >= 7) {
            return 1;
        }
        return 0;
    },
    promotionDM(c) {
        if (c.attributes.socialStanding >= 8) {
            return 1;
        }
        return 0;
    },
    personalDevelopment(c, i) {
        switch (i) {
            case 1:
                c.modifyAttribute("strength", 1);
                break;
            case 2:
                c.modifyAttribute("dexterity", 1);
                break;
            case 3:
                c.modifyAttribute("endurance", 1);
                break;
            case 4:
                c.skills.addSkill(
                    "Gambling",
                    c.attributes.strength,
                    c.items,
                    c.random,
                );
                break;
            case 5:
                c.skills.addSkill(
                    "Brawling",
                    c.attributes.strength,
                    c.items,
                    c.random,
                );
                break;
            case 6:
                c.skills.addSkill(
                    "Blade Cbt",
                    c.attributes.strength,
                    c.items,
                    c.random,
                );
                break;
        }
    },
    benefitsTable(c, i) {
        switch (i) {
            case 1:
                c.items.add("Low Psg");
                break;
            case 2:
                c.modifyAttribute("intelligence", 2);
                break;
            case 3:
                c.modifyAttribute("education", 1);
                break;
            case 4:
                c.items.addWeapon(
                    "blade",
                    c.attributes.strength,
                    c.skills,
                    c.random,
                );
                break;
            case 5:
                c.items.add("Travellers'");
                break;
            case 6:
                c.items.add("High Psg");
                break;
            case 7:
                c.modifyAttribute("socialStanding", 2);
                break;
        }
    },
    rankAndServiceSkills(c) {
        if (c.rank === 0) {
            // Marine
            c.skills.addSkill(
                "Cutlass",
                c.attributes.strength,
                c.items,
                c.random,
            );
        } else if (c.rank === 1) {
            // Marine Lt
            c.skills.addSkill(
                "Revolver",
                c.attributes.strength,
                c.items,
                c.random,
            );
        }
    },
};

const Army: Career = {
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
    enlistmentDM(c) {
        let dm = 0;
        if (c.attributes.dexterity >= 6) {
            dm += 1;
        }
        if (c.attributes.endurance >= 5) {
            dm += 2;
        }
        return dm;
    },
    survivalDM(c) {
        if (c.attributes.education >= 6) {
            return 2;
        }
        return 0;
    },
    commissionDM(c) {
        if (c.attributes.endurance >= 7) {
            return 1;
        }
        return 0;
    },
    promotionDM(c) {
        if (c.attributes.education >= 7) {
            return 1;
        }
        return 0;
    },
    personalDevelopment(c, i) {
        switch (i) {
            case 1:
                c.modifyAttribute("strength", 1);
                break;
            case 2:
                c.modifyAttribute("dexterity", 1);
                break;
            case 3:
                c.modifyAttribute("endurance", 1);
                break;
            case 4:
                c.skills.addSkill(
                    "Gambling",
                    c.attributes.strength,
                    c.items,
                    c.random,
                );
                break;
            case 5:
                c.modifyAttribute("education", 1);
                break;
            case 6:
                c.skills.addSkill(
                    "Brawling",
                    c.attributes.strength,
                    c.items,
                    c.random,
                );
                break;
        }
    },
    benefitsTable(c, i) {
        switch (i) {
            case 1:
                c.items.add("Low Psg");
                break;
            case 2:
                c.modifyAttribute("intelligence", 1);
                break;
            case 3:
                c.modifyAttribute("education", 2);
                break;
            case 4:
                c.items.addWeapon(
                    "gun",
                    c.attributes.strength,
                    c.skills,
                    c.random,
                );
                break;
            case 5:
                c.items.add("High Psg");
                break;
            case 6:
                c.items.add("Mid Psg");
                break;
            case 7:
                c.modifyAttribute("socialStanding", 1);
                break;
        }
    },
    rankAndServiceSkills(c) {
        if (c.rank === 0) {
            // Army
            c.skills.addSkill(
                "Rifle",
                c.attributes.strength,
                c.items,
                c.random,
            );
        } else if (c.rank === 1) {
            // Army Lt
            c.skills.addSkill("SMG", c.attributes.strength, c.items, c.random);
        }
    },
};

const Scouts: Career = {
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
    enlistmentDM(c) {
        let dm = 0;
        if (c.attributes.intelligence >= 6) {
            dm += 1;
        }
        if (c.attributes.strength >= 8) {
            dm += 2;
        }
        return dm;
    },
    survivalDM(c) {
        if (c.attributes.endurance >= 9) {
            return 2;
        }
        return 0;
    },
    commissionDM(_c) {
        return 0;
    },
    promotionDM(_c) {
        return 0;
    },
    personalDevelopment(c, i) {
        switch (i) {
            case 1:
                c.modifyAttribute("strength", 1);
                break;
            case 2:
                c.modifyAttribute("dexterity", 1);
                break;
            case 3:
                c.modifyAttribute("endurance", 1);
                break;
            case 4:
                c.modifyAttribute("intelligence", 1);
                break;
            case 5:
                c.modifyAttribute("education", 1);
                break;
            case 6:
                c.skills.addSkill(
                    "Gun Cbt",
                    c.attributes.strength,
                    c.items,
                    c.random,
                );
                break;
        }
    },
    benefitsTable(c, i) {
        switch (i) {
            case 1:
                c.items.add("Low Psg");
                break;
            case 2:
                c.modifyAttribute("intelligence", 2);
                break;
            case 3:
                c.modifyAttribute("education", 2);
                break;
            case 4:
                c.items.addWeapon(
                    "blade",
                    c.attributes.strength,
                    c.skills,
                    c.random,
                );
                break;
            case 5:
                c.items.addWeapon(
                    "gun",
                    c.attributes.strength,
                    c.skills,
                    c.random,
                );
                break;
            case 6:
                if (!c.ship) {
                    c.ship = createScoutCourier(randomShipName(c.random));
                }
                break;
            case 7:
                // no benefit
                break;
        }
    },
    rankAndServiceSkills(c) {
        if (c.rank === 0) {
            // Scout
            c.skills.addSkill(
                "Pilot",
                c.attributes.strength,
                c.items,
                c.random,
            );
        }
    },
};

const Merchants: Career = {
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
    enlistmentDM(c) {
        let dm = 0;
        if (c.attributes.strength >= 7) {
            dm += 1;
        }
        if (c.attributes.intelligence >= 6) {
            dm += 2;
        }
        return dm;
    },
    survivalDM(c) {
        if (c.attributes.intelligence >= 7) {
            return 2;
        }
        return 0;
    },
    commissionDM(c) {
        if (c.attributes.intelligence >= 6) {
            return 1;
        }
        return 0;
    },
    promotionDM(c) {
        if (c.attributes.intelligence >= 9) {
            return 1;
        }
        return 0;
    },
    personalDevelopment(c, i) {
        switch (i) {
            case 1:
                c.modifyAttribute("strength", 1);
                break;
            case 2:
                c.modifyAttribute("dexterity", 1);
                break;
            case 3:
                c.modifyAttribute("endurance", 1);
                break;
            case 4:
                c.modifyAttribute("strength", 1);
                break;
            case 5:
                c.skills.addSkill(
                    "Blade Cbt",
                    c.attributes.strength,
                    c.items,
                    c.random,
                );
                break;
            case 6:
                c.skills.addSkill(
                    "Bribery",
                    c.attributes.strength,
                    c.items,
                    c.random,
                );
                break;
        }
    },
    benefitsTable(c, i) {
        switch (i) {
            case 1:
                c.items.add("Low Psg");
                break;
            case 2:
                c.modifyAttribute("intelligence", 1);
                break;
            case 3:
                c.modifyAttribute("education", 1);
                break;
            case 4:
                c.items.addWeapon(
                    "gun",
                    c.attributes.strength,
                    c.skills,
                    c.random,
                );
                break;
            case 5:
                c.items.addWeapon(
                    "blade",
                    c.attributes.strength,
                    c.skills,
                    c.random,
                );
                break;
            case 6:
                c.items.add("Low Psg");
                break;
            case 7:
                if (!c.ship) {
                    c.ship = createFreeTrader(randomShipName(c.random));
                } else if (c.ship.mortgage) {
                    // pay off mortgage
                    c.ship.age += 10;
                    c.ship.mortgage.maturity -= 10;
                    if (c.ship.mortgage.maturity <= 0) {
                        c.ship.mortgage = undefined;
                    }
                }
                break;
        }
    },
    rankAndServiceSkills(c) {
        if (c.rank === 4) {
            // Merchant 1st Officer
            c.skills.addSkill(
                "Pilot",
                c.attributes.strength,
                c.items,
                c.random,
            );
        }
    },
};

const Other: Career = {
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
    enlistmentDM(_c) {
        return 0;
    },
    survivalDM(c) {
        if (c.attributes.intelligence >= 9) {
            return 2;
        }
        return 0;
    },
    commissionDM(_c) {
        return 0;
    },
    promotionDM(_c) {
        return 0;
    },
    personalDevelopment(c, i) {
        switch (i) {
            case 1:
                c.modifyAttribute("strength", 1);
                break;
            case 2:
                c.modifyAttribute("dexterity", 1);
                break;
            case 3:
                c.modifyAttribute("endurance", 1);
                break;
            case 4:
                c.skills.addSkill(
                    "Blade Cbt",
                    c.attributes.strength,
                    c.items,
                    c.random,
                );
                break;
            case 5:
                c.skills.addSkill(
                    "Brawling",
                    c.attributes.strength,
                    c.items,
                    c.random,
                );
                break;
            case 6:
                c.modifyAttribute("socialStanding", 1);
                break;
        }
    },
    benefitsTable(c, i) {
        switch (i) {
            case 1:
                c.items.add("Low Psg");
                break;
            case 2:
                c.modifyAttribute("intelligence", 1);
                break;
            case 3:
                c.modifyAttribute("education", 1);
                break;
            case 4:
                c.items.addWeapon(
                    "gun",
                    c.attributes.strength,
                    c.skills,
                    c.random,
                );
                break;
            case 5:
                c.items.add("High Psg");
                break;
            case 6:
                // no benefit
                break;
            case 7:
                // no benefit
                break;
        }
    },
    rankAndServiceSkills(_c) {
        // no skills
    },
};

export { Army, type Career, Marines, Merchants, Navy, Other, Scouts };
export const careers: Career[] = [
    Navy,
    Marines,
    Army,
    Scouts,
    Merchants,
    Other,
];
