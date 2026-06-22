import React, { useState } from "react";
import { readStore, updateSection } from "../cms/cmsStore";
import { Card } from "../components/ui/Card";
import { Field, Input, SaveBtn } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import type { NewsletterData } from "../types/cms.types";

const NewsletterPage: React.FC = () => {
    const { toast } = useToast();
    const [form, setForm] = useState<NewsletterData>(() => readStore().newsletter);
    const [saving, setSaving] = useState(false);

    const set = (key: keyof NewsletterData, value: string) =>
        setForm((f) => ({ ...f, [key]: value }));

    const handleSave = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 350));
        updateSection("newsletter", form);
        setSaving(false);
        toast("Newsletter section saved!");
    };

    return (
        <div>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 6 }}>Newsletter Section</h1>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>The email subscription section content.</p>
            </div>

            <Card title="Copy">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                    <Field label="Headline" hint="E.g. Stay Connected with">
                        <Input value={form.headline} onChange={(e) => set("headline", e.target.value)} />
                    </Field>
                    <Field label="Brand Highlight" hint="Brand name appended to headline">
                        <Input value={form.brandHighlight} onChange={(e) => set("brandHighlight", e.target.value)} />
                    </Field>
                </div>
                <Field label="Subtext">
                    <Input value={form.subtext} onChange={(e) => set("subtext", e.target.value)} />
                </Field>
            </Card>

            <Card title="Input & Button">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                    <Field label="Input Placeholder">
                        <Input value={form.placeholder} onChange={(e) => set("placeholder", e.target.value)} />
                    </Field>
                    <Field label="Submit Button Label">
                        <Input value={form.cta} onChange={(e) => set("cta", e.target.value)} />
                    </Field>
                </div>
            </Card>

            {/* Live preview */}
            <Card title="Preview">
                <div style={{ background: "var(--charcoal)", borderRadius: "var(--radius-sm)", padding: "32px 28px", textAlign: "center" }}>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "#fff", marginBottom: 10 }}>
                        {form.headline} <span style={{ color: "var(--gold-light)" }}>{form.brandHighlight}</span>
                    </h3>
                    <p style={{ color: "rgba(255,255,255,0.55)", marginBottom: 22, fontSize: "0.90rem" }}>{form.subtext}</p>
                    <div style={{ display: "flex", maxWidth: 420, margin: "0 auto", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                        <div style={{ flex: 1, background: "rgba(255,255,255,0.07)", padding: "12px 16px", color: "rgba(255,255,255,0.40)", fontSize: "0.88rem", fontStyle: "italic" }}>{form.placeholder}</div>
                        <div style={{ padding: "12px 20px", background: "var(--gold)", color: "#fff", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.06em" }}>{form.cta}</div>
                    </div>
                </div>
            </Card>

            <SaveBtn loading={saving} onClick={handleSave} />
        </div>
    );
};

export default NewsletterPage;
