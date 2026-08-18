import React, { useState, useEffect } from "react";
import { useSiteData } from "../data/SiteDataProvider";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { SocialLinkList } from "../components/SocialLinks";
import { supabase } from "../lib/supabase";


interface FormState { name: string; email: string; subject: string; message: string; }

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: "var(--sunken-deep)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-text)", flexShrink: 0 }}>
            {icon}
        </div>
        <div>
            <div className="eyebrow" style={{ marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: "0.88rem", color: "var(--text-main)", fontWeight: 500, lineHeight: 1.4 }}>{value}</div>
        </div>
    </div>
);

const ContactPage: React.FC = () => {
    const { brand: BRAND, contact: CONTACT } = useSiteData();
    const SUBJECTS = CONTACT.subjects;
    const [form, setForm] = useState<FormState>({ name: "", email: "", subject: SUBJECTS[0] ?? "", message: "" });
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Partial<FormState>>({});
    const [pending, setPending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);

    useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

    const set = (k: keyof FormState, v: string) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };
    const validate = () => {
        const e: Partial<FormState> = {};
        if (!form.name.trim()) e.name = "Name is required.";
        if (!form.email.trim()) e.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
        if (!form.message.trim()) e.message = "Message is required.";
        setErrors(e); return Object.keys(e).length === 0;
    };
    /**
     * Sends the enquiry to Supabase. The success screen now appears only after
     * the row is actually written — previously it appeared unconditionally and
     * the message was discarded, which told the visitor their enquiry had been
     * received when nothing had been kept.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pending || !validate()) return;

        setPending(true);
        setSendError(null);

        const { error } = await supabase.from("contacts").insert({
            kind: "enquiry",
            name: form.name.trim(),
            email: form.email.trim(),
            subject: form.subject,
            message: form.message.trim(),
        });

        setPending(false);

        if (error) {
            setSendError("Your message could not be sent. Please try again, or email us directly.");
            return;
        }
        setSubmitted(true);
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--white)" }}>
            <Navbar />

            {/* Page header */}
            <section style={{ padding: "120px 0 40px" }}>
                <div className="container">
                    {/* Inline heading */}
                    <div style={{ marginTop: 20, marginBottom: 16, paddingBottom: 20, textAlign: "center" }}>
                        <span className="tag" style={{ fontSize: "0.92rem" }}>{CONTACT.pageTag}</span>
                        <p style={{ fontSize: "0.92rem", color: "var(--text-muted)" }}>
                            {CONTACT.pageSubtitle}
                        </p>
                    </div>


                    <div className="ct-grid">

                        {/* Form card */}
                        <div className="contact-card">
                            <div style={{ marginBottom: 20 }}>
                                <div className="eyebrow" style={{ marginBottom: 6 }}>Send a Message</div>
                                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem,2vw,1.6rem)", fontWeight: 700, color: "var(--text-main)", lineHeight: 1.2 }}>
                                    How can we help you?
                                </h2>
                            </div>

                            {submitted ? (
                                <div style={{ background: "rgba(197,165,114,0.06)", border: "1px solid var(--accent-rule)", borderRadius: "var(--radius)", padding: "36px 24px", textAlign: "center" }}>
                                    <div style={{ fontSize: "2rem", marginBottom: 12 }}>✦</div>
                                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 8 }}>Thank you, {form.name.split(" ")[0]}!</h3>
                                    <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: 22 }}>We've received your message and will reply to <strong>{form.email}</strong> shortly.</p>
                                    <button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: SUBJECTS[0] ?? "", message: "" }); }} className="btn btn-solid" style={{ fontSize: "0.82rem" }}>Send Another</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                    <div className="ct-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                        <div>
                                            <label className="contact-label">Full Name <span style={{ color: "#e05555" }}>*</span></label>
                                            <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name"
                                                className="contact-input" style={{ borderColor: errors.name ? "#e05555" : undefined }} />
                                            {errors.name && <p className="contact-error">{errors.name}</p>}
                                        </div>
                                        <div>
                                            <label className="contact-label">Email Address <span style={{ color: "#e05555" }}>*</span></label>
                                            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com"
                                                className="contact-input" style={{ borderColor: errors.email ? "#e05555" : undefined }} />
                                            {errors.email && <p className="contact-error">{errors.email}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="contact-label">Subject</label>
                                        <select value={form.subject} onChange={(e) => set("subject", e.target.value)} className="contact-input" style={{ cursor: "pointer" }}>
                                            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="contact-label">Message <span style={{ color: "#e05555" }}>*</span></label>
                                        <textarea value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Tell us what's on your mind…" rows={5}
                                            className="contact-input" style={{ resize: "vertical", minHeight: 110, borderColor: errors.message ? "#e05555" : undefined }} />
                                        {errors.message && <p className="contact-error">{errors.message}</p>}
                                    </div>
                                    <div>
                                        <button type="submit" disabled={pending} className="btn btn-accent" style={{ minWidth: 180, justifyContent: "center", opacity: pending ? 0.7 : 1 }}>
                                            {pending ? "Sending…" : "Send Message"}
                                            {!pending && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>}
                                        </button>
                                        {sendError && (
                                            <p role="alert" style={{ marginTop: 12, color: "#b00", fontSize: "0.86rem" }}>
                                                {sendError}
                                            </p>
                                        )}
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Info card */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                            <div className="contact-card" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                                <div className="eyebrow" style={{ marginBottom: 4 }}>Contact Details</div>
                                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 20 }}>Find Us Here</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                    <InfoRow label="Location" value={BRAND.location} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>} />
                                    <InfoRow label="Phone" value={BRAND.phoneDisplay} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>} />
                                    <InfoRow label="Email" value={BRAND.email} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>} />
                                </div>
                                <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
                                    <div className="eyebrow" style={{ marginBottom: 12 }}>Follow Us</div>
                                    <SocialLinkList links={BRAND.socialLinks} size={17} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map */}
            {BRAND.mapEmbed && (
                <div style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                    <div className="container">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0 16px", flexWrap: "wrap", gap: 10 }}>
                            <div>
                                <div className="eyebrow" style={{ marginBottom: 2 }}>Our Location</div>
                                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: 0 }}>{BRAND.location}</p>
                            </div>
                            <a href={`https://maps.google.com/?q=${encodeURIComponent(BRAND.location)}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: "0.76rem", padding: "8px 18px" }}>
                                Open in Maps ↗
                            </a>
                        </div>
                        <div style={{ height: 280, overflow: "hidden", borderRadius: "var(--radius)", border: "1px solid var(--border)", marginBottom: 32 }}>
                            <iframe src={BRAND.mapEmbed} width="100%" height="280" style={{ border: "none", display: "block", filter: "grayscale(15%) contrast(1.02)" }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="ANOK Location" />
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default ContactPage;
