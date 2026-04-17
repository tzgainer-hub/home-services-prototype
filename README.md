# Home Services Prototype

**Point Zero AI — Vertical #2: Premium Websites for Home Services**

Sister project to [dental-prototype](../dental-prototype). Built for homeowners, not patients — basement/foundation/waterproofing, HVAC, plumbing, roofing, concrete, electrical, pest control, etc.

First demo client: **Basement Repair Specialists** (Appleton, WI).

---

## Local development

```bash
cd "/Users/thomaszgainer/Desktop/home-services-prototype"
npm install
npm start
```

Open http://localhost:3000

---

## Deploy to Railway

1. Create a new GitHub repo: `home-services-prototype`
2. Push this directory to it:
   ```bash
   cd "/Users/thomaszgainer/Desktop/home-services-prototype"
   git init
   git add .
   git commit -m "initial — basement repair specialists demo"
   git branch -M main
   git remote add origin https://github.com/tzgainer-hub/home-services-prototype.git
   git push -u origin main
   ```
3. In Railway: New Project → Deploy from GitHub → pick the repo.
4. Set environment variables (see below).
5. Railway gives you a live URL in ~60 seconds.

---

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `GMAIL_USER` | Optional | Gmail address that sends lead/confirmation emails |
| `GMAIL_APP_PASSWORD` | Optional | 16-char Gmail app password |
| `LEAD_INBOX` | Optional | Where lead notifications go (default: onboarding@pointzeroai.com) |
| `GHL_WEBHOOK_URL` | Optional | GoHighLevel inbound webhook — forwards leads to GHL for automations |
| `PORT` | Auto | Railway sets this |

Without any env vars, the site still runs — estimate form just returns `ok` without sending email. Add email/GHL creds when the client is live.

---

## Cloning this template for the next home services client

1. Copy this directory to `/Users/thomaszgainer/Desktop/[client-slug]-site/`
2. Global find-and-replace:
   - Practice name → new company name
   - Phone numbers (topbar, nav, footer, mobile sticky, tel: links)
   - Address(es)
   - Service list (currently 5 basement/foundation services)
   - Service area (currently Wisconsin)
   - Awards (currently BBB Torch 2025)
   - Testimonial names/cities
   - `<title>` tags and meta descriptions
3. Swap colors only if the client's brand demands it. The Trusted Trade palette in `styles.css` works for virtually every home services vertical.
4. Push to a new GitHub repo → Railway auto-deploy.

See `CLAUDE.md` for the full design system, content rules, and hero formula.

---

## File structure

```
home-services-prototype/
├── index.html           ← Homepage
├── services.html        ← All services overview
├── about.html           ← Company story + BBB Torch Award
├── estimate.html        ← Free estimate lead capture
├── hub.html             ← Tom's internal closer toolkit
├── styles.css           ← Design system (Trusted Trade palette)
├── server.js            ← Express + lead capture + GHL webhook hook
├── package.json
├── CLAUDE.md            ← Project instructions (read first)
└── README.md            ← This file
```

---

## Live URL

_To be set after first Railway deploy._

## GitHub

_To be set — suggested: `https://github.com/tzgainer-hub/home-services-prototype.git`_
