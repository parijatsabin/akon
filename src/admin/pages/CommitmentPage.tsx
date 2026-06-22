import React, { useState } from "react";
import { readStore, updateSection } from "../cms/cmsStore";
import { Card } from "../components/ui/Card";
import { Field, Input, Textarea, SaveBtn } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import type { CommitmentData } from "../types/cms.types";

const CommitmentPage: React.FC = () => {
    const { toast } = useToast();
    const [form, setForm] = useState<CommitmentData>(() => readStore().commitment);
    const [saving, setSaving] = useState(false);

    const set = (key: keyof CommitmentData, value: unknown) =>
        setForm((f) => ({ ...f, [key]: value }));
    const setCta = (field: "label" | "href", value: string) =>
        setForm((f) => ({ ...f, cta: { ...f.cta, [field]: value } }));

    const handleSave = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 350));
        updateSection("commitment", form);
        setSaving(false);
        toast("Commitment section saved!");
    };

    return (
        <div>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 6 }}>Commitment Section</h1>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>The "Commitment to Purity" content block.</p>
            </div>

            <Card title="Content">
                <Field label="Headline">
                    <Input value={form.headline} onChange={(e) => set("headline", e.target.value)} />
                </Field>
                <Field label="Body Text">
                    <Textarea value={form.body} onChange={(e) => set("body", e.target.value)} style={{ minHeight: 120 }} />
                </Field>
            </Card>

            <Card title="CTA Button">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                    <Field label="Button Label">
                        <Input value={form.cta.label} onChange={(e) => setCta("label", e.target.value)} />
                    </Field>
                    <Field label="Button Link">
                        <Input value={form.cta.href} onChange={(e) => setCta("href", e.target.value)} />
                    </Field>
                </div>
            </Card>

            <SaveBtn loading={saving} onClick={handleSave} />
        </div>
    );
};

export default CommitmentPage;
