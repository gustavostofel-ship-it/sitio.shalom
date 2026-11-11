import React from 'react';
import { MapPin, Navigation, Phone } from 'lucide-react';
import { LOCAL, SITE_INFO } from '@/lib/site-data';

const q = encodeURIComponent(LOCAL.endereco);
const MAPA_INCORPORADO = `https://www.google.com/maps?q=${q}&hl=pt-BR&z=15&output=embed`;
const ABRIR_NO_MAPS = `https://www.google.com/maps/search/?api=1&query=${q}`;
const ROTA_MAPS = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
const ROTA_WAZE = `https://waze.com/ul?q=${q}&navigate=yes`;

const botao =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D97706]';

// Seção "Como chegar": mapa dentro da página, endereço e botões para abrir a rota no celular.
export function Localizacao() {
  return (
    <section id="localizacao" className="py-20 sm:py-28 bg-[#F5F1EB] border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#B45309] mb-2 block">Localização</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1B4332] tracking-tight text-balance">Como chegar ao sítio</h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed text-balance">Em Xerém, Duque de Caxias (RJ). Toque em um botão para traçar a rota direto no seu celular.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="rounded-2xl bg-white border border-stone-200 p-6 shadow-xs">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-[#B45309]">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">Endereço</h3>
                  <p className="mt-1 text-sm leading-relaxed text-stone-700">{SITE_INFO.address}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-2.5">
                <a href={ROTA_MAPS} target="_blank" rel="noopener noreferrer" className={`${botao} bg-[#1B4332] text-white hover:bg-[#14301F]`}>
                  <Navigation className="h-4 w-4" /> Traçar rota no Google Maps
                </a>
                <a href={ROTA_WAZE} target="_blank" rel="noopener noreferrer" className={`${botao} border border-stone-300 bg-white text-stone-800 hover:border-[#1B4332] hover:text-[#1B4332]`}>
                  <Navigation className="h-4 w-4" /> Traçar rota no Waze
                </a>
                <a href={ABRIR_NO_MAPS} target="_blank" rel="noopener noreferrer" className={`${botao} border border-stone-300 bg-white text-stone-800 hover:border-[#1B4332] hover:text-[#1B4332]`}>
                  <MapPin className="h-4 w-4" /> Abrir no Google Maps
                </a>
              </div>
            </div>
            <div className="rounded-2xl bg-[#1B4332] p-6 text-white">
              <div className="flex items-center gap-2 text-amber-200">
                <Phone className="h-4 w-4" />
                <span className="text-sm font-semibold uppercase tracking-wider">Ficou com dúvida no caminho?</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-emerald-100/90">Chame a gente pelo WhatsApp que ajudamos você e a sua comissão a chegar, inclusive com orientação para vans e ônibus.</p>
              <a
                href={`https://wa.me/${SITE_INFO.whatsappNumber}?text=${encodeURIComponent('Olá! Preciso de ajuda para chegar ao Sítio Shalom Xerém.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${botao} mt-4 w-full bg-white text-stone-900 hover:bg-stone-100`}
              >
                Falar pelo WhatsApp {SITE_INFO.displayPhone}
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs min-h-[320px] sm:min-h-[420px]">
            <iframe
              title="Mapa com a localização do Sítio Shalom Xerém"
              src={MAPA_INCORPORADO}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full min-h-[320px] w-full sm:min-h-[420px]"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
