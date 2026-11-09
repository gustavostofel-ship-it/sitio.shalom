'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { SITE_INFO } from '@/lib/site-data';

export function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(true);
  // Só aparece depois que a pessoa desce da primeira tela: lá em cima ele cobria os botões
  // "Agendar Visita" em celulares pequenos, e o cabeçalho já tem o botão de agendar.
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const checar = () => setVisivel(window.scrollY > 520);
    const quadro = requestAnimationFrame(checar);
    window.addEventListener('scroll', checar, { passive: true });
    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener('scroll', checar);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-end gap-3 select-none transition-all duration-300 ${
        visivel ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
      aria-hidden={!visivel}
    >
      {/* Tooltip bubble */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white text-stone-800 text-xs font-medium py-2 px-3.5 rounded-xl shadow-lg border border-stone-200 animate-in fade-in slide-in-from-right-4 duration-300 max-w-xs">
          <span>Olá! Posso ajudar a agendar a visita da sua igreja?</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-stone-400 hover:text-stone-700 p-0.5 rounded-xs"
            aria-label="Fechar mensagem"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={`https://wa.me/${SITE_INFO.whatsappNumber}?text=Olá,%20gostaria%20de%20consultar%20datas%20e%20agendar%20uma%20visita%20ao%20Sítio%20Shalom%20Xerém%20para%20a%20nossa%20igreja.`}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={visivel ? 0 : -1}
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-emerald-300"
        aria-label="Falar com o Sítio Shalom Xerém pelo WhatsApp"
      >
        <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 fill-white" />
      </a>
    </div>
  );
}
