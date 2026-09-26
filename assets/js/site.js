document.documentElement.classList.add('js');

const toggle = document.querySelector('.menu-toggle');
const links = document.querySelector('.nav-links');

const serviceDropdown = document.querySelector('[data-services-menu]');
const serviceDropdownToggle = serviceDropdown?.querySelector('.nav-dropdown-toggle');

let serviceCloseTimer;

const setServiceMenu = open => {
  if (!serviceDropdown || !serviceDropdownToggle) return;
  window.clearTimeout(serviceCloseTimer);
  serviceDropdown.classList.toggle('open', open);
  serviceDropdownToggle.setAttribute('aria-expanded', String(open));
};

serviceDropdownToggle?.addEventListener('click', event => {
  event.preventDefault();
  event.stopPropagation();
  setServiceMenu(!serviceDropdown.classList.contains('open'));
});

serviceDropdownToggle?.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    setServiceMenu(true);
    serviceDropdown?.querySelector('.nav-dropdown-menu a')?.focus();
  }
});

serviceDropdown?.addEventListener('mouseenter', () => {
  if (window.matchMedia('(min-width: 1001px)').matches) setServiceMenu(true);
});

serviceDropdown?.addEventListener('mouseleave', () => {
  if (!window.matchMedia('(min-width: 1001px)').matches) return;
  serviceCloseTimer = window.setTimeout(() => setServiceMenu(false), 260);
});

serviceDropdown?.addEventListener('focusin', () => setServiceMenu(true));

document.addEventListener('click', event => {
  if (!serviceDropdown || serviceDropdown.contains(event.target)) return;
  setServiceMenu(false);
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  setServiceMenu(false);
  serviceDropdownToggle?.focus();
});

const currentPath = window.location.pathname;
if (currentPath.startsWith('/services/')) serviceDropdown?.classList.add('is-current');
document.querySelectorAll('.nav-links > a').forEach(a => {
  const href = a.getAttribute('href');
  if (!href || href === '/') return;
  if (currentPath === href || (href !== '/blog/' && currentPath.startsWith(href) && href.length > 1)) a.setAttribute('aria-current','page');
});


// Build/refresh the Case Studies dropdown across every page without replacing page content.
const ensureCaseStudiesDropdown = () => {
  if (!links) return null;
  let dropdown = links.querySelector('.case-studies-dropdown');
  const menuMarkup = `
    <a class="nav-section-all" href="/case-studies/"><strong>All Case Studies</strong><small>View the complete section</small></a>
    <a href="/case-studies/google-ads/"><strong>Google Ads Case Studies</strong></a>
    <a href="/case-studies/meta-ads/"><strong>Meta Ads Case Studies</strong></a>
    <a href="/case-studies/linkedin-ads/"><strong>LinkedIn Ads Case Studies</strong></a>`;
  if (dropdown) {
    const menu = dropdown.querySelector('.nav-section-menu');
    if (menu) menu.innerHTML = menuMarkup;
  } else {
    const anchor = [...links.querySelectorAll(':scope > a')].find(a => a.getAttribute('href') === '/case-studies/');
    if (anchor) {
      const wrapper = document.createElement('details');
      wrapper.className = 'nav-section-dropdown case-studies-dropdown';
      wrapper.innerHTML = `<summary>Case Studies<span aria-hidden="true">⌄</span></summary><div class="nav-section-menu">${menuMarkup}</div>`;
      anchor.replaceWith(wrapper);
      dropdown = wrapper;
    }
  }
  if (window.location.pathname.startsWith('/case-studies/')) dropdown?.classList.add('is-current');
  return dropdown;
};
const caseStudiesDropdown = ensureCaseStudiesDropdown();


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


// Keep Case Studies / Portfolio dropdowns easy to use.
const sectionDropdowns = [...document.querySelectorAll('.nav-section-dropdown')];
sectionDropdowns.forEach(dropdown => {
  dropdown.addEventListener('toggle', () => {
    if (!dropdown.open) return;
    sectionDropdowns.forEach(other => {
      if (other !== dropdown) other.open = false;
    });
  });
});
document.addEventListener('click', event => {
  sectionDropdowns.forEach(dropdown => {
    if (dropdown.open && !dropdown.contains(event.target)) dropdown.open = false;
  });
});
