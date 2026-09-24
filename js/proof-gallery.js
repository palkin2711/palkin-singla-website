(() => {
  const triggers = [...document.querySelectorAll('[data-proof]')];
  if (!triggers.length || !('HTMLDialogElement' in window)) return;

  const dialog = document.createElement('dialog');
  dialog.id = 'caseProofDialog';
  dialog.setAttribute('aria-labelledby', 'caseProofTitle');
  dialog.innerHTML = `
    <div class="proof-dialog-head">
      <h2 class="proof-dialog-title" id="caseProofTitle"></h2>
      <span class="proof-dialog-counter" aria-live="polite"></span>
      <button class="proof-dialog-close" type="button" aria-label="Close proof viewer">×</button>
    </div>
    <div class="proof-dialog-stage">
      <button class="proof-dialog-nav proof-dialog-prev" type="button" aria-label="Previous proof">‹</button>
      <img src="" alt="">
      <button class="proof-dialog-nav proof-dialog-next" type="button" aria-label="Next proof">›</button>
    </div>`;
  document.body.append(dialog);

  const image = dialog.querySelector('img');
  const title = dialog.querySelector('.proof-dialog-title');
  const counter = dialog.querySelector('.proof-dialog-counter');
  const previous = dialog.querySelector('.proof-dialog-prev');
  const next = dialog.querySelector('.proof-dialog-next');
  let group = [];
  let index = 0;

  const show = newIndex => {
    if (!group.length) return;
    index = (newIndex + group.length) % group.length;
    const item = group[index];
    const itemTitle = item.dataset.title || item.dataset.name || 'Campaign proof';
    image.src = item.dataset.proof;
    image.alt = item.dataset.alt || `${itemTitle} screenshot`;
    title.textContent = itemTitle;
    counter.textContent = `${index + 1} / ${group.length}`;
    previous.hidden = next.hidden = group.length < 2;
  };

  triggers.forEach(trigger => {
    trigger.addEventListener('click', event => {
      event.preventDefault();
      const gallery = trigger.dataset.gallery;
      group = gallery ? triggers.filter(item => item.dataset.gallery === gallery) : [trigger];
      index = Math.max(0, group.indexOf(trigger));
      show(index);
      dialog.showModal();
    });
  });

  previous.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  dialog.querySelector('.proof-dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') show(index - 1);
    if (event.key === 'ArrowRight') show(index + 1);
  });
  dialog.addEventListener('close', () => {
    image.removeAttribute('src');
    group = [];
  });
})();
