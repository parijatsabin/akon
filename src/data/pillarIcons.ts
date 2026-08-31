/**
 * Commitment pillar icons.
 *
 * The CMS stores ONE STRING per pillar in `CommitmentPillar.icon`. It used to
 * hold an emoji, typed free-hand into the admin. Emoji render in the platform's
 * own colour and weight, so they sat as clip-art beside the line icons used
 * everywhere else on the site, and a typo produced whatever the editor pasted.
 *
 * That same field now holds a KEY from this registry instead. Nothing about the
 * type, the schema or the stored rows had to change: `icon` was already
 * `string`. Rows written before the picker still contain an emoji, which
 * matches no key — `resolvePillarIcon` falls back to a stable per-position
 * default for those, so an un-migrated row renders a sensible icon rather than
 * a blank. That is also what happens if an editor adds a fifth pillar, or if a
 * key is ever removed from this file.
 *
 * This is the single source of truth for both sides: the About page draws from
 * it and the admin picker lists it, so the two cannot drift apart.
 */

import {
    Leaf,
    Gem,
    FlaskConical,
    Recycle,
    Sparkles,
    Award,
    ShieldCheck,
    Package,
    type LucideIcon,
} from "lucide-react";

export const PILLAR_ICONS = {
    leaf: { icon: Leaf, label: "Leaf" },
    gem: { icon: Gem, label: "Gem" },
    flask: { icon: FlaskConical, label: "Flask" },
    recycle: { icon: Recycle, label: "Recycle" },
    sparkles: { icon: Sparkles, label: "Sparkles" },
    award: { icon: Award, label: "Award" },
    shield: { icon: ShieldCheck, label: "Shield" },
    package: { icon: Package, label: "Package" },
} as const satisfies Record<string, { icon: LucideIcon; label: string }>;

export type PillarIconName = keyof typeof PILLAR_ICONS;

export const PILLAR_ICON_NAMES = Object.keys(PILLAR_ICONS) as PillarIconName[];

/** Options for the admin's <Select>, in registry order. */
export const PILLAR_ICON_OPTIONS = PILLAR_ICON_NAMES.map((name) => ({
    value: name,
    label: PILLAR_ICONS[name].label,
}));

/** The key a newly added pillar starts on. */
export const DEFAULT_PILLAR_ICON: PillarIconName = "leaf";

/**
 * Resolve a stored `icon` value to a component.
 *
 * `index` is the pillar's position, used only for the fallback: an emoji from
 * before the picker, or any unrecognised value, cycles through the registry by
 * position so the icon is stable across renders and never blank.
 */
export function resolvePillarIcon(value: string, index: number): LucideIcon {
    const key = value.trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(PILLAR_ICONS, key)) {
        return PILLAR_ICONS[key as PillarIconName].icon;
    }
    const fallback = PILLAR_ICON_NAMES[index % PILLAR_ICON_NAMES.length]!;
    return PILLAR_ICONS[fallback].icon;
}
