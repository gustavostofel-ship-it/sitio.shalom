'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Menu, X, PhoneCall } from 'lucide-react';
import { SITE_INFO } from '@/lib/site-data';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'O Espaço', href: '#espaco' },
    { label: 'Acomodações', href: '#acomodacoes' },
    { label: 'Lazer', href: '#lazer' },
    { label: 'Eventos', href: '#eventos' },
    { label: 'Galeria', href: '#galeria' },
    { label: 'Dúvidas', href: '#faq' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FAF8F5]/90 backdrop-blur-md shadow-xs border-b border-[#E5E0D8]/80 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark (Single element) */}
          <a
            href="#"
            className="flex items-center gap-2.5 text-slate-900 group whitespace-nowrap shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1B4332] rounded-md"
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center font-serif text-lg font-bold transition-colors ${
                isScrolled
                  ? 'bg-[#1B4332] text-amber-100 shadow-xs'
                  : 'bg-[#1B4332] text-amber-100 shadow-sm'
              }`}
            >
              S
            </div>
            <div className="flex flex-col">
              <span
                className={`text-lg font-serif font-bold tracking-tight transition-colors ${
                  isScrolled ? 'text-[#1B4332]' : 'text-slate-950 md:text-white drop-shadow-xs'
                }`}
              >
                Sítio Shalom
              </span>
              <span
                className={`text-[10px] tracking-widest uppercase font-semibold transition-colors ${
                  isScrolled ? 'text-stone-500' : 'text-slate-800 md:text-emerald-100/90'
                }`}
              >
                Retiros & Eventos
              </span>
            </div>
          </a>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#D97706] ${
                  isScrolled
                    ? 'text-stone-700'
                    : 'text-stone-100 hover:text-amber-300 drop-shadow-xs'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <a
              href="#agendar"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold tracking-wide text-white bg-[#D97706] hover:bg-[#B45309] shadow-sm hover:shadow-md transition-all active:scale-[0.98] whitespace-nowrap shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#D97706]"
            >
              <Calendar className="w-4 h-4" />
              <span>Agendar Visita Técnica</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isScrolled
                  ? 'text-stone-800 hover:bg-stone-100'
                  : 'text-stone-900 bg-white/80 backdrop-blur-xs'
              }`}
              aria-label="Abrir menu principal"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#FAF8F5] border-b border-[#E5E0D8] px-4 pt-4 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-base font-medium text-stone-800 hover:text-[#1B4332] hover:bg-stone-100/70 rounded-md transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-stone-200 flex flex-col gap-2">
              <a
                href="#agendar"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-white bg-[#D97706] hover:bg-[#B45309] transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar Visita Técnica</span>
              </a>
              <a
                href={`https://wa.me/${SITE_INFO.whatsappNumber}?text=Olá,%20gostaria%20de%20informações%20sobre%20o%20Sítio%20Shalom%20para%20o%20retiro%20da%20nossa%20igreja.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-emerald-700" />
                <span>WhatsApp Direto: {SITE_INFO.displayPhone}</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
