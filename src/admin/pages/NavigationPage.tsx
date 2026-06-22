import React, { useState } from "react";
import { readStore, updateSection } from "../cms/cmsStore";
import { Card } from "../components/ui/Card";
import { Field, Input, SaveBtn } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import type { NavLink } from "../types/cms.types";
import { Plus, Trash2, GripVertical } from "lucide-react";

const NavigationPage: React.FC = () => {
    const { toast } = useToast();
    const [links, setLinks] = useState<NavLink[]>(() => readStore().navLinks);
    const [saving, setSaving] = useState(false);

    const setLink = (i: number, field: keyof NavLink, value: string) => {
        const next = [...links];
        next[i] = { ...next[i], [field]: value };
        setLinks(next);
    };

    const addLink = () => setLinks((prev) => [...prev, { label: "", href: "#" }]);
    const removeLink = (i: number) => setLinks((prev) => prev.filter((_, idx) => idx !== i));

    const moveUp = (i: number) => {
        if (i === 0) return;
        const next = [...links];
        [next[i - 1], next[i]] = [next[i], next[i - 1]];
        setLinks(next);
    };
    const moveDown = (i: number) => {
        if (i === links.length - 1) return;
        const next = [...links];
        [next[i], next[i + 1]] = [next[i + 1], next[i]];
        setLinks(next);
    };

    const handleSave = async () => {
        if (links.some((l) => !l.label.trim() || !l.href.trim())) {
            toast("Label and href are required for all links.", "error");
            return;
        }
        setSaving(true);
        await new Promise((r) => setTimeout(r, 350));
        updateSection("navLinks", links);
        setSaving(false);
        toast("Navigation saved!");
    };

    return (
        <div>
            <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 6 }}>Navigation</h1>
                    <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>Manage menu links and their order.</p>
                </div>
                <button
                    onClick={addLink}
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", background: "var(--charcoal)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.06em", cursor: "pointer" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--charcoal-mid)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--charcoal)"; }}
                >
                    <Plus size={15} /> Add Link
                </button>
            </div>

            <Card title="Menu Links" subtitle="Drag handles to reorder (use ↑↓ buttons)">
                {links.map((link, i) => (
                    <div
                        key={i}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: i < links.length - 1 ? "1px solid var(--border)" : "none" }}
                    >
                        <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
                            <button onClick={() => moveUp(i)} disabled={i === 0} style={{ padding: "2px 4px", background: "none", border: "none", cursor: i === 0 ? "not-allowed" : "pointer", opacity: i === 0 ? 0.3 : 1, color: "var(--text-muted)" }}>▲</button>
                            <GripVertical size={14} style={{ color: "var(--text-faint)", margin: "0 auto" }} />
                            <button onClick={() => moveDown(i)} disabled={i === links.length - 1} style={{ padding: "2px 4px", background: "none", border: "none", cursor: i === links.length - 1 ? "not-allowed" : "pointer", opacity: i === links.length - 1 ? 0.3 : 1, color: "var(--text-muted)" }}>▼</button>
                        </div>

                        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                            <Field label={i === 0 ? "Label" : ""}>
                                <Input value={link.label} onChange={(e) => setLink(i, "label", e.target.value)} placeholder="Home" />
                            </Field>
                            <Field label={i === 0 ? "Href" : ""}>
                                <Input value={link.href} onChange={(e) => setLink(i, "href", e.target.value)} placeholder="#home" />
                            </Field>
                        </div>

                        <button
                            onClick={() => removeLink(i)}
                            disabled={links.length <= 1}
                            style={{ padding: 8, background: "none", border: "none", cursor: links.length <= 1 ? "not-allowed" : "pointer", color: links.length <= 1 ? "var(--text-faint)" : "#e05555", flexShrink: 0 }}
                            title="Remove"
                        >
                            <Trash2 size={15} />
                        </button>
                    </div>
                ))}
            </Card>

            {/* Live preview */}
            <Card title="Preview">
                <nav style={{ display: "flex", gap: 8, background: "var(--charcoal)", padding: "14px 20px", borderRadius: "var(--radius-sm)", flexWrap: "wrap" }}>
                    {links.map((l, i) => (
                        <span key={i} style={{ fontSize: "0.82rem", fontWeight: 600, color: "rgba(255,255,255,0.70)", padding: "6px 16px", borderRadius: "var(--radius-sm)", letterSpacing: "0.05em" }}>{l.label || "…"}</span>
                    ))}
                    <span style={{ marginLeft: "auto", fontSize: "0.78rem", background: "var(--gold)", color: "#fff", fontWeight: 700, padding: "6px 16px", borderRadius: "var(--radius-sm)", letterSpacing: "0.06em" }}>Shop Now</span>
                </nav>
            </Card>

            <SaveBtn loading={saving} onClick={handleSave} />
        </div>
    );
};

export default NavigationPage;
