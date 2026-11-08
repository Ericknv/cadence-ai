import React from 'react';
import { LandingNavbar } from './landing/LandingNavbar';
import { HeroSection } from './landing/HeroSection';
import { NumericProofSection } from './landing/NumericProofSection';
import { PillarsSection } from './landing/PillarsSection';
import { SimulatorSection } from './landing/SimulatorSection';
import { ManifestoSection } from './landing/ManifestoSection';
import { LandingFooter } from './landing/LandingFooter';

const LandingPage: React.FC = () => (
  <div className="relative min-h-screen bg-[#090B0E] text-slate-100 font-sans selection:bg-[#88C0A8] selection:text-black overflow-x-hidden">
    {/* Glow orbs difusos de fundo */}
    <div className="fixed -top-40 -left-40 w-96 h-96 bg-sky-500/5 blur-[140px] rounded-full pointer-events-none z-0" />
    <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-emerald-500/5 blur-[160px] rounded-full pointer-events-none z-0" />

    <LandingNavbar />
    <main className="relative z-10">
      <HeroSection />
      <NumericProofSection />
      <PillarsSection />
      <SimulatorSection />
      <ManifestoSection />
    </main>
    <div className="relative z-10">
      <LandingFooter />
    </div>
  </div>
);

export default LandingPage;
