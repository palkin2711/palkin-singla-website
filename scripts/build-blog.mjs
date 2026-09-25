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
const assetVersion = '20260924-cover2';

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


const escapeXml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const wrapCoverTitle = (title = '') => {
  const words = String(title).trim().split(/\s+/).filter(Boolean);
  const targetChars = title.length > 72 ? 18 : title.length > 55 ? 20 : 22;
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > targetChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  while (lines.length > 6) {
    lines[lines.length - 2] = `${lines[lines.length - 2]} ${lines.at(-1)}`;
    lines.pop();
  }
  return lines;
};

const categoryIconSvg = (slug, x = 0, y = 0) => {
  const common = `transform="translate(${x} ${y})" stroke="#1264f5" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const icons = {
    'google-ads': `<g ${common}><path d="M20 108 L74 22 L128 108"/><circle cx="20" cy="108" r="15" fill="#23a455" stroke="none"/><circle cx="128" cy="108" r="15" fill="#f7b529" stroke="none"/><path d="M75 22 L128 108" stroke="#4c79ff" stroke-width="26"/></g>`,
    'meta-ads': `<g ${common}><path d="M16 92 C42 34 66 32 84 76 C102 120 128 118 148 62"/><path d="M16 92 C42 150 66 150 84 106 C102 62 128 62 148 118"/></g>`,
    'seo': `<g ${common}><circle cx="66" cy="66" r="42"/><path d="M98 98 L146 146"/><path d="M48 68 L64 84 L91 49"/></g>`,
    'social-media': `<g ${common}><path d="M22 32 h122 v86 H76 l-34 26 8-26 H22z"/><path d="M52 76 h62"/><path d="M52 50 h76"/></g>`,
    'linkedin-ads': `<g ${common}><rect x="18" y="18" width="126" height="126" rx="20"/><circle cx="51" cy="53" r="10" fill="#1264f5" stroke="none"/><path d="M50 79 v42"/><path d="M80 79 v42 M80 98 c0-24 38-24 38 0 v23"/></g>`,
    'tiktok-ads': `<g ${common}><path d="M92 26 v72 a30 30 0 1 1-24-29"/><path d="M92 26 c12 25 30 35 50 36"/></g>`,
    'email-marketing': `<g ${common}><rect x="18" y="34" width="128" height="92" rx="14"/><path d="M22 46 l60 48 60-48"/></g>`,
    'content-writing': `<g ${common}><path d="M35 18 h75 l26 26 v104 H35z"/><path d="M110 18 v32 h30"/><path d="M58 76 h54 M58 101 h54 M58 126 h34"/></g>`,
    'website-design': `<g ${common}><rect x="15" y="28" width="136" height="112" rx="14"/><path d="M15 58 h136"/><circle cx="36" cy="43" r="5" fill="#1264f5" stroke="none"/><circle cx="54" cy="43" r="5" fill="#4c79ff" stroke="none"/><rect x="35" y="79" width="44" height="38" rx="6"/><path d="M94 80 h34 M94 98 h34 M94 116 h20"/></g>`,
    'website-development': `<g ${common}><path d="M58 48 L22 82 L58 116"/><path d="M106 48 L142 82 L106 116"/><path d="M92 28 L72 136"/></g>`,
    'digital-marketing': `<g ${common}><path d="M20 122 V84 h26 v38 M64 122 V60 h26 v62 M108 122 V34 h26 v88"/><path d="M18 44 C52 58 92 34 140 18"/><path d="M122 18 h18 v18"/></g>`
  };
  return icons[slug] || icons['digital-marketing'];
};

const getAuthorAvatarData = () => {
  const candidates = [
    path.join(root, 'assets', 'images', 'palkin-hero.jpg'),
    path.join(root, 'assets', 'images', 'palkin-office.jpg')
  ];
  const file = candidates.find(candidate => fs.existsSync(candidate));
  if (!file) return '';
  const ext = path.extname(file).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
};

const authorAvatarData = getAuthorAvatarData();

const generateAutoCover = post => {
  const coversDir = path.join(root, 'assets', 'blog-covers');
  fs.mkdirSync(coversDir, { recursive: true });
  const outputFile = path.join(coversDir, `${post.slug}.svg`);
  const lines = wrapCoverTitle(post.title);
  const fontSize = lines.length >= 6 ? 50 : lines.length === 5 ? 54 : lines.length === 4 ? 62 : lines.length === 3 ? 74 : 86;
  const lineHeight = Math.round(fontSize * 1.08);
  const startY = lines.length >= 6 ? 205 : lines.length === 5 ? 214 : lines.length === 4 ? 228 : 248;
  const titleSvg = lines.map((line, index) => {
    const fill = index === 1 ? '#1165f4' : '#0a214d';
    return `<text x="80" y="${startY + index * lineHeight}" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-weight="700" fill="${fill}">${escapeXml(line)}</text>`;
  }).join('');
  const category = escapeXml(post.category.toUpperCase());
  const avatar = authorAvatarData
    ? `<clipPath id="avatarClip"><circle cx="112" cy="790" r="38"/></clipPath><image href="${authorAvatarData}" x="74" y="752" width="76" height="76" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatarClip)"/>`
    : `<circle cx="112" cy="790" r="38" fill="#1165f4"/><text x="112" y="800" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="800" fill="#fff">PS</text>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(post.title)}</title>
  <desc id="desc">${escapeXml(post.category)} article by Palkin Singla</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.52" stop-color="#f8fbff"/><stop offset="1" stop-color="#d7e9ff"/></linearGradient>
    <linearGradient id="blue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d57f0"/><stop offset="1" stop-color="#69a8ff"/></linearGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#0d2b5e" flood-opacity="0.16"/></filter>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <circle cx="1250" cy="180" r="390" fill="#b8d6ff" opacity="0.62"/>
  <circle cx="1410" cy="660" r="360" fill="#6faeff" opacity="0.50"/>
  <circle cx="980" cy="820" r="260" fill="#d3e7ff" opacity="0.85"/>
  <g opacity="0.7">${Array.from({length: 24}, (_,i)=>`<circle cx="${1435 + (i%6)*24}" cy="${45 + Math.floor(i/6)*24}" r="5" fill="#77aaf4"/>`).join('')}</g>
  <rect x="80" y="96" width="${Math.max(236, category.length * 16 + 76)}" height="58" rx="29" fill="#dfeeff"/>
  <text x="112" y="134" font-family="Arial, sans-serif" font-size="28" font-weight="800" letter-spacing="3" fill="#123a77">${category}</text>
  ${titleSvg}
  <rect x="82" y="675" width="140" height="6" rx="3" fill="#1165f4"/>
  ${avatar}
  <text x="176" y="786" font-family="Arial, sans-serif" font-size="28" font-weight="800" fill="#0a214d">By Palkin Singla</text>
  <text x="176" y="820" font-family="Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="4" fill="#6e7c98">DIGITAL GROWTH STRATEGIST</text>

  <g filter="url(#shadow)">
    <rect x="840" y="250" width="610" height="420" rx="30" fill="#0d2449"/>
    <rect x="866" y="278" width="558" height="342" rx="18" fill="#f8fbff"/>
    <rect x="930" y="332" width="430" height="188" rx="18" fill="#ffffff" stroke="#dbe8fa" stroke-width="3"/>
    <path d="M972 486 C1030 448 1078 464 1122 420 C1170 372 1222 426 1288 354" fill="none" stroke="#1264f5" stroke-width="10" stroke-linecap="round"/>
    <g fill="#1264f5">${[0,1,2,3,4,5].map((n)=>`<circle cx="${972+n*63}" cy="${[486,458,464,420,425,354][n]}" r="9"/>`).join('')}</g>
    <g fill="#dfeaff">${[0,1,2,3,4].map((n)=>`<rect x="${975+n*78}" y="${540-n*16}" width="40" height="${48+n*16}" rx="6"/>`).join('')}</g>
    <path d="M780 676 H1510 L1430 752 H860 Z" fill="#cad9ea"/>
  </g>

  <g filter="url(#shadow)">
    <rect x="1110" y="120" width="270" height="160" rx="34" fill="#ffffff"/>
    ${categoryIconSvg(post.categorySlug, 1162, 132)}
  </g>
  <g filter="url(#shadow)">
    <rect x="1260" y="555" width="255" height="205" rx="34" fill="#ffffff"/>
    <path d="M1310 607 H1465 L1416 665 V713" fill="none" stroke="#1264f5" stroke-width="18" stroke-linejoin="round"/>
    <circle cx="1325" cy="722" r="18" fill="#1264f5"/><circle cx="1387" cy="722" r="24" fill="#1264f5"/><circle cx="1450" cy="722" r="18" fill="#1264f5"/>
  </g>
  <path d="M1410 420 C1488 394 1516 330 1540 270" fill="none" stroke="#3e8fff" stroke-width="16" stroke-linecap="round"/>
  <path d="M1516 284 L1542 266 L1546 300" fill="none" stroke="#3e8fff" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  fs.writeFileSync(outputFile, svg);
  return `/assets/blog-covers/${post.slug}.svg`;
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
  // The article shell creates the only H1. Remove any H1 supplied by a designer/template.
  .replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi, '')
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
  const countBadge = count => count > 0 ? ` <span>${count}</span>` : '';
  return `<nav class="blog-categories" aria-label="Blog categories">
    <a class="blog-category-chip${allActive}" href="/blog/">All${countBadge(posts.length)}</a>
    ${CATEGORY_DEFS.map(category => `<a class="blog-category-chip${activeSlug === category.slug ? ' is-active' : ''}" href="${categoryLink(category)}">${escapeHtml(category.name)}${countBadge(counts.get(category.slug) || 0)}</a>`).join('\n    ')}
  </nav>`;
};

function pageShell({ title, description, canonical, content, image = '', ogType = 'website', robots = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1', schema = null, published = '', modified = '', section = '' }) {
  const socialImage = image ? (image.startsWith('http') ? image : siteUrl + image) : `${siteUrl}/assets/images/palkin-hero.jpg`;
  const schemaHtml = schema ? `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>` : '';
  return `<!doctype html>
