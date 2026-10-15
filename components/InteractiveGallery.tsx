'use client';

import React, { useState } from 'react';
import { Maximize2, X, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { GALLERY_ITEMS, GalleryItem } from '@/lib/site-data';
import { SafeImage } from './SafeImage';

export function InteractiveGallery() {
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  const categories = [
    { id: 'todos', label: 'Todos os Ambientes' },
    { id: 'culto', label: 'Auditório de Cultos' },
    { id: 'refeitorio', label: 'Salão com Mesas' },
    { id: 'lazer', label: 'Piscina & Esportes' },
    { id: 'dormitorios', label: 'Acomodações & Banheiros' },
  ];

  const filteredItems =
    activeCategory === 'todos'
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <section id="galeria" className="py-20 sm:py-28 bg-[#FAF8F5] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706] mb-2 block">
            Tour Visual do Sítio
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1B4332] tracking-tight text-balance">
            Galeria da Estrutura
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed text-balance">
            Ambientes amplos, limpos e organizados com carinho para receber sua liderança e congregação com dignidade e excelência.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-10 no-scrollbar gap-2">
          <div className="inline-flex p-1 bg-stone-200/70 rounded-xl">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1B4332] ${
                    isActive
                      ? 'bg-white text-stone-900 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => {
            const isSpan2 = item.featured && index === 0;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedPhoto(item)}
                className={`group relative rounded-xl overflow-hidden cursor-pointer bg-stone-900 shadow-sm border border-stone-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isSpan2 ? 'md:col-span-2 md:row-span-1 lg:col-span-2' : ''
                }`}
              >
                <div className={`relative w-full ${isSpan2 ? 'h-80 sm:h-96' : 'h-72'}`}>
                  <SafeImage
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Scrim Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                  {/* Top Badge */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 text-xs text-amber-200 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md border border-white/10">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>{item.categoryLabel}</span>
                  </div>

                  {/* Expand icon */}
                  <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-4 h-4" />
                  </div>

                  {/* Bottom Text */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
                    <h3 className="text-lg sm:text-xl font-serif font-bold leading-tight mb-1 text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-300 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gallery Bottom Note */}
        <div className="mt-12 text-center">
          <p className="text-xs sm:text-sm text-stone-500 mb-3">
            Deseja conferir as instalações de perto antes de fechar a data da sua igreja?
          </p>
          <a
            href="#agendar"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#D97706] hover:text-[#B45309] transition-colors"
          >
            <span>Agende uma visita guiada com café da manhã cortesia</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedPhoto(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-4xl w-full bg-stone-900 rounded-2xl overflow-hidden border border-stone-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors border border-white/20 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label="Fechar visualização"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo Preview */}
            <div className="relative w-full h-80 sm:h-[460px] bg-black">
              <SafeImage
                src={selectedPhoto.image}
                alt={selectedPhoto.title}
                fill
                className="object-contain"
              />
            </div>

            {/* Photo Info */}
            <div className="p-6 bg-stone-900 border-t border-stone-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-semibold tracking-wider text-amber-400 block mb-1">
                  {selectedPhoto.categoryLabel}
                </span>
                <h4 className="text-xl font-serif font-bold text-white mb-1">
                  {selectedPhoto.title}
                </h4>
                <p className="text-sm text-stone-300 max-w-xl">
                  {selectedPhoto.description}
                </p>
              </div>

              <a
                href="#agendar"
                onClick={() => setSelectedPhoto(null)}
                className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#D97706] hover:bg-[#B45309] whitespace-nowrap shrink-0 transition-colors shadow-sm"
              >
                Visitar Este Espaço
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
