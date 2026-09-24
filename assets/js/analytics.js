/*
  Palkin Singla GA4 loader.
  ONE-TIME SETUP: replace G-PASTE-YOUR-ID-HERE with the GA4 Measurement ID.
  Example format: G-ABC123DE45
  Do not add a second GA4 installation through GTM unless this file is disabled.
*/
(() => {
  const measurementId = 'G-PASTE-YOUR-ID-HERE';
  if (!/^G-[A-Z0-9]{6,}$/i.test(measurementId) || measurementId.includes('PASTE')) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { anonymize_ip: true });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  document.addEventListener('DOMContentLoaded', () => {
    const send = (name, params = {}) => {
      if (typeof window.gtag === 'function') window.gtag('event', name, params);
    };

    document.querySelectorAll('form[data-contact-form]').forEach(form => {
      form.addEventListener('submit', () => send('generate_lead', { form_name: form.getAttribute('name') || 'contact' }));
    });

    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      if (href.startsWith('tel:')) send('phone_click', { link_url: href });
      else if (href.startsWith('mailto:')) send('email_click', { link_url: href });
      else {
        try {
          const url = new URL(link.href, window.location.href);
          if (url.origin !== window.location.origin && /^https?:$/.test(url.protocol)) {
            send('outbound_click', { link_url: url.href, link_domain: url.hostname });
          }
        } catch (_) {}
      }
    });
  });
})();
