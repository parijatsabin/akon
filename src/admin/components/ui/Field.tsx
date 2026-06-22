import React from "react";

interface FieldProps {
    label: string;
    hint?: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ label, hint, error, required, children }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
        <label
            style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
            }}
        >
            {label}
            {required && <span style={{ color: "var(--gold)", marginLeft: 4 }}>*</span>}
        </label>
        {children}
        {hint && !error && (
            <span style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>{hint}</span>
        )}
        {error && (
            <span style={{ fontSize: "0.75rem", color: "#e05555" }}>{error}</span>
        )}
    </div>
);

// ── Input ─────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    fullWidth?: boolean;
}
export const Input: React.FC<InputProps> = ({ fullWidth = true, style, ...props }) => (
    <input
        {...props}
        style={{
            width: fullWidth ? "100%" : undefined,
            padding: "10px 14px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-body)",
            fontSize: "0.92rem",
            color: "var(--text-main)",
            background: "var(--warm-white)",
            outline: "none",
            transition: "border-color 0.2s",
            ...style,
        }}
        onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--gold)";
            props.onFocus?.(e);
        }}
        onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            props.onBlur?.(e);
        }}
    />
);

// ── Textarea ──────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    fullWidth?: boolean;
}
export const Textarea: React.FC<TextareaProps> = ({ fullWidth = true, style, ...props }) => (
    <textarea
        {...props}
        style={{
            width: fullWidth ? "100%" : undefined,
            padding: "10px 14px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-body)",
            fontSize: "0.92rem",
            color: "var(--text-main)",
            background: "var(--warm-white)",
            outline: "none",
            resize: "vertical",
            minHeight: 90,
            transition: "border-color 0.2s",
            ...style,
        }}
        onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--gold)";
            props.onFocus?.(e);
        }}
        onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            props.onBlur?.(e);
        }}
    />
);

// ── Select ────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: { value: string; label: string }[];
    fullWidth?: boolean;
}
export const Select: React.FC<SelectProps> = ({ options, fullWidth = true, style, ...props }) => (
    <select
        {...props}
        style={{
            width: fullWidth ? "100%" : undefined,
            padding: "10px 14px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-body)",
            fontSize: "0.92rem",
            color: "var(--text-main)",
            background: "var(--warm-white)",
            outline: "none",
            cursor: "pointer",
            ...style,
        }}
    >
        {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
        ))}
    </select>
);

// ── Save button ───────────────────────────────────────────────
interface SaveBtnProps {
    loading?: boolean;
    onClick?: () => void;
    label?: string;
}
export const SaveBtn: React.FC<SaveBtnProps> = ({ loading, onClick, label = "Save Changes" }) => (
    <button
        onClick={onClick}
        disabled={loading}
        style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 28px",
            background: loading ? "var(--gold-subtle)" : "var(--gold)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: "0.82rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.22s, transform 0.18s",
            boxShadow: "0 4px 14px rgba(162,127,63,0.28)",
        }}
        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "var(--gold-dim)"; }}
        onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "var(--gold)"; }}
    >
        {loading ? (
            <>
                <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Saving…
            </>
        ) : (
            <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                </svg>
                {label}
            </>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
);
