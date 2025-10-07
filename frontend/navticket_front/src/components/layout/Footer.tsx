import { Bus, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const footerLinks = {
  company: [
    { label: 'À propos', href: '#about' },
    { label: 'Carrières', href: '#careers' },
    { label: 'Blog', href: '#blog' },
    { label: 'Partenaires', href: '#partners' },
  ],
  services: [
    { label: 'Réserver un billet', href: '#book' },
    { label: 'Mes réservations', href: '#bookings' },
    { label: 'Compagnies', href: '#companies' },
    { label: 'Destinations', href: '#destinations' },
  ],
  support: [
    { label: 'Centre d\'aide', href: '#help' },
    { label: 'Contactez-nous', href: '#contact' },
    { label: 'Conditions d\'utilisation', href: '#terms' },
    { label: 'Politique de confidentialité', href: '#privacy' },
  ],
};

const popularRoutes = [
  'Abidjan → Yamoussoukro',
  'Abidjan → Bouaké',
  'Abidjan → San-Pédro',
  'Abidjan → Korhogo',
];

const socialLinks = [
  { icon: Facebook, href: '#', color: '#1877F2' },
  { icon: Twitter, href: '#', color: '#1DA1F2' },
  { icon: Instagram, href: '#', color: '#E4405F' },
  { icon: Linkedin, href: '#', color: '#0A66C2' },
];

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full bg-gradient-to-br from-[#73C8D2] to-[#0046FF] p-3 shadow-lg">
                <Bus className="h-8 w-8 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">Navticket</span>
            </div>

            {/* Description */}
            <p className="mb-6 max-w-md text-gray-400 leading-relaxed">
              La plateforme moderne de réservation de billets de bus en Côte d'Ivoire. 
              Voyagez facilement, rapidement et en toute sécurité.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-5 w-5 text-[#73C8D2]" />
                <span>Abidjan, Plateau - Côte d'Ivoire</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-5 w-5 text-[#73C8D2]" />
                <span>+225 07 XX XX XX XX</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-5 w-5 text-[#73C8D2]" />
                <span>contact@navticket.ci</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-white/20 hover:scale-110"
                    aria-label={`Social link ${index + 1}`}
                  >
                    <Icon className="h-5 w-5" style={{ color: social.color }} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Entreprise</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors hover:text-[#73C8D2]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors hover:text-[#73C8D2]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors hover:text-[#73C8D2]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Popular Routes Section */}
        <div className="mt-12 border-t border-gray-700 pt-8">
          <h3 className="mb-4 text-lg font-bold text-white">Routes populaires</h3>
          <div className="flex flex-wrap gap-3">
            {popularRoutes.map((route, index) => (
              <a
                key={index}
                href="#"
                className="rounded-full bg-white/5 px-4 py-2 text-sm transition-all hover:bg-[#73C8D2]/20 hover:text-[#73C8D2]"
              >
                {route}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            {/* Copyright */}
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Navticket. Tous droits réservés.
            </p>

            {/* Payment Methods */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-gray-400">Paiements acceptés:</span>
              <div className="flex gap-2">
                <div className="rounded bg-white/10 px-3 py-1 text-xs font-medium text-white">
                  Orange Money
                </div>
                <div className="rounded bg-white/10 px-3 py-1 text-xs font-medium text-white">
                  MTN
                </div>
                <div className="rounded bg-white/10 px-3 py-1 text-xs font-medium text-white">
                  Wave
                </div>
                <div className="rounded bg-white/10 px-3 py-1 text-xs font-medium text-white">
                  Visa
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}