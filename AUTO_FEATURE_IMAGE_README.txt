AUTOMATIC BLOG FEATURE IMAGE SYSTEM

After this patch is installed, future blog posts do NOT need a feature image.

For every new HTML file in blog-posts/:
1. Update <title>.
2. Update <meta name="category">.
3. Write/paste the article content.
4. Commit to GitHub.

Netlify will automatically build a 1600x900 branded feature image using:
- Blog category
- Blog title
- Palkin Singla name/photo
- Consistent blue/white brand styling
- A different illustration/icon based on the selected category

Generated covers are saved automatically under:
/assets/blog-covers/<blog-slug>.svg

Supported categories:
Google Ads
Meta Ads
SEO
Social Media
LinkedIn Ads
TikTok Ads
Email Marketing
Content Writing
Website Design
Website Development
Digital Marketing

CUSTOM IMAGE OPTION
If you ever want a custom feature image for one specific blog, add this line in <head>:
<meta property="og:image" content="YOUR-IMAGE-URL">
That custom image will override the automatic template for that one article.
