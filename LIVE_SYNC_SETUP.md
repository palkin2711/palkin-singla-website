# Palkin Singla Website — Live Sync & Blog Setup

The site package already contains the front-end feed, Netlify Function, and automatic blog builder. The only remaining work for live third-party data is authorizing the official APIs and adding their credentials to Netlify Environment Variables.

## 1. One-time Netlify / Git setup (required for one-file blog publishing)

1. Put this website folder in a private or public GitHub/GitLab repository.
2. In Netlify: Site configuration → Build & deploy → Continuous deployment → Link repository.
3. Build command: `npm run build`
4. Publish directory: `.`
5. Functions directory is already set in `netlify.toml`.
6. Deploy once. After this, every commit/upload to the repository triggers a new live deploy automatically.

Important: a manual Netlify drag-and-drop ZIP deploy does not run the build command. For the "upload one HTML file and it appears automatically" workflow, the site must be connected to Git.

## 2. Publishing a blog post

1. Open the `blog-posts` folder in the repository.
2. Copy `_template.html`, rename it (example: `google-ads-lead-quality-guide.html`) and edit the content.
3. Upload/commit that one HTML file.
4. Netlify builds automatically and creates:
   - `/blog/` card with feature image, title, date, excerpt
   - `/blog/<file-name>/` full article page
   - homepage "Latest insights" cards
   - updated `sitemap.xml`

Required metadata in each post:

```html
<title>Your Blog Post Title</title>
<meta name="description" content="Short description">
<meta name="date" content="2026-09-24">
<meta property="og:image" content="https://.../feature-image.jpg">
```

For a true one-file workflow, use a full HTTPS image URL in `og:image`. A local image path also works, but the image file must then be uploaded too.

## 3. Google Business Profile reviews — automatic

Add these Netlify Environment Variables:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_BUSINESS_ACCOUNT_ID` (numeric ID or `accounts/...`)
- `GOOGLE_BUSINESS_LOCATION_ID` (numeric ID or `locations/...`)
- `GOOGLE_BUSINESS_PUBLIC_URL` (optional, your public Google profile/review URL)

The Google Cloud project must have Business Profile API access and OAuth authorization for the Business Profile account. The function reads the official `accounts.locations.reviews.list` endpoint.

## 4. LinkedIn posts — automatic when API access is approved

Add:

- `LINKEDIN_ACCESS_TOKEN`
- `LINKEDIN_AUTHOR_URN` (format: `urn:li:person:...`)
- `LINKEDIN_API_VERSION` (optional; default in code is `202609`)
- `LINKEDIN_PROFILE_URL` (optional)

LinkedIn requires the restricted `r_member_social` permission to retrieve personal-member posts. Because that permission is approval-gated, the website cannot bypass it. The integration is already coded and will start displaying posts once an approved token is supplied.

LinkedIn profile *recommendations* are not treated as a public automatic feed here; your existing verified LinkedIn recommendations stay in the static Reviews section. This avoids unsupported scraping and keeps the setup stable.

## 5. Upwork feedback — automatic when API access is approved

Add:

- `UPWORK_CLIENT_ID`
- `UPWORK_CLIENT_SECRET`
- `UPWORK_REFRESH_TOKEN`
- `UPWORK_PERSON_ID`
- `UPWORK_TENANT_ID` (only if required for your app)
- `UPWORK_PROFILE_URL` (optional)

The Upwork app must have the `Talent Workhistory - Read Only Access` permission. The function uses the official GraphQL `talentWorkHistory` query and shows public client feedback.

## 6. Where to add Netlify variables

Netlify dashboard → Site configuration → Environment variables → Add a variable. Add only secrets there; never paste access tokens into HTML or JavaScript files. Redeploy after adding/changing variables.

## 7. Test URLs

- Blog: `/blog/`
- Live data endpoint: `/.netlify/functions/live-feed`
- Home page live section: `/#live-updates`

If a source is not configured, the page remains usable and shows a clean "connection pending" state while the existing verified reviews remain visible.
