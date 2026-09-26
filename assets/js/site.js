document.documentElement.classList.add('js');

const nav = document.querySelector('.nav-links');
const toggle = document.querySelector('.menu-toggle');
const serviceDropdown = document.querySelector('[data-services-menu]');
const serviceToggle = serviceDropdown?.querySelector('.nav-dropdown-toggle');
const sectionDropdowns = [...document.querySelectorAll('.nav-section-dropdown')];
let serviceCloseTimer;

function closeServices(){
  if(!serviceDropdown || !serviceToggle) return;
  serviceDropdown.classList.remove('open');
  serviceToggle.setAttribute('aria-expanded','false');
}
function openServices(){
  if(!serviceDropdown || !serviceToggle) return;
  clearTimeout(serviceCloseTimer);
  serviceDropdown.classList.add('open');
  serviceToggle.setAttribute('aria-expanded','true');
}
function closeSections(except=null){ sectionDropdowns.forEach(d=>{ if(d!==except) d.open=false; }); }

serviceToggle?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();serviceDropdown.classList.contains('open')?closeServices():openServices();});
serviceToggle?.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();openServices();serviceDropdown?.querySelector('.nav-dropdown-menu a')?.focus();}});
serviceDropdown?.addEventListener('mouseenter',()=>{if(matchMedia('(min-width:1001px)').matches)openServices();});
serviceDropdown?.addEventListener('mouseleave',()=>{if(matchMedia('(min-width:1001px)').matches)serviceCloseTimer=setTimeout(closeServices,220);});
serviceDropdown?.addEventListener('focusin',openServices);

sectionDropdowns.forEach(d=>d.addEventListener('toggle',()=>{if(d.open){closeServices();closeSections(d);}}));
document.addEventListener('click',e=>{if(serviceDropdown && !serviceDropdown.contains(e.target))closeServices();sectionDropdowns.forEach(d=>{if(d.open&&!d.contains(e.target))d.open=false;});});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeServices();closeSections();nav?.classList.remove('open');document.body.classList.remove('nav-open');toggle?.setAttribute('aria-expanded','false');}});

if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));document.body.classList.toggle('nav-open',open);if(!open){closeServices();closeSections();}});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');document.body.classList.remove('nav-open');toggle.setAttribute('aria-expanded','false');closeServices();closeSections();}));}

const currentPath=location.pathname;
const normalize=p=>p.endsWith('/index.html')?p.replace(/index\.html$/,''):p;
const path=normalize(currentPath);
if(path.startsWith('/services/'))serviceDropdown?.classList.add('is-current');
sectionDropdowns.forEach(d=>{if(d.classList.contains('case-studies-dropdown')&&path.startsWith('/case-studies/'))d.classList.add('is-current');if(d.classList.contains('portfolio-dropdown')&&(path==='/portfolio/'||/_portfolio\.html$/.test(path)))d.classList.add('is-current');});
document.querySelectorAll('.nav-links>a').forEach(a=>{const href=a.getAttribute('href');if(!href||href==='/')return;if(path===href||(href!=='/blog/'&&path.startsWith(href)&&href.length>1))a.setAttribute('aria-current','page');});

// Small site-wide utilities.
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
const dialog=document.querySelector('#proofModal');
const proofImage=dialog?.querySelector('img');
const proofTitle=dialog?.querySelector('[data-modal-title]');
document.querySelectorAll('[data-proof]').forEach(button=>button.addEventListener('click',()=>{if(!dialog||!proofImage)return;proofImage.src=button.dataset.proof;proofImage.alt=`${button.dataset.name||'Client'} testimonial proof`;if(proofTitle)proofTitle.textContent=`${button.dataset.name||'Client'} — verified feedback`;dialog.showModal();}));
dialog?.querySelector('[data-close-modal]')?.addEventListener('click',()=>dialog.close());
dialog?.addEventListener('click',e=>{const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();});
const reviewsGrid=document.querySelector('[data-review-grid]');
const reviewsToggle=document.querySelector('[data-reviews-toggle]');
reviewsToggle?.addEventListener('click',()=>{if(!reviewsGrid)return;const expanded=reviewsGrid.classList.toggle('show-all');reviewsToggle.setAttribute('aria-expanded',String(expanded));reviewsToggle.textContent=expanded?'Show fewer reviews ↑':'View all reviews ↓';});
const contactForm=document.querySelector('[data-contact-form]');
contactForm?.addEventListener('submit',e=>{if(!contactForm.checkValidity()){e.preventDefault();contactForm.reportValidity();return;}const b=contactForm.querySelector('button[type="submit"]');if(b){b.disabled=true;b.textContent='Sending…';}});
