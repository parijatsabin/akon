/**
 * PolicyPage — shared renderer for the Privacy Policy and Terms of Use.
 *
 * Both pages have identical structure (title, intro, dated sections), so they
 * share one component and differ only in which CMS section they read.
 */
import React from "react";
import { useSiteData } from "../data/SiteDataProvider";
import PageShell from "../components/PageShell";

interface Props {
    /** Which top-level CMS section to render. */
    section: "privacy" | "terms";
}

const PolicyPage: React.FC<Props> = ({ section }) => {
    const data = useSiteData()[section];

    return (
        <PageShell resetKey={section}>
            <section className="section-page">
                <div className="container policy-container">
                    <header className="policy-header">
                        <h1 className="policy-title">{data.title}</h1>
                        {data.lastUpdated && (
                            <p className="policy-updated">Last updated {data.lastUpdated}</p>
                        )}
                        <div className="gold-divider" />
                        <p className="policy-intro">{data.intro}</p>
                    </header>

                    {data.sections.map((s, i) => (
                        <section key={s.id} className="policy-section">
                            <h2 className="policy-heading">
                                <span className="policy-num">{String(i + 1).padStart(2, "0")}</span>
                                {s.heading}
                            </h2>
                            {/* Blank lines in the CMS field become separate paragraphs. */}
                            {s.body.split("\n\n").map((para, j) => (
                                <p key={j} className="policy-body">{para}</p>
                            ))}
                        </section>
                    ))}
                </div>
            </section>
        </PageShell>
    );
};

export default PolicyPage;
