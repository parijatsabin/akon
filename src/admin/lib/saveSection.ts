/**
 * saveSection — shared save path for every admin form.
 *
 * Writes now fail loudly (there is no production write endpoint by design),
 * so every call site needs the same handling: persist, report, never leave
 * the button spinning. Centralised here rather than repeated per page.
 */

import { updateSection, SiteDataError } from "../../data/siteRepository";
import type { SiteData } from "../../data/types";

type Toast = (message: string, type?: "success" | "error") => void;

export async function saveSection<K extends keyof SiteData>(
    section: K,
    value: SiteData[K],
    toast: Toast,
    successMessage: string
): Promise<boolean> {
    try {
        await updateSection(section, value);
        toast(successMessage);
        return true;
    } catch (err) {
        toast(
            err instanceof SiteDataError
                ? err.message
                : "Save failed. Check the console for details.",
            "error"
        );
        return false;
    }
}
