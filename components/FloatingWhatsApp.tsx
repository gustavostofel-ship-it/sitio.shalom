'use client';

import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { SITE_INFO } from '@/lib/site-data';

export function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-end gap-3 select-none">
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
        href={`https://wa.me/${SITE_INFO.whatsappNumber}?text=Olá,%20gostaria%20de%20consultar%20datas%20e%20agendar%20uma%20visita%20ao%20Sítio%20Shalom%20para%20a%20nossa%20igreja.`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-emerald-300"
        aria-label="Falar com o Sítio Shalom Xerém pelo WhatsApp"
      >
        <MessageSquare className="w-7 h-7 fill-white" />
      </a>
    </div>
  );
}
