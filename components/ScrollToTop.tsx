'use client';

import { useEffect } from 'react';

// Garante que a página abra no topo (sem restaurar rolagem antiga no celular),
// a menos que a URL aponte para uma seção (#agendar, etc.).
export function ScrollToTop() {
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, []);

  return null;
}
