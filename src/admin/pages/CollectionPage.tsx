import React, { useState, useEffect } from "react";
import { readStore, updateSection } from "../cms/cmsStore";
import { Field, Input, Textarea, Select, SaveBtn } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import type { ProductItem } from "../types/cms.types";
import { Plus, Pencil, Trash2, X } from "lucide-react";

// ── Constants ─────────────────────────────────────────────────
const COLLECTIONS = [
    { value: "Signature Collection", label: "Signature Collection" },
    { value: "Luxury Collection", label: "Luxury Collection" },
    { value: "Limited Edition", label: "Limited Edition" },
    { value: "Seasonal Fragrances", label: "Seasonal Fragrances" },
];

const emptyProduct = (): ProductItem => ({
    id: `product-${Date.now()}`,
    name: "", collection: "Signature Collection",
    notes: { top: [], heart: [], base: [] },
    description: "", price: "", badge: null,
    accentColor: "#a27f3f", imageUrl: "", productUrl: "#",
    visible: true,
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
});

const notesString = (arr: string[]) => arr.join(", ");
const notesArray = (s: string) => s.split(",").map((n) => n.trim()).filter(Boolean);

// ── Backdrop ──────────────────────────────────────────────────
const Backdrop: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <div
        onClick={onClick}
        style={{
            position: "fixed", inset: 0, background: "rgba(13,12,11,0.55)",
            zIndex: 200, backdropFilter: "blur(3px)",
        }}
    />
);

