document.querySelectorAll('[data-proof]').forEach(btn=>{btn.addEventListener('click',()=>{const box=document.querySelector('.lightbox');if(!box)return;const img=box.querySelector('img');if(img){img.src=btn.dataset.proof||btn.dataset.proofSrc||'';img.alt=btn.dataset.alt||btn.dataset.proofAlt||'Case study proof screenshot';}box.classList.add('open');});});
const lb=document.querySelector('.lightbox');
lb?.addEventListener('click',e=>{if(e.target===lb||e.target.matches('button'))lb.classList.remove('open');});
document.addEventListener('keydown',e=>{if(e.key==='Escape')lb?.classList.remove('open');});
