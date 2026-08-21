/**
 * FeaturedProductPage — Admin CMS page for the single flagship product.
 *
 * V1 brands one perfume, so this edits it directly. The previous
 * "pick from collection" mode was removed along with the product catalog.
 */
import React, { useState } from "react";
import { readStore } from "../../data/siteRepository";
import { saveSection } from "../lib/saveSection";
import { Section } from "../components/ui/Section";
import { Field, Input, Textarea, SaveBtn, IconButton } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import type {
    ProductItem, ProductHighlight, ProductSpec, UsageStep,
} from "../../data/types";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { PageHeader } from "../components/ui/Page";
import { ImageField } from "../components/ui/ImageField";

const listToString = (arr: string[]) => arr.join(", ");
const stringToList = (s: string) => s.split(",").map((n) => n.trim()).filter(Boolean);

const TIERS = ["top", "heart", "base"] as const;

/** Small square button used for the reorder/remove controls in repeatable rows. */
const FeaturedProductPage: React.FC = () => {
    const { toast } = useToast();
    const store = readStore();

    const [product, setProduct] = useState<ProductItem>(store.featuredProduct);
    const [saving, setSaving] = useState(false);

    const set = <K extends keyof ProductItem>(key: K, value: ProductItem[K]) =>
        setProduct((prev) => ({ ...prev, [key]: value }));

    const setNoteField = (tier: typeof TIERS[number], field: "ingredients" | "impression", raw: string) =>
        setProduct((prev) => ({
            ...prev,
            notes: {
                ...prev.notes,
                [tier]: {
                    ...prev.notes[tier],
                    [field]: field === "ingredients" ? stringToList(raw) : raw,
                },
            },
        }));

    // ── Gallery ──
    const setImage = (i: number, v: string) => {
        const next = [...product.images]; next[i] = v; set("images", next);
    };
    const moveImage = (i: number, delta: number) => {
        const j = i + delta;
        if (j < 0 || j >= product.images.length) return;
        const next = [...product.images];
        [next[i], next[j]] = [next[j], next[i]];
        set("images", next);
    };

    // ── Repeatable groups ──
    const setHighlight = (i: number, k: keyof ProductHighlight, v: string) => {
        const next = [...product.highlights]; next[i] = { ...next[i], [k]: v }; set("highlights", next);
    };
    const setSpec = (i: number, k: keyof ProductSpec, v: string) => {
        const next = [...product.specs]; next[i] = { ...next[i], [k]: v }; set("specs", next);
    };
    const setUsage = (i: number, k: keyof UsageStep, v: string) => {
        const next = [...product.usage]; next[i] = { ...next[i], [k]: v }; set("usage", next);
    };

    const handleSave = async () => {
        if (!product.name.trim() || !product.price.trim()) {
            toast("Product name and price are required.", "error");
            return;
        }
        if (product.sizes.length === 0) {
            toast("At least one size is required.", "error");
            return;
        }
        const images = product.images.map((s) => s.trim()).filter(Boolean);
        if (images.length === 0) {
            toast("At least one product image is required.", "error");
            return;
        }
        setSaving(true);
        await saveSection("featuredProduct", { ...product, images }, toast, "Signature product updated successfully!");
        setSaving(false);
    };

    return (
        <div>
            {/* Page header */}
            <PageHeader
                title="Product"
                description="The single fragrance the homepage is built around."
            />
            {/* Current product preview */}
            <div style={{ background: "var(--noir)", borderRadius: "var(--radius)", padding: "20px 24px", marginBottom: 28, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                {product.images[0] && (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        style={{ width: 60, height: 76, objectFit: "contain", background: "rgba(255,255,255,0.05)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(197,165,114,0.30)", flexShrink: 0 }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent-text)", marginBottom: 4 }}>
                        Currently Featured
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "#fff", marginBottom: 2 }}>
                        {product.name || "—"}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.50)" }}>
                        {product.collection} · {product.price} · {product.concentration}
                    </div>
                </div>
            </div>

            {/* Details and Gallery share a row: the gallery is a short list of
                small rows, so at full width it was mostly empty. */}
            <div className="adm-cols adm-cols-rail">
            <Section title="Product Details">
                <div className="adm-grid-2">
                    <Field label="Product Name" required>
                        <Input value={product.name} onChange={(e) => set("name", e.target.value)} />
                    </Field>
                    <Field label="Price" required hint="E.g. NPR 24,500">
                        <Input value={product.price} onChange={(e) => set("price", e.target.value)} />
                    </Field>
                    <Field label="Collection" hint="Eyebrow shown above the product name">
                        <Input value={product.collection} onChange={(e) => set("collection", e.target.value)} />
                    </Field>
                    <Field label="Concentration" hint="E.g. Eau de Parfum (EDP)">
                        <Input value={product.concentration} onChange={(e) => set("concentration", e.target.value)} />
                    </Field>
                    <Field label="Headline Size" hint="Shown beside the concentration, e.g. 100 mL / 3.4 fl. oz.">
                        <Input value={product.headlineSize} onChange={(e) => set("headlineSize", e.target.value)} />
                    </Field>
                    <Field label="Sizes" required hint="Comma-separated — first one is preselected">
                        <Input value={listToString(product.sizes)} onChange={(e) => set("sizes", stringToList(e.target.value))} placeholder="100 ml, 50 ml, 30 ml" />
                    </Field>
                </div>

                <Field label="Tagline" hint="Italic lead paragraph at the top of the buy panel.">
                    <Textarea value={product.tagline} onChange={(e) => set("tagline", e.target.value)} rows={3} />
                </Field>
                <Field label="Description">
                    <Textarea value={product.description} onChange={(e) => set("description", e.target.value)} rows={3} />
                </Field>
                <Field label="Ordering Note" hint="Shown under the WhatsApp button. Leave blank to hide.">
                    <Textarea value={product.orderingNote} onChange={(e) => set("orderingNote", e.target.value)} rows={3} />
                </Field>
            </Section>

            {/* ── Gallery ── */}
            <Section title={`Gallery (${product.images.length})`}>
                <p className="adm-hint" style={{ marginBottom: 14 }}>
                    The first image is the default view. Upload replaces the slot; the arrows reorder.
                </p>
                {/* Controls sit under the field rather than beside it. In the
                    rail there is not enough width for both, and squeezing them
                    onto one line wrapped the Replace/Remove buttons instead. */}
                {product.images.map((src, i) => (
                    <div key={i} style={{ marginBottom: 12 }}>
                        <ImageField
                            label={i === 0 ? "Main image" : `Image ${i + 1}`}
                            value={src}
                            prefix="product"
                            onChange={(next) => setImage(i, next)}
                        />
                        <div className="adm-row" style={{ gap: 2, justifyContent: "flex-end", marginTop: 2 }}>
                            <IconButton label={`Move image ${i + 1} up`} onClick={() => moveImage(i, -1)} disabled={i === 0}>
                                <ArrowUp size={15} aria-hidden="true" />
                            </IconButton>
                            <IconButton label={`Move image ${i + 1} down`} onClick={() => moveImage(i, 1)} disabled={i === product.images.length - 1}>
                                <ArrowDown size={15} aria-hidden="true" />
                            </IconButton>
                            <IconButton
                                label={`Remove image ${i + 1}`}
                                onClick={() => {
                                    if (!window.confirm(`Remove image ${i + 1} from the gallery?

The image stays in your library.`)) return;
                                    set("images", product.images.filter((_, x) => x !== i));
                                }}
                            >
                                <Trash2 size={15} aria-hidden="true" />
                            </IconButton>
                        </div>
                    </div>
                ))}

                {/* Uploading here appends rather than replacing a slot. */}
                <ImageField
                    label="Add an image"
                    value=""
                    prefix="product"
                    hint="Optimised and added to the end of the gallery."
                    onChange={(src) => { if (src) set("images", [...product.images, src]); }}
                />
            </Section>

            </div>

            {/* ── Notes ── */}
            {/* Top, heart and base are three readings of the same shape, so they
                belong beside each other where they can be compared. Stacked, the
                two short fields in each tier left most of the row empty. */}
            {/* Reference information rather than selling copy: the list an
                allergy sufferer reads, and the guidance that goes with it. */}
            <Section title="Composition & Safety">
                <Field
                    label="Ingredients"
                    hint="Comma-separated, in the order printed on the bottle. Declarable allergens (limonene, linalool, geraniol and the rest) belong in this list, exactly as on the label."
                >
                    <Textarea
                        value={listToString(product.ingredients)}
                        onChange={(e) => set("ingredients", stringToList(e.target.value))}
                        placeholder="Alcohol Denat., Parfum (Fragrance), Aqua, …"
                        style={{ minHeight: 84 }}
                    />
                </Field>

                <Field
                    label="Safety Warning"
                    hint="Handling only — flammability, external use, eye contact. Shown with an accent rule so it stands out when scanning. Leave blank to hide it."
                >
                    <Textarea
                        value={product.safetyWarning}
                        onChange={(e) => set("safetyWarning", e.target.value)}
                        placeholder="Flammable. For external use only. Avoid contact with eyes."
                        style={{ minHeight: 64 }}
                    />
                </Field>

                <Field
                    label="Sensitive Skin Guidance"
                    hint="The patch-test advice shown beneath the ingredients. Also summarised in the FAQ and as the first step of How to Wear It."
                >
                    <Textarea
                        value={product.allergenNote}
                        onChange={(e) => set("allergenNote", e.target.value)}
                        style={{ minHeight: 120 }}
                    />
                </Field>
            </Section>

            <Section title="The Olfactory Experience">
                <div className="adm-cols adm-cols-3">
                    {TIERS.map((tier, ti) => (
                        <div
                            key={tier}
                            style={{
                                paddingLeft: ti === 0 ? 0 : 24,
                                borderLeft: ti === 0 ? "none" : "1px solid var(--border)",
                            }}
                        >
                            <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--accent-text)", marginBottom: 10 }}>
                                {tier} notes
                            </div>
                            <Field label="Ingredients" hint="Comma-separated">
                                <Input value={listToString(product.notes[tier].ingredients)} onChange={(e) => setNoteField(tier, "ingredients", e.target.value)} />
                            </Field>
                            <Field label="Scent Impression">
                                <Input value={product.notes[tier].impression} onChange={(e) => setNoteField(tier, "impression", e.target.value)} />
                            </Field>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Both are lists of short label/body pairs -- the same shape twice,
                each using about half the row on its own. */}
            <div className="adm-cols adm-cols-2">
            <Section title={`Key Highlights (${product.highlights.length})`} action={
                <button onClick={() => set("highlights", [...product.highlights, { id: `h${Date.now()}`, title: "", body: "" }])}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "var(--noir)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
                    <Plus size={13} /> Add Highlight
                </button>
            }>
                {product.highlights.map((h, i) => (
                    <div key={h.id} style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr auto", gap: "0 16px", alignItems: "end", marginBottom: 10 }}>
                        <Field label={i === 0 ? "Title" : ""}><Input value={h.title} onChange={(e) => setHighlight(i, "title", e.target.value)} /></Field>
                        <Field label={i === 0 ? "Body" : ""}><Input value={h.body} onChange={(e) => setHighlight(i, "body", e.target.value)} /></Field>
                        <div style={{ paddingBottom: 20 }}>
                            <button onClick={() => set("highlights", product.highlights.filter((_, x) => x !== i))}
                                style={{ padding: 7, background: "none", border: "none", cursor: "pointer", color: "#e05555" }}><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
            </Section>

            {/* ── Specs ── */}
            <Section title={`Details & Specifications (${product.specs.length})`} action={
                <button onClick={() => set("specs", [...product.specs, { label: "", value: "" }])}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "var(--noir)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
                    <Plus size={13} /> Add Row
                </button>
            }>
                {product.specs.map((s, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr auto", gap: "0 16px", alignItems: "end", marginBottom: 10 }}>
                        <Field label={i === 0 ? "Label" : ""}><Input value={s.label} onChange={(e) => setSpec(i, "label", e.target.value)} /></Field>
                        <Field label={i === 0 ? "Value" : ""}><Input value={s.value} onChange={(e) => setSpec(i, "value", e.target.value)} /></Field>
                        <div style={{ paddingBottom: 20 }}>
                            <button onClick={() => set("specs", product.specs.filter((_, x) => x !== i))}
                                style={{ padding: 7, background: "none", border: "none", cursor: "pointer", color: "#e05555" }}><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
            </Section>

            </div>

            {/* ── Usage ── */}
            <Section title={`How to Wear It (${product.usage.length})`} action={
                <button onClick={() => set("usage", [...product.usage, { id: `u${Date.now()}`, title: "", body: "" }])}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "var(--noir)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
                    <Plus size={13} /> Add Step
                </button>
            }>
                {product.usage.map((u, i) => (
                    <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr auto", gap: "0 16px", alignItems: "end", marginBottom: 10 }}>
                        <Field label={i === 0 ? "Title" : ""}><Input value={u.title} onChange={(e) => setUsage(i, "title", e.target.value)} /></Field>
                        <Field label={i === 0 ? "Body" : ""}><Input value={u.body} onChange={(e) => setUsage(i, "body", e.target.value)} /></Field>
                        <div style={{ paddingBottom: 20 }}>
                            <button onClick={() => set("usage", product.usage.filter((_, x) => x !== i))}
                                style={{ padding: 7, background: "none", border: "none", cursor: "pointer", color: "#e05555" }}><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
            </Section>

            <div style={{ marginTop: 8 }}>
                <SaveBtn loading={saving} onClick={handleSave} />
            </div>
        </div>
    );
};

export default FeaturedProductPage;
