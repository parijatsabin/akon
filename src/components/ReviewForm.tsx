/**
 * The public review form, in two wrappers.
 *
 * ReviewFormBody is the form itself. ReviewForm (the default export) is the
 * footer trigger and its dialog; ReviewPage renders the same body inline at
 * /review, which is the link that gets shared. One implementation, so the two
 * cannot drift.
 *
 * A native <dialog> rather than a hand-rolled overlay: it brings the focus
 * trap, the Escape key, inertness of the page behind it and the ::backdrop
 * for free, all of which a div would have had to reimplement badly.
 *
 * Submissions land in public.reviews with visible = false and stay invisible
 * until an admin turns them on. That is enforced by RLS, not by this file —
 * the insert policy carries `with check (visible = false)` — so the rule holds
 * even against someone posting to the API directly. See migration 0008.
 */

import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const MAX_QUOTE = 1000;

/** Matches the CHECK constraint on the column, so the form rejects before the DB does. */
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const Star: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg width="26" height="26" viewBox="0 0 24 24"
        fill={filled ? "var(--accent)" : "none"}
        stroke={filled ? "var(--accent)" : "var(--border-strong)"}
        strokeWidth="1.6" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

/**
 * Radio inputs under the stars rather than buttons: a rating is a single
 * choice from a set, which is what a radio group is, and it gives arrow-key
 * selection and a screen-reader announcement without any extra code.
 */
const RatingPicker: React.FC<{ value: number; onChange: (n: number) => void }> = ({ value, onChange }) => (
    <div className="rv-stars" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="rv-star" title={`${n} star${n > 1 ? "s" : ""}`}>
                <input type="radio" name="rating" value={n} checked={value === n}
                    onChange={() => onChange(n)} />
                <Star filled={n <= value} />
                <span className="sr-only">{n} star{n > 1 ? "s" : ""}</span>
            </label>
        ))}
    </div>
);

type Errors = Partial<Record<"author" | "email" | "quote", string>>;

/**
 * `onClose` is what tells the body which wrapper it is in: the dialog passes
 * one and gets a Close button on the thank-you, the page passes none and gets
 * a way back into the site instead.
 */