<html lang="en-IN">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="author" content="Palkin Singla">
  <meta name="robots" content="${robots}">
  <meta name="theme-color" content="#0d0d18">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="application-name" content="Palkin Singla">
  <meta name="apple-mobile-web-app-title" content="Palkin Singla">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${escapeHtml(socialImage)}">
  <meta property="og:image:alt" content="${escapeHtml(title)}">
  <meta property="og:site_name" content="Palkin Singla">
  <meta property="og:locale" content="en_IN">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(socialImage)}">
  ${published ? `<meta property="article:published_time" content="${published}">` : ''}
  ${modified ? `<meta property="article:modified_time" content="${modified}">` : ''}
  ${section ? `<meta property="article:section" content="${escapeHtml(section)}">` : ''}
  ${schemaHtml}
  <link rel="stylesheet" href="/assets/css/site.css?v=${assetVersion}">
</head>
<body>
  <header class="site-header"><div class="container nav-wrap">
    <a class="brand" href="/" aria-label="Palkin Singla home"><span class="brand-mark">PS</span><span>Palkin Singla<small>Digital growth strategist</small></span></a>
    <nav class="nav-links" aria-label="Primary navigation">
<a href="/about/">About</a>
<div class="nav-dropdown" data-services-menu>
<button class="nav-dropdown-toggle" type="button" aria-expanded="false">Services <span aria-hidden="true">⌄</span></button>
<div class="nav-dropdown-menu">
<a class="nav-all-services" href="/services/"><span class="nav-service-icon">✦</span><span><strong>All Services</strong><small>Explore every service</small></span></a>
<a href="/services/google-ads/"><span class="nav-service-icon">G</span><span>Google Ads</span></a><a href="/services/meta-ads/"><span class="nav-service-icon">M</span><span>Meta Ads</span></a><a href="/services/seo/"><span class="nav-service-icon">S</span><span>SEO</span></a><a href="/services/social-media-marketing/"><span class="nav-service-icon">↗</span><span>Social Media</span></a><a href="/services/linkedin-marketing/"><span class="nav-service-icon">Li</span><span>LinkedIn</span></a><a href="/services/tiktok-marketing/"><span class="nav-service-icon">T</span><span>TikTok</span></a><a href="/services/email-marketing/"><span class="nav-service-icon">@</span><span>Email Marketing</span></a><a href="/services/content-marketing/"><span class="nav-service-icon">✎</span><span>Content</span></a><a href="/services/website-design/"><span class="nav-service-icon">✦</span><span>Website Design</span></a><a href="/services/website-development/"><span class="nav-service-icon">&lt;/&gt;</span><span>Web Development</span></a>
</div>
</div>
<a href="/pricing/">Pricing</a>
<a href="/case-studies/">Case Studies</a><a href="/portfolio/">Portfolio</a><a href="/reviews/">Reviews</a><a href="/blog/">Blog</a><a href="/contact/">Contact</a>
</nav>
    <a class="nav-cta" href="/contact/">Start a project →</a><button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false">☰</button>
  </div></header>
  ${content}
  <footer class="site-footer"><div class="container footer-row"><span>© <span data-year></span> Palkin Singla. Built for meaningful growth.</span><nav class="footer-links" aria-label="Footer navigation"><a href="/about/">About</a><a href="/services/">Services</a><a href="/pricing/">Pricing</a><a href="/case-studies/">Case Studies</a><a href="/portfolio/">Portfolio</a><a href="/reviews/">Reviews</a><a href="/blog/">Blog</a><a href="/contact/">Contact</a><a href="/assets/docs/palkin_singla_resume_2026.pdf">Résumé</a></nav></div></footer>
  <script src="/assets/js/site.js?v=${assetVersion}" defer></script>
  <script src="/assets/js/analytics.js" defer></script>
