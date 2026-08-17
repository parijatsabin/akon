/**
 * Company — the business behind the site: name, contact details, opening
 * hours, social links. Mirrors the `company` table.
 *
 * Previously the "Brand" tab inside Settings, buried alongside homepage copy.
 * It is its own page now because it is the one thing here that describes the
 * business rather than the website.
 */

import React from "react";
import { PageHeader } from "../components/ui/Page";
import { BrandTab } from "./editors";

const CompanyPage: React.FC = () => (
    <>
        <PageHeader
            title="Company"
            description="Business name, contact details, opening hours and social links. Used across the site — in the footer, on the contact page, and in search results."
        />
        <BrandTab onSave={() => { /* toast in the editor is confirmation enough */ }} />
    </>
);

export default CompanyPage;
