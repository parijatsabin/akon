import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { readStore } from "../../data/siteRepository";
import { saveSection } from "../lib/saveSection";
import { Section } from "../components/ui/Section";
import { Field, Input, IconButton, SaveBtn } from "../components/ui/Field";
import { useToast } from "../components/ui/Toast";
import { PageHeader, SaveBar, EmptyState, Tabs } from "../components/ui/Page";
import type { EditorProps } from "./editors";
import type { TestimonialItem } from "../../data/types";
import { Trash2, ChevronUp, ChevronDown } from "lucide-react";

/** Short and local — "4 Sept", the form a queue is scanned in. */
const formatSent = (iso: string): string =>
    new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });

/**
 * The publish switch.
 *
 * A real <button role="switch">, not the <span role="checkbox"> this page used
 * to carry: a span is not focusable, so the control deciding whether a review
 * is public could only be reached with a mouse. No text beside it — the Status
 * column already names the state, and a label here would say it twice.
 */
const PublishSwitch: React.FC<{ on: boolean; onChange: () => void; who: string }> = ({ on, onChange, who }) => (
    <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={`${on ? "Hide" : "Publish"} the review by ${who || "this reviewer"}`}
        onClick={onChange}
        className="adm-rv-switch"
    >
        <span className="adm-rv-switch-track" aria-hidden="true">
            <span className="adm-rv-switch-knob" />
        </span>
    </button>
);

/**
 * Stars, shown not set.
 *
 * This used to be a picker. A rating is the reviewer's judgement of the
 * fragrance and it feeds the aggregateRating Google reads from the page —
 * neither is the owner's to adjust after the fact.
 */
const Stars: React.FC<{ value: number }> = ({ value }) => (
    <span aria-label={`${value} out of 5`} style={{ whiteSpace: "nowrap", letterSpacing: 1 }}>
        {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} aria-hidden="true" style={{ color: n <= value ? "var(--accent)" : "var(--border)" }}>★</span>
        ))}
    </span>
);

