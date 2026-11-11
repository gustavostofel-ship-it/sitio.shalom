import React from 'react';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { AgendaReserva } from '@/components/AgendaReserva';
import { MinistryLogistics } from '@/components/MinistryLogistics';
import { InteractiveGallery } from '@/components/InteractiveGallery';
import { ReservationJourney } from '@/components/ReservationJourney';
import { Testimonials } from '@/components/Testimonials';
import { BookingSection } from '@/components/BookingSection';
import { Localizacao } from '@/components/Localizacao';
import { FaqSection } from '@/components/FaqSection';
import { Footer } from '@/components/Footer';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';

// Página montada uma vez e guardada em cache (recalculada a cada hora): abre rápido para quem visita.
export const revalidate = 3600;

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#1F2937]">
      {/* Fixed Header with Glassmorphism */}
      <ScrollToTop />
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* Available dates calendar and booking (public, no login) */}
      <AgendaReserva />

      {/* Ministry Logistics Pillars */}
      <MinistryLogistics />

      {/* Interactive Bento Gallery with Lightbox */}
      <InteractiveGallery />

      {/* 3-Step Reservation Journey */}
      <ReservationJourney />

      {/* Pastor & Leader Social Proof / Testimonials */}
      <Testimonials />

      {/* Mapa e como chegar */}
      <Localizacao />

      {/* Conversion Booking & WhatsApp Generator Section */}
      <BookingSection />

      {/* Frequently Asked Questions (Accordion) */}
      <FaqSection />

      {/* Footer */}
      <Footer />

      {/* Floating Action WhatsApp */}
      <FloatingWhatsApp />
    </main>
  );
}
