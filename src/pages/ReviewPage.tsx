/**
 * /review — the link that gets shared.
 *
 * The footer dialog is for someone already reading the site. This page is for
 * someone arriving from a message, a QR code on a card in the box, or a link
 * in a bio: it has a URL to paste, and because it is registered in seo/routes
 * the Worker renders its title, description and og:image at the edge, so the
 * preview card shows the fragrance rather than a bare domain.
 *
 * It is noindex. The page is a form, not something anyone should reach from a
 * search result, and it stays out of sitemap.xml for the same reason.
 *
 * The form itself is ReviewFormBody, shared with the dialog — the same fields,
 * the same validation, the same insert.
 */

import React from "react";
import PageShell from "../components/PageShell";
import { ReviewFormBody } from "../components/ReviewForm";
import { useSiteData } from "../data/SiteDataProvider";

const ReviewPage: React.FC = () => {
    const { featuredProduct: product } = useSiteData();

    return (
        <PageShell>
            <section className="section-page bg-white">
                <div className="container">
                    {/* The same header every inner page uses. */}
                    <header className="policy-header rv-page-header">
                        <h1 className="policy-title">Share your experience</h1>
                        <div className="gold-divider" />
                        <p className="policy-intro">
                            Tell us how {product.name} wears for you. Reviews are read
                            before they are published, and your email is never shown
                            on the site.
                        </p>
                    </header>

                    <div className="rv-page-card">
                        <ReviewFormBody />
                    </div>
                </div>
            </section>
        </PageShell>
    );
};

export default ReviewPage;
