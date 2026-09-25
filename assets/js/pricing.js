(() => {
  const DISCOUNT = 0.20;

  // Fixed-date annual offer windows. Movable Indian festivals are listed below for 2026–2027.
  const annualWindows = [
    { name: 'New Year Offer', start: [12, 28], end: [1, 3], crossYear: true },
    { name: 'Republic Day Offer', start: [1, 23], end: [1, 27] },
    { name: 'Independence Day Offer', start: [8, 12], end: [8, 16] },
    { name: 'Gandhi Jayanti Offer', start: [10, 1], end: [10, 3] },
    { name: 'Christmas Offer', start: [12, 22], end: [12, 27] }
  ];

  // Major movable festival windows verified for India for 2026 and 2027.
  const datedWindows = [
    { name: 'Holi Offer', start: '2026-03-01', end: '2026-03-05' },
    { name: 'Raksha Bandhan Offer', start: '2026-08-26', end: '2026-08-29' },
    { name: 'Janmashtami Offer', start: '2026-09-02', end: '2026-09-05' },
    { name: 'Ganesh Chaturthi Offer', start: '2026-09-12', end: '2026-09-15' },
    { name: 'Navratri & Dussehra Offer', start: '2026-10-09', end: '2026-10-21' },
    { name: 'Karwa Chauth & Diwali Offer', start: '2026-10-27', end: '2026-11-11' },
    { name: 'Holi Offer', start: '2027-03-19', end: '2027-03-23' },
    { name: 'Raksha Bandhan Offer', start: '2027-08-15', end: '2027-08-18' },
    { name: 'Janmashtami & Ganesh Chaturthi Offer', start: '2027-08-23', end: '2027-09-05' },
    { name: 'Navratri & Dussehra Offer', start: '2027-09-28', end: '2027-10-10' },
    { name: 'Karwa Chauth & Diwali Offer', start: '2027-10-17', end: '2027-10-31' }
  ];

  const today = new Date();
  today.setHours(12,0,0,0);

  const parse = value => {
    const [y,m,d] = value.split('-').map(Number);
    return new Date(y,m-1,d,12,0,0,0);
  };

  const activeDated = datedWindows.find(w => today >= parse(w.start) && today <= parse(w.end));

  const annualMatch = annualWindows.find(w => {
    const y = today.getFullYear();
    if (w.crossYear) {
      const start = new Date(y, w.start[0]-1, w.start[1],12);
      const endThis = new Date(y, w.end[0]-1, w.end[1],12);
      const endNext = new Date(y+1, w.end[0]-1, w.end[1],12);
      const startPrev = new Date(y-1, w.start[0]-1, w.start[1],12);
      return (today >= start && today <= endNext) || (today >= startPrev && today <= endThis);
    }
    const start = new Date(y,w.start[0]-1,w.start[1],12);
    const end = new Date(y,w.end[0]-1,w.end[1],12);
    return today >= start && today <= end;
  });

  const offer = activeDated || annualMatch;
  if (!offer) return;

  document.documentElement.classList.add('festive-offer-active');
  document.querySelectorAll('[data-festive-offer]').forEach(el => {
    el.hidden = false;
    el.querySelectorAll('[data-festival-name]').forEach(node => node.textContent = offer.name);
  });

  document.querySelectorAll('[data-base-price]').forEach(el => {
    const base = Number(el.dataset.basePrice);
    if (!Number.isFinite(base)) return;
    const discounted = Math.round(base * (1 - DISCOUNT));
    const original = el.querySelector('.price-original');
    const current = el.querySelector('.price-current');
    const save = el.querySelector('.price-save');
    const money = value => `₹${Math.round(value).toLocaleString('en-IN')}`;
    if (original) original.textContent = money(base);
    if (current) current.textContent = money(discounted);
    if (save) save.textContent = `20% festive saving · save ${money(base-discounted)}`;
    el.classList.add('has-discount');
  });
})();
