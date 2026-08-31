/**
 * /fragrance — the reference detail behind the fragrance.
 *
 * Deliberately no product name block, no photography and no order button:
 * those belong to the homepage, which is where the fragrance is presented and
 * bought. This page answers what someone asks *before* deciding — what it is
 * made of, what is in it, how it is worn — and it is where the footer's
 * "Ingredients & Safety" link points.
 *
 * A gallery and an <h1> were tried here and removed again: the page reads as
 * a specification sheet, and repeating the product's identity above it made
 * it look like a second, weaker version of the homepage section. The SEO cost
 * is real and noted -- this page has no <h1>.
 *
 * The blocks are shared with the homepage section; see components/product.
 */

import React from "react";
import { Link } from "react-router-dom";
import { useSiteData } from "../data/SiteDataProvider";
import PageShell from "../components/PageShell";
import Reveal from "../components/Reveal";
import {
    ProductHighlights, ProductSpecs, ProductUsage, ProductComposition,
} from "../components/product/blocks";

const FragrancePage: React.FC = () => {
    const { featuredProduct: product } = useSiteData();

    return (
        <PageShell>
            <section className="section-page bg-white">
                <div className="container">
                    <Reveal className="sig-detail sig-detail--lead">
                        <ProductHighlights product={product} />

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
        </PageShell>
    );
};

export default FragrancePage;
