# Point Zero AI — Home Services Prototype
## CLAUDE.md — Project Instructions

Read this file completely before doing any work in this project.

---

## What This Is

**Premium Websites for Home Services** — Point Zero AI vertical #2.

Sister product to [dental-prototype](../dental-prototype) (Vertical #1: White Coat Websites).

**Audience:** Home services business owners — basement/foundation, HVAC, plumbing, roofing, concrete, electrical, pest control. Honest, straight-talking people. NOT ego-driven like dentists.

**Tom's insight (April 2026):** "Hundreds of home services clients from my 401(k) book. They tend to be honest, straight-talking good people without the big egos of dentists. They will LOVE this."

**First demo client:** Basement Repair Specialists — Appleton, WI. Real business, $6M revenue, 2025 BBB Torch Award Winner, trademarked motto "A Great Job. At a Great Price.®"

---

## Pricing (Fixed — Do Not Modify Without Tom's Approval)

Same as dental:
- **Option A:** $1,599 one-time + $149/month hosting (1 revision round)
- **Option B:** $2,500 flat — 12 months hosting + 3 revision rounds, then $149/month (LEAD WITH THIS)

---

## Stack

- Static HTML + vanilla CSS + vanilla JS
- Node.js / Express server (`server.js`) for form submission → email + GoHighLevel webhook
- Zero-dependency static preview server (`preview-server.js`) for local design work
- Deploy: Railway (auto-deploy on push to `main`)
- Local path: `/Users/thomaszgainer/Desktop/home-services-prototype/`

---

## Design System — "The Trusted Trade" (Do Not Deviate)

**Different from dental on purpose.** Dental = luxury, calming, serif-heavy. Home services = strong, honest, trade-grounded.

### Colors
```css
--slate:         #0f1e3a    /* Primary — trust, strength, foundation */
--slate-dark:    #0a1527    /* Topbar, footer */
--slate-mid:     #1e3456    /* Gradient partner */
--steel:         #2563eb    /* Confidence accent — eyebrows, icons */
--orange:        #ea6a1f    /* CTA — safety/urgency, warm not aggressive */
--green:         #15803d    /* Trust — BBB, guarantees, verified */
--amber:         #f59e0b    /* Caution — emergency notices */
```

### Typography
- **Headlines:** `Outfit` (strong, modern sans — matches PointZeroAI umbrella brand)
- **Body:** `Inter`
- **NEVER use:** Cormorant Garamond, Playfair Display (those are dental-only)

### Hero Formula
**[Action/Outcome] + [Trust Signal]**
Not luxury poetry like dental. Direct. For Basement Repair Specialists, we used their trademarked motto as hero: "A Great Job. *At a Great Price.*®"

Other good patterns:
- "[Problem Type] Solved. *The Honest Way.*"
- "[Local Area]'s [Trust Signal]. *[Service Category] Done Right.*"

---

## SEO Checklist — Required on Every Build (Added April 18, 2026)

Every site we ship must include all of these. No exceptions.

### Per-Page Requirements
- [ ] **Title tag** — unique, under 60 chars, primary keyword + location + brand
- [ ] **Meta description** — unique, under 160 chars, compelling, includes CTA language
- [ ] **Canonical URL** — `<link rel="canonical" href="...">`
- [ ] **Open Graph tags** — og:type, og:title, og:description, og:url, og:image (1200x630)
- [ ] **Twitter card tags** — twitter:card, twitter:title, twitter:description, twitter:image
- [ ] **Exactly one H1** — keyword-rich, matches page intent
- [ ] **Logical H2/H3 hierarchy** — sections use H2, subsections use H3
- [ ] **Image alt tags** — descriptive, keyword-relevant where natural
- [ ] **All phone numbers use `tel:` links**
- [ ] **NAP consistency** — name, address, phone identical on every page

### Site-Wide Requirements
- [ ] **JSON-LD schema** — `HomeAndConstructionBusiness` (or `LocalBusiness` / `MedicalBusiness` for white coat) with address, phone, rating, award, founding date
- [ ] **robots.txt** — allow all, disallow hub.html, point to sitemap
- [ ] **sitemap.xml** — all public pages with lastmod dates and priority
- [ ] **Favicon** — linked on every page
- [ ] **Mobile viewport meta** — `width=device-width, initial-scale=1.0`
- [ ] **Semantic HTML** — proper nav, section, footer elements
- [ ] **Internal linking** — every page linked from nav + footer
- [ ] **Google Maps link or embed** — for service area / location pages
- [ ] **External trust links** — BBB profile, Google reviews, social profiles in footer

### Performance
- [ ] **Font preconnect** — `<link rel="preconnect" href="https://fonts.googleapis.com">`
- [ ] **Images in WebP** where possible
- [ ] **Scripts at bottom** of body (not in head)
- [ ] **CSS in single external file** (not inline in HTML)

---

## File Structure

```
home-services-prototype/
├── index.html           ← Homepage — hero, promise, services, proof, process, reviews, area, CTA
├── services.html        ← All services with detail rows (waterproofing, foundation, crawl space, egress, finishing, drainage)
├── about.html           ← Story + BBB Torch Award story + values + community
├── estimate.html        ← Free estimate lead capture form (posts to /api/estimate)
├── hub.html             ← Internal closer toolkit (pricing, talking points, next verticals)
├── styles.css           ← Full design system — NEVER inline styles in HTML pages
├── server.js            ← Express — static files + /api/estimate (email + GHL webhook)
├── preview-server.js    ← Zero-dep static server for local preview
├── package.json
├── CLAUDE.md            ← This file
└── README.md            ← Deploy + clone instructions
```

---

## Automations / GoHighLevel Integration

The estimate form POSTs to `/api/estimate` which:
1. Forwards to `GHL_WEBHOOK_URL` (if env var set) — triggers text-back, pipeline, etc. in GoHighLevel
2. Emails lead notification to `LEAD_INBOX`
3. Emails confirmation to the homeowner

**Tom's plan:** Configure GHL in a separate conversation once his 30-day trial is activated. The site is already wired to send leads — just flip the env var.

---

## Content Rules — Absolute

1. **Real data only.** No placeholder phones, no fake addresses, no invented testimonials. If real data isn't available, use clearly-marked `[PLACEHOLDER]`.
2. **Trust signals are everything in home services.** BBB rating, years in business, "locally owned," licensed/insured, transferable warranty — pack the topbar, nav, hero trust row, and footer with these.
3. **Never use emoji as design elements.** Inline SVG only.
4. **Every nav item is a real page.** No anchor-link-only navigation.
5. **Phone number is sacred.** Must be clickable `tel:` everywhere it appears — topbar, nav, hero, service cards, CTA bands, footer, mobile sticky bar.
6. **Written quotes, not "contact us."** Homeowner CTAs are always "Get My Free Estimate," never "Request Information."
7. **No agency fluff.** "Innovative solutions," "cutting-edge," "world-class" — banned. Write like a tradesperson who happens to be good at copy.
8. **Google Map is mandatory on the homepage** (added 2026-04-22). Every site gets a `.find-us` section with an embedded Google Maps iframe + address + clickable phone + "Get Directions" button, placed just before the CTA band. This is a trust signal + local SEO requirement. Only skip if the client explicitly says no.

---

## Cloning This Template For The Next Vertical

When a new home services client is onboarded:

1. Copy this directory: `cp -r home-services-prototype [client-slug]-site`
2. Find-and-replace:
   - Practice/company name (e.g., "Basement Repair Specialists")
   - Motto/tagline
   - Phone number (all `tel:` links + display text)
   - Address
   - Services (swap waterproofing/foundation/etc. for HVAC services, plumbing services, etc.)
   - Service area cities
   - Award (replace "2025 BBB Torch Award" with whatever they actually have)
   - Testimonial cities
   - Hero photo (if adding real imagery)
3. Adjust colors ONLY if the client's brand demands it — the Trusted Trade palette works for every home services vertical.
4. Push to a new GitHub repo → Railway auto-deploys.

---

## Vertical-Specific Adaptations

| Vertical | Services | Trust Signals | Urgency Hook |
|---|---|---|---|
| Basement/Foundation | Waterproofing, Foundation, Crawl Space, Egress, Finishing, Drainage | BBB, Transferable Warranty, Licensed | "Water in the basement doesn't fix itself" |
| HVAC | AC install, Furnace, Heat Pump, Duct Cleaning, Tune-up, Indoor Air | NATE Cert, Manufacturer Dealers, 24/7 | "Broken AC in July. Broken furnace in January." |
| Plumbing | Water Heater, Sewer, Drain, Leak Detection, Bath Remodel, Emergency | Master Plumber License, Bonded, 24/7 | "Water where it shouldn't be" |
| Roofing | Storm Repair, Replacement, Gutters, Inspection, Skylights | GAF/Owens Cert, Insurance claim experience | "One bad storm from a bigger bill" |
| Concrete | Driveways, Patios, Walkways, Lifting, Staining, Repair | Years in business, Photo portfolio | "Cracks don't shrink" |
| Electrical | Panel upgrades, Rewiring, EV Chargers, Generators, Lighting | Master Electrician License, Bonded | "Old wiring is a fire waiting" |
| Pest Control | General Pest, Termite, Rodent, Mosquito, Quarterly Plans | State License, Family/Pet Safe | "They're only getting comfortable" |

---

## Tom's Closer Playbook (for `hub.html`)

**Opening line:** "Your current site does the job — but it doesn't look like a company that just won the 2025 BBB Torch Award. We build sites that look like you paid $20,000, for a fraction of that, in about two weeks."

**Hook:** "I built this demo for your business specifically. Click around. Tell me what you want changed."

**Close:** "$2,500 flat. Three revisions. 12 months hosting. GoHighLevel set up for automatic text-back on every lead. 10-14 day turnaround."

**Objection — 'I already have a site':** "Yours works. This converts. A homeowner looking at basement/HVAC/plumbing help is stressed — they pick the company that looks the most trustworthy. That's what this solves."

---

## Common Mistakes — Never Do These

1. **Don't use dental fonts.** Cormorant Garamond and Playfair Display are dental-only. Home services uses Outfit + Inter.
2. **Don't soften the CTAs.** "Request Information" is dental. Home services says "Get My Free Estimate" and "Call Now."
3. **Don't forget the mobile sticky bar.** Call + Estimate + Text on mobile — top conversion driver.
4. **Don't inline styles.** All CSS in `styles.css`. Page-specific tweaks go in a `<style>` block at page top ONLY if needed for unique layouts (see services.html, about.html).
5. **Don't invent trust signals.** If the client doesn't have a BBB Torch Award, don't claim one. Use their real awards.
6. **Don't skip the transferable warranty language.** In home services, this is a massive differentiator and a huge trust signal.
7. **Don't run `npm install` without fixing the cache.** Tom's `~/.npm` has root-owned files. Fix: `sudo chown -R 501:20 ~/.npm`. Or use `preview-server.js` which needs zero dependencies.

---

## Reference: Basement Repair Specialists Demo

- **Company:** Basement Repair Specialists LLC
- **Founded:** 1999
- **HQ:** 1400 S Van Dyke Rd, Appleton, WI 54914
- **Phone:** (855) 554-7246
- **Trademark:** "A Great Job. At a Great Price.®" (registered 2014)
- **Award:** 2025 BBB Torch Award for Ethics Winner
- **Service area:** All of Wisconsin
- **Real site:** basementrepairspecialists.com

---

*Last updated: April 17, 2026 — Initial build. Vertical #2 launched. Template ready for HVAC, plumbing, roofing, concrete, electrical, pest control.*
*Point Zero AI · onboarding@pointzeroai.com*
