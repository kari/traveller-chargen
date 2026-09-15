import type { Attribute, Character } from "./character";
import type { ItemName, SkillName } from "./domain_types";
import { createFreeTrader, createScoutCourier, randomShipName } from "./ships";

/**
 * A benefit or development a career table grants to a character.
 */
export type Effect =
    | { kind: "attribute"; attribute: Attribute; amount: number }
    | { kind: "skill"; skill: SkillName }
    | { kind: "weapon"; weapon: "blade" | "gun" }
    | { kind: "item"; item: ItemName }
    | {
          kind: "ship";
          ship: "scoutCourier" | "freeTrader";
          /**
           * when the character already has a ship, pay off part of its
           * mortgage instead of granting a new one
           */
          mortgagePayments?: boolean;
      }
    | { kind: "none" };

/**
 * A DM granted when an attribute meets a threshold.
 */
export type DmRule = {
    attribute: Attribute;
    threshold: number;
    bonus: number;
};

/**
 * Sum of the DM rules whose attribute meets the threshold.
 */
export function dm(
    rules: readonly DmRule[],
    attributes: Record<Attribute, number>,
): number {
    return rules.reduce(
        (total, rule) =>
            attributes[rule.attribute] >= rule.threshold
                ? total + rule.bonus
                : total,
        0,
    );
}

/**
 * Applies a career table effect to the character.
 */
export function applyEffect(c: Character, effect: Effect): void {
    switch (effect.kind) {
        case "attribute":
            c.modifyAttribute(effect.attribute, effect.amount);
            break;
        case "skill":
            c.addSkill(effect.skill);
            break;
        case "weapon":
            c.addWeapon(effect.weapon);
            break;
        case "item":
            c.items.add(effect.item);
            break;
        case "ship":
            grantShip(c, effect);
            break;
        case "none":
            break;
    }
}

function grantShip(
    c: Character,
    effect: Extract<Effect, { kind: "ship" }>,
): void {
    if (!c.ship) {
        c.ship =
            effect.ship === "scoutCourier"
                ? createScoutCourier(randomShipName(c.random))
                : createFreeTrader(randomShipName(c.random));
        const label =
            effect.ship === "scoutCourier" ? "Scout/Courier" : "Free Trader";
        c.record(`Character received a ${label}, the ${c.ship.name}`);
        return;
    }
    if (effect.mortgagePayments === true && c.ship.mortgage) {
        // pay off mortgage
        c.ship.age += 10;
        c.ship.mortgage.maturity -= 10;
        if (c.ship.mortgage.maturity <= 0) {
            c.ship.mortgage = undefined;
        }
    }
}
