/**
 * Homepage — every section a visitor scrolls through, in the order they see
 * them. Hero, About, Commitment, Testimonials, Newsletter, then the Footer
 * that closes every page.
 *
 * The tab order deliberately matches the rendered page order, so finding the
 * editor for something you are looking at is a matter of position rather than
 * memory.
 */

import React, { useState } from "react";
import { PageHeader, Tabs, TabPanel, type TabDef } from "../components/ui/Page";
import {
    HeroTab, AboutTab, CommitmentTab, NewsletterTab, FooterTab,
} from "./editors";
import { TestimonialsTab } from "./TestimonialsPage";

const TABS = [
    { id: "hero", label: "Hero" },
    { id: "about", label: "About" },
    { id: "commitment", label: "Commitment" },
    { id: "testimonials", label: "Testimonials" },
    { id: "newsletter", label: "Newsletter" },
    { id: "footer", label: "Footer" },
] as const satisfies readonly TabDef[];

type TabId = (typeof TABS)[number]["id"];

const HomepagePage: React.FC = () => {
    const [tab, setTab] = useState<TabId>("hero");
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const onSave = () => setLastSaved(new Date().toLocaleTimeString());

    const panels: Record<TabId, React.ReactNode> = {
        hero: <HeroTab onSave={onSave} />,
        about: <AboutTab onSave={onSave} />,
        commitment: <CommitmentTab onSave={onSave} />,
        testimonials: <TestimonialsTab onSave={onSave} />,
        newsletter: <NewsletterTab onSave={onSave} />,
        footer: <FooterTab onSave={onSave} />,
    };

    return (
        <>
            <PageHeader
                title="Homepage"
                description="The sections visitors scroll through, in the order they appear."
            />
            <Tabs
                tabs={TABS}
                active={tab}
                onChange={(id) => setTab(id as TabId)}
                label="Homepage sections"
            />
            <TabPanel id={tab}>{panels[tab]}</TabPanel>
            {lastSaved && (
                <p className="adm-hint" style={{ marginTop: 12 }}>Last saved at {lastSaved}</p>
            )}
        </>
    );
};

export default HomepagePage;
