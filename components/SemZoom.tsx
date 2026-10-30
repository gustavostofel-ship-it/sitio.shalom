'use client';

import { useEffect } from 'react';

// O Safari do iPhone ignora a trava de zoom do viewport: aqui os gestos de pinça (exclusivos do Safari) são cancelados.
export function SemZoom() {
  useEffect(() => {
    const barra = (e: Event) => e.preventDefault();
    const eventos = ['gesturestart', 'gesturechange', 'gestureend'];
    eventos.forEach((n) => document.addEventListener(n, barra));
    return () => eventos.forEach((n) => document.removeEventListener(n, barra));
  }, []);
  return null;
}