</body>
</html>`;
}

fs.mkdirSync(sourceDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });

const files = fs.readdirSync(sourceDir)
  .filter(file => /\.html?$/i.test(file) && !file.startsWith('_'));

const publishDate = process.env.BLOG_PUBLISH_DATE || new Date().toISOString().slice(0, 10);

const posts = files.map(file => {
  const full = path.join(sourceDir, file);
  const html = fs.readFileSync(full, 'utf8');
  const stat = fs.statSync(full);
  const slug = slugify(file);
  const body = getBody(html);
  const title = getTitle(html) || stripTags(body).slice(0, 70) || 'Untitled article';
  const description = getMeta(html, 'description') || stripTags(body).slice(0, 165);
  const customImage = normalizeImage(getMeta(html, 'feature-image'));
  const date = toIsoDate(getMeta(html, 'date') || stat.mtime.toISOString());
  const modified = toIsoDate(getMeta(html, 'modified') || getMeta(html, 'date-modified') || date || stat.mtime.toISOString());
  const category = inferCategory(html, file, title);

  // Future-dated posts remain in /blog-posts but are not published until their date.
  if (date && date > publishDate) return null;

  const post = { file, slug, title, description, image: customImage, date, modified, category: category.name, categorySlug: category.slug, body, url: `/blog/${slug}/` };
  if (!post.image) post.image = generateAutoCover(post);
  return post;
}).filter(Boolean).sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.title.localeCompare(b.title));

// Remove old generated post/category directories but keep the blog root files.
for (const entry of fs.readdirSync(outputDir, { withFileTypes: true })) {
  if (entry.isDirectory()) fs.rmSync(path.join(outputDir, entry.name), { recursive: true, force: true });
}

const personId = `${siteUrl}/#person`;
const websiteId = `${siteUrl}/#website`;

