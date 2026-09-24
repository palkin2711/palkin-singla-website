import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'blog-posts');
const outputDir = path.join(root, 'blog');
const indexPath = path.join(root, 'index.html');
const sitemapPath = path.join(root, 'sitemap.xml');
const siteUrl = 'https://palkin-singla.netlify.app';

const START = '<!-- BLOG-LATEST-START -->';
const END = '<!-- BLOG-LATEST-END -->';

// Categories mirror the services/portfolio already present on the website.
const CATEGORY_DEFS = [
  { name: 'Google Ads', slug: 'google-ads', keywords: ['google ads', 'google adwords', 'ppc', 'paid search', 'search ads', 'performance max', 'pmax', 'shopping ads'] },
  { name: 'Meta Ads', slug: 'meta-ads', keywords: ['meta ads', 'facebook ads', 'instagram ads', 'facebook advertising', 'instagram advertising'] },
  { name: 'SEO', slug: 'seo', keywords: ['seo', 'search engine optimization', 'organic search', 'keyword research', 'technical seo', 'local seo', 'google business profile', 'gmb'] },
  { name: 'Social Media', slug: 'social-media', keywords: ['social media', 'smm', 'social media marketing', 'instagram content', 'facebook content', 'content calendar'] },
  { name: 'LinkedIn Ads', slug: 'linkedin-ads', keywords: ['linkedin ads', 'linkedin advertising', 'linkedin campaign'] },
  { name: 'TikTok Ads', slug: 'tiktok-ads', keywords: ['tiktok ads', 'tiktok advertising', 'tiktok campaign'] },
  { name: 'Email Marketing', slug: 'email-marketing', keywords: ['email marketing', 'klaviyo', 'mailchimp', 'email automation', 'email campaign'] },
  { name: 'Content Writing', slug: 'content-writing', keywords: ['content writing', 'blog writing', 'copywriting', 'content strategy', 'blog content'] },
  { name: 'Website Design', slug: 'website-design', keywords: ['website design', 'web design', 'ui ux', 'ui/ux', 'landing page design'] },
  { name: 'Website Development', slug: 'website-development', keywords: ['website development', 'web development', 'wordpress', 'shopify', 'wix', 'html css', 'frontend development'] },
  { name: 'Digital Marketing', slug: 'digital-marketing', keywords: [] }
];

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const stripTags = (value = '') => String(value)
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const getMeta = (html, key, attr = 'name') => {
  const rx1 = new RegExp(`<meta[^>]+${attr}=["']${key}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i');
  const rx2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+${attr}=["']${key}["'][^>]*>`, 'i');
  return (html.match(rx1)?.[1] || html.match(rx2)?.[1] || '').trim();
};

const getTitle = html => (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/\s+/g, ' ').trim();
const getBody = html => html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1]?.trim() || html.trim();
const getFirstImage = html => html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || '';

const slugify = name => name
  .replace(/\.html?$/i, '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const normalizeImage = value => {
  if (!value) return '';
  if (/^(https?:|data:)/i.test(value)) return value;
  if (value.startsWith('/')) return value;
  return `/${value.replace(/^\.\//, '')}`;
};

const toIsoDate = value => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};

const formatDate = value => {
  if (!value) return '';
  const d = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(d);
};

const categoryByName = value => {
  const normalized = String(value || '').trim().toLowerCase();
  return CATEGORY_DEFS.find(category => category.name.toLowerCase() === normalized || category.slug === slugify(normalized));
};

const inferCategory = (html, file, title) => {
  const explicit = getMeta(html, 'category') || getMeta(html, 'article:section', 'property');
  if (explicit) return categoryByName(explicit) || { name: explicit.trim(), slug: slugify(explicit.trim()), keywords: [] };
  const haystack = `${file} ${title} ${stripTags(getBody(html))}`.toLowerCase();
  return CATEGORY_DEFS.find(category => category.keywords.some(keyword => haystack.includes(keyword))) || CATEGORY_DEFS.at(-1);
};

