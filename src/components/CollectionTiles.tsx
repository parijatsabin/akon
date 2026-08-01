import React from "react";
import { Link } from "react-router-dom";
import { useSiteData } from "../PublicSite";

const CollectionTiles: React.FC = () => {
    const { collectionTiles } = useSiteData();

    // Sort by order, filter visible only
    const tiles = [...collectionTiles.items]
        .filter((t) => t.visible)
        .sort((a, b) => a.order - b.order);

    if (tiles.length === 0) return null;

    return (
        <section className="section bg-cream">
            <div className="container">
                <div className="section-header">
                    <span className="tag">{collectionTiles.sectionTag}</span>
                    <h2 className="section-title">{collectionTiles.headline}</h2>
                </div>
                <div className="tiles-grid">
                    {tiles.map((tile) => (
                        <Link key={tile.id} to={tile.href} style={{ textDecoration: "none", display: "block" }}>
                            <div className="tile-wrap">
                                <img src={tile.imageUrl} alt={tile.heading} className="tile-img" />
                                <div className="tile-overlay" />
                                <div className="tile-gradient" />
                                <div className="tile-text">
                                    <div className="tile-label">{tile.label}</div>
                                    <div className="tile-heading">{tile.heading}</div>
                                    <div className="tile-sub">{tile.subtext}</div>
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
};

export default CollectionTiles;
