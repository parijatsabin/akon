/**
 * Reveal — scroll-in animation as a component rather than a convention.
 *
 * The `reveal` class sets opacity:0 and only becomes visible once useReveal's
 * observer adds `is-revealed`. That makes the class and the ref two halves of
 * one thing which a caller has to remember to pair — and forgetting the ref
 * does not fail loudly, it renders a permanently invisible element. That is
 * exactly what happened on /fragrance: the class was carried over during a
 * refactor, the ref was not, and half the page was blank.
 *
 * Binding both here means the pairing cannot be got wrong.
 */

import React from "react";
import { useReveal } from "../hooks/useReveal";

interface RevealProps {
    children: React.ReactNode;
    /** Extra classes; `reveal` is always applied. */
    className?: string;
    /** Cascade direct children in, rather than the block as a whole. */
    stagger?: boolean;
    id?: string;
}

const Reveal: React.FC<RevealProps> = ({ children, className = "", stagger, id }) => {
    const ref = useReveal<HTMLDivElement>();
    return (
        <div
            ref={ref}
            id={id}
            className={`reveal${stagger ? " reveal-stagger" : ""}${className ? ` ${className}` : ""}`}
        >
            {children}
        </div>
    );
};

export default Reveal;
