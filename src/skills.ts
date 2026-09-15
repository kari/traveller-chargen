import type { SkillName } from "./domain_types";

export class Skills {
    private skills: Partial<Record<SkillName, number>> = {};

    get list(): SkillName[] {
        return Object.keys(this.skills) as SkillName[];
    }

    filter(subset: readonly SkillName[]): SkillName[] {
        return this.list.filter((s) => subset.includes(s));
    }

    // FIXME: no sorting
    toString(subset?: readonly SkillName[] | SkillName): string {
        if (subset === undefined) {
            return this.list.map((s) => `${s}-${this.skills[s]}`).join(", ");
        }
        if (typeof subset === "string") {
            return `${subset}-${this.skills[subset]}`;
        }
        return this.list
            .filter((s) => subset.includes(s))
            .map((s) => `${s}-${this.skills[s]}`)
            .join(", ");
    }

    // sorts by skill value (descending)
    // FIXME: should return 0 for equal
    // FIXME: mutates array before returning!
    // FIXME: sort secondarily by name
    sorted(subset?: readonly SkillName[]): SkillName[] {
        if (subset === undefined) {
            return this.list.sort((a, b) =>
                (this.skills[a] ?? 0) < (this.skills[b] ?? 0) ? 1 : -1,
            );
        }
        return this.list
            .filter((s) => subset.includes(s))
            .sort((a, b) =>
                (this.skills[a] ?? 0) < (this.skills[b] ?? 0) ? 1 : -1,
            );
    }

    addZeroSkill(skill: SkillName) {
        this.increase(skill, 0);
    }

    increase(skill: SkillName, by = 1) {
        if (this.list.includes(skill)) {
            this.skills[skill] = (this.skills[skill] ?? 0) + by;
        } else {
            this.skills[skill] = by;
        }
    }
}
