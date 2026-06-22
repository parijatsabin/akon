import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

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
    const [userFocus, setUserFocus] = useState(false);
    const [passFocus, setPassFocus] = useState(false);

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

    const inputStyle = (focused: boolean): React.CSSProperties => ({
        width: "100%",
        padding: "13px 16px",
        border: `1.5px solid ${focused ? "var(--gold)" : "#e2dbd0"}`,
        borderRadius: 8,
        fontFamily: "var(--font-body)",
        fontSize: "0.95rem",
        color: "var(--text-main)",
        background: focused ? "#fdfaf5" : "#faf7f2",
        outline: "none",
        transition: "border-color 0.2s, background 0.2s",
        boxShadow: focused ? "0 0 0 3px rgba(162,127,63,0.10)" : "none",
    });

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            fontFamily: "var(--font-body)",
        }}>

            {/* ── LEFT PANEL — brand ── */}
            <div style={{
                flex: "0 0 48%",
                background: "var(--charcoal)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                padding: "60px 48px",
            }}
                className="login-left"
            >
                {/* Decorative gold rings */}
                <div style={{ position: "absolute", top: "-120px", left: "-120px", width: 420, height: 420, borderRadius: "50%", border: "1px solid rgba(162,127,63,0.14)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", top: "-60px", left: "-60px", width: 260, height: 260, borderRadius: "50%", border: "1px solid rgba(162,127,63,0.10)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: "-100px", right: "-100px", width: 360, height: 360, borderRadius: "50%", border: "1px solid rgba(162,127,63,0.12)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: "-40px", right: "-40px", width: 200, height: 200, borderRadius: "50%", border: "1px solid rgba(162,127,63,0.08)", pointerEvents: "none" }} />

                {/* Gold horizontal rule top */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />

                {/* Content */}
                <div style={{ position: "relative", textAlign: "center", maxWidth: 360 }}>

                    {/* Logo image */}
                    <div style={{ marginBottom: 32 }}>
                        <img
                            src="/logo.png"
                            alt="ANOK"
                            style={{
                                height: 300,
                                width: "auto",
                                filter: "brightness(0) invert(1) drop-shadow(0 0 20px rgba(162,127,63,0.50))",
                                margin: "0 auto",
                                display: "block",
                            }}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                    </div>


                </div>


            </div>

            {/* ── RIGHT PANEL — form ── */}
            <div style={{
                flex: 1,
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 48px",
                position: "relative",
            }}
                className="login-right"
            >
                {/* Top-right corner accent */}
                <div style={{ position: "absolute", top: 0, right: 0, width: 180, height: 180, background: "radial-gradient(circle at top right, rgba(162,127,63,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

                <div style={{ width: "100%", maxWidth: 400 }}>

                    {/* Greeting */}
                    <div style={{ marginBottom: 36 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                            <div style={{ width: 36, height: 3, background: "var(--gold)", borderRadius: 2 }} />
                            <span style={{ fontSize: "0.70rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)" }}>
                                Admin Access
                            </span>
                        </div>
                        <h1 style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "2rem",
                            fontWeight: 700,
                            color: "var(--text-main)",
                            marginBottom: 8,
                            lineHeight: 1.15,
                        }}>
                            Welcome back
                        </h1>

                    </div>

                    {/* Error banner */}
                    {error && (
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            background: "#fff5f5",
                            border: "1px solid #fca5a5",
                            borderLeft: "4px solid #ef4444",
                            borderRadius: 8,
                            padding: "12px 14px",
                            marginBottom: 22,
                            fontSize: "0.86rem",
                            color: "#b91c1c",
                            animation: "shakeX 0.4s ease",
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} noValidate>

                        {/* Username */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
                                Username
                            </label>
                            <div style={{ position: "relative" }}>
                                <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: userFocus ? "var(--gold)" : "#c5bdb3", transition: "color 0.2s", pointerEvents: "none" }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onFocus={() => setUserFocus(true)}
                                    onBlur={() => setUserFocus(false)}
                                    autoComplete="username"
                                    autoFocus
                                    placeholder="admin"
                                    style={{ ...inputStyle(userFocus), paddingLeft: 42 }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: 32 }}>
                            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
                                Password
                            </label>
                            <div style={{ position: "relative" }}>
                                <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: passFocus ? "var(--gold)" : "#c5bdb3", transition: "color 0.2s", pointerEvents: "none" }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </div>
                                <input
                                    type={showPass ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setPassFocus(true)}
                                    onBlur={() => setPassFocus(false)}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    style={{ ...inputStyle(passFocus), paddingLeft: 42, paddingRight: 44 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass((s) => !s)}
                                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#c5bdb3", padding: 4, display: "flex", transition: "color 0.2s" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = "#c5bdb3")}
                                >
                                    {showPass ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "14px 0",
                                background: loading ? "var(--gold-subtle)" : "var(--gold)",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                fontFamily: "var(--font-body)",
                                fontWeight: 700,
                                fontSize: "0.90rem",
                                letterSpacing: "0.10em",
                                textTransform: "uppercase",
                                cursor: loading ? "not-allowed" : "pointer",
                                transition: "all 0.22s",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 10,
                                boxShadow: loading ? "none" : "0 6px 24px rgba(162,127,63,0.35)",
                            }}
                            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = "var(--gold-dim)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                            onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.background = "var(--gold)"; e.currentTarget.style.transform = "translateY(0)"; } }}
                        >
                            {loading ? (
                                <>
                                    <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                                    Signing in…
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>



                </div>

                {/* Bottom-right branding */}
                <div style={{ position: "absolute", bottom: 22, right: 28, fontSize: "0.68rem", color: "#000000ff", letterSpacing: "0.08em" }}>
                    ANOK © {new Date().getFullYear()}
                </div>
            </div>

            <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes shakeX {
          0%,100% { transform: translateX(0); }
          20%,60% { transform: translateX(-6px); }
          40%,80% { transform: translateX(6px); }
        }
        @media (max-width: 768px) {
          .login-left  { display: none !important; }
          .login-right { padding: 40px 28px !important; }
        }
      `}</style>
        </div>
    );
};

export default LoginPage;
