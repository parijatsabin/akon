import React, { useState } from "react";
import { readStore, updateSection } from "../cms/cmsStore";
import { Card } from "../components/ui/Card";
import { Field, Input, Textarea, SaveBtn } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import type { BrandData } from "../types/cms.types";

const GlobalSettingsPage: React.FC = () => {
    const { toast } = useToast();
    const [form, setForm] = useState<BrandData>(() => readStore().brand);
    const [saving, setSaving] = useState(false);

    const set = (key: keyof BrandData, value: unknown) =>
        setForm((f) => ({ ...f, [key]: value }));

    const setHour = (i: number, field: "day" | "time", value: string) => {
        const hours = [...form.hours];
        hours[i] = { ...hours[i], [field]: value };
        set("hours", hours);
    };

    const setSocial = (key: keyof typeof form.socialLinks, value: string) =>
        set("socialLinks", { ...form.socialLinks, [key]: value });

    const handleSave = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 350));
        updateSection("brand", form);
        setSaving(false);
        toast("Global settings saved successfully!");
    };

    return (
        <div>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 6 }}>Global Settings</h1>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>Core brand information used throughout the website.</p>
            </div>

            <Card title="Brand Identity">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                    <Field label="Brand Name" required>
                        <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
                    </Field>
                    <Field label="Tagline">
                        <Input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
                    </Field>
                </div>
                <Field label="Short Description">
                    <Textarea value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} style={{ minHeight: 100 }} />
                </Field>
            </Card>

            <Card title="Contact Information">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                    <Field label="Email">
                        <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                    </Field>
                    <Field label="Phone">
                        <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                    </Field>
                    <Field label="Phone Display">
                        <Input value={form.phoneDisplay} onChange={(e) => set("phoneDisplay", e.target.value)} />
                    </Field>
                    <Field label="Location">
                        <Input value={form.location} onChange={(e) => set("location", e.target.value)} />
                    </Field>
                </div>
                <Field label="Google Maps Embed URL" hint="Paste the full Maps embed URL">
                    <Input value={form.mapEmbed} onChange={(e) => set("mapEmbed", e.target.value)} />
                </Field>
            </Card>

            <Card title="Business Hours">
                {form.hours.map((h, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                        <Field label={`Day ${i + 1}`}>
                            <Input value={h.day} onChange={(e) => setHour(i, "day", e.target.value)} />
                        </Field>
                        <Field label="Hours">
                            <Input value={h.time} onChange={(e) => setHour(i, "time", e.target.value)} />
                        </Field>
                    </div>
                ))}
            </Card>

            <Card title="Social Links">
                <Field label="Instagram URL">
                    <Input value={form.socialLinks.instagram} onChange={(e) => setSocial("instagram", e.target.value)} />
                </Field>
                <Field label="Facebook URL">
                    <Input value={form.socialLinks.facebook} onChange={(e) => setSocial("facebook", e.target.value)} />
                </Field>
                <Field label="Pinterest URL">
                    <Input value={form.socialLinks.pinterest} onChange={(e) => setSocial("pinterest", e.target.value)} />
                </Field>
            </Card>

            <SaveBtn loading={saving} onClick={handleSave} />
        </div>
    );
};

export default GlobalSettingsPage;
