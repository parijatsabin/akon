/**
 * /fragrance — the reference detail behind the fragrance.
 *
 * Deliberately no product name block, no photography and no order button:
 * those belong to the homepage, which is where the fragrance is presented and
 * bought. This page answers what someone asks *before* deciding — what it is
 * made of, what is in it, how it is worn — and it is where the footer's
 * "Ingredients & Safety" link points.
 *
 * A gallery and a display-type product header were tried here and removed
 * again: the page reads as a specification sheet, and repeating the product's
 * identity above it made it look like a second, weaker version of the homepage
 * section. What it does carry is the same plain header every other inner page
 * uses, which restores the <h1> without bringing the product block back.
 *
 * The blocks are shared with the homepage section; see components/product.
 */

import React from "react";
import { Link } from "react-router-dom";
import { useSiteData } from "../data/SiteDataProvider";
import PageShell from "../components/PageShell";
import Reveal from "../components/Reveal";
import Testimonials from "../components/Testimonials";
import {
    ProductHighlights, ProductSpecs, ProductUsage, ProductComposition, ProductNotes,
} from "../components/product/blocks";

const FragrancePage: React.FC = () => {
    const { featuredProduct: product } = useSiteData();

    return (
        <PageShell>
            <section className="section-page bg-white">
                <div className="container">
                    {/* The same header every inner page uses -- About, FAQ and
                        the policy pages all share .policy-header. The page
                        previously opened straight onto two highlight cards,
                        with nothing saying what it was, and no <h1> at all.
                        This is page context, not the product identity block:
                        no name in display type, no price, no photograph. */}
                    <header className="policy-header">
                        <h1 className="policy-title">Details, Care &amp; Ingredients</h1>
                        <div className="gold-divider" />
                        <p className="policy-intro">
                            Specifications, wearing guidance and the full ingredient
                            list for {product.name}.
                        </p>
                    </header>

                    <Reveal className="sig-detail sig-detail--lead">
                        <ProductHighlights product={product} />

                        <div style={{ marginBottom: "2rem" }}>
                            <ProductNotes product={product} />
                        </div>

                        <div className="sig-detail-grid">
                            <ProductSpecs product={product} />
                            <ProductUsage product={product} />
                        </div>
                    </Reveal>

                    <ProductComposition product={product} />

                    <Reveal className="frag-back">
                        <Link to="/#signature" className="btn btn-accent">
                            Back to the fragrance
                        </Link>
                    </Reveal>
                </div>
            </section>

            {/* This page is the product's detail page and carries the Product
                structured data with it, reviews included. Google requires the
                reviews it reads to be visible here, not only on /about. */}
            <Testimonials tint={false} />
        </PageShell>
    );
};

export default FragrancePage;
