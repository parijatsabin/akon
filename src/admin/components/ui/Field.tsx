/**
 * Form primitives.
 *
 * These used to carry their styling as inline objects, including focus colours
 * applied through onFocus/onBlur handlers on every single input. All of it now
 * lives in admin.css — see the component layer there. Keeping it in CSS is
 * what makes :hover, :focus-visible and :disabled states possible at all,
 * which inline styles cannot express.
 */

import React from "react";

// ── Field wrapper ─────────────────────────────────────────────
interface FieldProps {
    label: string;
    hint?: string;
    error?: string;
    required?: boolean;
    /** Wire the label to the control so clicking it focuses the input. */
    htmlFor?: string;
    children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ label, hint, error, required, htmlFor, children }) => (
    <div className="adm-field">
        {label && (
            <label className="adm-label" htmlFor={htmlFor}>
                {label}
                {required && <span className="adm-req" aria-hidden="true">*</span>}
            </label>
        )}
        {children}
        {hint && !error && <span className="adm-hint">{hint}</span>}
        {error && <span className="adm-err" role="alert">{error}</span>}
    </div>
);

// ── Input ─────────────────────────────────────────────────────
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export const Input: React.FC<InputProps> = ({ className = "", invalid, ...props }) => (
    <input
        {...props}
        aria-invalid={invalid || undefined}
        className={`adm-input ${className}`.trim()}
    />
);

// ── Textarea ──────────────────────────────────────────────────
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export const Textarea: React.FC<TextareaProps> = ({ className = "", invalid, ...props }) => (
    <textarea
        {...props}
        aria-invalid={invalid || undefined}
        className={`adm-textarea ${className}`.trim()}
    />
);

// ── Select ────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ options, className = "", ...props }) => (
    <select {...props} className={`adm-select ${className}`.trim()}>
        {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
        ))}
    </select>
);

// ── Buttons ───────────────────────────────────────────────────
type Variant = "primary" | "ghost" | "quiet" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    small?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    variant = "ghost", small, className = "", children, ...props
}) => (
    <button
        type="button"
        {...props}
        className={`adm-btn adm-btn-${variant} ${small ? "adm-btn-sm" : ""} ${className}`.trim()}
    >
        {children}
    </button>
);

/** Icon-only control. `label` is required — it becomes the accessible name. */
interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
    label: string;
}

export const IconButton: React.FC<IconButtonProps> = ({ label, className = "", children, ...props }) => (
    <button type="button" aria-label={label} title={label} {...props}
        className={`adm-icon-btn ${className}`.trim()}>
        {children}
    </button>
);

// ── Save button ───────────────────────────────────────────────
interface SaveBtnProps {
    loading?: boolean;
    onClick?: () => void;
    label?: string;
}

export const SaveBtn: React.FC<SaveBtnProps> = ({ loading, onClick, label = "Save Changes" }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="adm-btn adm-btn-primary"
    >
        {loading ? (
            <>
                <Spinner /> Saving…
            </>
        ) : (
            <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                </svg>
                {label}
            </>
        )}
    </button>
);

const Spinner: React.FC = () => (
    <span
        aria-hidden="true"
        style={{
            display: "inline-block", width: 14, height: 14,
            border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "currentColor",
            borderRadius: "50%", animation: "adm-spin 0.7s linear infinite",
        }}
    />
);
