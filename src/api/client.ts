/**
 * API client — thin wrapper around fetch for /api/* routes.
 * Used by both the public site and the admin panel.
 *
 * In development (Vite dev server on :3000):
 *   Worker runs separately via `wrangler dev` on :8787
 *   VITE_API_URL=http://localhost:8787 in .dev.vars / .env
 *
 * In production (Cloudflare):
 *   Worker and assets are on the same origin — /api/* works directly.
 */

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

export interface ApiOk<T> { ok: true; data: T }
export interface ApiErr { ok: false; error: string; status: number }
export type ApiResult<T> = ApiOk<T> | ApiErr;

// ── Token storage ─────────────────────────────────────────────
// Supabase access token is stored in sessionStorage after login.
const TOKEN_KEY = "anok_access_token";

export function setApiToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearApiToken(): void {
    sessionStorage.removeItem(TOKEN_KEY);
}

function getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
}

// ── Core fetch helper ─────────────────────────────────────────
async function apiFetch<T>(
    path: string,
    options: RequestInit = {}
): Promise<ApiResult<T>> {
    const token = getToken();

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string> ?? {}),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(`${BASE}${path}`, { ...options, headers });
        const json = await res.json().catch(() => ({ ok: false, error: res.statusText }));

        if (!res.ok || !json.ok) {
            return {
                ok: false,
                error: (json as { error?: string }).error ?? "Unknown error",
                status: res.status,
            };
        }

        return { ok: true, data: (json as { data: T }).data };
    } catch (err) {
        return {
            ok: false,
            error: err instanceof Error ? err.message : "Network error",
            status: 0,
        };
    }
}

// ── Public API ────────────────────────────────────────────────
export const api = {
    // CMS
    getCmsSection: <T>(section: string) => apiFetch<T>(`/api/cms/${section}`),
    getFullCms: () => apiFetch<unknown>("/api/cms"),
    updateCmsSection: (section: string, data: unknown) =>
        apiFetch(`/api/cms/${section}`, { method: "PUT", body: JSON.stringify(data) }),

    // Products
    getProducts: () => apiFetch<unknown[]>("/api/products"),
    getProduct: (slug: string) => apiFetch<unknown>(`/api/products/${slug}`),
    searchProducts: (q: string) => apiFetch<unknown[]>(`/api/products/search?q=${encodeURIComponent(q)}`),

    // Newsletter
    subscribe: (email: string) =>
        apiFetch("/api/newsletter/subscribe", { method: "POST", body: JSON.stringify({ email }) }),
    unsubscribe: (email: string) =>
        apiFetch("/api/newsletter/unsubscribe", { method: "POST", body: JSON.stringify({ email }) }),

    // Orders (auth required)
    createOrder: (order: unknown) =>
        apiFetch("/api/orders", { method: "POST", body: JSON.stringify(order) }),
    getMyOrders: () => apiFetch("/api/orders/mine"),
    getOrder: (orderNumber: string) => apiFetch(`/api/orders/${orderNumber}`),
};
