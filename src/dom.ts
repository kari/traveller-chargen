export class DomView {
    constructor(private readonly document: Document) {}

    text(id: string, value: string): void {
        this.required(id).textContent = value;
    }

    clear(id: string): void {
        this.text(id, "");
    }

    checked(id: string, value: boolean): void {
        const element = this.required(id);
        if (!(element instanceof HTMLInputElement)) {
            throw new TypeError(`Element #${id} is not a checkbox`);
        }
        element.checked = value;
    }

    hidden(id: string, value: boolean): void {
        this.required(id).hidden = value;
    }

    toggleClass(id: string, className: string, enabled: boolean): void {
        this.required(id).classList.toggle(className, enabled);
    }

    data(id: string, name: string, value: string): void {
        this.required(id).setAttribute(`data-${name}`, value);
    }

    optional(id: string): HTMLElement | null {
        return this.document.getElementById(id);
    }

    element(id: string): HTMLElement {
        return this.required(id);
    }

    private required(id: string): HTMLElement {
        const element = this.document.getElementById(id);
        if (element === null) {
            throw new Error(`Required element #${id} was not found`);
        }
        return element;
    }
}
