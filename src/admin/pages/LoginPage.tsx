import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Input } from "../components/ui/Field";

const LoginPage: React.FC = () => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: string })?.from ?? "/admin";

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    useEffect(() => {
        if (isAuthenticated) navigate(from, { replace: true });
    }, [isAuthenticated, navigate, from]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!username.trim() || !password) {
            setError("Please enter both username and password.");
            return;
        }
        setLoading(true);
        const result = await login(username, password);
        setLoading(false);
        if (result.ok) {
            navigate(from, { replace: true });
        } else {
            setError(result.error ?? "Login failed.");
            setPassword("");
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "var(--charcoal)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Decorative rings */}
            <div style={{ position: "absolute", top: "-120px", right: "-120px", width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(162,127,63,0.15)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: "-60px", right: "-60px", width: 260, height: 260, borderRadius: "50%", border: "1px solid rgba(162,127,63,0.10)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-100px", left: "-100px", width: 320, height: 320, borderRadius: "50%", border: "1px solid rgba(162,127,63,0.12)", pointerEvents: "none" }} />

            <div
                style={{
                    width: "100%",
                    maxWidth: 420,
                    background: "#fff",
                    borderRadius: "var(--radius-lg)",
                    overflow: "hidden",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
                    position: "relative",
                }}
            >
                {/* Gold header strip */}
                <div
                    style={{
                        background: "var(--gold)",
                        padding: "32px 36px 28px",
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "2rem",
                            fontWeight: 700,
                            letterSpacing: "0.22em",
                            color: "#fff",
                            marginBottom: 6,
                        }}
                    >
                        ANOK
                    </div>
                    <div
                        style={{
                            fontSize: "0.72rem",
                            letterSpacing: "0.20em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.75)",
                        }}
                    >
                        Content Studio
                    </div>
                </div>

                {/* Form */}
                <div style={{ padding: "36px 36px 40px" }}>
                    <h2
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "1.4rem",
                            fontWeight: 700,
                            color: "var(--text-main)",
                            marginBottom: 6,
                        }}
                    >
                        Welcome back
                    </h2>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 28 }}>
                        Sign in to manage your website content.
                    </p>

                    {error && (
                        <div
                            style={{
                                background: "#fff0f0",
                                border: "1px solid #e05555",
                                borderLeft: "4px solid #e05555",
                                borderRadius: "var(--radius-sm)",
                                padding: "12px 16px",
                                fontSize: "0.85rem",
                                color: "#c03333",
                                marginBottom: 22,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <div style={{ marginBottom: 18 }}>
                            <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 7 }}>
                                Username
                            </label>
                            <Input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                autoFocus
                                placeholder="admin"
                            />
                        </div>

                        <div style={{ marginBottom: 28 }}>
                            <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 7 }}>
                                Password
                            </label>
                            <div style={{ position: "relative" }}>
                                <Input
                                    type={showPass ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    style={{ paddingRight: 44 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass((s) => !s)}
                                    style={{
                                        position: "absolute",
                                        right: 12, top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "var(--text-muted)",
                                        padding: 4,
                                        display: "flex",
                                    }}
                                >
                                    {showPass ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "13px 0",
                                background: loading ? "var(--gold-subtle)" : "var(--gold)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "var(--radius-sm)",
                                fontFamily: "var(--font-body)",
                                fontWeight: 700,
                                fontSize: "0.88rem",
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                cursor: loading ? "not-allowed" : "pointer",
                                transition: "background 0.22s",
                                boxShadow: "0 4px 18px rgba(162,127,63,0.30)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 10,
                            }}
                            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "var(--gold-dim)"; }}
                            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "var(--gold)"; }}
                        >
                            {loading ? (
                                <>
                                    <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                                    Signing in…
                                </>
                            ) : "Sign In"}
                        </button>
                    </form>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default LoginPage;
