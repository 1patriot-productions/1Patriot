# Ritzie Custom Designs — Customer Website

Polished, free, static customer-facing site for **Ritzie Custom Designs** (owned by Jen Ritzie).

Mobile-first, craft-forward design with sticky navigation, service filters, **customer-facing pricing**, Free-with-purchase AI Design callout, parties/events section with a simple party estimator, gallery placeholders, and an interactive quote form (`mailto:` + copyable success message).

## What’s included

- `index.html` — full marketing site (services, pricing, parties, quote form)
- `styles.css` — responsive styles
- `script.js` — nav, filters, party estimator, form validation & mailto/success UX
- `assets/` — SVG logo and illustrations (no external image CDNs)
- This `README.md`

## Pricing (on the site)

Starting prices are shown on service cards, in a dedicated **Pricing** section, and in the quote form dropdown. Highlights:

- T-shirts from **$15** (or **2 for $25**); uniforms from **$18**/shirt
- Parties / events from **$10 per person** + optional add-ons
- AI designs: **Free with purchase**
- Crafts, keepsakes, coloring books, décor, and soundtrack packages — see the Pricing section

## Open locally

1. Download or clone the files.
2. Open `index.html` in any modern browser (double-click, or drag into Chrome / Safari / Firefox).
3. No build step or server required.

Optional local server (nice for testing links):

```bash
# Python 3
python3 -m http.server 8080

# then visit http://localhost:8080
```

## Upload to GitHub (`1Patriot` repo)

Repo: [https://github.com/1patriot-productionz/1Patriot](https://github.com/1patriot-productionz/1Patriot)

These files are meant to sit at the **repo root** (so `index.html` replaces any stub).

### Option A — GitHub web UI

1. Open the repo on GitHub.
2. Upload `index.html`, `styles.css`, `script.js`, `README.md`, and the `assets/` folder to the root of the default branch (`main`).
3. Commit the changes.

### Option B — Git command line

```bash
git clone https://github.com/1patriot-productionz/1Patriot.git
cd 1Patriot
# Copy this site’s files into the repo root (overwrite stub index.html)
cp -R /path/to/ritzie-custom-designs/* .
git add index.html styles.css script.js README.md assets
git commit -m "Add Ritzie Custom Designs customer website with pricing"
git push origin main
```

## Enable GitHub Pages

1. On GitHub, open the repo → **Settings** → **Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Choose branch **`main`** and folder **`/ (root)`**.
4. Save. After a minute or two, the site will be live at the Pages URL GitHub shows (often `https://1patriot-productionz.github.io/1Patriot/`).

## Before you go live

- Replace `YOUR-EMAIL@example.com` in `index.html` and `script.js` with Jen’s real email.
- Replace `(XXX) XXX-XXXX` with a real phone number (or remove the phone lines).
- Swap gallery placeholders for real photos when ready.

## Contact form behavior

The quote form validates name, email, service, and message client-side. Service options include priced labels. On submit it opens a `mailto:` draft to the placeholder address and shows a success panel with a copyable message for backup.

## License / ownership

Site content and branding for Ritzie Custom Designs / Jen Ritzie. Built as a free static site with no paid APIs.
