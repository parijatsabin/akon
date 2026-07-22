/**
 * CollectionSettingsPage — manages the non-product fields in CollectionData:
 *   • productSizes        — size options shown on product cards & detail page
 *   • trustSignals        — "In Stock", "Free shipping" badges on product detail
 *   • shippingRows        — Shipping tab rows on product detail
 *   • craftsmanshipText   — Craftsmanship tab paragraphs on product detail
 */
import React, { useState } from "react";
import { readStore, updateSection } from "../cms/cmsStore";
import { Card } from "../components/ui/Card";
import { Field, Input, Textarea, SaveBtn } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import type { TrustSignal, ShippingRow } from "../types/cms.types";
import { Package, Plus, Trash2 } from "lucide-react";

const CollectionSettingsPage: React.FC = () => {
    const { toast } = useToast();
    const store = readStore().collection;

    const [sizes, setSizes] = useState<string[]>(store.productSizes);
    const [trustSignals, setTrustSignals] = useState<TrustSignal[]>(store.trustSignals);
    const [shippingRows, setShippingRows] = useState<ShippingRow[]>(store.shippingRows);
    const [craftsmanship, setCraftsmanship] = useState<string[]>(store.craftsmanshipText);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 300));
        // Preserve items + headline — only update the settings fields
        const current = readStore().collection;
        await updateSection("collection", {
            ...current,
            productSizes: sizes.filter((s) => s.trim()),
            trustSignals,
            shippingRows,
            craftsmanshipText: craftsmanship.filter((p) => p.trim()),
        });
        setSaving(false);
        toast("Collection settings saved!");
    };

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                        <Package size={20} />
                    </div>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, color: "var(--text-main)" }}>
                        Collection Settings
                    </h1>
                </div>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginLeft: 52 }}>
                    Manage product sizes, trust signals, shipping info and craftsmanship text shown on product pages.
                </p>
            </div>

            {/* ── Product Sizes ── */}
            <Card title="Product Sizes" subtitle="Shown as size selector chips on product cards and the detail page" action={
                <button onClick={() => setSizes((p) => [...p, ""])}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "var(--charcoal)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
                    <Plus size={13} /> Add Size
                </button>
            }>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {sizes.map((s, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <Input value={s} onChange={(e) => { const n = [...sizes]; n[i] = e.target.value; setSizes(n); }} placeholder="e.g. 100 ml" style={{ maxWidth: 200 }} />
                            <button onClick={() => setSizes((p) => p.filter((_, x) => x !== i))} disabled={sizes.length <= 1}
                                style={{ padding: 8, background: "none", border: "none", cursor: sizes.length <= 1 ? "not-allowed" : "pointer", color: sizes.length <= 1 ? "var(--text-faint)" : "#e05555" }}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
                {/* Preview */}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)", display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {sizes.filter(Boolean).map((s) => (
                        <span key={s} style={{ padding: "8px 18px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: "0.80rem", fontWeight: 600, color: "var(--text-muted)" }}>{s}</span>
                    ))}
                </div>
            </Card>

            {/* ── Trust Signals ── */}
            <Card title="Trust Signals" subtitle="Shown as a checklist on the product detail page" action={
                <button onClick={() => setTrustSignals((p) => [...p, { icon: "✦", text: "" }])}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "var(--charcoal)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
                    <Plus size={13} /> Add Signal
                </button>
            }>
                {trustSignals.map((sig, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr auto", gap: "0 12px", alignItems: "end", marginBottom: 10 }}>
                        <Field label={i === 0 ? "Icon" : ""}>
                            <Input value={sig.icon} onChange={(e) => { const n = [...trustSignals]; n[i] = { ...n[i], icon: e.target.value }; setTrustSignals(n); }} style={{ textAlign: "center", fontSize: "1.1rem" }} />
                        </Field>
                        <Field label={i === 0 ? "Text" : ""}>
                            <Input value={sig.text} onChange={(e) => { const n = [...trustSignals]; n[i] = { ...n[i], text: e.target.value }; setTrustSignals(n); }} placeholder="In Stock — ships within 2–3 days" />
                        </Field>
                        <div style={{ paddingBottom: 20 }}>
                            <button onClick={() => setTrustSignals((p) => p.filter((_, x) => x !== i))} disabled={trustSignals.length <= 1}
                                style={{ padding: 8, background: "none", border: "none", cursor: trustSignals.length <= 1 ? "not-allowed" : "pointer", color: trustSignals.length <= 1 ? "var(--text-faint)" : "#e05555" }}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </Card>

            {/* ── Shipping Rows ── */}
            <Card title="Shipping Info" subtitle="Rows shown in the Shipping tab on product detail page" action={
                <button onClick={() => setShippingRows((p) => [...p, { label: "", value: "" }])}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "var(--charcoal)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
                    <Plus size={13} /> Add Row
                </button>
            }>
                {shippingRows.map((row, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "0 12px", alignItems: "end", marginBottom: 10 }}>
                        <Field label={i === 0 ? "Label" : ""}>
                            <Input value={row.label} onChange={(e) => { const n = [...shippingRows]; n[i] = { ...n[i], label: e.target.value }; setShippingRows(n); }} placeholder="Standard Delivery" />
                        </Field>
                        <Field label={i === 0 ? "Value" : ""}>
                            <Input value={row.value} onChange={(e) => { const n = [...shippingRows]; n[i] = { ...n[i], value: e.target.value }; setShippingRows(n); }} placeholder="2–3 business days" />
                        </Field>
                        <div style={{ paddingBottom: 20 }}>
                            <button onClick={() => setShippingRows((p) => p.filter((_, x) => x !== i))} disabled={shippingRows.length <= 1}
                                style={{ padding: 8, background: "none", border: "none", cursor: shippingRows.length <= 1 ? "not-allowed" : "pointer", color: shippingRows.length <= 1 ? "var(--text-faint)" : "#e05555" }}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </Card>

            {/* ── Craftsmanship Text ── */}
            <Card title="Craftsmanship Text" subtitle="Paragraphs shown in the Craftsmanship tab on product detail page" action={
                <button onClick={() => setCraftsmanship((p) => [...p, ""])}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", background: "var(--charcoal)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
                    <Plus size={13} /> Add Paragraph
                </button>
            }>
                {craftsmanship.map((para, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                        <div style={{ flex: 1 }}>
                            <Textarea value={para} onChange={(e) => { const n = [...craftsmanship]; n[i] = e.target.value; setCraftsmanship(n); }} style={{ minHeight: 72 }} />
                        </div>
                        <button onClick={() => setCraftsmanship((p) => p.filter((_, x) => x !== i))} disabled={craftsmanship.length <= 1}
                            style={{ marginTop: 4, padding: 8, background: "none", border: "none", cursor: craftsmanship.length <= 1 ? "not-allowed" : "pointer", color: craftsmanship.length <= 1 ? "var(--text-faint)" : "#e05555", flexShrink: 0 }}>
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </Card>

            <SaveBtn loading={saving} onClick={handleSave} />
        </div>
    );
};

export default CollectionSettingsPage;
