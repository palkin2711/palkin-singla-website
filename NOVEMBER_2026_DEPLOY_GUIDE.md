# November 2026 SEO Blog Schedule — Deployment Guide

Eight individually written articles are stored in `blog-posts/`. Each has a future publication date, 1,500+ editorial words, a featured SVG cover generated in `assets/blog-covers/`, article metadata, FAQs, sources, contextual service links, and crosslinks between posts.

## Scheduled publication

- 13 Nov — How to Rank in ChatGPT, Google AI Overviews & Perplexity
- 16 Nov — Why Your Meta Ads Get Clicks but No Sales
- 18 Nov — Black Friday Marketing Strategy 2026
- 20 Nov — Performance Max vs Search Campaigns
- 23 Nov — Black Friday Retargeting Strategy
- 25 Nov — How to Track Leads Using GA4, GTM and UTMs
- 27 Nov — Google Ads vs Meta Ads for Small Businesses
- 30 Nov — Digital Marketing Strategy for 2027

The blog build uses `BLOG_PUBLISH_DATE` (otherwise the build server's date) to exclude articles whose dates have not arrived. The GitHub Actions workflow `.github/workflows/publish-scheduled-blogs.yml` triggers a small commit on these November dates at approximately **08:05 India time**, allowing a GitHub-connected Netlify project to rebuild. GitHub Actions cron jobs can run late; verify that GitHub Actions are enabled, Netlify auto-deploy is active, and the workflow is on the default branch. These are not guaranteed-to-the-minute releases.

**Important:** Schedule is stored in code, not activated on the public website until these files are committed and pushed to the linked repository. To avoid revealing all posts at once, do not set `BLOG_PUBLISH_DATE` to a future date on Netlify. Dates are the intended publication dates, not a promise of automatic indexing.

## Updating only affected files in GitHub Desktop

1. Make a backup of the existing repository.
2. Extract the *changed files only* ZIP and copy its folder contents into the repository root (where `blog-posts`, `assets`, `scripts` and `.github` are located). Merge folders; do not nest a new parent directory. Do not delete `.git`.
3. Check GitHub Desktop Changes, then commit and **Push origin**. Verify Netlify deployment.
4. For the first scheduled date, check that `/blog/` and the new article appear. Later dates follow the same process, with no manual edit required if the automation is working.

## Quality checks and limitations

- Articles contain suggested target keywords, not claimed search-volume or difficulty metrics.
- Source links are to official/help pages or established date sources; third-party platforms may require login or change paths.
- All eight featured SVG images are included. The builder uses them as article and social preview artwork. SVG display support in social previews can vary by platform; convert to PNG/JPG for networks that require raster thumbnails.
- The additional illustrations listed in `NOVEMBER_2026_BLOG_PLAN.json` are **suggestions**, not supplied image files.
- Source articles are noindex, to avoid duplicate indexing; generated `/blog/<slug>/` pages are indexable once published.
- Cross-links to future articles are displayed as plain text until their destinations are published. Links become clickable at the next scheduled rebuild.
- This package is **not** deployed to your live Netlify account. Verify published URLs, event tracking, canonical URLs and layout after push.
