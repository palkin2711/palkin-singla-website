
// Unified portfolio interactions.
(() => {
  const filters=[...document.querySelectorAll('[data-content-filter]')];
  const pieces=[...document.querySelectorAll('[data-content-category]')];
  filters.forEach(btn=>btn.addEventListener('click',()=>{
    const category=btn.dataset.contentFilter;
    filters.forEach(b=>b.classList.toggle('active',b===btn));
    pieces.forEach(piece=>{piece.hidden=category!=='All' && piece.dataset.contentCategory!==category;});
  }));

  const detailMenus=[...document.querySelectorAll('.nav-section-dropdown')];
  detailMenus.forEach(menu=>menu.addEventListener('toggle',()=>{
    if(!menu.open)return;
    detailMenus.forEach(other=>{if(other!==menu)other.open=false;});
  }));
  document.addEventListener('click',e=>detailMenus.forEach(menu=>{if(menu.open&&!menu.contains(e.target))menu.open=false;}));
})();
