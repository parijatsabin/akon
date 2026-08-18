/**
 * Social links — catalogue and renderer.
 *
 * The icons and the list markup used to be duplicated in Footer.tsx and
 * ContactPage.tsx, each with its own copy of three SVG paths and a hardcoded
 * instagram/facebook/pinterest triple. Adding a platform meant editing both,
 * and the set could only ever be those three.
 *
 * The content model is now a list, so an editor adds and removes platforms in
 * the CMS. This module is the single place that knows what a platform looks
 * like; everything else just renders whatever the list contains.
 */

import React from "react";
import type { SocialLink, SocialPlatform } from "../data/types";

/** Every platform the CMS can offer, in the order the picker lists them. */
export const SOCIAL_PLATFORMS: { id: SocialPlatform; label: string }[] = [
    { id: "instagram", label: "Instagram" },
    { id: "facebook", label: "Facebook" },
    { id: "pinterest", label: "Pinterest" },
    { id: "x", label: "X (Twitter)" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "youtube", label: "YouTube" },
    { id: "tiktok", label: "TikTok" },
    { id: "whatsapp", label: "WhatsApp" },
];

export const platformLabel = (id: string): string =>
    SOCIAL_PLATFORMS.find((p) => p.id === id)?.label ?? id;

/** 24×24 paths, drawn at whatever size the caller asks for. */
const ICONS: Record<SocialPlatform, React.ReactNode> = {
    instagram: (
        <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
        </g>
    ),
    facebook: <path fill="currentColor" d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
    pinterest: (
        <path fill="currentColor" d="M12 0C5.4 0 0 5.4 0 12c0 5.1 3.2 9.4 7.6 11.2-.1-.9-.2-2.4 0-3.4.2-.9 1.4-6 1.4-6s-.4-.7-.4-1.8c0-1.7 1-2.9 2.2-2.9 1 0 1.5.8 1.5 1.7 0 1-.7 2.6-1 4-.3 1.2.6 2.2 1.8 2.2 2.1 0 3.8-2.2 3.8-5.5 0-2.9-2.1-4.9-5-4.9-3.4 0-5.4 2.6-5.4 5.2 0 1 .4 2.1.9 2.7.1.1.1.2.1.3l-.3 1.4c-.1.2-.2.3-.4.2-1.5-.7-2.4-2.9-2.4-4.6 0-3.8 2.7-7.3 7.9-7.3 4.2 0 7.4 3 7.4 6.9 0 4.1-2.6 7.5-6.2 7.5-1.2 0-2.4-.6-2.8-1.4l-.7 2.9c-.3 1-1 2.3-1.5 3.1 1.1.4 2.3.5 3.5.5 6.6 0 12-5.4 12-12S18.6 0 12 0z" />
    ),
    x: <path fill="currentColor" d="M18.9 2H22l-7 8 8.2 12h-6.4l-5-7.3L5.9 22H2.7l7.5-8.6L2.3 2h6.6l4.5 6.7L18.9 2zm-1.1 18h1.8L7.3 3.9H5.4L17.8 20z" />,
    linkedin: (
        <g fill="currentColor">
            <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3 9h4v12H3z" />
            <path d="M10 9h3.8v1.7h.05c.53-.95 1.83-1.95 3.75-1.95C21.4 8.75 22 11 22 14.1V21h-4v-6.1c0-1.45-.03-3.3-2.05-3.3-2.06 0-2.37 1.57-2.37 3.2V21h-4z" />
        </g>
    ),
    youtube: (
        <g fill="currentColor">
            <path d="M23 12s0-3.2-.4-4.7a3 3 0 0 0-2.1-2.1C18.9 4.8 12 4.8 12 4.8s-6.9 0-8.5.4a3 3 0 0 0-2.1 2.1C1 8.8 1 12 1 12s0 3.2.4 4.7a3 3 0 0 0 2.1 2.1c1.6.4 8.5.4 8.5.4s6.9 0 8.5-.4a3 3 0 0 0 2.1-2.1C23 15.2 23 12 23 12z" />
            <path fill="var(--noir, #0e0d0c)" d="M9.8 15.3V8.7l5.7 3.3z" />
        </g>
    ),
    tiktok: <path fill="currentColor" d="M16.5 2c.4 2.3 1.8 4 4.1 4.3v3c-1.5.1-2.9-.3-4.1-1.1v6.4c0 4.1-3.2 6.7-6.6 6.4A6.3 6.3 0 0 1 4 14.6c.2-3 2.7-5.4 5.7-5.4.3 0 .6 0 .9.1v3.2a3.1 3.1 0 0 0-1.2-.2 3 3 0 0 0 .4 6c1.7 0 3.1-1.3 3.1-3.1V2z" />,
    whatsapp: <path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.8 14.2c-.2.7-1.2 1.3-1.9 1.4-.5.1-1.2.2-3.5-.7-2.9-1.2-4.8-4.2-5-4.4-.1-.2-1.1-1.5-1.1-2.9 0-1.3.7-2 .9-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.5c-.1.2-.3.3-.1.6.1.2.6 1 1.3 1.7.9.8 1.6 1 1.9 1.2.2.1.4.1.5-.1l.7-.9c.2-.2.3-.2.6-.1l1.9.9c.3.1.4.2.5.3.1.2.1.6-.1 1.1z" />,
};

/** True when the id is a platform we can draw. */
export const isKnownPlatform = (id: string): id is SocialPlatform => id in ICONS;

export const SocialIcon: React.FC<{ platform: SocialPlatform; size?: number }> = ({
    platform, size = 18,
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        {ICONS[platform]}
    </svg>
);

/**
 * Renders the whole set. Entries without a URL are skipped so a half-filled
 * row in the CMS never becomes a link to nowhere.
 */
export const SocialLinkList: React.FC<{ links: SocialLink[]; size?: number }> = ({ links, size }) => {
    const usable = links.filter((l) => l.url.trim() && isKnownPlatform(l.platform));
    if (usable.length === 0) return null;

    return (
        <div style={{ display: "flex", gap: 10 }}>
            {usable.map((l) => (
                <a
                    key={l.platform}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={platformLabel(l.platform)}
                    className="social-btn"
                >
                    <SocialIcon platform={l.platform} size={size} />
                </a>
            ))}
        </div>
    );
};
