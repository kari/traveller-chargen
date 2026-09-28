import { beforeAll, expect, test } from "vitest";
import { Character } from "../src/character";
import { loadShipNames } from "../src/ships";
import { jamisonRolls, ScriptedRandom } from "./jamison";

beforeAll(async () => {
    // the merchant ship benefit needs the lazily loaded ship names
    await loadShipNames();
});

/**
 * Book 1 character generation worked example: Alexander Lascelles Jamison
 * (Traveller Book 1, 1981 edition). The scripted queue replays the book's
 * die throws in the code's RNG consumption order; comments cite the book's
 * narration. Final sheet per the book: Merchant Captain Alexander Jamison,
 * UPP 779C99, age 38, 5 terms, Cr31,200, specific skills, and a type A free
 * trader with ten years payments remaining.
 *
 * Documented deviations (resolved with the project owner against the
 * rulebook tables; the code follows the tables):
 * - The example's mustering-out benefit rolls are garbled: per the book
 *   table, +1 Education is roll 3 and the passage at roll 6 is Low, not
 *   Middle. The code's table matches the book table.
 * - The example grants Captain (rank 5) a +2 roll bonus; the book rule and
 *   the code give ranks 5-6 three bonus rolls, so mustering out takes eight
 *   rolls where the example narrates seven. The eighth is scripted as cash.
 * - The example's final Cr31,200 only decomposes if the first annual pension
 *   payment is included. Under the corrected tables the mustering cash is
 *   Cr25,000 + Cr900 passage conversion; the Cr4,000 pension is tracked
 *   separately from cash on hand.
 * - The example's Body Pistol-1 and SMG-1 are unreachable at STR 7 under
 *   the code's weapon-cascade rules (STR 7 incurs the Body Pistol penalty,
 *   and known weapons are leveled first): the script yields Rifle-2 and
 *   Dagger-2 instead of Body Pistol-1/SMG-1 and Cutlass-1.
 */
test("Book 1 worked example: Alexander Lascelles Jamison", () => {
    const jamison = new Character(new ScriptedRandom(42, jamisonRolls()));

    expect(jamison.dead).toBe(false);
    expect(jamison.age).toBe(38); // "is now 38 years old"
    expect(jamison.upp).toBe("779C99"); // matches the book's final UPP
    expect(jamison.career.name).toBe("Merchants");
    expect(jamison.terms).toBe(5);
    expect(jamison.rank).toBe(5); // "Merchant Captain"
    expect(jamison.commissioned).toBe(true);
    expect(jamison.retired).toBe(true);
    expect(jamison.retirementPay).toBe(4_000); // "a pension of Cr4000 per year"

    // "Dagger-1, Cutlass-1, Vacc Suit-1, Pilot-2, Body Pistol-1, SMG-1,
    // Electronic-3" in the book; the code's cascade yields (see docblock):
    expect(jamison.skills.list).toEqual([
        "Dagger",
        "Vacc Suit",
        "Electronics",
        "Rifle",
        "Pilot",
    ]);
    expect(jamison.skills.level("Dagger")).toBe(2);
    expect(jamison.skills.level("Vacc Suit")).toBe(1);
    expect(jamison.skills.level("Electronics")).toBe(3);
    expect(jamison.skills.level("Rifle")).toBe(2);
    expect(jamison.skills.level("Pilot")).toBe(2);

    // Cr20,000 + Cr5,000 cash, Low Passage converted at 90% (Cr900)
    expect(jamison.credits).toBe(25_900);
    expect(jamison.items.has("Low Psg")).toBe(false);

    // "owns a type A free trader, with ten years payments remaining"
    expect(jamison.ship).toBeDefined();
    expect(jamison.ship?.type).toBe("A");
    expect(jamison.ship?.tonnage).toBe(200);
    expect(jamison.ship?.age).toBe(30);
    expect(jamison.ship?.mortgage?.maturity).toBe(10);
    expect(jamison.ship?.mortgage?.monthlyPayment).toBe(150_000);

    // milestones the book narrates, in order
    const history = jamison.history.join("\n");
    expect(history).toContain("Character was accepted to Merchants");
    expect(history).toContain("Character was commissioned to 4th Officer");
    expect(history).toContain("Character was promoted to rank 3 (2nd Officer)");
    expect(history).toContain("Character was promoted to rank 4 (1st Officer)");
    expect(history).toContain("Character was promoted to rank 5 (Captain)");
    expect(history).toContain(
        "Character failed reenlistment throw 4+, career is over after 5 terms of service",
    );
    expect(history).toContain("Character chose to retire after 5 terms");
    expect(history).toContain("Character received a Free Trader");
});
