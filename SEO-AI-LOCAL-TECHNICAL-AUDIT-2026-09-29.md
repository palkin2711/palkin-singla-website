# SEO / AI Search / Local SEO / Technical SEO Audit
Date: 2026-09-29
Site: https://palkin-singla.netlify.app/

## What was already strong
- Clean canonical URL structure with 301 redirects from legacy `.html` and old portfolio URLs.
- Indexable public pages already include unique title tags, meta descriptions, canonical tags, Open Graph, Twitter cards, one H1, and JSON-LD.
- `robots.txt` allows the public site and points to the XML sitemap.
- `sitemap.xml` is valid XML and includes core services, portfolios, case studies, blog/category pages and contact/about pages.
- `llms.txt` already provides an AI-readable entity/service/case-study index with explicit citation guidance.
- Homepage already used Person + ProfessionalService + WebSite + FAQ structured data.
- Strong internal linking between services, portfolios and case studies.
- Public-site local link audit found 0 broken internal links/assets.
- Netlify redirects consolidate legacy URL variants.
- Security headers and HTTPS/HSTS support are present.

## Fixes applied
### Homepage/footer
- Replaced the homepage footer with the same full shared footer used by inner pages.
- This removes the visual/content inconsistency between the homepage and the rest of the site.

### Local SEO
- Updated the homepage title to explicitly include Ambala, India.
- Updated the homepage meta description to include Ambala, Haryana while retaining India/worldwide positioning.
- Enriched ProfessionalService structured data with Google Business Profile map/profile URL, contact email and ContactPoint.
- Expanded sameAs entity links to LinkedIn, Facebook, X, GitHub, Blogger and Google Business Profile.
- Added Person homeLocation for Ambala, Haryana, India.

### AI SEO / GEO
- Preserved the existing `llms.txt`, which is already a strong AI-retrieval layer.
- Strengthened entity consistency between homepage schema and the social/public profile URLs already documented in `llms.txt`.
- Kept case-study metric guidance explicit so AI systems do not merge unrelated client/project metrics.

### Technical SEO
- Verified all 71 public/indexable HTML pages have: title, description, canonical, one H1, OG title/description/image, Twitter card and JSON-LD.
- Verified 0 broken local links/assets across public HTML pages.
- Verified XML sitemap parses correctly.
- Kept `/blog-posts/` intentionally excluded because these are source/template files; public built posts live under `/blog/`.
- Unified conflicting asset cache rules in `_headers` and `netlify.toml` to 7-day caching. This avoids stale non-hashed assets while retaining useful caching.

## Notes / recommended after deployment
- Resubmit `sitemap.xml` in Google Search Console after deploying the updated package.
- Re-run Rich Results / Schema Validator on homepage, services and a representative case study.
- Check Google Business Profile NAP consistency with website contact details.
- Monitor Core Web Vitals in Search Console after deployment; field data can only be validated on the live site.
- Keep adding first-party case studies, author expertise and dated useful blog content; these support both classic SEO and AI search visibility.
