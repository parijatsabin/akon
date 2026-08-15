import React from "react";

/**
 * Section — flat content grouping for admin forms.
 *
 * Replaces the old Card: no box, no shadow, no fill. Just a small uppercase
 * label over a hairline rule. Groups read as one continuous document rather
 * than a stack of competing panels.
 */
interface SectionProps {
    title?: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, children, action }) => (
    <section className="adm-section">
        {(title || action) && (
            <div className="adm-section-head">
                {title && <h2 className="adm-section-title">{title}</h2>}
                {action}
            </div>
        )}
        {children}
    </section>
);

/**
 * Stat — a single number with a label. No icon, no tile, no border.
 */
interface StatProps {
    label: string;
    value: string | number;
}

export const Stat: React.FC<StatProps> = ({ label, value }) => (
    <div className="adm-stat">
        <div className="adm-stat-value">{value}</div>
        <div className="adm-stat-label">{label}</div>
    </div>
);
