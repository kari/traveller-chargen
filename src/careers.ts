import type { Character } from "./chargen";

type Career = {
    name: string,
    enlistment: number;
    draft: number;
    survival: number;
    commission: number | null;
    promotion: number | null;
    reenlist: number;
    ranks: string[] | null;
    cashTable: number[];
    skillsTable: string[];
    advancedEducationTable: string[];
    advancedEducationTable8: string[];
    enlistmentDM(c: Character): number;
    survivalDM(c: Character): number;
    commissionDM(c: Character): number;
    promotionDM(c: Character): number;
    personalDevelopment(c: Character): void;
    benefitsTable(c: Character): void;
}

const Navy: Career = {
    name: "Navy",
    enlistment: 8,
    draft: 1,
    survival: 5,
    commission: 10,
    promotion: 8,
    reenlist: 6,
    ranks: ["Ensign", "Lieutenant", "Lt Cmdr", "Commander", "Captain", "Admiral"],
    cashTable: [1000, 5000, 5000, 10_000, 20_000, 50_000, 50_000],
    skillsTable: ["Ship's Boat", "Vacc Suit", "Fwd Obsvr", "Gunnery", "Blade Cbt", "Gun Cbt"],
    advancedEducationTable: ["Vacc Suit", "Mechanical", "Electronic", "Engineering", "Gunnery", "Jack-o-T"],
    advancedEducationTable8: ["Medical", "Navigation", "Engineering", "Computer", "Pilot", "Admin"],
    enlistmentDM(c) {
        let dm = 0;
        if (c.attributes.intelligence >= 8) {
            dm += 1
        }
        if (c.attributes.education >= 9) {
            dm += 2
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
    personalDevelopment(c) {

    },
    benefitsTable(c) {

    }
}

const Marines: Career = {
    name: "Marines",
    enlistment: 9,
    draft: 2,
    survival: 6,
    commission: 9,
    promotion: 9,
    reenlist: 6,
    ranks: ["Lieutenant", "Captain", "Force Cmdr", "Lt Colonel", "Colonel", "Brigadier"],
    cashTable: [2000, 5000, 5000, 10_000, 20_000, 30_000, 40_000],
    skillsTable: ["Vehicle", "Vacc Suit", "Blade Cbt", "Gun Cbt", "Blade Cbt", "Gun Cbt"],
    advancedEducationTable: ["Vehicle", "Mechanical", "Electronic", "Tactics", "Blade Cbt", "Gun Cbt"],
    advancedEducationTable8: ["Medical", "Tactics", "Tactics", "Computer", "Leader", "Admin"],
    enlistmentDM(c) {
        let dm = 0;
        if (c.attributes.intelligence >= 8) {
            dm += 1
        }
        if (c.attributes.strength >= 8) {
            dm += 2
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
    personalDevelopment(c) {

    },
    benefitsTable(c) {

    }
}

const Army: Career = {
    name: "Army",
    enlistment: 5,
    draft: 3,
    survival: 5,
    commission: 5,
    promotion: 6,
    reenlist: 7,
    ranks: ["Lieutenant", "Captain", "Major", "Lt Colonel", "Colonel", "General"],
    cashTable: [2000, 5000, 10_000, 10_000, 10_000, 20_000, 30_000],
    skillsTable: ["Vehicle", "Air/Raft", "Gun Cbt", "Fwd Obsvr", "Blade Cbt", "Gun Cbt"],
    advancedEducationTable: ["Vehicle", "Mechanical", "Electronic", "Tactics", "Blade Cbt", "Gun Cbt"],
    advancedEducationTable8: ["Medical", "Tactics", "Tactics", "Computer", "Leader", "Admin"],
    enlistmentDM(c) {
        let dm = 0;
        if (c.attributes.dexterity >= 6) {
            dm += 1
        }
        if (c.attributes.endurance >= 5) {
            dm += 2
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
    personalDevelopment(c) {

    },
    benefitsTable(c) {

    }
}

const Scouts: Career = {
    name: "Scouts",
    enlistment: 7,
    draft: 4,
    survival: 7,
    commission: null,
    promotion: null,
    reenlist: 3,
    ranks: null,
    cashTable: [20_000, 20_000, 30_000, 30_000, 50_000, 50_000, 50_000],
    skillsTable: ["Vehicle", "Vacc Suit", "Mechanical", "Navigation", "Electronics", "Jack-o-T"],
    advancedEducationTable: ["Vehicle", "Mechanical", "Electronic", "Jack-o-T", "Gunnery", "Medical"],
    advancedEducationTable8: ["Medical", "Navigation", "Engineering", "Computer", "Pilot", "Jack-o-T"],
    enlistmentDM(c) {
        let dm = 0;
        if (c.attributes.intelligence >= 6) {
            dm += 1
        }
        if (c.attributes.strength >= 8) {
            dm += 2
        }
        return dm;
    },
    survivalDM(c) {
        if (c.attributes.endurance >= 9) {
            return 2;
        }
        return 0;
    },
    commissionDM(c) {
        return 0;
    },
    promotionDM(c) {
        return 0;
    },
    personalDevelopment(c) {

    },
    benefitsTable(c) {

    }
}

const Merchants: Career = {
    name: "Merchants",
    enlistment: 7,
    draft: 5,
    survival: 5,
    commission: 4,
    promotion: 10,
    reenlist: 4,
    ranks: ["4th Officer", "3rd Officer", "2nd Officer", "1st Officer", "Captain"],
    cashTable: [1000, 5000, 10_000, 20_000, 20_000, 40_000, 40_000],
    skillsTable: ["Vehicle", "Vacc Suit", "Jack-o-T", "Steward", "Electronics", "Gun Cbt"],
    advancedEducationTable: ["Streetwise", "Mechanical", "Electronic", "Navigation", "Gunnery", "Medical"],
    advancedEducationTable8: ["Medical", "Navigation", "Engineering", "Computer", "Pilot", "Admin"],
    enlistmentDM(c) {
        let dm = 0;
        if (c.attributes.strength >= 7) {
            dm += 1
        }
        if (c.attributes.intelligence >= 6) {
            dm += 2
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
    personalDevelopment(c) {

    },
    benefitsTable(c) {

    }
}

const Other: Career = {
    name: "Other",
    enlistment: 3,
    draft: 6,
    survival: 5,
    commission: null,
    promotion: null,
    reenlist: 5,
    ranks: null,
    cashTable: [1000, 5000, 10_000, 10_000, 10_000, 50_000, 100_000],
    skillsTable: ["Vehicle", "Gambling", "Brawling", "Bribert", "Blade Cbt", "Gun Cbt"],
    advancedEducationTable: ["Streetwise", "Mechanical", "Electronic", "Gambling", "Brawling", "Forgery"],
    advancedEducationTable8: ["Medical", "Forgery", "Electronics", "Computer", "Streetwise", "Jack-o-T"],
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
    personalDevelopment(c) {

    },
    benefitsTable(c) {

    }
}

export { Navy, Marines, Army, Scouts, Merchants, Other, Career };