// ── Delete Confirm Dialog ─────────────────────────────────────
interface DeleteDialogProps {
    productName: string;
    onConfirm: () => void;
    onCancel: () => void;
}
const DeleteDialog: React.FC<DeleteDialogProps> = ({ productName, onConfirm, onCancel }) => (
    <>
        <Backdrop onClick={onCancel} />
        <div style={{
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 201, background: "#fff",
            borderRadius: "var(--radius)", padding: "36px 32px",
            width: 400, maxWidth: "90vw",
            boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
            textAlign: "center",
        }}>
            {/* Icon */}
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fff0f0", border: "1px solid #f5c0c0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", color: "#e05555" }}>
                <Trash2 size={22} />
            </div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 8 }}>
                Delete Product?
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: 28, lineHeight: 1.6 }}>
                <strong style={{ color: "var(--text-main)" }}>"{productName}"</strong> will be permanently removed from the collection. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button onClick={onCancel}
                    style={{ padding: "10px 24px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", background: "#fff", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.84rem", cursor: "pointer", color: "var(--text-main)", transition: "all 0.18s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--parchment)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}>
                    Cancel
                </button>
                <button onClick={onConfirm}
                    style={{ padding: "10px 24px", border: "none", borderRadius: "var(--radius-sm)", background: "#e05555", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.84rem", cursor: "pointer", transition: "background 0.18s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#c03333"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#e05555"; }}>
                    Delete
                </button>
            </div>
        </div>
    </>
);

// ── Product Dialog (Add / Edit) ───────────────────────────────
interface ProductDialogProps {
    initial: ProductItem;
    mode: "add" | "edit";
    onSave: (p: ProductItem) => void;
    onClose: () => void;
}
const ProductDialog: React.FC<ProductDialogProps> = ({ initial, mode, onSave, onClose }) => {
    const [form, setForm] = useState<ProductItem>(initial);
    const set = (k: keyof ProductItem, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
    const setNotes = (tier: "top" | "heart" | "base", raw: string) =>
        setForm((f) => ({ ...f, notes: { ...f.notes, [tier]: notesArray(raw) } }));

    // Close on Escape
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const handleSubmit = () => {
        if (!form.name.trim() || !form.price.trim()) return;
        onSave(form);
    };

    return (
        <>
            <Backdrop onClick={onClose} />
            <div style={{
                position: "fixed", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 201, background: "#fff",
                borderRadius: "var(--radius)", width: 680, maxWidth: "95vw",
                maxHeight: "90vh", overflowY: "auto",
                boxShadow: "0 32px 80px rgba(0,0,0,0.24)",
                display: "flex", flexDirection: "column",
            }}>
                {/* Dialog header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: "1px solid var(--border)", background: "var(--parchment)", flexShrink: 0 }}>
                    <div>
                        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
                            {mode === "add" ? "Add New Product" : "Edit Product"}
                        </h3>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 3 }}>
                            {mode === "add" ? "Fill in the details below and save to add to the collection." : `Editing: ${initial.name}`}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ padding: 6, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", borderRadius: "var(--radius-sm)", transition: "all 0.18s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--border)"; e.currentTarget.style.color = "var(--text-main)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-muted)"; }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Dialog body */}
                <div style={{ padding: "24px 28px", flex: 1 }}>
                    {/* Row 1 — Name + Price */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                        <Field label="Product Name" required>
                            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Noir Veil" />
                        </Field>
                        <Field label="Price" required hint="E.g. NPR 24,500">
                            <Input value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="NPR 24,500" />
                        </Field>
                    </div>
                    {/* Row 2 — Collection + Badge */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                        <Field label="Collection">
                            <Select value={form.collection} options={COLLECTIONS} onChange={(e) => set("collection", e.target.value)} />
                        </Field>
                        <Field label="Badge" hint="Best Seller, New — leave empty for none">
                            <Input value={form.badge ?? ""} onChange={(e) => set("badge", e.target.value || null)} placeholder="Leave empty for no badge" />
                        </Field>
                    </div>
                    <Field label="Description">
                        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} style={{ minHeight: 76 }} />
                    </Field>
                    {/* Row 3 — Image URL + preview */}
                    <Field label="Image URL" hint="Direct image link — Unsplash, CDN, etc.">
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}>
                                <Input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://..." />
                            </div>
                            {form.imageUrl && (
                                <img src={form.imageUrl} alt="" style={{ width: 40, height: 50, objectFit: "cover", borderRadius: 4, border: "1px solid var(--border)", flexShrink: 0, marginTop: 2 }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                            )}
                        </div>
                    </Field>
                    {/* Row 4 — Product URL + Accent Color */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                        <Field label="Product URL">
                            <Input value={form.productUrl} onChange={(e) => set("productUrl", e.target.value)} />
                        </Field>
                        <Field label="Accent Color">
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <input type="color" value={form.accentColor} onChange={(e) => set("accentColor", e.target.value)} style={{ width: 42, height: 38, padding: 2, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer" }} />
                                <Input value={form.accentColor} onChange={(e) => set("accentColor", e.target.value)} style={{ flex: 1 }} />
                            </div>
                        </Field>
                    </div>
                    {/* Row 5 — Visible toggle */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--parchment)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", marginBottom: 4 }}>
                        <span
                            role="checkbox"
                            aria-checked={form.visible}
                            onClick={() => set("visible", !form.visible)}
                            style={{
                                display: "inline-flex", alignItems: "center",
                                width: 40, height: 22, borderRadius: 11,
                                background: form.visible ? "var(--gold)" : "var(--border)",
                                padding: "2px", transition: "background 0.22s", cursor: "pointer", flexShrink: 0,
                            }}
                        >
                            <span style={{
                                width: 18, height: 18, borderRadius: "50%", background: "#fff",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                                transform: form.visible ? "translateX(18px)" : "translateX(0)",
                                transition: "transform 0.22s", display: "block",
                            }} />
                        </span>
                        <div>
                            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-main)" }}>
                                {form.visible ? "Visible on site" : "Hidden from site"}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>
                                Toggle to show or hide this product without deleting it
                            </div>
                        </div>
                    </div>
                    {/* Fragrance Notes */}
                    <div style={{ paddingTop: 16, borderTop: "1px solid var(--border)", marginTop: 4 }}>
                        <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 14 }}>Fragrance Notes</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 20px" }}>
                            <Field label="Top Notes" hint="Comma-separated">
                                <Input value={notesString(form.notes.top)} onChange={(e) => setNotes("top", e.target.value)} placeholder="Bergamot, Pepper" />
                            </Field>
                            <Field label="Heart Notes" hint="Comma-separated">
                                <Input value={notesString(form.notes.heart)} onChange={(e) => setNotes("heart", e.target.value)} placeholder="Rose, Iris" />
                            </Field>
                            <Field label="Base Notes" hint="Comma-separated">
                                <Input value={notesString(form.notes.base)} onChange={(e) => setNotes("base", e.target.value)} placeholder="Oud, Amber" />
                            </Field>
                        </div>
                    </div>
                </div>

                {/* Dialog footer */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, padding: "16px 28px", borderTop: "1px solid var(--border)", background: "var(--parchment)", flexShrink: 0 }}>
                    <button onClick={onClose}
                        style={{ padding: "10px 22px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", background: "#fff", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.84rem", cursor: "pointer", color: "var(--text-main)", transition: "all 0.18s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--parchment)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}>
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={!form.name.trim() || !form.price.trim()}
                        style={{ padding: "10px 26px", border: "none", borderRadius: "var(--radius-sm)", background: (!form.name.trim() || !form.price.trim()) ? "var(--gold-subtle)" : "var(--gold)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.84rem", cursor: (!form.name.trim() || !form.price.trim()) ? "not-allowed" : "pointer", transition: "background 0.18s", letterSpacing: "0.04em" }}
                        onMouseEnter={(e) => { if (form.name.trim() && form.price.trim()) e.currentTarget.style.background = "var(--gold-dim)"; }}
                        onMouseLeave={(e) => { if (form.name.trim() && form.price.trim()) e.currentTarget.style.background = "var(--gold)"; }}>
                        {mode === "add" ? "Add Product" : "Save Changes"}
                    </button>
                </div>
            </div>
        </>
    );
};

// ── Product Card ─────────────────────────────────────────────
interface ProductCardProps {
    product: ProductItem;
    index: number;
    onEdit: () => void;
    onDelete: () => void;
}
const ProductCard: React.FC<ProductCardProps> = ({ product, index, onEdit, onDelete }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            style={{
                background: "#fff",
                border: `1.5px solid ${hovered ? "var(--gold-subtle)" : "var(--border)"}`,
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
                boxShadow: hovered ? "var(--shadow-gold)" : "var(--shadow)",
                display: "flex", flexDirection: "column",
                transition: "all 0.2s",
                transform: hovered ? "translateY(-3px)" : "translateY(0)",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Image + hover overlay */}
            <div style={{ position: "relative", width: "100%", height: 110, background: "var(--parchment)", overflow: "hidden", flexShrink: 0 }}>
                {product.imageUrl
                    ? <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.3s", transform: hovered ? "scale(1.06)" : "scale(1)" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-faint)", fontSize: "0.58rem", letterSpacing: "0.06em" }}>NO IMG</div>
                }
                {/* Hover action overlay */}
                <div style={{ position: "absolute", inset: 0, background: "rgba(13,12,11,0.65)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, opacity: hovered ? 1 : 0, transition: "opacity 0.2s", backdropFilter: "blur(2px)" }}>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 18px", background: "rgba(255,255,255,0.95)", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700, color: "var(--gold-dim)", fontFamily: "var(--font-body)", letterSpacing: "0.04em", width: 90, justifyContent: "center" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--gold)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--gold-dim)"; }}>
                        <Pencil size={12} /> Edit
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 18px", background: "rgba(224,85,85,0.88)", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700, color: "#fff", fontFamily: "var(--font-body)", letterSpacing: "0.04em", width: 90, justifyContent: "center" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#e05555"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(224,85,85,0.88)"; }}>
                        <Trash2 size={12} /> Delete
                    </button>
                </div>
                {/* Order # */}
                <div style={{ position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: "50%", background: "rgba(253,250,245,0.92)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.52rem", fontWeight: 700, color: "var(--text-muted)", zIndex: 1 }}>
                    {index + 1}
                </div>
                {product.badge && (
                    <div style={{ position: "absolute", bottom: 4, left: 4, fontSize: "0.50rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: "var(--charcoal)", color: "var(--gold-light)", padding: "2px 5px", borderRadius: 2, zIndex: 1 }}>
                        {product.badge}
                    </div>
                )}
                {!product.visible && (
                    <div style={{ position: "absolute", top: 4, left: 4, fontSize: "0.50rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: "rgba(224,85,85,0.90)", color: "#fff", padding: "2px 5px", borderRadius: 2, zIndex: 2 }}>
                        Hidden
                    </div>
                )}
            </div>

            {/* Body */}
            <div style={{ padding: "7px 8px 8px", flex: 1 }}>
                <div style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {product.collection}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.76rem", color: "var(--text-main)", lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {product.name || <span style={{ color: "var(--text-faint)", fontStyle: "italic" }}>Untitled</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)" }}>{product.price}</span>

                </div>
            </div>
        </div>
    );
};


const CollectionPage: React.FC = () => {
    const { toast } = useToast();
    const store = readStore();
    const [headline, setHeadline] = useState(store.collection.headline);
    const [items, setItems] = useState<ProductItem[]>(store.collection.items);
    const [saving, setSaving] = useState(false);

    // Dialog state
    type DialogState =
        | { type: "none" }
        | { type: "add" }
        | { type: "edit"; product: ProductItem }
        | { type: "delete"; product: ProductItem };
    const [dialog, setDialog] = useState<DialogState>({ type: "none" });

    // Dialog actions
    const handleAdd = (p: ProductItem) => {
        const withOrder = { ...p, order: items.length, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setItems((prev) => [withOrder, ...prev]);
        setDialog({ type: "none" });
        toast("Product added — remember to save.");
    };
    const handleEdit = (p: ProductItem) => {
        setItems((prev) => prev.map((x) => (x.id === p.id ? { ...p, updatedAt: new Date().toISOString() } : x)));
        setDialog({ type: "none" });
        toast("Product updated — remember to save.");
    };
    const handleDelete = (id: string) => {
        setItems((prev) => prev.filter((p) => p.id !== id));
        setDialog({ type: "none" });
        toast("Product removed — remember to save.");
    };

    const handleSave = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 300));
        // Preserve the non-items fields (productSizes, shippingRows, etc.) from the current store
        const current = readStore().collection;
        await updateSection("collection", { ...current, headline, items });
        setSaving(false);
        toast("Collection saved!");
    };

    return (
        <div>
            {/* ── Dialogs ── */}
            {dialog.type === "add" && (
                <ProductDialog
                    mode="add"
                    initial={emptyProduct()}
                    onSave={handleAdd}
                    onClose={() => setDialog({ type: "none" })}
                />
            )}
            {dialog.type === "edit" && (
                <ProductDialog
                    mode="edit"
                    initial={dialog.product}
                    onSave={handleEdit}
                    onClose={() => setDialog({ type: "none" })}
                />
            )}
            {dialog.type === "delete" && (
                <DeleteDialog
                    productName={dialog.product.name || "Untitled Product"}
                    onConfirm={() => handleDelete(dialog.product.id)}
                    onCancel={() => setDialog({ type: "none" })}
                />
            )}

            {/* ── Page header ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
                <div>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>Collection</h1>
                    <p style={{ fontSize: "0.86rem", color: "var(--text-muted)" }}>
                        {items.length} product{items.length !== 1 ? "s" : ""} · click <strong>Edit</strong> or <strong>Delete</strong> on any row
                    </p>
                </div>
                <button
                    onClick={() => setDialog({ type: "add" })}
                    style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 20px", background: "var(--charcoal)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.06em", cursor: "pointer", transition: "background 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--charcoal-mid)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--charcoal)"; }}>
                    <Plus size={14} /> Add Product
                </button>
            </div>

            {/* ── Headline card ── */}
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 16, boxShadow: "var(--shadow)" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Section Headline</span>
                <input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    style={{ flex: 1, padding: "8px 12px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontSize: "0.90rem", color: "var(--text-main)", background: "var(--warm-white)", outline: "none" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                />
            </div>

            {/* ── Product grid ── */}
            {items.length === 0 ? (
                <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "40px 24px", textAlign: "center", boxShadow: "var(--shadow)", marginBottom: 20 }}>
                    <p style={{ color: "var(--text-faint)", fontSize: "0.84rem", marginBottom: 12 }}>No products yet.</p>
                    <button onClick={() => setDialog({ type: "add" })}
                        style={{ color: "var(--gold)", background: "none", border: "1px solid var(--gold)", borderRadius: "var(--radius-sm)", padding: "6px 16px", cursor: "pointer", fontWeight: 600, fontSize: "0.78rem", fontFamily: "var(--font-body)" }}>
                        Add your first product →
                    </button>
                </div>
            ) : (
                <div
                    className="col-grid"
                    style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10, marginBottom: 20 }}
                >
                    {items.map((product, i) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            index={i}
                            onEdit={() => setDialog({ type: "edit", product })}
                            onDelete={() => setDialog({ type: "delete", product })}
                        />
                    ))}
                </div>
            )}
            <style>{`
                @media (max-width: 1100px) { .col-grid { grid-template-columns: repeat(5, 1fr) !important; } }
                @media (max-width: 800px)  { .col-grid { grid-template-columns: repeat(4, 1fr) !important; } }
                @media (max-width: 560px)  { .col-grid { grid-template-columns: repeat(3, 1fr) !important; } }
            `}</style>

            <SaveBtn loading={saving} onClick={handleSave} />
        </div>
    );
};

export default CollectionPage;
