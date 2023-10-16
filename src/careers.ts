import { ScoutCourier, type Character, FreeTrader } from "./chargen";

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
    enlistment: 8,
    draft: 1,
    survival: 5,
    commission: 10,
    promotion: 8,
    reenlist: 6,
    retirementPay: true,
    ranks: ["Ensign", "Lieutenant", "Lt Cmdr", "Commander", "Captain", "Admiral"],
    cashTable: [1000, 5000, 5000, 10_000, 20_000, 50_000, 50_000],
    skillsTable: ["Ship's Boat", "Vacc Suit", "Fwd Obsvr", "Gunnery", "Blade Cbt", "Gun Cbt"],
    advancedEducationTable: ["Vacc Suit", "Mechanical", "Electronics", "Engineering", "Gunnery", "Jack-o-T"],
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
    personalDevelopment(c, i) {
        switch (i) {
            case 1: 
                c.attributes.strength += 1;
                break;
            case 2:
                c.attributes.dexterity += 1;
                break;
            case 3:
                c.attributes.endurance += 1;
                break;
            case 4:
                c.attributes.intelligence += 1;
                break;
            case 5:
                c.attributes.education += 1;
                break;
            case 6:
                c.attributes.socialStanding += 1;
                break;
        }
    },
    benefitsTable(c, i) {
        switch (i) {
            case 1: 
                c.addItem('Low Psg');
                break;
            case 2:
                c.attributes.intelligence += 1;
                break;
            case 3:
                c.attributes.education += 2;
                break;
            case 4:
                c.addBlade();
                break;
            case 5:
                c.addItem("Travellers'");
                break;
            case 6:
                c.addItem('High Psg');
                break;
            case 7:
                c.attributes.socialStanding += 2;
                break;
        }
    },
    rankAndServiceSkills(c) {
        if (c.rank == 5 || c.rank == 6) { // Navy Captain / Admiral
            c.attributes.socialStanding += 1        
        }
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
    retirementPay: true,
    ranks: ["Lieutenant", "Captain", "Force Cmdr", "Lt Colonel", "Colonel", "Brigadier"],
    cashTable: [2000, 5000, 5000, 10_000, 20_000, 30_000, 40_000],
    skillsTable: ["Vehicle", "Vacc Suit", "Blade Cbt", "Gun Cbt", "Blade Cbt", "Gun Cbt"],
    advancedEducationTable: ["Vehicle", "Mechanical", "Electronics", "Tactics", "Blade Cbt", "Gun Cbt"],
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
    personalDevelopment(c, i) {
        switch (i) {
            case 1: 
                c.attributes.strength += 1;
                break;
            case 2:
                c.attributes.dexterity += 1;
                break;
            case 3:
                c.attributes.endurance += 1;
                break;
            case 4:
                c.addSkill('Gambling');
                break;
            case 5:
                c.addSkill('Brawling');
                break;
            case 6:
                c.addItem('Blade Cbt');
                break;
        }
    },
    benefitsTable(c, i) {
        switch (i) {
            case 1: 
                c.addItem('Low Psg');
                break;
            case 2:
                c.attributes.intelligence += 2;
                break;
            case 3:
                c.attributes.education += 1;
                break;
            case 4:
                c.addBlade();
                break;
            case 5:
                c.addItem("Travellers'");
                break;
            case 6:
                c.addItem('High Psg');
                break;
            case 7:
                c.attributes.socialStanding += 2;
                break;
        }
    },
    rankAndServiceSkills(c) {
        if (c.rank == 0) { // Marine
            c.addSkill('Cutlass');
        } else if (c.rank == 1) { // Marine Lt
            c.addSkill('Revolver');
        }
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
    retirementPay: true,
    ranks: ["Lieutenant", "Captain", "Major", "Lt Colonel", "Colonel", "General"],
    cashTable: [2000, 5000, 10_000, 10_000, 10_000, 20_000, 30_000],
    skillsTable: ["Vehicle", "Air/Raft", "Gun Cbt", "Fwd Obsvr", "Blade Cbt", "Gun Cbt"],
    advancedEducationTable: ["Vehicle", "Mechanical", "Electronics", "Tactics", "Blade Cbt", "Gun Cbt"],
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
    personalDevelopment(c, i) {
        switch (i) {
            case 1: 
                c.attributes.strength += 1;
                break;
            case 2:
                c.attributes.dexterity += 1;
                break;
            case 3:
                c.attributes.endurance += 1;
                break;
            case 4:
                c.addSkill('Gambling');
                break;
            case 5:
                c.attributes.education += 1;
                break;
            case 6:
                c.addSkill('Brawling');
                break;
        }
    },
    benefitsTable(c, i) {
        switch (i) {
            case 1: 
                c.addItem('Low Psg');
                break;
            case 2:
                c.attributes.intelligence += 1;
                break;
            case 3:
                c.attributes.education += 2;
                break;
            case 4:
                c.addGun();
                break;
            case 5:
                c.addItem("High Psg");
                break;
            case 6:
                c.addItem('Mid Psg');
                break;
            case 7:
                c.attributes.socialStanding += 1;
                break;
        }
    },
    rankAndServiceSkills(c) {
        if (c.rank == 0) { // Army
            c.addSkill('Rifle');
        } else if (c.rank == 1) { // Army Lt
            c.addSkill('SMG');
        }
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
    retirementPay: false,
    cashTable: [20_000, 20_000, 30_000, 30_000, 50_000, 50_000, 50_000],
    skillsTable: ["Vehicle", "Vacc Suit", "Mechanical", "Navigation", "Electronics", "Jack-o-T"],
    advancedEducationTable: ["Vehicle", "Mechanical", "Electronics", "Jack-o-T", "Gunnery", "Medical"],
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    commissionDM(_c) {
        return 0;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    promotionDM(_c) {
        return 0;
    },
    personalDevelopment(c, i) {
        switch (i) {
            case 1: 
                c.attributes.strength += 1;
                break;
            case 2:
                c.attributes.dexterity += 1;
                break;
            case 3:
                c.attributes.endurance += 1;
                break;
            case 4:
                c.attributes.intelligence += 1;
                break;
            case 5:
                c.attributes.education += 1;
                break;
            case 6:
                c.addSkill('Gun Cbt');
                break;
        }
    },
    benefitsTable(c, i) {
        switch (i) {
            case 1: 
                c.addItem('Low Psg');
                break;
            case 2:
                c.attributes.intelligence += 2;
                break;
            case 3:
                c.attributes.education += 2;
                break;
            case 4:
                c.addBlade();
                break;
            case 5:
                c.addGun();
                break;
            case 6:
                if (!c.ship) {
                    c.ship = new ScoutCourier();
                }
                break;
            case 7:
                // no benefit
                break;
        }
    },
    rankAndServiceSkills(c) {
        if (c.rank == 0) { // Scout
            c.addSkill('Pilot');
        }
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
    retirementPay: true,
    ranks: ["4th Officer", "3rd Officer", "2nd Officer", "1st Officer", "Captain"],
    cashTable: [1000, 5000, 10_000, 20_000, 20_000, 40_000, 40_000],
    skillsTable: ["Vehicle", "Vacc Suit", "Jack-o-T", "Steward", "Electronics", "Gun Cbt"],
    advancedEducationTable: ["Streetwise", "Mechanical", "Electronics", "Navigation", "Gunnery", "Medical"],
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
    personalDevelopment(c, i) {
        switch (i) {
            case 1: 
                c.attributes.strength += 1;
                break;
            case 2:
                c.attributes.dexterity += 1;
                break;
            case 3:
                c.attributes.endurance += 1;
                break;
            case 4:
                c.attributes.strength += 1;
                break;
            case 5:
                c.addSkill('Blade Cbt');
                break;
            case 6:
                c.addSkill('Bribery');
                break;
        }
    },
    benefitsTable(c, i) {
        switch (i) {
            case 1: 
                c.addItem('Low Psg');
                break;
            case 2:
                c.attributes.intelligence += 1;
                break;
            case 3:
                c.attributes.education += 1;
                break;
            case 4:
                c.addGun();
                break;
            case 5:
                c.addBlade();
                break;
            case 6:
                c.addItem('Low Psg');
                break;
            case 7:
                if (!c.ship) {
                    c.ship = new FreeTrader();
                } else if (c.ship.mortgage!.maturity > 0) {
                    // pay off mortgage
                    c.ship.age += 10;
                    c.ship.mortgage!.maturity -= 10; // Shouldn't go below zero, requires five throws on benefit to zero out.
                }
                break;
        }
    },    
    rankAndServiceSkills(c) {
        if (c.rank == 4) { // Merchant 1st Officer
            c.addSkill('Pilot');
        }
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
    retirementPay: false,
    cashTable: [1000, 5000, 10_000, 10_000, 10_000, 50_000, 100_000],
    skillsTable: ["Vehicle", "Gambling", "Brawling", "Bribert", "Blade Cbt", "Gun Cbt"],
    advancedEducationTable: ["Streetwise", "Mechanical", "Electronics", "Gambling", "Brawling", "Forgery"],
    advancedEducationTable8: ["Medical", "Forgery", "Electronics", "Computer", "Streetwise", "Jack-o-T"],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    enlistmentDM(_c) {
        return 0;
    },
    survivalDM(c) {
        if (c.attributes.intelligence >= 9) {
            return 2;
        }
        return 0;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    commissionDM(_c) {
        return 0;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    promotionDM(_c) {
        return 0;
    },
    personalDevelopment(c, i) {
        switch (i) {
            case 1: 
                c.attributes.strength += 1;
                break;
            case 2:
                c.attributes.dexterity += 1;
                break;
            case 3:
                c.attributes.endurance += 1;
                break;
            case 4:
                c.addSkill('Blade Cbt');
                break;
            case 5:
                c.addSkill('Brawling');
                break;
            case 6:
                c.attributes.socialStanding -= 1;
                break;
        }
    },
    benefitsTable(c, i) {
        switch (i) {
            case 1: 
                c.addItem('Low Psg');
                break;
            case 2:
                c.attributes.intelligence += 1;
                break;
            case 3:
                c.attributes.education += 1;
                break;
            case 4:
                c.addGun();
                break;
            case 5:
                c.addItem("High Psg");
                break;
            case 6:
                // no benefit
                break;
            case 7:
                // no benefit
                break;
        }
    },    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    rankAndServiceSkills(_c) {
        // no skills
    }
}

export { Navy, Marines, Army, Scouts, Merchants, Other, Career };
