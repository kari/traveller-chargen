import { expect, test } from "vitest";
import { Items } from "../src/items";

test("has() and count() read the item map", () => {
    const i = new Items([["Dagger", 1]]);
    expect(i.has("Dagger")).toBe(true);
    expect(i.count("Dagger")).toBe(1);
    expect(i.has("Sword")).toBe(false);
    expect(i.count("Sword")).toBe(0);
});

test("Add items", () => {
    const i = new Items();
    i.add("Low Psg");
    expect(i.list.length).toBe(1);
    expect(i.list).toContain("Low Psg");
    expect(i.toString()).toBe("1 Low Psg");
    expect(i.hasTravellers).toBeFalsy();
    i.add("Low Psg");
    expect(i.list.length).toBe(1);
    expect(i.toString()).toBe("2 Low Psg");
    i.add("Mid Psg");
    expect(i.list.length).toBe(2);
});

test("Add Travellers", () => {
    const i = new Items();
    expect(i.hasTravellers).toBeFalsy();
    i.add("Travellers'");
    expect(i.hasTravellers).toBeTruthy();
    expect(i.toString()).toBe("1 Travellers'");
    i.add("Travellers'");
    expect(i.toString()).toBe("1 Travellers'");
});

test("Convert passages", () => {
    const i = new Items();
    expect(i.convertPassages()).toBe(0);

    i.add("Low Psg");
    expect(i.convertPassages()).toBe(900);

    i.add("Low Psg");
    i.add("Low Psg");
    expect(i.convertPassages()).toBe(1800);

    i.add("Mid Psg");
    expect(i.convertPassages()).toBe(7200);

    i.add("Mid Psg");
    i.add("Low Psg");
    expect(i.convertPassages()).toBe(8100);

    i.add("High Psg");
    expect(i.convertPassages()).toBe(9000);

    i.add("High Psg");
    i.add("Mid Psg");
    i.add("Low Psg");
    expect(i.convertPassages()).toBe(17100);
});
