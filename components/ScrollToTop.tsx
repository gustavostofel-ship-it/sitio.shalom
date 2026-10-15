'use client';

import { useEffect } from 'react';

// Garante que a página abra no topo (sem restaurar rolagem antiga no celular),
// a menos que a URL aponte para uma seção (#agendar, etc.) ou a pessoa já tenha rolado.
export function ScrollToTop() {
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    if (window.location.hash) return;

    let userScrolled = false;
    const markUser = () => {
      userScrolled = true;
    };
    const toTop = () => {
      if (!userScrolled && window.scrollY > 0) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      }
    };

    window.addEventListener('touchstart', markUser, { passive: true, once: true });
    window.addEventListener('wheel', markUser, { passive: true, once: true });
    window.addEventListener('keydown', markUser, { once: true });
    window.addEventListener('load', toTop);
    window.addEventListener('pageshow', toTop);

    toTop();
    const timers = [100, 400, 1000, 2000].map((ms) => window.setTimeout(toTop, ms));

    return () => {
      timers.forEach(window.clearTimeout);
      window.removeEventListener('load', toTop);
      window.removeEventListener('pageshow', toTop);
      window.removeEventListener('touchstart', markUser);
      window.removeEventListener('wheel', markUser);
      window.removeEventListener('keydown', markUser);
    };
  }, []);

  return null;
}
