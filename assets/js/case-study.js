// Google Ads case-study pages
const genericProofButtons=[...document.querySelectorAll('body:not(.meta-case-study-detail) [data-proof]')];
genericProofButtons.forEach(btn=>{btn.addEventListener('click',()=>{const box=document.querySelector('.lightbox');if(!box)return;const img=box.querySelector('img');if(!img)return;img.src=btn.dataset.proof;img.alt=btn.dataset.alt||'Case study proof screenshot';box.classList.add('open');box.setAttribute('aria-hidden','false')})});
const genericLightbox=document.querySelector('body:not(.meta-case-study-detail) .lightbox');
genericLightbox?.addEventListener('click',e=>{if(e.target===genericLightbox||e.target.matches('button')){genericLightbox.classList.remove('open');genericLightbox.setAttribute('aria-hidden','true')}});
// Existing Meta Ads detail pages
document.querySelectorAll('.meta-case-study-detail [data-proof]').forEach(btn=>{btn.addEventListener('click',()=>{const box=document.querySelector('.meta-case-study-detail .lightbox');if(!box)return;const img=box.querySelector('img');img.src=btn.dataset.proof;img.alt=btn.dataset.alt||'Case study proof screenshot';box.classList.add('open');box.setAttribute('aria-hidden','false')})});
const metaLightbox=document.querySelector('.meta-case-study-detail .lightbox');
metaLightbox?.addEventListener('click',e=>{if(e.target===metaLightbox||e.target.matches('button')){metaLightbox.classList.remove('open');metaLightbox.setAttribute('aria-hidden','true')}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){[genericLightbox,metaLightbox].forEach(box=>{if(box?.classList.contains('open')){box.classList.remove('open');box.setAttribute('aria-hidden','true')}})}});
// Keep static <details> menus usable on standalone case-study pages.
document.querySelectorAll('.nav-section-dropdown').forEach(d=>{d.addEventListener('toggle',()=>{if(d.open)document.querySelectorAll('.nav-section-dropdown').forEach(o=>{if(o!==d)o.open=false})})});
document.addEventListener('click',e=>{document.querySelectorAll('.nav-section-dropdown[open]').forEach(d=>{if(!d.contains(e.target))d.open=false})});
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
