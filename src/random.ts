import {
    Random as RandomJS,
    MersenneTwister19937,
    createEntropy,
    nativeMath,
} from "random-js";

/**
 * Wrapper for Random.js's class giving some convienence methods
 */
class Random {
    private _random: RandomJS;
    private _seed: number;

    constructor(seed: number = createEntropy(nativeMath, 1)[0]) {
        this._random = new RandomJS(MersenneTwister19937.seed(seed));
        this._seed = seed;
    }

    get seed(): number {
        return this._seed;
    }

    pick<Type>(arr: ArrayLike<Type>): Type {
        return this._random.pick(arr);
    }

    date(start: Date, end: Date): Date {
        return this._random.date(start, end);
    }

    roll(dice = 2): number {
        // default roll in Traveller are two dice
        return this._random.dice(6, dice).reduce((a, b) => a + b, 0);
    }

    integer(min: number, max: number): number {
        return this._random.integer(min, max);
    }

    real(min: number, max: number, inclusive = true) {
        return this._random.real(min, max, inclusive);
    }
}

export { Random };
