import { uniformFloat64 } from "pure-rand/distribution/uniformFloat64";
import { uniformInt } from "pure-rand/distribution/uniformInt";
import { xoroshiro128plus } from "pure-rand/generator/xoroshiro128plus";

/**
 * Project-level random source used by all generation code.
 */
class Random {
    private _random: ReturnType<typeof xoroshiro128plus>;
    private _seed: number;

    constructor(seed = Random.createSeed()) {
        this._random = xoroshiro128plus(seed);
        this._seed = seed >>> 0;
    }

    private static createSeed(): number {
        if (globalThis.crypto !== undefined) {
            const values = new Uint32Array(1);
            globalThis.crypto.getRandomValues(values);
            return values[0];
        }
        return Math.floor(Math.random() * 0x1_0000_0000);
    }

    get seed(): number {
        return this._seed;
    }

    pick<Type>(arr: ArrayLike<Type>): Type {
        if (arr.length === 0) {
            throw new RangeError("Cannot pick from an empty collection");
        }
        return arr[this.integer(0, arr.length - 1)];
    }

    date(start: Date, end: Date): Date {
        return new Date(this.integer(start.getTime(), end.getTime()));
    }

    roll(dice = 2): number {
        // default roll in Traveller are two dice
        let total = 0;
        for (let die = 0; die < dice; die += 1) {
            total += this.integer(1, 6);
        }
        return total;
    }

    integer(min: number, max: number): number {
        return uniformInt(this._random, min, max);
    }

    real(min: number, max: number, _inclusive = true): number {
        return min + uniformFloat64(this._random) * (max - min);
    }
}

export { Random };
