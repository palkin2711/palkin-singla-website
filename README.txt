This patch forces automatic feature covers for existing and future blog posts.

Default behavior:
- Blog feature image is automatically generated from <title> + category.
- Legacy og:image tags in source blog HTML no longer override the automatic cover.
- If you intentionally want a custom cover for one article, add:
  <meta name="feature-image" content="https://example.com/custom-image.jpg">

Existing Google Ads blog is included so its feature image regenerates immediately.
