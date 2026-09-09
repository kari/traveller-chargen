// @vitest-environment jsdom

import { expect, test } from "vitest";
import { DomView } from "../src/dom";

test("writes through the DOM adapter", () => {
    document.body.innerHTML = '<input id="flag" type="checkbox"><div id="value"></div>';
    const view = new DomView(document);

    view.text("value", "hello");
    view.checked("flag", true);
    view.hidden("value", true);
    view.toggleClass("value", "active", true);
    view.data("value", "seed", "123");

    expect(document.getElementById("value")?.textContent).toBe("hello");
    expect(document.getElementById("flag")).toHaveProperty("checked", true);
    expect(document.getElementById("value")).toHaveProperty("hidden", true);
    expect(document.getElementById("value")?.classList).toContain("active");
    expect(document.getElementById("value")?.dataset.seed).toBe("123");
});

test("fails clearly for missing or mistyped required elements", () => {
    const view = new DomView(document);

    expect(() => view.text("missing", "value")).toThrow(
        "Required element #missing was not found",
    );

    document.body.innerHTML = '<div id="not-a-checkbox"></div>';
    expect(() => view.checked("not-a-checkbox", true)).toThrow(
        "Element #not-a-checkbox is not a checkbox",
    );
});
