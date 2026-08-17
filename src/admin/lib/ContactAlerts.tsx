/**
 * ContactAlerts — live notification when a visitor submits the contact form
 * or subscribes to the newsletter.
 *
 * Subscribes to INSERTs on `contacts` and raises a popup wherever the editor
 * happens to be in the CMS. Without it, an enquiry sits unseen until somebody
 * thinks to reload the Inbox — which, on a page inviting press and wholesale
 * contact, is the one thing that should not wait.
 *
 * Both kinds raise a popup, but only enquiries feed the sidebar badge: an
 * enquiry is owed a reply, a signup is not. A badge that counts both would
 * keep showing work that does not exist.
 *
 * Safe to broadcast because Realtime applies RLS before delivery: the
 * "staff read contacts" policy limits SELECT to is_admin(), so only signed-in
 * staff sessions ever receive these rows. See migration 0002.
 *
 * The unread count lives here too, so the sidebar badge and the popup cannot
 * disagree with each other.
 */

import React, {
    createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";
import { Link } from "react-router-dom";
import { Mail, UserPlus, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../auth/AuthContext";

interface Contact {
    id: string;
    name: string | null;
    email: string;
    subject: string;
    kind: "enquiry" | "newsletter";
}

interface ContactAlertsValue {
    /** Unread enquiries, for the sidebar badge. Signups are not counted. */
    unread: number;
    /** Called by the Inbox after it marks messages read. */
    refresh: () => void;
}

const ContactAlertsContext = createContext<ContactAlertsValue>({ unread: 0, refresh: () => {} });

export const useContactAlerts = () => useContext(ContactAlertsContext);

export const ContactAlertsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [unread, setUnread] = useState(0);
    const [toasts, setToasts] = useState<Contact[]>([]);
    // Kept in a ref so the subscription callback never closes over a stale value.
    const seen = useRef<Set<string>>(new Set());

    const refresh = useCallback(async () => {
        const { count } = await supabase
            .from("contacts")
            .select("id", { count: "exact", head: true })
            .eq("kind", "enquiry")
            .eq("status", "new");
        setUnread(count ?? 0);
    }, []);

    useEffect(() => {
        // No session means no permission to read these rows anyway.
        if (!isAuthenticated) {
            setUnread(0);
            setToasts([]);
            return;
        }

        void refresh();

        const channel = supabase
            .channel("cms-enquiries")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "contacts" },
                (payload) => {
                    const row = payload.new as Contact;
                    // Guard against a duplicate delivery re-announcing the same row.
                    if (seen.current.has(row.id)) return;
                    seen.current.add(row.id);

                    // Only enquiries are owed a reply, so only they raise the count.
                    if (row.kind === "enquiry") setUnread((n) => n + 1);
                    setToasts((prev) => [...prev, row]);
                }
            )
            .subscribe();

        return () => { void supabase.removeChannel(channel); };
    }, [isAuthenticated, refresh]);

    const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

    const value = useMemo(() => ({ unread, refresh: () => void refresh() }), [unread, refresh]);

    return (
        <ContactAlertsContext.Provider value={value}>
            {children}

            {/* Deliberately not auto-dismissed: an enquiry that vanishes after
                four seconds is an enquiry someone can miss. */}
            {toasts.length > 0 && (
                <div className="adm-alerts" role="region" aria-label="New contacts">
                    {toasts.map((t) => {
                        const isEnquiry = t.kind === "enquiry";
                        return (
                        <div key={t.id} className="adm-alert" role="alert">
                            {isEnquiry
                                ? <Mail size={16} className="adm-alert-icon" aria-hidden="true" />
                                : <UserPlus size={16} className="adm-alert-icon" aria-hidden="true" />}
                            <div className="adm-fill">
                                <p className="adm-alert-title">
                                    {isEnquiry ? "New enquiry" : "New subscriber"}
                                </p>
                                <p className="adm-alert-body">
                                    <strong>{isEnquiry ? (t.name || t.email) : t.email}</strong>
                                    {isEnquiry && t.subject ? ` — ${t.subject}` : ""}
                                </p>
                                <Link
                                    to={isEnquiry ? "/admin/inbox" : "/admin/inbox?tab=subscribers"}
                                    className="adm-alert-link"
                                    onClick={() => dismiss(t.id)}
                                >
                                    {isEnquiry ? "Open inbox" : "See subscribers"}
                                </Link>
                            </div>
                            <button
                                type="button"
                                className="adm-icon-btn"
                                aria-label="Dismiss notification"
                                onClick={() => dismiss(t.id)}
                            >
                                <X size={15} aria-hidden="true" />
                            </button>
                        </div>
                        );
                    })}
                </div>
            )}
        </ContactAlertsContext.Provider>
    );
};
