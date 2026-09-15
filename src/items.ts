import type { SkillName } from "./skills";

export type ItemName =
    | "High Psg"
    | "Low Psg"
    | "Mid Psg"
    | "Travellers'"
    | SkillName;

export class Items {
    private items: Map<ItemName, number>;

    constructor(items?: Iterable<readonly [ItemName, number]>) {
        this.items = new Map(items);
    }

    has(item: ItemName): boolean {
        return this.items.has(item);
    }

    count(item: ItemName): number {
        return this.items.get(item) ?? 0;
    }

    get list(): ItemName[] {
        return [...this.items.keys()];
    }

    toString(): string {
        return this.list.map((i) => `${this.count(i)} ${i}`).join(", ");
    }

    convertPassages(): number {
        const passagePrices = {
            "Low Psg": 1_000,
            "Mid Psg": 8_000,
            "High Psg": 10_000,
        } as const;
        type PassageName = keyof typeof passagePrices;

        let credits = 0;
        for (const [item, quantity] of this.items) {
            if (item in passagePrices) {
                const price = passagePrices[item as PassageName];
                credits += (price * quantity * 9) / 10;
                this.items.delete(item);
            }
        }

        return credits;
    }

    add(item: ItemName) {
        // note: Travellers' membership is never stacked
        if (item === "Travellers'") {
            this.items.set(item, 1);
        } else {
            this.items.set(item, this.count(item) + 1);
        }
    }

    get hasTravellers(): boolean {
        return this.items.has("Travellers'");
    }
}
