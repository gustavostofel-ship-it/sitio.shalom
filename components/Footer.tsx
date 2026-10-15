'use client';

import React from 'react';
import { Church, MapPin, Phone, Mail, Clock, Heart, Shield, ArrowUp, Instagram, Facebook, Youtube } from 'lucide-react';
import { SITE_INFO } from '@/lib/site-data';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#122E22] text-stone-300 pt-16 pb-12 border-t border-emerald-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-emerald-900/60">
          {/* Col 1: Brand & Ministry Verse (4 cols) */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#D97706] text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs">
                S
              </div>
              <div>
                <span className="text-xl font-serif font-bold text-white tracking-tight block">
                  Sítio Shalom
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-300">
                  Retiros & Eventos Cristãos
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-300/90 leading-relaxed mb-6">
              Estrutura exclusiva desenhada para proporcionar paz, comunhão e encontros reais com Deus. Hospedagem para até 150 participantes em ambiente consagrado cercado pela natureza.
            </p>

            {/* Scripture Verse Quote */}
            <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800/40 text-xs italic text-amber-200/90">
              <p>&ldquo;Oh! quão bom e quão suave é que os irmãos vivam em união.&rdquo;</p>
              <span className="block not-italic font-semibold text-emerald-300/80 mt-1">— Salmos 133:1</span>
            </div>
          </div>

          {/* Col 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs uppercase font-semibold tracking-wider text-amber-300 mb-4">
              Navegação
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="#espaco" className="hover:text-amber-300 transition-colors">
                  O Espaço
                </a>
              </li>
              <li>
                <a href="#culto" className="hover:text-amber-300 transition-colors">
                  Salão de Cultos
                </a>
              </li>
              <li>
                <a href="#acomodacoes" className="hover:text-amber-300 transition-colors">
                  Acomodações
                </a>
              </li>
              <li>
                <a href="#lazer" className="hover:text-amber-300 transition-colors">
                  Lazer & Batismo
                </a>
              </li>
              <li>
                <a href="#eventos" className="hover:text-amber-300 transition-colors">
                  Tipos de Eventos
                </a>
              </li>
              <li>
                <a href="#galeria" className="hover:text-amber-300 transition-colors">
                  Galeria de Fotos
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-amber-300 transition-colors">
                  Perguntas Frequentes
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contato & Visitas (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs uppercase font-semibold tracking-wider text-amber-300 mb-4">
              Atendimento à Liderança
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-stone-400 block text-[11px]">Plantão de Retiros / WhatsApp:</span>
                  <a
                    href={`https://wa.me/${SITE_INFO.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-amber-300 font-semibold"
                  >
                    {SITE_INFO.displayPhone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-stone-400 block text-[11px]">E-mail para Ofícios e Contratos:</span>
                  <span className="text-stone-200">{SITE_INFO.email}</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-stone-400 block text-[11px]">Horário de Visitas Técnicas:</span>
                  <span className="text-stone-200">Terça a Sábado das 09h às 17h (com agendamento prévio)</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 4: Localização & Segurança (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs uppercase font-semibold tracking-wider text-amber-300 mb-4">
              Localização & Acesso
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed mb-4">
              {SITE_INFO.address}
            </p>
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-[11px] text-stone-300 space-y-1">
              <p className="flex items-center gap-1.5 text-amber-200 font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Estacionamento & Segurança</span>
              </p>
              <p>Espaço reservado para veículos e vans da congregação.</p>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-900/60 flex items-center gap-3 text-stone-400">
              <span className="text-xs">Siga nossas redes:</span>
              <a href="#" className="hover:text-amber-300 transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-amber-300 transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-amber-300 transition-colors" aria-label="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} Sítio Shalom — Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <span>Uso Exclusivo para Retiros Cristãos</span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-amber-300 hover:text-white transition-colors"
            >
              <span>Voltar ao topo</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
