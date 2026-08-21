/**
 * verify-backend — health check for the live Supabase backend.
 *
 * This replaces verify-migration, whose job was to prove the database matched
 * public/cms-data.json before that file was deleted. It passed, the file is
 * gone, and there is nothing left to diff against — Supabase IS the content
 * now. What remains worth checking on every deploy is the security boundary
 * and the payload size, neither of which a type checker can see.
 *
 *   npm run verify
 */

import { anonClient, serviceClient, formatBytes } from "./lib/env.js";

const REQUIRED_SECTIONS = [
    "brand", "hero", "about", "featuredProduct", "testimonials",
    "commitment", "newsletter", "footer", "contact", "privacy", "terms", "faq", "seo",
];

const PAYLOAD_BUDGET = 60_000;

let failures = 0;
const check = (ok: boolean, label: string, detail = "") => {
    if (!ok) failures++;
    console.log(`    ${ok ? "ok  " : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
};

async function main() {
    const anon = anonClient();
    const svc = serviceClient();

    // ── The document the public site renders from ─────────────
    console.log("\n  Content");
    const { data: doc, error } = await anon.rpc("get_site_data");
    if (error || !doc) {
        console.log(`    FAIL get_site_data() — ${error?.message ?? "returned nothing"}`);
        process.exit(1);
    }

    const site = doc as Record<string, unknown>;
    const missing = REQUIRED_SECTIONS.filter((k) => !(k in site));
    check(missing.length === 0, "all 13 sections present", missing.join(", "));

    const p = site.featuredProduct as any;

    // Content is edited in the CMS, so asserting exact counts means every
    // legitimate edit reports a failure. It did: changing the product from
    // four sizes to one tripped a check that had frozen the original seed.
    // What is worth asserting is that nothing required has been emptied.
    const nonEmpty: [string, unknown[]][] = [
        ["about reasons", (site.about as any).reasons],
        ["product images", p.images],
        ["product sizes", p.sizes],
        ["highlights", p.highlights],
        ["specs", p.specs],
        ["usage steps", p.usage],
        ["ingredients", p.ingredients],
        ["testimonials", (site.testimonials as any).items],
        ["pillars", (site.commitment as any).pillars],
        ["contact subjects", (site.contact as any).subjects],
        ["privacy sections", (site.privacy as any).sections],
        ["terms sections", (site.terms as any).sections],
        ["faq items", (site.faq as any).items],
    ];
    for (const [label, list] of nonEmpty) {
        check(Array.isArray(list) && list.length > 0, label.padEnd(18), `${list?.length ?? 0} item(s)`);
    }

    // A week has seven days whoever is editing.
    const hours = (site.brand as any).hours as unknown[];
    check(hours.length === 7, "business hours".padEnd(18), `${hours.length} (expected 7)`);

    // Safety text is the one piece of copy that must never be blank.
    check(Boolean(p.safetyWarning?.trim()), "safety warning present");
    check(Boolean(p.allergenNote?.trim()), "allergen guidance present");

    // Every image field must resolve to something renderable.
    const images: [string, string][] = [
        ["commitment.imageUrl", (site.commitment as any).imageUrl],
        ["about.ctaStripImage", (site.about as any).ctaStripImage],
        ["newsletter.backgroundImage", (site.newsletter as any).backgroundImage],
        ["seo.ogImage", (site.seo as any).ogImage],
        ...p.images.map((s: string, i: number) => [`featuredProduct.images[${i}]`, s] as [string, string]),
    ];
    const broken = images.filter(([, src]) => !src || !/^(https?:|data:)/.test(src));
    check(broken.length === 0, "every image resolves", broken.map(([f]) => f).join(", "));

    // ── Security boundary ─────────────────────────────────────
    console.log("\n  Anonymous access");
    const { data: profiles } = await anon.from("profiles").select("*").limit(1);
    check((profiles?.length ?? 0) === 0, "cannot read profiles");

    const { data: contactRows } = await anon.from("contacts").select("*").limit(1);
    check((contactRows?.length ?? 0) === 0, "cannot read contacts");

    // Anon must still be able to submit — the forms depend on it.
    const probe = `verify-${Date.now()}@example.invalid`;
    const { error: subErr } = await anon.from("contacts")
        .insert({ kind: "enquiry", name: "verify", email: probe, subject: "probe", message: "probe" });
    check(!subErr, "can submit the contact form", subErr?.message ?? "");

    const { error: nlErr } = await anon.from("contacts").insert({ kind: "newsletter", email: probe });
    check(!nlErr, "can subscribe to the newsletter", nlErr?.message ?? "");
    await svc.from("contacts").delete().eq("email", probe);

    // An UPDATE blocked by RLS is not an error — zero rows match and PostgREST
    // returns success. Assert on the effect, not on `error`.
    const nameBefore = (await svc.from("company").select("name").single()).data?.name;
    await anon.from("company").update({ name: "rls-probe" }).eq("id", true);
    const nameAfter = (await svc.from("company").select("name").single()).data?.name;
    check(nameBefore === nameAfter, "cannot update company");

    const { error: insErr } = await anon.from("site_content")
        .insert({ key: "rls-probe", data: {} });
    check(Boolean(insErr), "cannot insert content");
    if (!insErr) await svc.from("site_content").delete().eq("key", "rls-probe");

    // Testimonials live inside site_content jsonb now, so RLS cannot filter
    // them per row — get_site_data() does it. Verify that from the outside.
    const { data: stored } = await svc.from("site_content").select("data").eq("key", "testimonials").single();
    const total = ((stored?.data as any)?.items ?? []).length;
    const shown = (site.testimonials as any).items as any[];
    check(!shown.some((t) => t.visible === false), "hidden testimonials not exposed",
        `${shown.length} of ${total} shown`);

    // ── Payload ───────────────────────────────────────────────
    console.log("\n  Payload");
    const bytes = Buffer.byteLength(JSON.stringify(doc));
    check(bytes <= PAYLOAD_BUDGET, "get_site_data() size",
        `${formatBytes(bytes)} of ${formatBytes(PAYLOAD_BUDGET)}`);
    if (bytes > PAYLOAD_BUDGET) {
        console.log("      An image is inline that should be a Storage object — check the tiering.");
    }

    console.log(failures === 0 ? "\n  All checks passed.\n" : `\n  ${failures} check(s) failed.\n`);
    process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
