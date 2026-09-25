
(() => {
  const dialog = document.querySelector('[data-lightbox]');
  const dialogImg = dialog?.querySelector('img');
  document.querySelectorAll('[data-proof-src]').forEach(button => {
    button.addEventListener('click', () => {
      if (!dialog || !dialogImg) return;
      dialogImg.src = button.dataset.proofSrc;
      dialogImg.alt = button.dataset.proofAlt || 'Portfolio proof';
      if (typeof dialog.showModal === 'function') dialog.showModal();
    });
  });
  dialog?.querySelector('button')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const contentCards = [...document.querySelectorAll('[data-category]')];
  filterButtons.forEach(btn => btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    contentCards.forEach(card => card.hidden = filter !== 'all' && card.dataset.category !== filter);
  }));
})();