export const ReviewFormBody: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
    const [author, setAuthor] = useState("");
    const [email, setEmail] = useState("");
    const [quote, setQuote] = useState("");
    const [rating, setRating] = useState(5);
    /** The honeypot. A person never sees it; a bot filling forms by name will. */
    const [website, setWebsite] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const [pending, setPending] = useState(false);
    const [sendError, setSendError] = useState("");
    const [done, setDone] = useState<"" | "thanks" | "already">("");

    const validate = (): boolean => {
        const next: Errors = {};
        if (!author.trim()) next.author = "Please tell us your name.";
        else if (author.trim().length > 120) next.author = "Please keep this under 120 characters.";
        if (!email.trim()) next.email = "Please add your email.";
        else if (!EMAIL_RE.test(email.trim())) next.email = "That does not look like an email address.";
        if (!quote.trim()) next.quote = "Please write a few words about the fragrance.";
        else if (quote.trim().length > MAX_QUOTE) next.quote = `Please keep this under ${MAX_QUOTE} characters.`;
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSendError("");
        if (!validate()) return;

        // Honeypot tripped. Report success rather than an error: telling a bot
        // it was caught only tells its author which field to leave alone.
        if (website !== "") { setDone("thanks"); return; }

        setPending(true);
        const { error } = await supabase.from("reviews").insert({
            author: author.trim(),
            email: email.trim(),
            quote: quote.trim(),
            rating,
            // Stated explicitly, though the column defaults to it: the value is
            // the point of the whole flow, and the RLS policy checks it.
            visible: false,
        });
        setPending(false);

        // 23505 = the one-review-per-address index. Said plainly rather than
        // swallowed: this person has just written several sentences, and
        // silently discarding them to avoid confirming an address they typed
        // themselves would be the worse trade.
        if (error?.code === "23505") { setDone("already"); return; }
        if (error) {
            setSendError("Your review could not be sent. Please try again in a moment.");
            return;
        }
        setDone("thanks");
    };

    return (
        <>
                {done !== "" ? (
                    <div className="rv-done">
                        <div className="rv-done-mark" aria-hidden="true">✦</div>
                        <p className="rv-done-lead">
                            {done === "thanks" ? "Thank you." : "You have already shared a review."}
                        </p>
                        <p className="rv-done-note">
                            {done === "thanks"
                                ? "Your review has been sent to us. It will appear on the site once we have read it."
                                : "We only take one review per email address. Write to us if you would like to change what you said."}
                        </p>
                        {onClose
                            ? <button type="button" className="btn btn-accent rv-submit" onClick={onClose}>Close</button>
                            : <Link to="/" className="btn btn-accent rv-submit">Back to the site</Link>}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} noValidate className="rv-form">
                        <div>
                            <label className="contact-label" htmlFor="rv-name">
                                Your Name <span className="rv-req">*</span>
                            </label>
                            <input id="rv-name" type="text" className="contact-input" value={author}
                                onChange={(e) => setAuthor(e.target.value)} placeholder="Your name"
                                style={{ borderColor: errors.author ? "#e05555" : undefined }} />
                            {errors.author && <p className="contact-error">{errors.author}</p>}
                        </div>

                        <div>
                            <label className="contact-label" htmlFor="rv-email">
                                Email <span className="rv-req">*</span>
                            </label>
                            <input id="rv-email" type="email" className="contact-input" value={email}
                                onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                                style={{ borderColor: errors.email ? "#e05555" : undefined }} />
                            {errors.email
                                ? <p className="contact-error">{errors.email}</p>
                                : <p className="rv-hint">Never shown on the site. It only lets us reach you.</p>}
                        </div>

                        <div>
                            <span className="contact-label">Rating</span>
                            <RatingPicker value={rating} onChange={setRating} />
                        </div>

                        <div>
                            <label className="contact-label" htmlFor="rv-quote">
                                Your Review <span className="rv-req">*</span>
                            </label>
                            <textarea id="rv-quote" className="contact-input rv-textarea" value={quote}
                                onChange={(e) => setQuote(e.target.value)} rows={5}
                                maxLength={MAX_QUOTE} placeholder="What did you think of the fragrance?"
                                style={{ borderColor: errors.quote ? "#e05555" : undefined }} />
                            {errors.quote
                                ? <p className="contact-error">{errors.quote}</p>
                                : <p className="rv-hint">{MAX_QUOTE - quote.length} characters left.</p>}
                        </div>

                        {/* Honeypot. Hidden from sight and from assistive tech, and
                            skipped by tabbing, so only a script ever fills it. */}
                        <div className="rv-trap" aria-hidden="true">
                            <label htmlFor="rv-website">Website</label>
                            <input id="rv-website" type="text" tabIndex={-1} autoComplete="off"
                                value={website} onChange={(e) => setWebsite(e.target.value)} />
                        </div>

                        <div>
                            <button type="submit" className="btn btn-accent rv-submit" disabled={pending}>
                                {pending ? "Sending…" : "Send Review"}
                            </button>
                            <p className="rv-hint rv-hint--foot">
                                Reviews are published once we have read them.
                            </p>
                            {sendError && <p role="alert" className="contact-error">{sendError}</p>}
                        </div>
                    </form>
                )}
        </>
    );
};

/**
 * The footer's dialog.
 *
 * A native <dialog>: it brings the focus trap, the Escape key, inertness of
 * the page behind it and the ::backdrop for free, all of which a div would
 * have had to reimplement badly. The body is mounted only while the dialog is
 * open, so closing it resets the form without any state to unwind by hand.
 */
const ReviewForm: React.FC = () => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [open, setOpen] = useState(false);

    // showModal() cannot be expressed as a prop, so open state drives it here.
    useEffect(() => {
        const el = dialogRef.current;
        if (!el) return;
        if (open && !el.open) el.showModal();
        if (!open && el.open) el.close();
    }, [open]);

    return (
        <>
            <button type="button" className="rv-trigger" onClick={() => setOpen(true)}>
                Write a Review
            </button>

            <dialog ref={dialogRef} className="rv-dialog" onClose={() => setOpen(false)}
                aria-labelledby="rv-title">
                <div className="rv-head">
                    <h2 id="rv-title" className="rv-title">Share your experience</h2>
                    <button type="button" className="rv-close" onClick={() => setOpen(false)}
                        aria-label="Close">×</button>
                </div>
                {open && <ReviewFormBody onClose={() => setOpen(false)} />}
            </dialog>
        </>
    );
};

export default ReviewForm;
