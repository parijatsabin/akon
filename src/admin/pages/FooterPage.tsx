import React, { useState } from "react";
import { readStore, updateSection } from "../cms/cmsStore";
import { Card } from "../components/ui/Card";
import { Field, Input, Textarea, SaveBtn } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import type { FooterData, FooterNavColumn } from "../types/cms.types";
import { Plus, Trash2 } from "lucide-react";

const FooterPage: React.FC = () => {
    const { toast } = useToast();
    const [form, setForm] = useState<FooterData>(() => readStore().footer);
    const [saving, setSaving] = useState(false);

    const set = (key: keyof FooterData, value: unknown) =>
        setForm((f) => ({ ...f, [key]: value }));

    const setColumn = (ci: number, key: keyof FooterNavColumn, value: unknown) => {
        const cols = [...form.navColumns];
        cols[ci] = { ...cols[ci], [key]: value };
        set("navColumns", cols);
    };

    const setColLink = (ci: number, li: number, field: "label" | "href", value: string) => {
        const cols = [...form.navColumns];
        const links = [...cols[ci].links];
        links[li] = { ...links[li], [field]: value };
        cols[ci] = { ...cols[ci], links };
        set("navColumns", cols);
    };

    const addColLink = (ci: number) => {
        const cols = [...form.navColumns];
        cols[ci] = { ...cols[ci], links: [...cols[ci].links, { label: "", href: "#" }] };
        set("navColumns", cols);
    };

    const removeColLink = (ci: number, li: number) => {
        const cols = [...form.navColumns];
        cols[ci] = { ...cols[ci], links: cols[ci].links.filter((_, i) => i !== li) };
        set("navColumns", cols);
    };

    const addColumn = () =>
        set("navColumns", [...form.navColumns, { heading: "", links: [{ label: "", href: "#" }] }]);

    const removeColumn = (ci: number) => {
        if (form.navColumns.length <= 1) return;
        set("navColumns", form.navColumns.filter((_, i) => i !== ci));
    };

    const handleSave = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 350));
        updateSection("footer", form);
        setSaving(false);
        toast("Footer saved!");
    };

    return (
        <div>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 6 }}>Footer</h1>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>Footer tagline, navigation columns, and credits.</p>
            </div>

            <Card title="Footer Info">
                <Field label="Footer Tagline">
                    <Textarea value={form.tagline} onChange={(e) => set("tagline", e.target.value)} style={{ minHeight: 80 }} />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                    <Field label="Credit Label" hint="E.g. AbionSoft">
                        <Input value={form.credit.label} onChange={(e) => set("credit", { ...form.credit, label: e.target.value })} />
                    </Field>
                    <Field label="Credit URL">
                        <Input value={form.credit.href} onChange={(e) => set("credit", { ...form.credit, href: e.target.value })} />
                    </Field>
                </div>
            </Card>

            {form.navColumns.map((col, ci) => (
                <Card
                    key={ci}
                    title={`Column ${ci + 1}: ${col.heading || "Untitled"}`}
                    action={
                        form.navColumns.length > 1 ? (
                            <button onClick={() => removeColumn(ci)} style={{ fontSize: "0.78rem", color: "#e05555", background: "#fff0f0", border: "1px solid #f5c0c0", borderRadius: "var(--radius-sm)", padding: "5px 12px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600 }}>
                                Remove Column
                            </button>
                        ) : undefined
                    }
                >
                    <Field label="Column Heading">
                        <Input value={col.heading} onChange={(e) => setColumn(ci, "heading", e.target.value)} />
                    </Field>

                    <div style={{ marginTop: 4 }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12 }}>Links</div>
                        {col.links.map((link, li) => (
                            <div key={li} style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 10 }}>
                                <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
                                    <Field label={li === 0 ? "Label" : ""}>
                                        <Input value={link.label} onChange={(e) => setColLink(ci, li, "label", e.target.value)} placeholder="Link text" />
                                    </Field>
                                    <Field label={li === 0 ? "URL" : ""}>
                                        <Input value={link.href} onChange={(e) => setColLink(ci, li, "href", e.target.value)} placeholder="#section" />
                                    </Field>
                                </div>
                                <button
                                    onClick={() => removeColLink(ci, li)}
                                    disabled={col.links.length <= 1}
                                    style={{ marginBottom: 20, padding: 8, background: "none", border: "none", cursor: col.links.length <= 1 ? "not-allowed" : "pointer", color: col.links.length <= 1 ? "var(--text-faint)" : "#e05555", flexShrink: 0 }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => addColLink(ci)}
                            style={{ fontSize: "0.78rem", color: "var(--gold)", background: "transparent", border: "1px solid var(--gold)", borderRadius: "var(--radius-sm)", padding: "5px 14px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}
                        >
                            <Plus size={12} /> Add Link
                        </button>
                    </div>
                </Card>
            ))}

            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
                <button
                    onClick={addColumn}
                    style={{ padding: "10px 22px", background: "transparent", border: "1.5px solid var(--gold)", color: "var(--gold)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.06em", cursor: "pointer" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--gold-glow)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                    + Add Column
                </button>
                <SaveBtn loading={saving} onClick={handleSave} />
            </div>
        </div>
    );
};

export default FooterPage;
