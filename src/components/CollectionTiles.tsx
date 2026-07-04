import React from "react";
import { Link } from "react-router-dom";

const TILES = [
    { label: "Signature", heading: "Signature Collection", sub: "The house icons — built to last a lifetime", href: "/products?category=Signature+Collection", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=900&h=640&fit=crop" },
    { label: "Luxury", heading: "Luxury Collection", sub: "Rare ingredients, opulent compositions", href: "/products?category=Luxury+Collection", image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=900&h=640&fit=crop" },
    { label: "Limited", heading: "Limited Edition", sub: "Numbered, unrepeatable, collectible", href: "/products?category=Limited+Edition", image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=900&h=640&fit=crop" },
];

const CollectionTiles: React.FC = () => (
    <section className="section bg-cream">
        <div className="container">
            <div className="section-header">
                <span className="tag">Explore</span>
                <h2 className="section-title">Our Collections</h2>
            </div>
            <div className="tiles-grid">
                {TILES.map((tile) => (
                    <Link key={tile.label} to={tile.href} style={{ textDecoration: "none", display: "block" }}>
                        <div className="tile-wrap">
                            <img src={tile.image} alt={tile.heading} className="tile-img" />
                            <div className="tile-overlay" />
                            <div className="tile-gradient" />
                            <div className="tile-text">
                                <div className="tile-label">{tile.label}</div>
                                <div className="tile-heading">{tile.heading}</div>
                                <div className="tile-sub">{tile.sub}</div>
                                <div className="tile-cta">
                                    Shop Now
                                    <svg width="13" height="13" viewBox="0 0 18 18" fill="none">
                                        <path d="M3.5 9H14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                        <path d="M10 4.5L14.5 9L10 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    </section>
);

export default CollectionTiles;
