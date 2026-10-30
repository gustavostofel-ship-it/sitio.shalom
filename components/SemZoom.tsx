'use client';

import { useEffect } from 'react';

// Trava todo tipo de zoom da página, porque só o viewport não basta:
// - Safari do iPhone/iPad ignora a trava do viewport: cancela os gestos de pinça e de duas mãos.
// - Computador: Ctrl + roda do mouse, pinça do touchpad (chega como Ctrl + roda) e Ctrl com +, - e 0.
// O zoom pelo menu do navegador não dá para bloquear por código.
export function SemZoom() {
  useEffect(() => {
    const cancela = (e: Event) => e.preventDefault();
    const roda = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    const tecla = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['+', '=', '-', '_', '0'].includes(e.key)) e.preventDefault();
    };
    const toque = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    const gestos = ['gesturestart', 'gesturechange', 'gestureend'];
    gestos.forEach((n) => document.addEventListener(n, cancela));
    window.addEventListener('wheel', roda, { passive: false });
    window.addEventListener('keydown', tecla);
    document.addEventListener('touchmove', toque, { passive: false });
    return () => {
      gestos.forEach((n) => document.removeEventListener(n, cancela));
      window.removeEventListener('wheel', roda);
      window.removeEventListener('keydown', tecla);
      document.removeEventListener('touchmove', toque);
    };
  }, []);
  return null;
}
