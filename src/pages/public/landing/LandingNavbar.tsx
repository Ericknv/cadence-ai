import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { CadenceLogo } from '../../../components/brand/CadenceLogo';

interface NavLinkItem {
  href: string;
  label: string;
}

const NAV_LINKS: NavLinkItem[] = [
  { href: '#metodologia', label: 'Metodologia' },
  { href: '#capacidade', label: 'Capacidade' },
  { href: '#simulador', label: 'Simulador' },
  { href: '#manifesto', label: 'Manifesto' },
];

export const LandingNavbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-5xl">
      <nav
        aria-label="Navegação principal"
        className="flex items-center justify-between gap-3 pl-3.5 pr-2 py-2 bg-[#090B0E]/65 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]"
      >
        <Link to="/" aria-label="Cadence AI — início" className="shrink-0">
          <CadenceLogo size={28} subtitle="" />
        </Link>

        {/* Âncoras: visíveis somente em desktop */}
        <ul className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <Link
            to="/login"
            className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full text-xs font-medium text-[#E2E8F0] hover:bg-white/10 hover:shadow-[inset_0_0_14px_rgba(255,255,255,0.08)] transition-all"
          >
            Entrar
          </Link>
          <Link
            to="/login"
            className="inline-flex px-4 py-2 rounded-full text-xs font-semibold text-[#E2E8F0] bg-[#0E1319] border border-[#88C0A8] shadow-[0_0_20px_rgba(136,192,168,0.2)] hover:shadow-[0_0_28px_rgba(136,192,168,0.35)] transition-shadow"
          >
            Iniciar Cadência
          </Link>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Menu de vidro (tablet): hambúrguer */}
      {isMenuOpen && (
        <div className="lg:hidden mt-2 rounded-3xl border border-white/10 bg-[#090B0E]/85 backdrop-blur-2xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-2xl text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="sm:hidden">
              <Link
                to="/login"
                className="block px-4 py-3 rounded-2xl text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                Entrar
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};
