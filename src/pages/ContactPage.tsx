import React, { useState, useEffect } from "react";
import { useSiteData } from "../PublicSite";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ── Helpers ───────────────────────────────────────────────────
const format12 = (time: string): string => {
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
};

const IGIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
);
const FBIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);
const PinIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
);

// ── Contact form state ────────────────────────────────────────
interface FormState {
    name: string;
    email: string;
    subject: string;
    message: string;
}

const SUBJECTS = [
    "General Enquiry",
    "Order & Shipping",
    "Product Information",
    "Wholesale / Retail Partnership",
    "Press & Media",
    "Other",
];

// ── Main Page ─────────────────────────────────────────────────
const ContactPage: React.FC = () => {
    const { brand: BRAND } = useSiteData();

    const [form, setForm] = useState<FormState>({ name: "", email: "", subject: SUBJECTS[0], message: "" });
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Partial<FormState>>({});

    useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

    const set = (k: keyof FormState, v: string) => {
        setForm((f) => ({ ...f, [k]: v }));
        setErrors((e) => ({ ...e, [k]: undefined }));
    };

    const validate = (): boolean => {
        const e: Partial<FormState> = {};
        if (!form.name.trim()) e.name = "Name is required.";
        if (!form.email.trim()) e.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
        if (!form.message.trim()) e.message = "Message is required.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            // In production: POST to your API here
            setSubmitted(true);
        }
    };

    const inputStyle = (hasError?: string): React.CSSProperties => ({
        width: "100%",
        padding: "12px 14px",
        border: `1.5px solid ${hasError ? "#e05555" : "var(--border)"}`,
        borderRadius: "var(--radius-sm)",
        fontFamily: "var(--font-body)",
        fontSize: "0.90rem",
        color: "var(--text-main)",
        background: "#fff",
        outline: "none",
        transition: "border-color 0.18s",
    });

    const labelStyle: React.CSSProperties = {
        display: "block",
        fontSize: "0.74rem",
        fontWeight: 700,
        letterSpacing: "0.10em",
        textTransform: "uppercase",
        color: "var(--text-main)",
        marginBottom: 8,
    };

    const errorStyle: React.CSSProperties = {
        fontSize: "0.76rem",
        color: "#e05555",
        marginTop: 5,
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
            <Navbar />

            {/* ── Main content grid ── */}
            <section className="section" style={{ background: "var(--cream)", paddingTop: 120 }}>
                <div className="container">
                    <div className="ct-grid" style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 56, alignItems: "flex-start" }}>

                        {/* LEFT — Contact form */}
                        <div>
                            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)", fontWeight: 700, color: "var(--text-main)", marginBottom: 8, lineHeight: 1.15 }}>
                                Send Us a Message
                            </h2>
                            <p style={{ fontSize: "0.90rem", color: "var(--text-muted)", marginBottom: 36 }}>
                                Fill in the form and we'll get back to you within one business day.
                            </p>

                            {submitted ? (
                                <div style={{ background: "rgba(162,127,63,0.08)", border: "1px solid var(--gold-rule)", borderRadius: "var(--radius)", padding: "40px 32px", textAlign: "center" }}>
                                    <div style={{ fontSize: "2rem", marginBottom: 16 }}>✦</div>
                                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 10 }}>
                                        Thank you, {form.name.split(" ")[0]}!
                                    </h3>
                                    <p style={{ fontSize: "0.90rem", color: "var(--text-muted)", marginBottom: 24 }}>
                                        We've received your message and will reply to <strong>{form.email}</strong> shortly.
                                    </p>
                                    <button
                                        onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" }); }}
                                        className="btn btn-dark"
                                        style={{ fontSize: "0.82rem" }}
                                    >
                                        Send Another
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                    {/* Name + Email row */}
                                    <div className="ct-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                        <div>
                                            <label style={labelStyle}>Full Name <span style={{ color: "#e05555" }}>*</span></label>
                                            <input
                                                type="text"
                                                value={form.name}
                                                onChange={(e) => set("name", e.target.value)}
                                                placeholder="Your name"
                                                style={inputStyle(errors.name)}
                                                onFocus={(e) => { if (!errors.name) e.currentTarget.style.borderColor = "var(--gold)"; }}
                                                onBlur={(e) => { e.currentTarget.style.borderColor = errors.name ? "#e05555" : "var(--border)"; }}
                                            />
                                            {errors.name && <p style={errorStyle}>{errors.name}</p>}
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Email Address <span style={{ color: "#e05555" }}>*</span></label>
                                            <input
                                                type="email"
                                                value={form.email}
                                                onChange={(e) => set("email", e.target.value)}
                                                placeholder="you@example.com"
                                                style={inputStyle(errors.email)}
                                                onFocus={(e) => { if (!errors.email) e.currentTarget.style.borderColor = "var(--gold)"; }}
                                                onBlur={(e) => { e.currentTarget.style.borderColor = errors.email ? "#e05555" : "var(--border)"; }}
                                            />
                                            {errors.email && <p style={errorStyle}>{errors.email}</p>}
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label style={labelStyle}>Subject</label>
                                        <select
                                            value={form.subject}
                                            onChange={(e) => set("subject", e.target.value)}
                                            style={{ ...inputStyle(), cursor: "pointer" }}
                                            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
                                            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                                        >
                                            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label style={labelStyle}>Message <span style={{ color: "#e05555" }}>*</span></label>
                                        <textarea
                                            value={form.message}
                                            onChange={(e) => set("message", e.target.value)}
                                            placeholder="Tell us what's on your mind…"
                                            rows={6}
                                            style={{ ...inputStyle(errors.message), resize: "vertical", minHeight: 140 }}
                                            onFocus={(e) => { if (!errors.message) e.currentTarget.style.borderColor = "var(--gold)"; }}
                                            onBlur={(e) => { e.currentTarget.style.borderColor = errors.message ? "#e05555" : "var(--border)"; }}
                                        />
                                        {errors.message && <p style={errorStyle}>{errors.message}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-gold"
                                        style={{ alignSelf: "flex-start", minWidth: 180, justifyContent: "center" }}
                                    >
                                        Send Message
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* RIGHT — Info panel */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                            {/* Contact details */}
                            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "28px", boxShadow: "var(--shadow)" }}>
                                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 22 }}>
                                    Get In Touch
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                                    {[
                                        {
                                            icon: (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                                </svg>
                                            ),
                                            label: "Location",
                                            value: BRAND.location,
                                        },
                                        {
                                            icon: (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                                </svg>
                                            ),
                                            label: "Phone",
                                            value: BRAND.phoneDisplay,
                                        },
                                        {
                                            icon: (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                                                </svg>
                                            ),
                                            label: "Email",
                                            value: BRAND.email,
                                        },
                                    ].map((row) => (
                                        <div key={row.label} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: "var(--parchment)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)", flexShrink: 0, marginTop: 2 }}>
                                                {row.icon}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 3 }}>{row.label}</div>
                                                <div style={{ fontSize: "0.88rem", color: "var(--text-main)", fontWeight: 500, lineHeight: 1.5 }}>{row.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Social links */}
                                <div style={{ marginTop: 22, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                                    <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 12 }}>Follow Us</div>
                                    <div style={{ display: "flex", gap: 10 }}>
                                        {[
                                            { href: BRAND.socialLinks.instagram, label: "Instagram", icon: <IGIcon /> },
                                            { href: BRAND.socialLinks.facebook, label: "Facebook", icon: <FBIcon /> },
                                            { href: BRAND.socialLinks.pinterest, label: "Pinterest", icon: <PinIcon /> },
                                        ].map((s) => (
                                            <a
                                                key={s.label}
                                                href={s.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={s.label}
                                                style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", transition: "all 0.22s" }}
                                                onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "var(--gold)"; el.style.borderColor = "var(--gold)"; el.style.color = "#fff"; el.style.transform = "translateY(-2px)"; }}
                                                onMouseLeave={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "transparent"; el.style.borderColor = "var(--border)"; el.style.color = "var(--text-muted)"; el.style.transform = "translateY(0)"; }}
                                            >
                                                {s.icon}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Business hours */}
                            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "28px", boxShadow: "var(--shadow)" }}>
                                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 22 }}>
                                    Opening Hours
                                </h3>
                                <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {BRAND.hours.map((hour) => {
                                        const openTime = BRAND.useDefaultTime ? "09:00" : hour.openTime;
                                        const closeTime = BRAND.useDefaultTime ? "17:00" : hour.closeTime;
                                        return (
                                            <li key={hour.day} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: "0.86rem" }}>
                                                <span style={{ fontWeight: 600, color: hour.isClosed ? "var(--text-faint)" : "var(--text-main)" }}>{hour.day}</span>
                                                {hour.isClosed ? (
                                                    <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#e05555", background: "rgba(224,85,85,0.08)", padding: "3px 10px", borderRadius: 4 }}>Closed</span>
                                                ) : (
                                                    <span style={{ color: "var(--text-muted)" }}>{format12(openTime)} – {format12(closeTime)}</span>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Map ── */}
            {BRAND.mapEmbed && (
                <div style={{ height: 400, overflow: "hidden", background: "var(--parchment)" }}>
                    <iframe
                        src={BRAND.mapEmbed}
                        width="100%"
                        height="400"
                        style={{ border: "none", display: "block", filter: "grayscale(20%) contrast(1.02)" }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="ANOK Location"
                    />
                </div>
            )}

            <Footer />

            <style>{`
        @media (max-width: 900px) {
          .ct-grid { grid-template-columns: 1fr !important; }
          .ct-grid > div:last-child { order: -1; }
        }
        @media (max-width: 520px) {
          .ct-form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </div>
    );
};

export default ContactPage;
