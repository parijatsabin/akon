/**
 * The homepage's product section — where the fragrance is bought.
 *
 * Gallery, scent, size and the order button all live here, because this is
 * where most visitors land and it is the shortest path from arriving to
 * ordering. What moved to /fragrance is the reference material someone reads
 * *before deciding*: specifications, wearing guidance, and the ingredient list.
 *
 * The blocks are shared with that page — see ./product/blocks — so neither
 * copy can drift from the other.
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSiteData } from "../data/SiteDataProvider";
import Reveal from "./Reveal";
import WhatsAppButton from "./WhatsAppButton";
import { ProductGallery, ProductHeader, ProductNotes, ProductSizes } from "./product/blocks";

const SignatureProduct: React.FC = () => {
    const { featuredProduct: product } = useSiteData();
    const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "");

    return (
        <section id="signature" className="section bg-white">
            <div className="container">
                <ProductHeader product={product} />

                <div className="sig-grid">
                    <ProductGallery product={product} />

                    <Reveal className="sig-content" stagger>
                        <p className="sig-tagline">{product.tagline}</p>
                        <p className="sig-desc">{product.description}</p>

                        <ProductNotes product={product} />

                        <ProductSizes
                            sizes={product.sizes}
                            selected={selectedSize}
                            onSelect={setSelectedSize}
                        />

                        <div className="sig-ctas">
                            <WhatsAppButton
                                name={product.name}
                                size={selectedSize}
                                price={product.price}
                                style={{ flex: "1 1 auto", minWidth: 160 }}
                            />
                        </div>

                    </Reveal>
                </div>

                {/* Below the grid rather than inside the buy column: the
                    ordering note is a paragraph of prose, and setting it in a
                    half-width column left it cramped against the button. */}
                <Reveal className="sig-footnote">
                    {/* {product.orderingNote && (
                        <p className="sig-ordering-note">{product.orderingNote}</p>
                    )} */}
                    <p className="sig-footnote-link">
                        <Link to="/fragrance" className="sig-detail-link">
                            Specifications, how to wear it &amp; full ingredients →
                        </Link>
                    </p>
                </Reveal>
            </div>
        </section>
    );
};

export default SignatureProduct;
