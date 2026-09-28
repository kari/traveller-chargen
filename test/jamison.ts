/**
 * The Book 1 worked example's die throws in the code's RNG consumption
 * order (see book1_example.test.ts for the narrated context).
 */
export function jamisonRolls(): number[] {
    const rolls: number[] = [];
    const r = (...values: number[]) => {
        rolls.push(...values);
    };

    // UPP 688C89: "he rolls, consecutively, 6, 8, 8, 12, 8, 9"
    r(6, 8, 8, 12, 8, 9);
    r(0); // gender pick: male (Alexander)
    r(0, 0); // first and last name picks (arbitrary)

    // birthworld and discharge world (not narrated): starport C, plain profiles
    r(7, 7, 7, 7, 7, 7, 7, 3);
    r(7, 7, 7, 7, 7, 7, 7, 3);

    // career pick among eligible [Navy, Army, Scouts, Merchants, Other]: Merchants
    r(3);
    // enlistment: "he rolls 5 (+2=7)"
    r(5);

    // First Term: survival 11 (+2=13), commission 7 (+1=8), promotion 10 (+1=11)
    r(11, 7, 10);
    // "Table 1, roll 1 = +1 strength"
    r(1, 1);
    // "Table 1, roll 5 = blade combat" -> Dagger-1
    r(2, 5, 0);
    // "Table 2, roll 2 = vacc suit"
    r(3, 2);
    // "Table 2, roll 5 = electronics"
    r(4, 5);
    // reenlistment 7; voluntary-leave check (not narrated)
    r(7, 6);

    // Second Term: survival 3 (+2=5), promotion 12 (+1=13)
    r(3, 12);
    // "Table 1, roll 3 = +1 endurance"
    r(1, 3);
    // "Table 2, roll 4 = gun combat" (erratum: Gun Cbt is roll 6) -> Rifle-1
    r(3, 6, 1);
    // reenlistment 6; voluntary-leave check
    r(6, 6);

    // Third Term: survival 9 (+2=11), promotion fails 8 (+1=9)
    r(9, 8);
    // "Table 2, roll 5 = electronics" -> Electronics-2
    r(3, 5);
    // reenlistment 10; voluntary-leave check
    r(10, 6);

    // Fourth Term: survival 7 (+2=9), promotion 12 (+1=13) + automatic Pilot-1
    r(7, 12);
    // "Table 1, roll 5 = blade combat" -> Dagger-2 (book: cutlass)
    r(2, 5, 0);
    // "Table 2, roll 4 = gun combat" (erratum: roll 6) -> Rifle-2 (book: SMG)
    r(4, 6, 0);
    // aging: "he rolls 12, 7, and 9, resulting in no changes"
    r(12, 7, 9);
    // reenlistment 7; voluntary-leave check
    r(7, 6);

    // Fifth Term: survival 7 (+2=9), promotion 10 (+1=11) -> Captain
    r(7, 10);
    // "Table 4, roll 5 = pilot" -> Pilot-2 (higher table, EDU throw 4)
    r(5, 4, 5);
    // "Table 3, roll 3 = electronics" -> Electronics-3 (standard table, EDU throw 2)
    r(6, 2, 3);
    // aging: "he rolls 9, 6, and 11" -> Dexterity -1
    r(9, 6, 11);
    // reenlistment 3 - fails, retires
    r(3);

    // Mustering out: eight rolls (5 terms + rank-5 bonus of 3)
    r(4); // cash table roll 4 = Cr20,000
    r(4, 2); // benefits roll 3 (+1 DM): +1 Education
    r(4, 6, 0); // benefits roll 7: merchant ship (free trader) + name pick
    r(4, 5); // benefits roll 6 (+1): Low Passage
    r(4, 6); // benefits roll 7: ship (mortgage -10y)
    r(4, 6); // benefits roll 7: ship (-10y)
    r(4, 6); // benefits roll 7: ship (-10y)
    r(2, 2); // eighth roll scripted as cash: Cr5,000
    r(1); // birth date day-of-year (not narrated)

    return rolls;
}
