/**
 * adminRepository — the CMS write path.
 *
 * This file used to be ~350 lines: every section was scattered across
 * normalised tables, so saving one meant an UPDATE plus a delete-and-reinsert
 * of each child list, with column mappings for all of it. Consolidating the
 * schema (migration 0009) removed the need for any of that. Eleven of the
 * thirteen sections are now a single row in `site_content`, so saving one is
 * a single upsert of the exact object the form already holds.
 *
 * Only two sections need mapping, because they are not page copy:
 *   brand           -> company        (identity, hours, social)
 *   featuredProduct -> products       (typed scalars + jsonb lists)
 *
 * Every write is gated by RLS. is_admin() must be true or Postgres rejects it,
 * whatever the UI allows.
 */

import { supabase } from "../lib/supabase";
import { SiteDataError, refreshSiteData } from "./siteRepository";
import type { SiteData } from "./types";

/** Sections stored verbatim as a `site_content` row. */
const CONTENT_KEYS = [
    "hero", "about", "commitment", "newsletter",
    "footer", "contact", "seo", "faq", "privacy", "terms",
    "productLabels",
] as const;

type ContentKey = typeof CONTENT_KEYS[number];

const isContentKey = (k: string): k is ContentKey =>
    (CONTENT_KEYS as readonly string[]).includes(k);

/** Throws with the database's own message, which is more useful than ours. */
function check(error: { message: string } | null, what: string): void {
    if (error) throw new SiteDataError(`Could not save ${what}: ${error.message}`, error);
}

/**
 * Writes one section, then refreshes the cache so the live site and every open
 * admin form show the new values without a reload.
 */
export async function saveSiteSection<K extends keyof SiteData>(
    section: K,
    value: SiteData[K],
    /**
     * Testimonials only: rows the editor explicitly removed. Saving does NOT
     * delete every row missing from `value`, because `value` is a snapshot
     * taken when the page loaded — a review submitted by a customer while the
     * form sat open is absent from it, and a blind reconciliation would
     * destroy the submission on the next save.
     */
    removedIds: readonly string[] = []
): Promise<void> {
    const key = String(section);

    if (key === "testimonials") {
        const t = value as SiteData["testimonials"];
        // The section's copy stays in site_content; the list lives in its own
        // table now, because the public review form has to be able to write to
        // it. See migration 0008.
        const { items, ...copy } = t;
        check(
            (await supabase
                .from("site_content")
                .upsert({ key, data: copy }, { onConflict: "key" })).error,
            key
        );

        if (removedIds.length > 0) {
            check(
                (await supabase.from("reviews").delete().in("id", removedIds as string[])).error,
                "the removed reviews"
            );
        }

        if (items.length > 0) {
            // `email` is deliberately absent: it belongs to the submitter and
            // the CMS never edits it. Omitting the column from the payload
            // leaves the stored value untouched on conflict.
            check(
                (await supabase.from("reviews").upsert(
                    items.map((t2, i) => ({
                        id: t2.id,
                        author: t2.author.trim(),
                        title: t2.title.trim(),
                        quote: t2.quote.trim(),
                        rating: t2.rating,
                        visible: t2.visible,
                        sort_order: i,
                    })),
                    { onConflict: "id" }
                )).error,
                "the reviews"
            );
        }
    } else if (isContentKey(key)) {
        // The whole section, exactly as the form holds it. No mapping, no
        // child tables, no ordering to maintain.
        check(
            (await supabase
                .from("site_content")
                .upsert({ key, data: value }, { onConflict: "key" })).error,
            key
        );
    } else if (key === "brand") {
        const b = value as SiteData["brand"];
        check((await supabase.from("company").update({
            name: b.name,
            tagline: b.tagline,
            short_description: b.shortDescription,
            location: b.location,
            phone: b.phone,
            phone_display: b.phoneDisplay,
            email: b.email,
            use_default_time: b.useDefaultTime,
            map_embed: b.mapEmbed,
            hours: b.hours,
            social: b.socialLinks,
        }).eq("id", true)).error, "company details");
    } else if (key === "featuredProduct") {
        const p = value as SiteData["featuredProduct"];
        check((await supabase.from("products").update({
            slug: p.id,
            name: p.name,
            collection: p.collection,
            concentration: p.concentration,
            headline_size: p.headlineSize,
            tagline: p.tagline,
            description: p.description,
            price: p.price,
            ordering_note: p.orderingNote,
            images: p.images,
            sizes: p.sizes,
            notes: p.notes,
            highlights: p.highlights,
            specs: p.specs,
            usage: p.usage,
            ingredients: p.ingredients,
            safety_warning: p.safetyWarning,
            allergen_note: p.allergenNote,
        }).eq("is_featured", true)).error, "the product");
    } else {
        throw new SiteDataError(`No writer is defined for section "${key}".`);
    }

    await refreshSiteData();
}
