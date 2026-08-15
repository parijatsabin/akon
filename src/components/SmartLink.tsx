/**
 * SmartLink — renders the right element for a CMS-authored href.
 *
 * Content editors can type "/about", "#signature" or "https://…" into any
 * link field. React Router's <Link> only handles the first kind: given a
 * hash it treats it as a path and never scrolls. So route paths get <Link>
 * (no reload) and everything else gets a plain <a> (browser handles the
 * hash scroll and external navigation).
 */
import React from "react";
import { Link } from "react-router-dom";

interface Props {
    href: string;
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
}

const SmartLink: React.FC<Props> = ({ href, className, children, onClick }) => {
    const isRoute = href.startsWith("/") && !href.startsWith("//");
    const isExternal = /^https?:\/\//.test(href);

    if (isRoute) {
        return <Link to={href} className={className} onClick={onClick}>{children}</Link>;
    }
    return (
        <a
            href={href}
            className={className}
            onClick={onClick}
            {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
            {children}
        </a>
    );
};

export default SmartLink;
