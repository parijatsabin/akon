/**
 * FeaturedProductPage — Admin CMS page for managing the Signature/Flagship product.
 * Lets the admin either pick an existing product from the collection as the featured one,
 * or manually override all fields.
 */
import React, { useState } from "react";
import { readStore, updateSection } from "../cms/cmsStore";
import { Card } from "../components/ui/Card";
import { Field, Input, Textarea, Select, SaveBtn } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import type { ProductItem } from "../types/cms.types";
import { Star, RefreshCw } from "lucide-react";

const notesString = (arr: string[]) => arr.join(", ");
const notesArray = (s: string) => s.split(",").map((n) => n.trim()).filter(Boolean);

const COLLECTION_OPTIONS = [
    { value: "Signature Collection", label: "Signature Collection" },
    { value: "Luxury Collection", label: "Luxury Collection" },
    { value: "Limited Edition", label: "Limited Edition" },
    { value: "Seasonal Fragrances", label: "Seasonal Fragrances" },
];

const FeaturedProductPage: React.FC = () => {
    const { toast } = useToast();
    const store = readStore();

    const [mode, setMode] = useState<"pick" | "manual">("pick");
    const [selectedId, setSelectedId] = useState<string>(store.featuredProduct.id);
    const [product, setProduct] = useState<ProductItem>(store.featuredProduct);
    const [saving, setSaving] = useState(false);

    const collectionItems = store.collection.items;

    const handlePickChange = (id: string) => {
        setSelectedId(id);
        const found = collectionItems.find((p) => p.id === id);
        if (found) setProduct({ ...found });
    };

    const set = (key: keyof ProductItem, value: unknown) => {
        setProduct((prev) => ({ ...prev, [key]: value }));
    };

    const setNotes = (tier: "top" | "heart" | "base", raw: string) => {
        setProduct((prev) => ({
            ...prev,
            notes: { ...prev.notes, [tier]: notesArray(raw) },
        }));
    };

    const handleSave = async () => {
        if (!product.name.trim() || !product.price.trim()) {
            toast("Product name and price are required.", "error");
            return;
        }
        setSaving(true);
        await new Promise((r) => setTimeout(r, 350));
        await updateSection("featuredProduct", product);
        setSaving(false);
        toast("Signature product updated successfully!");
    };

    return (
        <div>
            {/* Page header */}
            <div style={{ marginBottom: 32, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                            <Star size={20} />
                        </div>
                        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, color: "var(--text-main)" }}>
                            Signature Product
                        </h1>
                    </div>
                    <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginLeft: 52 }}>
                        Manage the flagship product shown on the homepage's Signature Collection section.
                    </p>
                </div>

                {/* Live preview link */}
                <a
                    href={`/products/${product.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: "0.80rem", fontWeight: 600, color: "var(--text-muted)", background: "#fff", textDecoration: "none", transition: "all 0.18s" }}
                    onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = "var(--gold)"; el.style.color = "var(--gold)"; }}
                    onMouseLeave={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = "var(--border)"; el.style.color = "var(--text-muted)"; }}
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Preview Page
                </a>
            </div>

            {/* Current featured product preview card */}
            <div
                style={{
                    background: "var(--charcoal)",
                    borderRadius: "var(--radius)",
                    padding: "20px 24px",
                    marginBottom: 28,
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    flexWrap: "wrap",
                }}
            >
                <img
                    src={product.imageUrl || "https://images.unsplash.com/photo-1541643600914-78b084683601?w=120&h=150&fit=crop"}
                    alt={product.name}
                    style={{ width: 60, height: 76, objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid rgba(162,127,63,0.30)", flexShrink: 0 }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1541643600914-78b084683601?w=120&h=150&fit=crop"; }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>
                        Currently Featured
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "#fff", marginBottom: 2 }}>
                        {product.name || "—"}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.50)" }}>
                        {product.collection} · {product.price}
                    </div>
                </div>
                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "5px 14px",
                        borderRadius: 30,
                        background: "rgba(162,127,63,0.20)",
                        border: "1px solid rgba(162,127,63,0.35)",
                        color: "var(--gold-light)",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        letterSpacing: "0.10em",
                        textTransform: "uppercase",
                    }}
                >
                    <Star size={11} />
                    Signature
                </div>
            </div>

            {/* Mode switcher */}
            <Card title="Update Signature Product">
                <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-main)", marginBottom: 12 }}>
                        How would you like to set it?
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        {([
                            { val: "pick", label: "Pick from Collection", desc: "Choose an existing product" },
                            { val: "manual", label: "Manual Override", desc: "Set all fields manually" },
                        ] as const).map((opt) => (
                            <button
                                key={opt.val}
                                onClick={() => setMode(opt.val)}
                                style={{
                                    flex: 1,
                                    padding: "14px 16px",
                                    borderRadius: "var(--radius-sm)",
                                    border: "1.5px solid",
                                    cursor: "pointer",
                                    fontFamily: "var(--font-body)",
                                    transition: "all 0.18s",
                                    textAlign: "left",
                                    background: mode === opt.val ? "var(--parchment)" : "#fff",
                                    borderColor: mode === opt.val ? "var(--gold)" : "var(--border)",
                                }}
                            >
                                <div style={{ fontWeight: 700, fontSize: "0.86rem", color: mode === opt.val ? "var(--gold-dim)" : "var(--text-main)", marginBottom: 3 }}>
                                    {mode === opt.val && "✓ "}{opt.label}
                                </div>
                                <div style={{ fontSize: "0.76rem", color: "var(--text-faint)" }}>{opt.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pick from collection */}
                {mode === "pick" && (
                    <div>
                        <Field label="Select Product" hint="This will populate all fields from the selected product.">
                            <select
                                value={selectedId}
                                onChange={(e) => handlePickChange(e.target.value)}
                                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontSize: "0.88rem", color: "var(--text-main)", background: "#fff", outline: "none", cursor: "pointer" }}
                                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                            >
                                {collectionItems.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} — {p.collection} ({p.price})
                                    </option>
                                ))}
                            </select>
                        </Field>

                        {/* Selected product preview */}
                        {(() => {
                            const found = collectionItems.find((p) => p.id === selectedId);
                            if (!found) return null;
                            return (
                                <div style={{ marginTop: 16, padding: "16px", background: "var(--parchment)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 16 }}>
                                    <img src={found.imageUrl} alt={found.name} style={{ width: 52, height: 64, objectFit: "cover", borderRadius: 4, border: "1px solid var(--border)" }} />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-main)", marginBottom: 2 }}>{found.name}</div>
                                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 4 }}>{found.collection} · {found.price}</div>
                                        {found.badge && (
                                            <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.10em", background: "var(--charcoal)", color: "var(--gold-light)", padding: "3px 10px", borderRadius: 3 }}>
                                                {found.badge}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* Manual override form */}
                {mode === "manual" && (
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, padding: "10px 14px", background: "rgba(162,127,63,0.08)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(162,127,63,0.20)" }}>
                            <RefreshCw size={13} style={{ color: "var(--gold)", flexShrink: 0 }} />
                            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                                These fields override the homepage display only. The collection catalog is unaffected.
                            </span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                            <Field label="Product Name" required>
                                <Input value={product.name} onChange={(e) => set("name", e.target.value)} />
                            </Field>
                            <Field label="Price" required hint="E.g. NPR 24,500">
                                <Input value={product.price} onChange={(e) => set("price", e.target.value)} />
                            </Field>
                            <Field label="Collection">
                                <Select value={product.collection} options={COLLECTION_OPTIONS} onChange={(e) => set("collection", e.target.value)} />
                            </Field>
                            <Field label="Badge" hint="E.g. Signature, New — leave empty for none">
                                <Input value={product.badge ?? ""} onChange={(e) => set("badge", e.target.value || null)} placeholder="Leave empty for no badge" />
                            </Field>
                        </div>

                        <Field label="Description">
                            <Textarea value={product.description} onChange={(e) => set("description", e.target.value)} rows={4} />
                        </Field>

                        <Field label="Image URL" hint="Direct image link — Unsplash, CDN, etc.">
                            <Input value={product.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} />
                        </Field>
                        {product.imageUrl && (
                            <img src={product.imageUrl} alt="preview" style={{ width: 80, height: 100, objectFit: "cover", borderRadius: 4, border: "1px solid var(--border)", marginBottom: 16 }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                        )}

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                            <Field label="Product ID" hint="Used for the URL: /products/{id}">
                                <Input value={product.id} onChange={(e) => set("id", e.target.value)} />
                            </Field>
                            <Field label="Accent Color">
                                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                    <input type="color" value={product.accentColor} onChange={(e) => set("accentColor", e.target.value)} style={{ width: 44, height: 38, padding: 2, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer" }} />
                                    <Input value={product.accentColor} onChange={(e) => set("accentColor", e.target.value)} style={{ flex: 1 }} />
                                </div>
                            </Field>
                        </div>

                        <div style={{ marginTop: 8, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                            <div style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>
                                Fragrance Notes
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 24px" }}>
                                <Field label="Top Notes" hint="Comma-separated">
                                    <Input value={notesString(product.notes.top)} onChange={(e) => setNotes("top", e.target.value)} placeholder="Bergamot, Pink Pepper" />
                                </Field>
                                <Field label="Heart Notes" hint="Comma-separated">
                                    <Input value={notesString(product.notes.heart)} onChange={(e) => setNotes("heart", e.target.value)} placeholder="Bulgarian Rose, Iris" />
                                </Field>
                                <Field label="Base Notes" hint="Comma-separated">
                                    <Input value={notesString(product.notes.base)} onChange={(e) => setNotes("base", e.target.value)} placeholder="Oud, Amber" />
                                </Field>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            <div style={{ marginTop: 8 }}>
                <SaveBtn loading={saving} onClick={handleSave} />
            </div>
        </div>
    );
};

export default FeaturedProductPage;
