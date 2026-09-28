import { Random } from "../src/random";

/**
 * A Random whose die throws come from a scripted queue instead of the
 * generator, letting a test replay an exact sequence of throws. Dice rolls
 * (roll) and integer picks share the queue in consumption order; real()
 * keeps the seeded generator so Markov name generation needs no scripting.
 * The queue must match the generation flow's RNG consumption order exactly.
 */
export class ScriptedRandom extends Random {
    private readonly queue: readonly number[];
    private position = 0;

    constructor(seed: number, rolls: readonly number[]) {
        super(seed);
        this.queue = rolls;
    }

    override roll(dice = 2): number {
        return this.next(`roll(${dice})`);
    }

    override integer(min: number, max: number): number {
        const value = this.next(`integer(${min}, ${max})`);
        if (value < min || value > max) {
            throw new RangeError(
                `Scripted roll ${value} at entry ${this.position - 1} outside [${min}, ${max}]`,
            );
        }
        return value;
    }

    private next(context: string): number {
        const value = this.queue[this.position];
        if (value === undefined) {
            throw new Error(
                `Scripted rolls exhausted at entry ${this.position} (${context})`,
            );
        }
        this.position += 1;
        return value;
    }
}
