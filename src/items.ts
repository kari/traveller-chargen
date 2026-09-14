import type { ItemName } from "./domain_types";

export class Items {
    private items: Partial<Record<ItemName, number>> = {};

    toString(): string {
        return Object.keys(this.items)
            .map((i) => `${this.items[i as ItemName] ?? 0} ${i}`)
            .join(", ");
    }

    get list(): ItemName[] {
        return Object.keys(this.items) as ItemName[];
    }

    convertPassages(): number {
        const passagePrices: Record<
            Extract<ItemName, "Low Psg" | "Mid Psg" | "High Psg">,
            number
        > = {
            "Low Psg": 1_000,
            "Mid Psg": 8_000,
            "High Psg": 10_000,
        };
        const passages = this.list.filter((x) =>
            Object.keys(passagePrices).includes(x),
        );
        let credits = 0;

        for (const p of passages) {
            console.debug(`Converted ${this.items[p]} ${p} to credits`);
            const price = passagePrices[p as keyof typeof passagePrices];
            const quantity = this.items[p];
            if (price !== undefined && quantity !== undefined) {
                credits += (price * quantity * 9) / 10;
            }
            delete this.items[p]; // FIXME: rebuild map instead
        }

        return credits;
    }

    add(item: ItemName) {
        console.debug(`Character earned item ${item}`);
        if (this.list.includes(item) && item !== "Travellers'") {
            this.items[item] = (this.items[item] ?? 0) + 1;
        } else {
            this.items[item] = 1;
        }
    }

    get hasTravellers(): boolean {
        if (this.list.includes("Travellers'")) {
            return true;
        }
        return false;
    }
}
