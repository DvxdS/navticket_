import { Check, Shield, Clock, Star } from 'lucide-react';

const badges = [
  {
    id: 1,
    icon: Check,
    title: '1000+ Voyages',
    description: 'Réservés',
  },
  {
    id: 2,
    icon: Shield,
    title: 'Sécurisé',
    description: '100% protégé',
  },
  {
    id: 3,
    icon: Clock,
    title: 'Support 24/7',
    description: 'Assistance',
  },
  {
    id: 4,
    icon: Star,
    title: '4.8/5',
    description: 'Note clients',
  },
];

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-4 md:gap-6 lg:gap-8">
      {badges.map((badge) => {
        const Icon = badge.icon;
        return (
          <div
            key={badge.id}
            className="flex items-center gap-2 rounded-xl bg-white/80 px-4 py-3 shadow-md backdrop-blur-sm transition-transform hover:scale-105 sm:gap-3 sm:px-5 md:px-6"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#73C8D2]/10 sm:h-12 sm:w-12">
              <Icon className="h-5 w-5 text-[#73C8D2] sm:h-6 sm:w-6" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-gray-900 sm:text-sm">
                {badge.title}
              </p>
              <p className="text-xs text-gray-600">{badge.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}