document.documentElement.classList.add('js');

const toggle = document.querySelector('.menu-toggle');
const links = document.querySelector('.nav-links');

const serviceDropdown = document.querySelector('[data-services-menu]');
const serviceDropdownToggle = serviceDropdown?.querySelector('.nav-dropdown-toggle');

serviceDropdownToggle?.addEventListener('click', event => {
  event.stopPropagation();
  const open = serviceDropdown.classList.toggle('open');
  serviceDropdownToggle.setAttribute('aria-expanded', String(open));
});

document.addEventListener('click', event => {
  if (!serviceDropdown || serviceDropdown.contains(event.target)) return;
  serviceDropdown.classList.remove('open');
  serviceDropdownToggle?.setAttribute('aria-expanded', 'false');
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  serviceDropdown?.classList.remove('open');
  serviceDropdownToggle?.setAttribute('aria-expanded', 'false');
});

const currentPath = window.location.pathname;
if (currentPath.startsWith('/services/')) serviceDropdown?.classList.add('is-current');
document.querySelectorAll('.nav-links > a').forEach(a => {
  const href = a.getAttribute('href');
  if (!href || href === '/') return;
  if (currentPath === href || (href !== '/blog/' && currentPath.startsWith(href) && href.length > 1)) a.setAttribute('aria-current','page');
});


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
