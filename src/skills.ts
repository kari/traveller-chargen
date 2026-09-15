import type { SkillName } from "./domain_types";

export class Skills {
    private skills: Map<SkillName, number>;

    constructor(skills?: Iterable<readonly [SkillName, number]>) {
        this.skills = new Map(skills);
    }

    /** Skill level, 0 for unknown skills (Traveller zero-level convention). */
    level(skill: SkillName): number {
        return this.skills.get(skill) ?? 0;
    }

    has(skill: SkillName): boolean {
        return this.skills.has(skill);
    }

    get list(): SkillName[] {
        return [...this.skills.keys()];
    }

    filter(subset: readonly SkillName[]): SkillName[] {
        return this.list.filter((s) => subset.includes(s));
    }

    toString(subset?: readonly SkillName[] | SkillName): string {
        if (subset === undefined) {
            return this.list.map((s) => `${s}-${this.level(s)}`).join(", ");
        }
        if (typeof subset === "string") {
            return `${subset}-${this.level(subset)}`;
        }
        return this.list
            .filter((s) => subset.includes(s))
            .map((s) => `${s}-${this.level(s)}`)
            .join(", ");
    }

    // sorts by skill level (descending), secondarily by name
    sorted(subset?: readonly SkillName[]): SkillName[] {
        const selected =
            subset === undefined
                ? this.list
                : this.list.filter((s) => subset.includes(s));
        return selected.toSorted(
            (a, b) => this.level(b) - this.level(a) || a.localeCompare(b),
        );
    }

    addZeroSkill(skill: SkillName) {
        this.increase(skill, 0);
    }

    increase(skill: SkillName, by = 1) {
        this.skills.set(skill, this.level(skill) + by);
    }
}
