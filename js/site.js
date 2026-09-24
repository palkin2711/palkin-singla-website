document.documentElement.classList.add('js');

const toggle = document.querySelector('.menu-toggle');
const links = document.querySelector('.nav-links');

if (toggle && links) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-open', open);
  });
  links.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }));
}

document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

const dialog = document.querySelector('#proofModal');
const proofImage = dialog?.querySelector('img');
const proofTitle = dialog?.querySelector('[data-modal-title]');

document.querySelectorAll('[data-proof]').forEach(button => {
  button.addEventListener('click', () => {
    if (!dialog || !proofImage) return;
    proofImage.src = button.dataset.proof;
    proofImage.alt = `${button.dataset.name || 'Client'} testimonial proof`;
    if (proofTitle) proofTitle.textContent = `${button.dataset.name || 'Client'} — verified feedback`;
    dialog.showModal();
  });
});

dialog?.querySelector('[data-close-modal]')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', event => {
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
});

const reviewsGrid = document.querySelector('[data-review-grid]');
const reviewsToggle = document.querySelector('[data-reviews-toggle]');

reviewsToggle?.addEventListener('click', () => {
  if (!reviewsGrid) return;
  const expanded = reviewsGrid.classList.toggle('show-all');
  reviewsToggle.setAttribute('aria-expanded', String(expanded));
  reviewsToggle.textContent = expanded ? 'Show fewer reviews ↑' : 'View all reviews ↓';
});

const contactForm = document.querySelector('[data-contact-form]');
contactForm?.addEventListener('submit', event => {
  if (!contactForm.checkValidity()) {
    event.preventDefault();
    contactForm.reportValidity();
    return;
  }
  const button = contactForm.querySelector('button[type="submit"]');
  if (button) {
    button.disabled = true;
    button.textContent = 'Sending…';
  }
});

// Live Google / LinkedIn / Upwork feed (data is fetched server-side so secrets stay private).
const liveFeed = document.querySelector('[data-live-feed]');
const liveStatus = document.querySelector('[data-live-status]');

const sourceIcon = source => ({ Google: 'G', LinkedIn: 'in', Upwork: 'U' }[source] || '•');
const formatLiveDate = value => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', { day:'numeric', month:'short', year:'numeric' }).format(date);
};

function liveStatusPill(label, state) {
  const span = document.createElement('span');
  span.className = `live-pill ${state === 'connected' ? 'connected' : state === 'error' ? 'error' : ''}`;
  span.textContent = `${label}: ${state === 'connected' ? 'Live' : state === 'error' ? 'Check connection' : 'Pending setup'}`;
  return span;
}

function makeLiveCard(item) {
  const article = document.createElement('article');
  article.className = 'live-card';

  const head = document.createElement('div');
  head.className = 'live-card-head';
  const source = document.createElement('span');
  source.className = 'live-source';
  const icon = document.createElement('i');
  icon.textContent = sourceIcon(item.source);
  source.append(icon, document.createTextNode(item.source || 'Update'));
  head.append(source);

  if (item.rating) {
    const rating = document.createElement('span');
    rating.className = 'live-rating';
    const rounded = Math.max(0, Math.min(5, Math.round(Number(item.rating))));
    rating.textContent = `${'★'.repeat(rounded)}${'☆'.repeat(5-rounded)}`;
    rating.setAttribute('aria-label', `${item.rating} out of 5`);
    head.append(rating);
  }

  const quote = document.createElement('blockquote');
  quote.textContent = item.text || '';

  const foot = document.createElement('div');
  foot.className = 'live-card-foot';
  const info = document.createElement('div');
  const author = document.createElement('strong');
  author.textContent = item.author || (item.kind === 'post' ? 'Palkin Singla' : 'Client review');
  info.append(author);
  const dateText = formatLiveDate(item.date);
  if (dateText) {
    const time = document.createElement('time');
    time.dateTime = item.date;
    time.textContent = dateText;
    info.append(time);
  }
  foot.append(info);

  if (item.url) {
    const link = document.createElement('a');
    link.href = item.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'View source ↗';
    foot.append(link);
  }

  article.append(head, quote, foot);
  return article;
}

async function loadLiveFeed() {
  if (!liveFeed) return;
  try {
    const response = await fetch('/.netlify/functions/live-feed', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Feed returned ${response.status}`);
    const data = await response.json();

    if (liveStatus) {
      liveStatus.replaceChildren(
        liveStatusPill('Google', data.sources?.google),
        liveStatusPill('LinkedIn', data.sources?.linkedin),
        liveStatusPill('Upwork', data.sources?.upwork)
      );
    }

    liveFeed.replaceChildren();
    if (Array.isArray(data.items) && data.items.length) {
      data.items.slice(0, 9).forEach(item => liveFeed.append(makeLiveCard(item)));
    } else {
      const empty = document.createElement('div');
      empty.className = 'live-empty';
      const strong = document.createElement('strong');
      strong.textContent = 'Live sync is installed and ready.';
      const message = document.createElement('span');
      message.textContent = ' Add the platform API credentials in Netlify to start showing new reviews and posts automatically.';
      empty.append(strong, message);
      liveFeed.append(empty);
    }
  } catch (error) {
    if (liveStatus) liveStatus.replaceChildren(liveStatusPill('Live feed', 'error'));
    liveFeed.replaceChildren();
    const empty = document.createElement('div');
    empty.className = 'live-empty';
    empty.innerHTML = '<strong>Live updates are temporarily unavailable.</strong><span>The verified reviews above are still available.</span>';
    liveFeed.append(empty);
  }
}

loadLiveFeed();
