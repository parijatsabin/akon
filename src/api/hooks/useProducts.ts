/**
 * useProducts — fetches products from the Worker API.
 * Falls back to the CMS store products if the API is unavailable.
 */

import { useState, useEffect } from "react";
import { api } from "../client.ts";
import { readStore } from "../../admin/cms/cmsStore.ts";
import type { ProductItem } from "../../admin/types/cms.types.ts";
import type { Product } from "../types/api.types.ts";

/** Map DB product shape → legacy ProductItem shape for component compatibility */
function dbToProductItem(p: Product): ProductItem {
    return {
        id: p.slug,
        name: p.name,
        collection: p.collection,
        description: p.description ?? "",
        price: `NPR ${p.price_npr.toLocaleString("en-IN")}`,
        badge: p.badge,
        accentColor: p.accent_color,
        imageUrl: p.image_url,
        productUrl: p.product_url,
        notes: {
            top: p.notes_top ?? [],
            heart: p.notes_heart ?? [],
            base: p.notes_base ?? [],
        },
    };
}

interface State {
    items: ProductItem[];
    rawItems: Product[];          // DB-native shape for WhatsApp/order flows
    loading: boolean;
    error: string | null;
}

export function useProducts(): State {
    const fallback = readStore().collection.items;

    const [state, setState] = useState<State>({
        items: fallback,
        rawItems: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const result = await api.getProducts();

            if (cancelled) return;

            if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
                const raw = result.data as Product[];
                setState({
                    items: raw.map(dbToProductItem),
                    rawItems: raw,
                    loading: false,
                    error: null,
                });
            } else {
                // Fall back to localStorage/defaults silently
                setState({ items: fallback, rawItems: [], loading: false, error: null });
            }
        }

        load();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return state;
}
