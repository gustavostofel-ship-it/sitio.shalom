'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';
import { FAQ_ITEMS, SITE_INFO } from '@/lib/site-data';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First open by default

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 bg-[#F5F1EB] border-t border-stone-200/80 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706] mb-2 block">
            Tire Suas Dúvidas
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1B4332] tracking-tight text-balance">
            Perguntas Frequentes de Lideranças e Organizadores
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed text-balance">
            Respostas diretas e transparentes sobre logística, pagamentos, acomodações e regras de locação para a sua igreja.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {FAQ_ITEMS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.id}
                className="bg-white rounded-xl border border-stone-200/90 shadow-xs overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1B4332]"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-semibold text-stone-900 leading-snug">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180 bg-[#1B4332]/10 text-[#1B4332]' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 animate-in fade-in duration-150">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions banner */}
        <div className="mt-12 text-center p-6 bg-white rounded-xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="text-base font-serif font-bold text-stone-900">
              Sua dúvida não está listada acima?
            </h4>
            <p className="text-xs text-stone-500 mt-0.5">
              Converse diretamente com nosso coordenador de retiros via WhatsApp.
            </p>
          </div>
          <a
            href={`https://wa.me/${SITE_INFO.whatsappNumber}?text=Olá,%20tenho%20uma%20dúvida%20específica%20sobre%20a%20locação%20do%20Sítio%20Shalom%20Xerém.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#1B4332] text-amber-100 hover:bg-[#153427] transition-colors whitespace-nowrap shrink-0 shadow-xs"
          >
            <MessageSquare className="w-4 h-4 text-amber-300" />
            <span>Falar com o Coordenador</span>
          </a>
        </div>
      </div>
    </section>
  );
}
