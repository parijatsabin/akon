/**
 * saveSection — shared save path for every admin form.
 *
 * The signature is unchanged from the JSON era, so no admin page needed
 * editing when the storage moved to Supabase. What changed is underneath:
 * this used to PUT the whole cms-data.json through a dev-only Vite middleware
 * and fail outright in production. It now writes the section's own tables,
 * works on the deployed site, and reports the database's error verbatim.
 */

import { saveSiteSection } from "../../data/adminRepository";
import { SiteDataError } from "../../data/siteRepository";
import type { SiteData } from "../../data/types";

type Toast = (message: string, type?: "success" | "error") => void;

export async function saveSection<K extends keyof SiteData>(
    section: K,
    value: SiteData[K],
    toast: Toast,
    successMessage: string
): Promise<boolean> {
    try {
        await saveSiteSection(section, value);
        toast(successMessage);
        return true;
    } catch (err) {
        toast(
            err instanceof SiteDataError
                ? err.message
                : "Save failed. Check the console for details.",
            "error"
        );
        console.error("[cms] Save failed.", err);
        return false;
    }
}
