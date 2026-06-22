import React, { useState } from "react";
import { readStore, updateSection } from "../cms/cmsStore";
import { Card } from "../components/ui/Card";
import { Field, Input, Textarea, SaveBtn } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import type { AboutData } from "../types/cms.types";

const AboutPage: React.FC = () => {
    const { toast } = useToast();
    const [form, setForm] = useState<AboutData>(() => readStore().about);
    const [saving, setSaving] = useState(false);

    const set = (key: keyof AboutData, value: unknown) =>
        setForm((f) => ({ ...f, [key]: value }));

    const setCta = (field: "label" | "href", value: string) =>
        setForm((f) => ({ ...f, cta: { ...f.cta, [field]: value } }));

    const setReason = (i: number, field: "title" | "body", value: string) => {
        const reasons = [...form.reasons];
        reasons[i] = { ...reasons[i], [field]: value };
        set("reasons", reasons);
    };

    const addReason = () =>
        set("reasons", [...form.reasons, { id: String(form.reasons.length + 1).padStart(2, "0"), title: "", body: "" }]);

    const removeReason = (i: number) =>
        set("reasons", form.reasons.filter((_, idx) => idx !== i));

    const handleSave = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 350));
        updateSection("about", form);
        setSaving(false);
        toast("About section saved!");
    };

    return (
        <div>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 6 }}>About Section</h1>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>Brand story and "Why Choose Us" cards.</p>
            </div>

            <Card title="About Block">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                    <Field label="Section Label" hint='E.g. "Our Legacy Of Luxury"'>
                        <Input value={form.sectionLabel} onChange={(e) => set("sectionLabel", e.target.value)} />
                    </Field>
                    <Field label="Headline">
                        <Input value={form.headline} onChange={(e) => set("headline", e.target.value)} />
                    </Field>
                </div>
                <Field label="Body Text">
                    <Textarea value={form.body} onChange={(e) => set("body", e.target.value)} style={{ minHeight: 110 }} />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                    <Field label="CTA Label">
                        <Input value={form.cta.label} onChange={(e) => setCta("label", e.target.value)} />
                    </Field>
                    <Field label="CTA Link">
                        <Input value={form.cta.href} onChange={(e) => setCta("href", e.target.value)} />
                    </Field>
                </div>
            </Card>

            <Card title="Why Choose Us — Header">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                    <Field label="Headline">
                        <Input value={form.whyHeadline} onChange={(e) => set("whyHeadline", e.target.value)} />
                    </Field>
                    <Field label="Tagline">
                        <Input value={form.whyTagline} onChange={(e) => set("whyTagline", e.target.value)} />
                    </Field>
                </div>
            </Card>

            {form.reasons.map((r, i) => (
                <Card
                    key={r.id}
                    title={`Reason Card ${r.id}`}
                    action={
                        form.reasons.length > 1 ? (
                            <button onClick={() => removeReason(i)} style={{ fontSize: "0.78rem", color: "#e05555", background: "#fff0f0", border: "1px solid #f5c0c0", borderRadius: "var(--radius-sm)", padding: "5px 12px", cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600 }}>
                                Remove
                            </button>
                        ) : undefined
                    }
                >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                        <Field label="Title">
                            <Input value={r.title} onChange={(e) => setReason(i, "title", e.target.value)} />
                        </Field>
                        <Field label="Body">
                            <Input value={r.body} onChange={(e) => setReason(i, "body", e.target.value)} />
                        </Field>
                    </div>
                </Card>
            ))}

            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
                <button
                    onClick={addReason}
                    style={{ padding: "10px 22px", background: "transparent", border: "1.5px solid var(--gold)", color: "var(--gold)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.06em", cursor: "pointer", transition: "background 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--gold-glow)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                    + Add Reason
                </button>
                <SaveBtn loading={saving} onClick={handleSave} />
            </div>
        </div>
    );
};

export default AboutPage;
