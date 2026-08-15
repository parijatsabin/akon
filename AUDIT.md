# ANOK — Version 1 Codebase Audit

**Phase 2 deliverable. No code has been changed.**

Date: 2026-08-04 · Branch: `main` · Commit: `92720a0`

---

## 0. Decisions already confirmed

These were agreed before this audit was written and are treated as settled:

| # | Decision | Choice |
|---|---|---|
| 1 | Products/collections layer | **Delete entirely** — V1 is Home / About / Contact + one perfume |
| 2 | CMS write path | **Dev-only** — content edited locally, committed, redeployed |
| 3 | Data file layout | **Single `cms-data.json`** — not split into `data/*.json` |
| 4 | `cms.defaults.ts` | **Fold into the JSON and delete** — one true source |
| 5 | Testimonials | **Keep** — they render on the About page |
| 6 | `/admin` in production | **Exclude from the production build** |
| 7 | Restructure depth | **Extract a shared data layer** — no deep `features/` tree |

---

## 1. Current architecture

```
index.html
  └─ src/index.tsx
      └─ App.tsx ──────────────── BrowserRouter
          └─ PublicDataProvider  ← useCmsData() → SiteDataContext
              ├─ /admin/*        → AdminApp      (auth, 8 pages)
              ├─ /products       → ProductsPage
              ├─ /products/:id   → ProductDetailPage
              ├─ /about          → AboutPage
              ├─ /contact        → ContactPage
              └─ /*              → PublicSite    (homepage sections)

Data flow:
  public/cms-data.json
        ↓ fetch()
  cmsStore.loadStore()  ──deep-merge──  cms.defaults.ts (DEFAULT_SITE_DATA)
        ↓
  useCmsData()  ←─── "cms:update" window event ───  cmsStore.writeStore()
        ↓                                                    ↑
  SiteDataContext                                    admin form pages
        ↓
  useSiteData() in every component
```

**Verdict on the data layer:** the *shape* is right. There is one context, one fetch,
one write function, and the UI never touches the JSON directly. Swapping
`loadStore()`/`writeStore()` for `GET /api/site` and `PUT /api/site` is close to a
one-file change. This is the strongest part of the project and should be preserved,
not rewritten.

**Verdict on everything around it:** the project is carrying a second product,
a second website, and a second CMS that V1 does not use.

---

## 2. Scale

| Area | Files | Lines | % |
|---|---:|---:|---:|
| `index.css` | 1 | 1,805 | 21% |
| Admin (`src/admin/`) | 19 | 3,449 | 41% |
| Public pages (`src/pages/`) | 4 | 1,190 | 14% |
| Public components | 11 | 1,003 | 12% |
| Root + hooks | 8 | 1,028 | 12% |
| **Total** | **43** | **8,475** | |

The admin CMS is **41% of the codebase** and serves content that is 60% deleted
under the V1 scope. `index.css` alone is larger than every public component combined.

---

## 3. Findings

Ordered by severity. **P0** = live user-facing defect. **P1** = blocks the V1 scope
or the backend migration. **P2** = maintainability.

### P0 — Live defects on the deployed site

