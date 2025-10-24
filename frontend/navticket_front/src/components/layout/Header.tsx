// components/layout/Header.tsx

import { useState, useEffect } from 'react';
import { Bus, Menu, X, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompanyAuthModal } from '@/components/auth/CompanyAuthModal';

interface NavItem {
  label: string;
  href: string;
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showCompanyAuth, setShowCompanyAuth] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: NavItem[] = [
    { label: 'Accueil', href: '#accueil' },
    { label: 'Trajets', href: '#trajets' },
    { label: 'À propos', href: '#a-propos' },
    { label: 'Aide', href: '#aide' },
  ];

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 shadow-lg backdrop-blur-lg'
            : 'bg-white/95 shadow-md'
        }`}
      >
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <a href="#" className="group flex items-center gap-3">
                <div className="rounded-full bg-gradient-to-br from-blue-600 to-blue-700 p-3 shadow-md transition-transform duration-200 group-hover:scale-110">
                  <Bus className="h-7 w-7 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">Navticket</span>
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
              <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-2.5 shadow-xl ring-1 ring-gray-200/50 backdrop-blur-md">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="group relative overflow-hidden rounded-full px-6 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:text-blue-600"
                  >
                    <span className="relative z-10">{item.label}</span>
                    <span className="absolute inset-0 scale-0 rounded-full bg-blue-50 transition-transform duration-200 group-hover:scale-100" />
                  </a>
                ))}
              </div>
            </nav>

            {/* Company Login Button + Mobile Menu */}
            <div className="flex items-center gap-3">
              {/* Desktop button */}
              <div className="hidden items-center gap-3 lg:flex">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                  onClick={() => setShowCompanyAuth(true)}
                >
                  <Building2 className="h-5 w-5" />
                  Espace Entreprise
                </Button>
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-20 m-4 w-80 rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-4 border-t pt-4">
              <Button
                variant="outline"
                className="w-full justify-start border-indigo-200 font-medium text-indigo-600 hover:bg-indigo-50"
                onClick={() => {
                  setShowCompanyAuth(true);
                  setIsMobileMenuOpen(false);
                }}
              >
                <Building2 className="mr-2 h-5 w-5" />
                Espace Entreprise
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Company Auth Modal */}
      <CompanyAuthModal
        isOpen={showCompanyAuth}
        onClose={() => setShowCompanyAuth(false)}
      />
    </>
  );
}
