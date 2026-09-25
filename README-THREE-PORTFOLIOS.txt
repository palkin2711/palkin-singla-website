THREE PORTFOLIO PAGES — REBUILT FROM SCRATCH

This patch replaces only:
- google_ads_portfolio.html
- meta_ads_portfolio.html
- content_writing_portfolio.html

It also adds a new isolated stylesheet, lightbox/filter JS, and static SVG charts.
No existing shared site CSS or other portfolio pages are overwritten.

Why this is safer:
- Google/Meta charts are static SVG assets, so they do not depend on Chart.js.
- Meta campaign numbering is written directly into HTML.
- Proof images use object-fit: contain and open in a lightbox.
- Content Writing is a fully new Drive-based portfolio page, not an edit of the old layout.

Deploy:
1. Extract ZIP.
2. Paste files/folders into your local palkin-singla-website repository.
3. Replace the three HTML files when prompted.
4. Commit: Rebuild Google Meta and Content portfolios
5. Push origin.
