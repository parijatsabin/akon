/**
 * Dashboard — what needs attention, then what changed.
 *
 * It previously showed four counts: product sizes, testimonials, FAQ items,
 * and "sections". None of them is something anyone decides on, and the one
 * genuinely time-sensitive number — unread enquiries — was not shown at all.
 * It also advertised a "navigation" editor that no longer exists.
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, UserPlus } from "lucide-react";
import { useSiteData } from "../../data/SiteDataProvider";
import { supabase } from "../../lib/supabase";
import { PageHeader } from "../components/ui/Page";

/** Sections, in the order they appear in the sidebar. */
const DESTINATIONS = [
    { to: "/admin/company", label: "Company", note: "Name, contact details, hours, social links" },
    { to: "/admin/homepage", label: "Homepage", note: "Hero, about, commitment, testimonials, newsletter, footer" },
    { to: "/admin/product", label: "Product", note: "Notes, pricing, sizes, imagery" },
    { to: "/admin/pages", label: "Pages", note: "Contact, FAQ, privacy, terms" },
    { to: "/admin/seo", label: "SEO", note: "Meta tags and social sharing" },
];

interface Counts {
    unread: number;
    subscribers: number;
}

/** Relative time, for the "last edited" list. */
function timeAgo(iso: string): string {
    const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
    const days = Math.round(hrs / 24);
    if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
    return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

const SECTION_LABELS: Record<string, string> = {
    hero: "Hero", about: "About", commitment: "Commitment", testimonials: "Testimonials",
    newsletter: "Newsletter", footer: "Footer", contact: "Contact page", seo: "SEO",
    faq: "FAQ", privacy: "Privacy policy", terms: "Terms of use",
};

const DashboardPage: React.FC = () => {
    const data = useSiteData();
    const [counts, setCounts] = useState<Counts | null>(null);
    const [edited, setEdited] = useState<{ key: string; updated_at: string }[]>([]);

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            const [unreadRes, subsRes, editedRes] = await Promise.all([
                supabase.from("contacts").select("id", { count: "exact", head: true })
                    .eq("kind", "enquiry").eq("status", "new"),
                supabase.from("contacts").select("id", { count: "exact", head: true })
                    .eq("kind", "newsletter"),
                supabase.from("site_content").select("key, updated_at")
                    .order("updated_at", { ascending: false }).limit(4),
            ]);
            if (cancelled) return;
            setCounts({ unread: unreadRes.count ?? 0, subscribers: subsRes.count ?? 0 });
            setEdited(editedRes.data ?? []);
        })();

        return () => { cancelled = true; };
    }, []);

    const unread = counts?.unread ?? 0;

    return (
        <>
            <PageHeader title="Dashboard" description={`Signed in to ${data.brand.name} content studio.`} />

            {/* ── Needs attention ── */}
            <div className="adm-grid-auto" style={{ marginBottom: "var(--adm-8)" }}>
                <Link to="/admin/inbox" className="adm-item" style={{ display: "block", marginBottom: 0 }}>
                    <div className="adm-row" style={{ marginBottom: 10 }}>
                        <Mail size={16} aria-hidden="true" />
                        <span className="adm-item-title">Enquiries</span>
                        {unread > 0 && <span className="adm-badge">{unread} new</span>}
                    </div>
                    <p className="adm-stat-value">{counts === null ? "—" : unread}</p>
                    <p className="adm-stat-label">
                        {unread === 0 ? "Nothing waiting for a reply" : "Waiting for a reply"}
                    </p>
                </Link>

                <Link to="/admin/inbox" className="adm-item" style={{ display: "block", marginBottom: 0 }}>
                    <div className="adm-row" style={{ marginBottom: 10 }}>
                        <UserPlus size={16} aria-hidden="true" />
                        <span className="adm-item-title">Newsletter</span>
                    </div>
                    <p className="adm-stat-value">{counts === null ? "—" : counts.subscribers}</p>
                    <p className="adm-stat-label">Subscribers</p>
                </Link>
            </div>

            {/* ── Currently featured ── */}
            <div className="adm-featured">
                <div className="adm-featured-label">Currently featured</div>
                <div className="adm-featured-name">{data.featuredProduct.name}</div>
                <div className="adm-featured-meta">
                    {data.featuredProduct.collection} · {data.featuredProduct.price}
                </div>
            </div>

            {/* ── Recently edited ── */}
            {edited.length > 0 && (
                <section className="adm-section">
                    <div className="adm-section-head">
                        <h2 className="adm-section-title">Recently edited</h2>
                    </div>
                    <ul className="adm-stack-s" style={{ listStyle: "none" }}>
                        {edited.map((e) => (
                            <li key={e.key} className="adm-row-between">
                                <span>{SECTION_LABELS[e.key] ?? e.key}</span>
                                <span className="adm-hint">{timeAgo(e.updated_at)}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* ── Everything else ── */}
            <section className="adm-section">
                <div className="adm-section-head">
                    <h2 className="adm-section-title">Manage</h2>
                </div>
                <nav className="adm-list">
                    {DESTINATIONS.map((d) => (
                        <Link key={d.to} to={d.to} className="adm-list-row">
                            <span className="adm-list-label">{d.label}</span>
                            <span className="adm-list-note">{d.note}</span>
                            <ArrowRight size={16} className="adm-list-arrow" aria-hidden="true" />
                        </Link>
                    ))}
                </nav>
            </section>
        </>
    );
};

export default DashboardPage;
