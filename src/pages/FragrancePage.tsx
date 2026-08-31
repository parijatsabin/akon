/**
 * /fragrance — the reference detail behind the fragrance.
 *
 * No order button: buying belongs to the homepage, which is where the
 * fragrance is presented and sold. This page answers what someone asks
 * *before* deciding — what it is made of, what is in it, how it is worn — and
 * it is where the footer's "Ingredients & Safety" link points.
 *
 * It carried no photography either, on the same reasoning. That went too far:
 * a reader comparing specifications still wants to see the bottle they are
 * reading about, and the page had no <h1> for the product it is named after.
 * A single gallery and a heading, no buy controls.
 *
 * The blocks are shared with the homepage section; see components/product.
 */

import React from "react";
import { Link } from "react-router-dom";
import { useSiteData } from "../data/SiteDataProvider";
import PageShell from "../components/PageShell";
import Reveal from "../components/Reveal";
import {
    ProductGallery, ProductHeader, ProductHighlights, ProductSpecs,
    ProductUsage, ProductComposition,
} from "../components/product/blocks";

const FragrancePage: React.FC = () => {
    const { featuredProduct: product } = useSiteData();

    return (
        <PageShell>
            <section className="section-page bg-white">
                <div className="container">
                    {/* The page opened straight into the highlight cards: no
                        photograph of the thing it describes, and no <h1> — the
                        one heading a search engine weighs most, on the page
                        that targets the product's own name. Both are the same
                        block, so both are fixed here. */}
                    <ProductHeader product={product} as="h1" />

                    <div className="frag-gallery">
                        <ProductGallery product={product} />
                    </div>

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