export const TestimonialsTab: React.FC<EditorProps> = ({ onSave }) => {
    const { toast } = useToast();
    const store = readStore();
    const [headline, setHeadline] = useState(store.testimonials.headline);
    const [items, setItems] = useState<TestimonialItem[]>(store.testimonials.items);
    const [saving, setSaving] = useState(false);
    /**
     * Removals are tracked rather than inferred. Reviews live in their own
     * table now and customers write to it, so "delete every row not on screen"
     * would wipe any submission that arrived after this page loaded.
     */
    const [removedIds, setRemovedIds] = useState<string[]>([]);

    /**
     * Who sent each review, read straight from the table.
     *
     * get_site_data() never returns `email` — not even to staff — because that
     * document is also what the public site fetches, and a field that must not
     * leak is safest when it is not in the payload at all. The CMS holds an
     * admin session, so it reads the column here under the staff SELECT policy
     * instead. A row with no email was typed in this page rather than sent
     * through the form.
     */
    const [senders, setSenders] = useState<Record<string, { email: string | null; created_at: string }>>({});
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const { data } = await supabase.from("reviews").select("id, email, created_at");
            if (cancelled || !data) return;
            setSenders(Object.fromEntries(
                data.map((r) => [r.id as string, { email: r.email as string | null, created_at: r.created_at as string }])
            ));
        })();
        return () => { cancelled = true; };
    }, []);

    const published = items.filter((t) => t.visible).length;
    const waiting = items.length - published;

    /**
     * Which rows to show. Publishing is the job this page exists for, and the
     * one that arrives unannounced, so "what is waiting" has to be one click
     * rather than a read of the whole list.
     */
    const [filter, setFilter] = useState<"all" | "live" | "waiting">("all");
    const shown = items
        .map((item, index) => ({ item, index }))
        .filter(({ item }) =>
            filter === "all" || (filter === "live" ? item.visible : !item.visible));

    /**
     * Display order on the site is the order of this array — saveSiteSection
     * writes sort_order from each row's index. Until now nothing could change
     * it, so the order a review happened to be created in was permanent.
     *
     * Reordering is offered only in the unfiltered view: in a filtered one the
     * row above is not the row you would be swapping with.
     */
    const move = (index: number, by: -1 | 1) => {
        const to = index + by;
        if (to < 0 || to >= items.length) return;
        setItems((prev) => {
            const next = [...prev];
            [next[index], next[to]] = [next[to]!, next[index]!];
            return next;
        });
    };

    const setItem = (id: string, key: keyof TestimonialItem, value: unknown) =>
        setItems((prev) => prev.map((t) => (t.id === id ? { ...t, [key]: value } : t)));

    const removeReview = (id: string) => {
        if (!window.confirm("Remove this testimonial?")) return;
        setItems((prev) => prev.filter((t) => t.id !== id));
        setRemovedIds((prev) => [...prev, id]);
    };

    const handleSave = async () => {
        // No content validation left to do: nothing on this page writes a
        // review's text, and the column CHECK constraints reject an empty one
        // at the database anyway.
        setSaving(true);
        // Preserve sectionTag — this page does not edit it, and dropping it
        // would strip the field from the saved document.
        const ok = await saveSection(
            "testimonials",
            { ...readStore().testimonials, headline, items },
            toast,
            "Testimonials saved!",
            removedIds
        );
        setSaving(false);
        if (ok) {
            setRemovedIds([]);
            onSave();
        }
    };

    return (
        <div>
            {/* No heading of its own: the page above supplies it. What stays is
                the count, which now has to distinguish the two states — with
                public submissions arriving hidden, "how many are there" and
                "how many are live" are different questions. */}
            {/* No "Add Review" button. Reviews come from customers through the
                form at /review; a review written in the CMS would be the shop
                writing its own testimonial. */}
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: 28 }}>
                {published} of {items.length} review{items.length !== 1 ? "s" : ""} published
                {waiting > 0 && (
                    <span style={{ color: "var(--accent-text)", fontWeight: 600 }}>
                        {" "}· {waiting} waiting
                    </span>
                )}
            </p>

            <Section title="Section Headline">
                <Field label="Headline">
                    <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
                </Field>
            </Section>

            {items.length > 0 && (
                <Tabs
                    tabs={[
                        { id: "all", label: `All ${items.length}` },
                        { id: "live", label: `Published ${published}` },
                        { id: "waiting", label: `Waiting ${waiting}` },
                    ]}
                    active={filter}
                    onChange={(id) => setFilter(id as typeof filter)}
                    label="Filter reviews"
                />
            )}

            {items.length === 0 ? (
                <EmptyState title="No reviews yet">
                    <p className="adm-hint">
                        Reviews arrive when a customer sends one — from the Write a
                        Review button in the site footer, or from anokperfumes.com.np/review,
                        which is the link to share.
                    </p>
                </EmptyState>
            ) : (
                /* A table, not a stack of cards. With submissions arriving on
                   their own, this list only grows, and a card each turned
                   "which of these is still waiting" into a scroll. One row per
                   review puts the rating and the publish switch — the two
                   things being scanned for — in fixed columns. */
                <div className="adm-table-wrap">
                    <table className="adm-table adm-table--reviews">
                        <thead>
                            <tr>
                                <th scope="col" style={{ width: 44 }}>#</th>
                                <th scope="col" style={{ width: 180 }}>Author</th>
                                <th scope="col">Review</th>
                                <th scope="col" style={{ width: 96 }}>Rating</th>
                                <th scope="col" style={{ width: 104 }}>Status</th>
                                <th scope="col" style={{ width: 110 }}>Received</th>
                                <th scope="col" style={{ width: 140 }} aria-label="Actions" />
                            </tr>
                        </thead>
                        <tbody>
                            {shown.map(({ item, index }) => {
                                const sender = senders[item.id];
                                return (
                                    /* Dimmed while unpublished, the same way Users dims a
                                       deactivated account. */
                                    <tr key={item.id} style={{ opacity: item.visible ? 1 : 0.55 }}>
                                        <td className="adm-hint">{index + 1}</td>
                                        <td>
                                            <strong>{item.author}</strong>
                                            {sender?.email && (
                                                <div className="adm-hint" style={{ marginTop: 3, wordBreak: "break-all" }}>
                                                    {sender.email}
                                                </div>
                                            )}
                                        </td>
                                        <td className="adm-rv-quote">{item.quote}</td>
                                        <td><Stars value={item.rating} /></td>
                                        <td>
                                            <span className={`adm-badge${item.visible ? "" : " adm-badge-quiet"}`}>
                                                {item.visible ? "Published" : "Waiting"}
                                            </span>
                                        </td>
                                        <td className="adm-hint">
                                            {sender ? formatSent(sender.created_at) : "—"}
                                        </td>
                                        <td>
                                            <div className="adm-row" style={{ gap: 4, justifyContent: "flex-end" }}>
                                                {/* Order is the order on the site. Hidden while
                                                    filtered: the row above is not the row you
                                                    would be swapping with. */}
                                                {filter === "all" && items.length > 1 && (
                                                    <>
                                                        <IconButton
                                                            label={`Move the review by ${item.author || "this reviewer"} up`}
                                                            disabled={index === 0}
                                                            onClick={() => move(index, -1)}
                                                        >
                                                            <ChevronUp size={15} aria-hidden="true" />
                                                        </IconButton>
                                                        <IconButton
                                                            label={`Move the review by ${item.author || "this reviewer"} down`}
                                                            disabled={index === items.length - 1}
                                                            onClick={() => move(index, 1)}
                                                        >
                                                            <ChevronDown size={15} aria-hidden="true" />
                                                        </IconButton>
                                                    </>
                                                )}
                                                <PublishSwitch
                                                    on={item.visible}
                                                    who={item.author}
                                                    onChange={() => setItem(item.id, "visible", !item.visible)}
                                                />
                                                <IconButton
                                                    label={`Remove the review by ${item.author || "this reviewer"}`}
                                                    onClick={() => removeReview(item.id)}
                                                >
                                                    <Trash2 size={15} aria-hidden="true" />
                                                </IconButton>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {shown.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="adm-hint" style={{ textAlign: "center", padding: "28px 12px" }}>
                                        {filter === "waiting"
                                            ? "Nothing waiting — every review is published."
                                            : "No published reviews yet."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <SaveBar><SaveBtn loading={saving} onClick={handleSave} /></SaveBar>
        </div>
    );
};

/**
 * The standalone page.
 *
 * Testimonials used to be a tab under Homepage, grouped with the sections a
 * visitor scrolls past. They stopped being only that when customers gained a
 * way to submit them: the list is now a queue that arrives on its own schedule
 * and needs approving, which is a job of its own rather than one of six tabs
 * to remember the position of. The editor itself is unchanged — this only
 * gives it a door.
 */
const TestimonialsPage: React.FC = () => {
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    return (
        <div>
            <PageHeader
                title="Testimonials"
                description="What customers sent in. Submissions arrive hidden — switch one on to publish it. Their words are not edited here."
            />
            <TestimonialsTab onSave={() => setLastSaved(new Date().toLocaleTimeString())} />
            {lastSaved && (
                <p className="adm-hint" style={{ marginTop: 12 }}>Last saved at {lastSaved}</p>
            )}
        </div>
    );
};

export default TestimonialsPage;
