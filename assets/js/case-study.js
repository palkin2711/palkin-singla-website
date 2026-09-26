
document.querySelectorAll('.meta-case-study-detail [data-proof]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const box=document.querySelector('.meta-case-study-detail .lightbox');
    if(!box) return;
    const img=box.querySelector('img');
    img.src=btn.dataset.proof;
    img.alt=btn.dataset.alt||'Case study proof screenshot';
    box.classList.add('open');
    box.setAttribute('aria-hidden','false');
  });
});
const csLightbox=document.querySelector('.meta-case-study-detail .lightbox');
csLightbox?.addEventListener('click',e=>{if(e.target===csLightbox||e.target.matches('button')){csLightbox.classList.remove('open');csLightbox.setAttribute('aria-hidden','true')}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&csLightbox?.classList.contains('open')){csLightbox.classList.remove('open');csLightbox.setAttribute('aria-hidden','true')}});