const safeArticleBody = value => String(value)
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<link[^>]+rel=["']?stylesheet["']?[^>]*>/gi, '')
  .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
  // Remove designer inline colours/fonts so every uploaded post inherits the portfolio theme.
  .replace(/\sstyle\s*=\s*["'][^"']*["']/gi, '');

const categoryLink = category => `/blog/category/${category.slug}/`;

const categoryBadge = category => `<a class="blog-category-badge" href="${categoryLink(category)}">${escapeHtml(category.name)}</a>`;

const cardHtml = (post, compact = false) => `
  <article class="blog-card${compact ? ' blog-card-compact' : ''}" data-category="${escapeHtml(post.categorySlug)}">
    <a class="blog-card-image${post.image ? '' : ' blog-card-image-empty'}" href="${post.url}" aria-label="Read ${escapeHtml(post.title)}">
      ${post.image ? `<img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" loading="lazy">` : '<span>PS</span>'}
    </a>
    <div class="blog-card-copy">
      <div class="blog-card-topline">${categoryBadge({ name: post.category, slug: post.categorySlug })}<span class="blog-card-date">${post.date ? `<time datetime="${post.date}">${escapeHtml(formatDate(post.date))}</time>` : 'Insights'}</span></div>
      <h3><a href="${post.url}">${escapeHtml(post.title)}</a></h3>
      ${post.description ? `<p>${escapeHtml(post.description)}</p>` : ''}
      <a class="blog-read" href="${post.url}">Read article →</a>
    </div>
  </article>`;

const categoriesHtml = (posts, activeSlug = '') => {
  const counts = new Map(CATEGORY_DEFS.map(category => [category.slug, 0]));
  posts.forEach(post => counts.set(post.categorySlug, (counts.get(post.categorySlug) || 0) + 1));
  const allActive = !activeSlug ? ' is-active' : '';
  return `<nav class="blog-categories" aria-label="Blog categories">
    <a class="blog-category-chip${allActive}" href="/blog/">All <span>${posts.length}</span></a>
    ${CATEGORY_DEFS.map(category => `<a class="blog-category-chip${activeSlug === category.slug ? ' is-active' : ''}" href="${categoryLink(category)}">${escapeHtml(category.name)} <span>${counts.get(category.slug) || 0}</span></a>`).join('\n    ')}
  </nav>`;
};

function pageShell({ title, description, canonical, content, image = '', ogType = 'website', robots = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' }) {
  return `<!doctype html>
<html lang="en-IN">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="${robots}">
  <meta name="theme-color" content="#0d0d18"><link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:type" content="${ogType}"><meta property="og:url" content="${canonical}">${image ? `<meta property="og:image" content="${escapeHtml(image.startsWith('http') ? image : siteUrl + image)}">` : ''}
  <link rel="stylesheet" href="/assets/css/site.css">
</head>
<body>
  <header class="site-header"><div class="container nav-wrap">
    <a class="brand" href="/" aria-label="Palkin Singla home"><span class="brand-mark">PS</span><span>Palkin Singla<small>Digital growth strategist</small></span></a>
    <nav class="nav-links" aria-label="Primary navigation"><a href="/#about">About</a><a href="/#services">Services</a><a href="/#work">Case Studies</a><a href="/#portfolio">Portfolio</a><a href="/#testimonials">Reviews</a><a href="/blog/" aria-current="page">Blog</a><a href="/#contact">Contact</a></nav>
    <a class="nav-cta" href="/#contact">Start a project →</a><button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false">☰</button>
  </div></header>
  ${content}
  <footer class="site-footer"><div class="container footer-row"><span>© <span data-year></span> Palkin Singla. Built for meaningful growth.</span><nav class="footer-links"><a href="/assets/docs/Palkin_Singla_Resume_2026.pdf">Résumé</a><a href="/blog/">Blog</a><a href="/#portfolio">Portfolio</a><a href="/#contact">Contact</a></nav></div></footer>
  <script src="/assets/js/site.js" defer></script>
</body>
</html>`;
}

fs.mkdirSync(sourceDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });

const files = fs.readdirSync(sourceDir)
  .filter(file => /\.html?$/i.test(file) && !file.startsWith('_'));

const posts = files.map(file => {
  const full = path.join(sourceDir, file);
  const html = fs.readFileSync(full, 'utf8');
  const stat = fs.statSync(full);
  const slug = slugify(file);
  const body = getBody(html);
  const title = getTitle(html) || stripTags(body).slice(0, 70) || 'Untitled article';
  const description = getMeta(html, 'description') || stripTags(body).slice(0, 165);
  const image = normalizeImage(getMeta(html, 'og:image', 'property') || getMeta(html, 'feature-image') || getFirstImage(body));
  const date = toIsoDate(getMeta(html, 'date') || stat.mtime.toISOString());
  const category = inferCategory(html, file, title);
  return { file, slug, title, description, image, date, category: category.name, categorySlug: category.slug, body, url: `/blog/${slug}/` };
}).sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.title.localeCompare(b.title));

// Remove old generated post/category directories but keep the blog root files.
for (const entry of fs.readdirSync(outputDir, { withFileTypes: true })) {
  if (entry.isDirectory()) fs.rmSync(path.join(outputDir, entry.name), { recursive: true, force: true });
}

for (const post of posts) {
  const dir = path.join(outputDir, post.slug);
  fs.mkdirSync(dir, { recursive: true });
  const safeBody = safeArticleBody(post.body);
  const article = `<main class="blog-post-main">
    <article class="container blog-article">
      <div class="blog-breadcrumbs"><a href="/blog/">Blog</a><span>›</span><a href="${categoryLink({ slug: post.categorySlug })}">${escapeHtml(post.category)}</a></div>
      <header class="blog-article-head">
        ${categoryBadge({ name: post.category, slug: post.categorySlug })}
        <h1>${escapeHtml(post.title)}</h1>
        <div class="blog-meta">${post.date ? `<time datetime="${post.date}">${escapeHtml(formatDate(post.date))}</time> · ` : ''}By Palkin Singla</div>
        ${post.description ? `<p class="blog-article-deck">${escapeHtml(post.description)}</p>` : ''}
      </header>
      ${post.image ? `<figure class="blog-feature"><img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}"></figure>` : ''}
      <div class="blog-content">${safeBody}</div>
      <aside class="blog-article-cta"><span class="eyebrow">Need help with ${escapeHtml(post.category)}?</span><h2>Turn the strategy into measurable growth.</h2><p>Share your website, target market and current challenge. I’ll review the brief and suggest the most practical next step.</p><a class="btn btn-primary" href="/#contact">Discuss your project →</a></aside>
      <div class="blog-author-box"><div class="brand-mark">PS</div><div><strong>Palkin Singla</strong><p>Digital marketing specialist focused on paid media, SEO, content and conversion-led growth.</p></div></div>
    </article>
  </main>`;
  fs.writeFileSync(path.join(dir, 'index.html'), pageShell({
    title: `${post.title} | Palkin Singla`,
    description: post.description,
    canonical: `${siteUrl}${post.url}`,
    image: post.image,
    ogType: 'article',
    content: article
  }));
}

const blogCards = posts.length
  ? `<div class="blog-grid">${posts.map(post => cardHtml(post)).join('\n')}</div>`
  : `<div class="blog-empty"><strong>No articles published yet.</strong><p>Add an HTML file inside <code>blog-posts/</code>. The next Netlify build will automatically style it in this website theme and place it in the correct category.</p></div>`;

const blogPage = pageShell({
  title: 'Digital Marketing Insights | Palkin Singla',
  description: 'Practical insights on Google Ads, Meta Ads, SEO, social media, LinkedIn Ads, TikTok Ads, email marketing, content and websites from Palkin Singla.',
  canonical: `${siteUrl}/blog/`,
  content: `<main class="blog-main">
    <section class="section blog-hero"><div class="container"><span class="eyebrow">Blog & insights</span><h1 class="section-title">Practical ideas for better digital growth.</h1><p class="section-lead">Browse insights by the same specialist areas featured across my portfolio.</p>${categoriesHtml(posts)}</div></section>
    <section class="section white"><div class="container"><div class="blog-list-head"><div><span class="eyebrow">All articles</span><h2>Latest from the blog</h2></div><p>${posts.length} published article${posts.length === 1 ? '' : 's'}</p></div>${blogCards}</div></section>
  </main>`
});
fs.writeFileSync(path.join(outputDir, 'index.html'), blogPage);
fs.writeFileSync(path.join(outputDir, 'posts.json'), JSON.stringify(posts.map(({ body, ...rest }) => rest), null, 2));

// Generate service-aligned category landing pages automatically.
const categoryRoot = path.join(outputDir, 'category');
for (const category of CATEGORY_DEFS) {
  const categoryPosts = posts.filter(post => post.categorySlug === category.slug);
  const dir = path.join(categoryRoot, category.slug);
  fs.mkdirSync(dir, { recursive: true });
  const cards = categoryPosts.length
    ? `<div class="blog-grid">${categoryPosts.map(post => cardHtml(post)).join('\n')}</div>`
    : `<div class="blog-empty"><strong>No ${escapeHtml(category.name)} articles yet.</strong><p>When you upload a matching HTML post, it will appear here automatically.</p></div>`;
  const categoryPage = pageShell({
    title: `${category.name} Insights | Palkin Singla`,
    description: `Articles and practical insights about ${category.name} from Palkin Singla.`,
    canonical: `${siteUrl}${categoryLink(category)}`,
    robots: categoryPosts.length ? 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' : 'noindex,follow',
    content: `<main class="blog-main">
      <section class="section blog-hero blog-category-hero"><div class="container"><div class="blog-breadcrumbs"><a href="/blog/">Blog</a><span>›</span><span>${escapeHtml(category.name)}</span></div><span class="eyebrow">Blog category</span><h1 class="section-title">${escapeHtml(category.name)}</h1><p class="section-lead">Articles, tests and practical lessons focused on ${escapeHtml(category.name)}.</p>${categoriesHtml(posts, category.slug)}</div></section>
      <section class="section white"><div class="container"><div class="blog-list-head"><div><span class="eyebrow">${escapeHtml(category.name)}</span><h2>${categoryPosts.length ? 'Latest articles' : 'Category ready'}</h2></div><p>${categoryPosts.length} article${categoryPosts.length === 1 ? '' : 's'}</p></div>${cards}</div></section>
    </main>`
  });
  fs.writeFileSync(path.join(dir, 'index.html'), categoryPage);
}

// Refresh the home-page latest-insights section.
if (fs.existsSync(indexPath)) {
  let home = fs.readFileSync(indexPath, 'utf8');
  const latest = posts.slice(0, 3);
  const section = `${START}
    <section class="section soft" id="insights"><div class="container">
      <div class="section-head"><div><span class="eyebrow">Latest insights</span><h2 class="section-title">Fresh notes on smarter digital growth.</h2></div><div><p class="section-lead">New HTML articles inherit the website design automatically and are organized into service-based categories.</p><p><a class="btn btn-secondary" href="/blog/">View all articles →</a></p></div></div>
      ${latest.length ? `<div class="blog-grid blog-grid-home">${latest.map(post => cardHtml(post, true)).join('\n')}</div>` : '<div class="blog-empty"><strong>Blog is ready.</strong><p>Your first article will appear here automatically after you add it to <code>blog-posts/</code>.</p></div>'}
    </div></section>
${END}`;
  const markerRx = new RegExp(`${START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
  if (markerRx.test(home)) home = home.replace(markerRx, section);
  else home = home.replace(/\s*<section class="section" id="faq">/, `\n${section}\n\n    <section class="section" id="faq">`);
  fs.writeFileSync(indexPath, home);
}

// Rebuild sitemap with current blog/article/category URLs while keeping existing non-blog entries.
if (fs.existsSync(sitemapPath)) {
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  sitemap = sitemap.replace(/\s*<!-- BLOG-SITEMAP-START -->[\s\S]*?<!-- BLOG-SITEMAP-END -->/g, '');
  sitemap = sitemap.replace(/\s*<url><loc>https:\/\/palkin-singla\.netlify\.app\/blog\/[\s\S]*?<\/url>/g, '');
  const today = new Date().toISOString().slice(0,10);
  const blogUrls = [
    `  <url><loc>${siteUrl}/blog/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
    ...CATEGORY_DEFS.filter(category => posts.some(post => post.categorySlug === category.slug)).map(category => `  <url><loc>${siteUrl}${categoryLink(category)}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`),
    ...posts.map(post => `  <url><loc>${siteUrl}${post.url}</loc><lastmod>${post.date || today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`)
  ].join('\n');
  sitemap = sitemap.replace('</urlset>', `  <!-- BLOG-SITEMAP-START -->\n${blogUrls}\n  <!-- BLOG-SITEMAP-END -->\n</urlset>`);
  fs.writeFileSync(sitemapPath, sitemap);
}

console.log(`Blog build complete: ${posts.length} published post(s), ${CATEGORY_DEFS.length} category page(s).`);
