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
import { Field, Input, Textarea, SaveBtn } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import type {
    ProductItem, ProductHighlight, ProductSpec, UsageStep,
} from "../../data/types";
import { Star, Plus, Trash2 } from "lucide-react";

const listToString = (arr: string[]) => arr.join(", ");
const stringToList = (s: string) => s.split(",").map((n) => n.trim()).filter(Boolean);

const TIERS = ["top", "heart", "base"] as const;

/** Small square button used for the reorder/remove controls in repeatable rows. */
const iconBtn = (disabled = false): React.CSSProperties => ({
    padding: "4px 8px",
    background: "none",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.35 : 1,
});

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
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--on-accent)" }}>
                        <Star size={20} />
                    </div>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, color: "var(--text-main)" }}>
                        Signature Product
                    </h1>
                </div>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginLeft: 52 }}>
                    The single fragrance the homepage is built around.
                </p>
            </div>

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

            {/* ── Basics ── */}
            <Section title="Product Details">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
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
            <Section title={`Gallery (${product.images.length})`} action={
                <button onClick={() => set("images", [...product.images, ""])}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "var(--noir)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
                    <Plus size={13} /> Add Image
                </button>
            }>
                <p style={{ fontSize: "0.80rem", color: "var(--text-faint)", marginBottom: 14 }}>
                    Full Supabase Storage URLs. The first image is shown by default. An address that does not match a stored asset is dropped on save.
                </p>
                {product.images.map((src, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 56, height: 68, flexShrink: 0, borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", background: "var(--sunken-deep)", overflow: "hidden" }}>
                            {src && <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <Input value={src} onChange={(e) => setImage(i, e.target.value)} placeholder="https://…supabase.co/storage/v1/…" />
                        </div>
                        <button onClick={() => moveImage(i, -1)} disabled={i === 0} title="Move up" style={iconBtn(i === 0)}>↑</button>
                        <button onClick={() => moveImage(i, 1)} disabled={i === product.images.length - 1} title="Move down" style={iconBtn(i === product.images.length - 1)}>↓</button>
                        <button onClick={() => set("images", product.images.filter((_, x) => x !== i))} title="Remove"
                            style={{ padding: 7, background: "none", border: "none", cursor: "pointer", color: "#e05555" }}><Trash2 size={14} /></button>
                    </div>
                ))}
            </Section>

            {/* ── Notes ── */}
            <Section title="The Olfactory Experience">
                {TIERS.map((tier) => (
                    <div key={tier} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: tier !== "base" ? "1px solid var(--border)" : "none" }}>
                        <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--accent-text)", marginBottom: 10 }}>
                            {tier} notes
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "0 24px" }}>
                            <Field label="Ingredients" hint="Comma-separated">
                                <Input value={listToString(product.notes[tier].ingredients)} onChange={(e) => setNoteField(tier, "ingredients", e.target.value)} />
                            </Field>
                            <Field label="Scent Impression">
                                <Input value={product.notes[tier].impression} onChange={(e) => setNoteField(tier, "impression", e.target.value)} />
                            </Field>
                        </div>
                    </div>
                ))}
            </Section>

            {/* ── Highlights ── */}
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
