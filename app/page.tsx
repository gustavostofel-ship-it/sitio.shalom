'use client';

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
import { FaqSection } from '@/components/FaqSection';
import { Footer } from '@/components/Footer';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';

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
