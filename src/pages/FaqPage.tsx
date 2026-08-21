/**
 * FaqPage — accordion of CMS-managed questions.
 *
 * Uses <details>/<summary> so it works without JavaScript, is keyboard
 * accessible and is announced correctly by screen readers for free.
 */
import React from "react";
import { Link } from "react-router-dom";
import { useSiteData } from "../data/SiteDataProvider";
import PageShell from "../components/PageShell";

const FaqPage: React.FC = () => {
    const { faq: FAQ } = useSiteData();

    return (
        <PageShell>
            <section className="section-page">
                <div className="container policy-container">
                    <header className="policy-header">
                        <h1 className="policy-title">{FAQ.title}</h1>
                        <div className="gold-divider" />
                        <p className="policy-intro">{FAQ.intro}</p>
                    </header>

                    <div className="faq-list">
                        {FAQ.items.map((item) => (
                            <details key={item.id} className="faq-item">
                                <summary className="faq-question">
                                    <span>{item.question}</span>
                                    <svg className="faq-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </summary>
                                <p className="faq-answer">{item.answer}</p>
                            </details>
                        ))}
                    </div>

                    <div className="faq-footer">
                        <p className="policy-body" style={{ marginBottom: 20 }}>
                            Still have a question?
                        </p>
                        <Link to="/contact" className="btn btn-accent">Ask Us Directly</Link>
                    </div>
                </div>
            </section>
        </PageShell>
    );
};

export default FaqPage;