const articleSchemaFor = post => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BlogPosting',
      '@id': `${siteUrl}${post.url}#article`,
      headline: post.title,
      description: post.description,
      image: post.image ? (post.image.startsWith('http') ? post.image : siteUrl + post.image) : `${siteUrl}/assets/images/palkin-hero.jpg`,
      datePublished: post.date,
      dateModified: post.modified || post.date,
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}${post.url}` },
      author: { '@type': 'Person', '@id': personId, name: 'Palkin Singla', url: siteUrl },
      publisher: { '@type': 'Person', '@id': personId, name: 'Palkin Singla', url: siteUrl },
      articleSection: post.category,
      inLanguage: 'en-IN',
      isPartOf: { '@id': websiteId }
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${siteUrl}${post.url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog/` },
        { '@type': 'ListItem', position: 3, name: post.category, item: `${siteUrl}${categoryLink({ slug: post.categorySlug })}` },
        { '@type': 'ListItem', position: 4, name: post.title, item: `${siteUrl}${post.url}` }
      ]
    }
  ]
});

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
      <aside class="blog-article-cta"><span class="eyebrow">Need help with ${escapeHtml(post.category)}?</span><h2>Turn the strategy into measurable growth.</h2><p>Share your website, target market and current challenge. I’ll review the brief and suggest the most practical next step.</p><a class="btn btn-primary" href="/contact/">Discuss your project →</a></aside>
      <div class="blog-author-box"><div class="brand-mark">PS</div><div><strong>Palkin Singla</strong><p>Digital marketing specialist focused on paid media, SEO, content and conversion-led growth.</p></div></div>
    </article>
  </main>`;
  fs.writeFileSync(path.join(dir, 'index.html'), pageShell({
    title: `${post.title} | Palkin Singla`,
    description: post.description,
    canonical: `${siteUrl}${post.url}`,
    image: post.image,
    ogType: 'article',
    published: post.date,
    modified: post.modified || post.date,
    section: post.category,
    schema: articleSchemaFor(post),
    content: article
  }));
}

const blogCards = posts.length
  ? `<div class="blog-grid">${posts.map(post => cardHtml(post)).join('\n')}</div>`
  : `<div class="blog-empty"><strong>New articles coming soon.</strong><p>Practical insights on paid media, SEO, social media, content and websites will be published here.</p></div>`;

const blogPage = pageShell({
  title: 'Digital Marketing Insights | Palkin Singla',
  description: 'Practical insights on Google Ads, Meta Ads, SEO, social media, LinkedIn Ads, TikTok Ads, email marketing, content and websites from Palkin Singla.',
  canonical: `${siteUrl}/blog/`,
  schema: { '@context': 'https://schema.org', '@type': 'Blog', '@id': `${siteUrl}/blog/#blog`, url: `${siteUrl}/blog/`, name: 'Digital Marketing Insights | Palkin Singla', description: 'Practical insights on Google Ads, Meta Ads, SEO, social media, email marketing, content and websites.', inLanguage: 'en-IN', author: { '@type': 'Person', '@id': personId, name: 'Palkin Singla', url: siteUrl } },
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
    : `<div class="blog-empty"><strong>${escapeHtml(category.name)} insights coming soon.</strong><p>New practical articles in this category will be published here.</p></div>`;
  const categoryPage = pageShell({
    title: `${category.name} Insights | Palkin Singla`,
    description: `Articles and practical insights about ${category.name} from Palkin Singla.`,
    canonical: `${siteUrl}${categoryLink(category)}`,
    schema: { '@context': 'https://schema.org', '@graph': [ { '@type': 'CollectionPage', '@id': `${siteUrl}${categoryLink(category)}#collection`, url: `${siteUrl}${categoryLink(category)}`, name: `${category.name} Insights | Palkin Singla`, description: `Articles and practical insights about ${category.name} from Palkin Singla.`, inLanguage: 'en-IN' }, { '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` }, { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog/` }, { '@type': 'ListItem', position: 3, name: category.name, item: `${siteUrl}${categoryLink(category)}` } ] } ] },
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
  const section = latest.length ? `${START}
    <section class="section soft" id="insights"><div class="container">
      <div class="section-head"><div><span class="eyebrow">Latest insights</span><h2 class="section-title">Fresh notes on smarter digital growth.</h2></div><div><p class="section-lead">Practical lessons from paid media, SEO, content and conversion-focused digital work.</p><p><a class="btn btn-secondary" href="/blog/">View all articles →</a></p></div></div>
      <div class="blog-grid blog-grid-home">${latest.map(post => cardHtml(post, true)).join('\n')}</div>
    </div></section>
${END}` : `${START}${END}`;
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
