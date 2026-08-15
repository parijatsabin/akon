/**
 * useReveal — adds the `is-revealed` class when an element scrolls into view.
 *
 * Deliberately tiny: one IntersectionObserver, no animation library. The
 * actual motion lives in CSS (.reveal / .is-revealed) so it can be disabled
 * wholesale by prefers-reduced-motion without touching component code.
 *
 * Usage:
 *   const ref = useReveal<HTMLDivElement>();
 *   <div ref={ref} className="reveal">…</div>
 *
 * Add `reveal-stagger` alongside `reveal` to have direct children cascade in.
 */

import { useEffect, useRef } from "react";

interface RevealOptions {
    /** How far into the viewport before revealing. Default: 12% up from the bottom. */
    rootMargin?: string;
    /** Reveal once and stop observing. Default true — re-animating on scroll-up feels cheap. */
    once?: boolean;
}

export function useReveal<T extends HTMLElement>({
    rootMargin = "0px 0px -12% 0px",
    once = true,
}: RevealOptions = {}) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Reduced motion, or no observer support: show immediately, never animate.
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced || typeof IntersectionObserver === "undefined") {
            el.classList.add("is-revealed");
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-revealed");
                        if (once) observer.unobserve(entry.target);
                    } else if (!once) {
                        entry.target.classList.remove("is-revealed");
                    }
                }
            },
            { rootMargin, threshold: 0.05 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [rootMargin, once]);

    return ref;
}
