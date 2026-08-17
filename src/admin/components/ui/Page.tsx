/**
 * Page-level primitives.
 *
 * Every admin page previously wrote its own header: SEO had an icon tile plus
 * a description, Testimonials had a title plus a count and a corner button,
 * Dashboard had a title plus a subtitle. Three shapes, three implementations,
 * none reusable. PageHeader is the one shape.
 */

import React from "react";

// ── Page header ───────────────────────────────────────────────
interface PageHeaderProps {
    title: string;
    /** One line explaining what this page controls. */
    description?: string;
    /** Primary control for the page, e.g. "Add Review" or "Refresh". */
    action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action }) => (
    <header className="adm-page-head">
        <div className="adm-row-between">
            <div>
                <h1 className="adm-page-title">{title}</h1>
                {description && <p className="adm-page-sub">{description}</p>}
            </div>
            {action}
        </div>
    </header>
);

// ── Tabs ──────────────────────────────────────────────────────
export interface TabDef {
    id: string;
    label: string;
}

interface TabsProps {
    tabs: readonly TabDef[];
    active: string;
    onChange: (id: string) => void;
    /** Describes the tab set for screen readers, e.g. "Homepage sections". */
    label: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, active, onChange, label }) => (
    <div className="adm-tabs" role="tablist" aria-label={label}>
        {tabs.map((t) => (
            <button
                key={t.id}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={active === t.id}
                aria-controls={`panel-${t.id}`}
                className="adm-tab"
                onClick={() => onChange(t.id)}
            >
                {t.label}
            </button>
        ))}
    </div>
);

/** Wraps a tab's content so the tablist's aria-controls resolves. */
export const TabPanel: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
    <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`}>
        {children}
    </div>
);

// ── Sticky save bar ───────────────────────────────────────────
/**
 * Keeps the save control reachable on long editors. The Testimonials page is
 * roughly 1700px tall and its only save button sat at the very bottom.
 */
export const SaveBar: React.FC<{ note?: string; children: React.ReactNode }> = ({ note, children }) => (
    <div className="adm-savebar">
        {note && <span className="adm-savebar-note">{note}</span>}
        {children}
    </div>
);

// ── Empty state ───────────────────────────────────────────────
export const EmptyState: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
    <div className="adm-empty">
        <p className="adm-empty-title">{title}</p>
        {children}
    </div>
);

// ── Loading / error ───────────────────────────────────────────
export const Loading: React.FC<{ label?: string }> = ({ label = "Loading…" }) => (
    <div className="site-status" role="status" aria-live="polite">
        <div className="site-status-spinner" aria-hidden="true" />
        <span className="site-status-text">{label}</span>
    </div>
);

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
    <div className="adm-empty" role="alert">
        <p className="adm-empty-title">Something went wrong</p>
        <p style={{ marginBottom: onRetry ? 16 : 0 }}>{message}</p>
        {onRetry && (
            <button type="button" className="adm-btn adm-btn-ghost" onClick={onRetry}>
                Try again
            </button>
        )}
    </div>
);
