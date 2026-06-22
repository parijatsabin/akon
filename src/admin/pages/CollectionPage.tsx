import React, { useState } from "react";
import { readStore, updateSection } from "../cms/cmsStore";
import { Card } from "../components/ui/Card";
import { Field, Input, Textarea, Select, SaveBtn } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import type { ProductItem } from "../types/cms.types";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

const COLLECTIONS = [
    { value: "Signature Collection", label: "Signature Collection" },
    { value: "Luxury Collection", label: "Luxury Collection" },
    { value: "Limited Edition", label: "Limited Edition" },
    { value: "Seasonal Fragrances", label: "Seasonal Fragrances" },
];

const emptyProduct = (): ProductItem => ({
    id: `product-${Date.now()}`,
    name: "",
    collection: "Signature Collection",
    notes: { top: [], heart: [], base: [] },
    description: "",
    price: "",
    badge: null,
    accentColor: "#a27f3f",
    imageUrl: "",
    productUrl: "#",
});

const notesString = (arr: string[]) => arr.join(", ");
const notesArray = (s: string) => s.split(",").map((n) => n.trim()).filter(Boolean);

const CollectionPage: React.FC = () => {
    const { toast } = useToast();
    const store = readStore();
    const [headline, setHeadline] = useState(store.collection.headline);
    const [items, setItems] = useState<ProductItem[]>(store.collection.items);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const toggle = (id: string) => setExpanded((e) => (e === id ? null : id));

    const setItem = (id: string, key: keyof ProductItem, value: unknown) =>
        setItems((prev) => prev.map((p) => (p.id === id ? { ...p, [key]: value } : p)));

    const setNotes = (id: string, tier: "top" | "heart" | "base", raw: string) =>
        setItems((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, notes: { ...p.notes, [tier]: notesArray(raw) } } : p
            )
        );

    const addProduct = () => {
        const p = emptyProduct();
        setItems((prev) => [p, ...prev]);
        setExpanded(p.id);
    };

    const removeProduct = (id: string) => {
        if (!window.confirm("Remove this product?")) return;
        setItems((prev) => prev.filter((p) => p.id !== id));
        if (expanded === id) setExpanded(null);
    };

    const moveUp = (i: number) => {
        if (i === 0) return;
        const next = [...items];
        [next[i - 1], next[i]] = [next[i], next[i - 1]];
        setItems(next);
    };
    const moveDown = (i: number) => {
        if (i === items.length - 1) return;
        const next = [...items];
        [next[i], next[i + 1]] = [next[i + 1], next[i]];
        setItems(next);
    };

    const handleSave = async () => {
        if (items.some((p) => !p.name.trim() || !p.price.trim())) {
            toast("Product name and price are required.", "error");
            return;
        }
        setSaving(true);
        await new Promise((r) => setTimeout(r, 350));
        updateSection("collection", { headline, items });
        setSaving(false);
        toast("Collection saved!");
    };

    return (
        <div>
            <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 6 }}>Collection</h1>
                    <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>{items.length} product{items.length !== 1 ? "s" : ""} in the featured collection.</p>
                </div>
                <button
                    onClick={addProduct}
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", background: "var(--charcoal)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.06em", cursor: "pointer", transition: "background 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--charcoal-mid)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--charcoal)"; }}
                >
                    <Plus size={15} /> Add Product
                </button>
            </div>

            <Card title="Section Headline">
                <Field label="Headline">
                    <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
                </Field>
            </Card>

            {items.map((product, i) => (
                <div
                    key={product.id}
                    style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius)", marginBottom: 14, overflow: "hidden", boxShadow: "var(--shadow)" }}
                >
                    {/* Row header */}
                    <div
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", cursor: "pointer", userSelect: "none", borderBottom: expanded === product.id ? "1px solid var(--border)" : "none", background: expanded === product.id ? "var(--parchment)" : "#fff" }}
                        onClick={() => toggle(product.id)}
                    >
                        {/* Image thumb */}
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt="" style={{ width: 44, height: 52, objectFit: "cover", borderRadius: 4, flexShrink: 0, border: "1px solid var(--border)" }} />
                        ) : (
                            <div style={{ width: 44, height: 52, background: "var(--parchment)", borderRadius: 4, flexShrink: 0, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", color: "var(--text-faint)" }}>IMG</div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--text-main)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {product.name || <span style={{ color: "var(--text-faint)", fontStyle: "italic" }}>Untitled Product</span>}
                            </div>
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                <span style={{ fontSize: "0.72rem", color: "var(--gold)", fontWeight: 600 }}>{product.collection}</span>
                                {product.badge && <span style={{ fontSize: "0.65rem", background: "var(--charcoal)", color: "var(--gold-light)", padding: "2px 8px", borderRadius: 3 }}>{product.badge}</span>}
                                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>{product.price}</span>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
                            <button onClick={(e) => { e.stopPropagation(); moveUp(i); }} disabled={i === 0} title="Move up" style={{ padding: 5, background: "none", border: "none", cursor: i === 0 ? "not-allowed" : "pointer", opacity: i === 0 ? 0.3 : 1, color: "var(--text-muted)" }}><ChevronUp size={15} /></button>
                            <button onClick={(e) => { e.stopPropagation(); moveDown(i); }} disabled={i === items.length - 1} title="Move down" style={{ padding: 5, background: "none", border: "none", cursor: i === items.length - 1 ? "not-allowed" : "pointer", opacity: i === items.length - 1 ? 0.3 : 1, color: "var(--text-muted)" }}><ChevronDown size={15} /></button>
                            <button onClick={(e) => { e.stopPropagation(); removeProduct(product.id); }} title="Delete" style={{ padding: 5, background: "none", border: "none", cursor: "pointer", color: "#e05555" }}><Trash2 size={15} /></button>
                            {expanded === product.id ? <ChevronUp size={17} style={{ color: "var(--text-muted)" }} /> : <ChevronDown size={17} style={{ color: "var(--text-muted)" }} />}
                        </div>
                    </div>

                    {/* Expanded form */}
                    {expanded === product.id && (
                        <div style={{ padding: "24px 20px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                                <Field label="Product Name" required>
                                    <Input value={product.name} onChange={(e) => setItem(product.id, "name", e.target.value)} />
                                </Field>
                                <Field label="Price" required hint="E.g. NPR 24,500">
                                    <Input value={product.price} onChange={(e) => setItem(product.id, "price", e.target.value)} />
                                </Field>
                                <Field label="Collection">
                                    <Select
                                        value={product.collection}
                                        options={COLLECTIONS}
                                        onChange={(e) => setItem(product.id, "collection", e.target.value)}
                                    />
                                </Field>
                                <Field label="Badge" hint="E.g. Best Seller, Limited Edition — leave empty for none">
                                    <Input
                                        value={product.badge ?? ""}
                                        onChange={(e) => setItem(product.id, "badge", e.target.value || null)}
                                        placeholder="Leave empty for no badge"
                                    />
                                </Field>
                            </div>

                            <Field label="Description">
                                <Textarea value={product.description} onChange={(e) => setItem(product.id, "description", e.target.value)} />
                            </Field>

                            <Field label="Image URL" hint="Direct image link (Unsplash, CDN, etc.)">
                                <Input value={product.imageUrl} onChange={(e) => setItem(product.id, "imageUrl", e.target.value)} />
                            </Field>
                            {product.imageUrl && (
                                <img src={product.imageUrl} alt="preview" style={{ width: 80, height: 100, objectFit: "cover", borderRadius: 4, border: "1px solid var(--border)", marginBottom: 16 }} />
                            )}

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                                <Field label="Product URL">
                                    <Input value={product.productUrl} onChange={(e) => setItem(product.id, "productUrl", e.target.value)} />
                                </Field>
                                <Field label="Accent Color">
                                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                        <input type="color" value={product.accentColor} onChange={(e) => setItem(product.id, "accentColor", e.target.value)} style={{ width: 44, height: 38, padding: 2, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer" }} />
                                        <Input value={product.accentColor} onChange={(e) => setItem(product.id, "accentColor", e.target.value)} style={{ flex: 1 }} />
                                    </div>
                                </Field>
                            </div>

                            <div style={{ marginTop: 8, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                                <div style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>Fragrance Notes</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 24px" }}>
                                    <Field label="Top Notes" hint="Comma-separated">
                                        <Input value={notesString(product.notes.top)} onChange={(e) => setNotes(product.id, "top", e.target.value)} placeholder="Bergamot, Pink Pepper" />
                                    </Field>
                                    <Field label="Heart Notes" hint="Comma-separated">
                                        <Input value={notesString(product.notes.heart)} onChange={(e) => setNotes(product.id, "heart", e.target.value)} placeholder="Bulgarian Rose, Iris" />
                                    </Field>
                                    <Field label="Base Notes" hint="Comma-separated">
                                        <Input value={notesString(product.notes.base)} onChange={(e) => setNotes(product.id, "base", e.target.value)} placeholder="Oud, Amber" />
                                    </Field>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            <div style={{ marginTop: 8 }}>
                <SaveBtn loading={saving} onClick={handleSave} />
            </div>
        </div>
    );
};

export default CollectionPage;