**F1. The mobile menu CTA is an empty gold button.**
[Navbar.tsx:100-102](src/components/Navbar.tsx#L100-L102) renders a hardcoded
`<Link to="/products">{mobileCtaLabel}</Link>`. `mobileCtaLabel` **does not exist in
`cms-data.json`** — it only exists in `cms.defaults.ts`, and the deep-merge falls back
to it. Worse, the link target `/products` is being deleted. Every mobile visitor sees
a gold button leading to a page that will 404.

**F2. The Hero "Our Story" button scrolls nowhere.**
`hero.ctaSecondary.href` is `#about`, but the `<About />` section is commented out of
[PublicSite.tsx:71](src/PublicSite.tsx#L71). There is no `#about` anchor on the
homepage. The primary CTA `#signature` does resolve. One of the two hero buttons is dead.

**F3. Nine of twelve footer links are broken.**
[cms-data.json → footer.navColumns](public/cms-data.json): four "Shop" links point to
`/products?category=…` (page being deleted), and five "Support" links (FAQs, Shipping,
Returns, Privacy Policy, Terms of Use) point to `#`. Only About / Our Story / Contact work.

**F4. `#contact` anchors land on the Newsletter.**
[Newsletter.tsx:16](src/components/Newsletter.tsx#L16) carries `id="contact"`, which
collides with the real `/contact` page. Any in-page `#contact` link scrolls to the
mailing-list signup instead.

**F5. Neither form submits anywhere.**
The Contact form ([ContactPage.tsx:79](src/pages/ContactPage.tsx#L79)) validates
correctly and then shows *"We've received your message and will reply to you shortly"* —
but never sends it. Same for the Newsletter ([Newsletter.tsx:11](src/components/Newsletter.tsx#L11)).
Both silently discard real customer enquiries while telling the customer otherwise.
**This needs a decision — see §6.**

### P1 — Scope and architecture

**F6. Two competing product sources.** `SiteData` defines both
`featuredProduct: ProductItem` and `collection.items: ProductItem[]`
([cms.types.ts:234-236](src/admin/types/cms.types.ts#L234-L236)). "Noir Veil" exists in
both, editable from two different admin pages, with no sync between them. Fifteen products
are stored for a one-product brand.

**F7. `DEFAULT_SITE_DATA` is a live second source of truth, not a fallback.**
`cms-data.json` has **no `contact` key and no `mobileCtaLabel`**. Those values are served
from [cms.defaults.ts](src/admin/types/cms.defaults.ts) — invisible in the CMS, uneditable
by the admin, and only discoverable by reading the source. The 70-line defensive deep-merge
at [cmsStore.ts:36-101](src/admin/cms/cmsStore.ts#L36-L101) — with legacy-array
normalisation and ~15 per-field `??` chains — exists solely to service this.

**F8. The public site depends on the CMS.** [App.tsx:3](src/App.tsx#L3) and
[PublicSite.tsx:9](src/PublicSite.tsx#L9) import the data layer and every core type from
`src/admin/`. Deleting or excluding the admin breaks the website. The dependency arrow
points the wrong way, and it points that way *through the exact module the MySQL migration
will replace*.

**F9. `useSiteData` lives in a page component.** The context hook every component depends
on is exported from [PublicSite.tsx:22](src/PublicSite.tsx#L22) — a route component. This
is why `useWhatsApp` (a hook) imports from `../PublicSite` (a page).

**F10. `SignatureProduct` reads sizes from the collection.**
[SignatureProduct.tsx:9](src/components/SignatureProduct.tsx#L9) pulls `productSizes` from
`COLLECTION`, and gates its CTA on whether the `/products` nav link is enabled
([:12-14](src/components/SignatureProduct.tsx#L12-L14)). Deleting the collection breaks
the one component V1 is built around. Sizes must move onto the product itself.

**F11. No loading or error state.** `useCmsData` returns `DEFAULT_SITE_DATA` synchronously
and `loadStore` swallows fetch failures with a `console.warn`
([cmsStore.ts:106-111](src/admin/cms/cmsStore.ts#L106-L111)). If the JSON fails to load the
site renders placeholder content and looks fine. **Once the defaults file is deleted (D4)
this becomes mandatory work, not a nice-to-have.**

**F12. Admin auth is decorative.** The sha256 of `admin123` is hardcoded at
[AuthContext.tsx:29](src/admin/auth/AuthContext.tsx#L29), shipped in the client bundle, and
the guard is client-side only. Mitigated entirely by D6 (excluding admin from production) —
noted so the decision is not accidentally reversed later.

### P2 — Dead code and consistency

**F13. Five components are imported nowhere.** `Collection.tsx`, `CollectionTiles.tsx`,
`StatsBar.tsx`, `About.tsx`, `Testimonials.tsx` — all commented out of
[PublicSite.tsx:69-74](src/PublicSite.tsx#L69-L74). `StatsBar` is a straight duplicate of
the stats strip already inlined in [Hero.tsx:61-72](src/components/Hero.tsx#L61-L72).
*(Note: the testimonial **carousel** on the About page is separate, hand-rolled inline code
and survives per D5 — only the unused `Testimonials.tsx` component is dead.)*

**F14. Hardcoded copy that duplicates unused CMS fields.** `ContactData`
(`pageTag`, `pageSubtitle`, `subjects`) is defined, defaulted, and **never read**.
[ContactPage.tsx:11](src/pages/ContactPage.tsx#L11) hardcodes its own `SUBJECTS` array,
and reads only `brand` from the CMS. The entire Contact page is uneditable.

**F15. Styling is split across two incompatible systems.** [index.css](src/index.css) is
1,805 lines / 272 rules — genuinely well-organised under clear section headers — yet
components layer heavy inline `style={{}}` objects on top
([Navbar.tsx](src/components/Navbar.tsx) is almost entirely inline; so is
[Commitment.tsx](src/components/Commitment.tsx)). Spacing and typography values are
duplicated between the two with no single source. *(No Tailwind is installed, despite
TASK.md referencing it — treating that as boilerplate and staying with plain CSS.)*

**F16. ~600 lines of CSS die with the scope cut.** Sections *Collection carousel* (L845),
*Collection Tiles* (L873), *Testimonials* (L1101), *Products page* (L1341) plus their
responsive blocks (L1589, L1662, L1730) — roughly a third of the stylesheet.

**F17. Four of eight admin pages die.** `CollectionPage` (468), `CollectionSettingsPage`
(159), `CollectionTilesPage` (211) and their nav entries in
[AdminLayout.tsx:10-19](src/admin/components/AdminLayout.tsx#L10-L19). `TestimonialsPage`
survives per D5.

**F18. `GlobalSettingsPage` is 888 lines** — one file editing brand, nav, hero, stats,
about, commitment, newsletter and footer. It works, but it is the single largest source
file after the stylesheet and the hardest thing in the repo to navigate.

**F19. Seven legacy redirect routes** in [AdminApp.tsx:42-49](src/admin/AdminApp.tsx#L42-L49)
point at pages that were merged into Settings. No external system links to `/admin/hero`.

**F20. Duplicated page chrome.** Every page individually imports and wraps
`<Navbar />` … `<Footer />` (4 pages + PublicSite). A layout route removes this repetition.

**F21. Hero video and product image are hotlinked to third parties.**
`hero.videoUrl` → **pexels.com** (a 3840×2160 25fps MP4, loaded on every homepage visit,
autoplaying, uncached, on mobile data). `featuredProduct.imageUrl` → **unsplash.com**.
Both are stock placeholders on external CDNs — a licensing question as much as a
performance one. Meanwhile [public/anok-1.jpeg](public/anok-1.jpeg) sits unreferenced.

**F22. `npm run build` does not currently succeed.** The script is `tsc && vite build`, and
`tsc` exits 2 on three pre-existing type errors: two in `CollectionTilesPage` (deleted in M2)
and one in [TestimonialsPage.tsx:60](src/admin/pages/TestimonialsPage.tsx#L60), which drops
`sectionTag` from the saved document on every testimonials save. *Corrects an earlier claim
in this document that the build was clean — it was not.*

**Non-findings (checked, clean):** `dist/` and `.wrangler/` are correctly gitignored and
untracked. No unused npm dependencies — `lucide-react`, `react-router-dom`, `react` and
`react-dom` are all genuinely used. No commented-out code beyond F13.

---

## 4. Scores

| Dimension | Score | Reasoning |
|---|:---:|---|
| **Maintainability** | **4 / 10** | 41% of the code serves deleted features; two sources of truth; a 1,805-line stylesheet fighting inline styles; two 888/468-line files |
| **Scalability** | **6 / 10** | The context + repository shape is genuinely good and migration-ready. Held back only by living inside `src/admin/` and by the defaults file |
| **Correctness** | **3 / 10** | Five live user-facing defects, two of which (F1, F5) affect every mobile visitor and every enquiry |
| **Migration readiness** | **7 / 10** | Two functions to replace. Best-in-class for a project at this stage |

**Estimated dead/deletable code: ~3,100 lines (37%).**

---

## 5. Proposed roadmap

Each milestone compiles, is independently verifiable, and can be stopped at.

| # | Milestone | Scope | Risk |
|---|---|---|:---:|
| **M1** | **Extract the data layer** | Move `cms.types.ts`, `cmsStore.ts`, `useCmsData.ts` → `src/data/`. Move `SiteDataContext` + `useSiteData` out of `PublicSite.tsx` → `src/data/SiteDataProvider.tsx`. Update imports. *No behaviour change.* Fixes F8, F9 | Low |
| **M2** | **Delete the out-of-scope layer** | Remove `/products` + `/products/:id`, `ProductsPage`, `ProductDetailPage`, `Collection*`, `StatsBar`, `About.tsx`, `Testimonials.tsx`, 3 admin collection pages, their types, their JSON, their ~600 lines of CSS. Fixes F6, F13, F16, F17 | Med |
| **M3** | **Collapse to one source of truth** | Fold every default into `cms-data.json`, delete `cms.defaults.ts` and the 70-line merge. Move `productSizes` onto `featuredProduct`. Add real loading + error states. Fixes F7, F10, F11 | Med |
| **M4** | **Fix the live defects** | Mobile CTA, hero anchor, footer links, `#contact` collision, wire Contact page to the CMS. Fixes F1–F4, F14 | Low |
| **M5** | **Simplify the admin** | Drop to 4 pages (Dashboard, Settings, Product, Testimonials, SEO); split `GlobalSettingsPage`; drop legacy redirects; exclude `/admin` from the production build. Fixes F12, F17, F18, F19 | Med |
| **M6** | **Layout + styling consistency** | Layout route for Navbar/Footer; pull repeated inline styles into the existing CSS sections. Fixes F15, F20 | Med |
| **M7** | **Performance + QA** | Self-host/replace the hero video and product image; lazy-load; responsive + a11y pass; final build. Fixes F21 | Low |

**Recommended order:** M1 → M2 → M3 → M4 first. M1 before M2 means the deletions land in a
structure that is already correct. M4 could be pulled forward if the live defects are urgent.

---

## 6. Open question — blocking M4

**F5: the Contact and Newsletter forms accept input, tell the user it was received, and
discard it.** This is the one finding I cannot resolve from the codebase, because every fix
implies infrastructure that D2 (dev-only CMS, static deploy) does not currently provide.

Options, roughly in ascending cost:

1. **`mailto:` handoff** — the form opens the visitor's email client, prefilled. Zero
   infrastructure, works today on a static deploy. Feels dated and fails on machines with no
   mail client configured.
2. **WhatsApp handoff** — reuse the existing `useWhatsApp` hook and send enquiries to the
   brand's WhatsApp. Consistent with how the product CTA already works, and likely how this
   business actually receives orders. My recommendation if that is the case.
3. **Third-party form service** (Formspree, Web3Forms) — a real inbox, one `fetch`, free tier,
   no backend. ~30 minutes.
4. **A Cloudflare Worker route** that forwards to email — you are already deployed on
   Cloudflare Workers, so this is not far-fetched, but it reopens the infrastructure question
   D2 deliberately closed.
5. **Remove the forms** — replace both with the phone number, email and WhatsApp button.
   Honest, and arguably right for a one-product branding site.

The newsletter has the same problem plus a second one: there is nowhere to store subscribers.
Option 3 or 5 applies.

**Nothing else is blocked.** M1–M3 can start on approval.
