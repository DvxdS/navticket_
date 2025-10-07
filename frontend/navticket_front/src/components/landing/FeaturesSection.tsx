import { CreditCard, Ticket, Zap, Shield } from 'lucide-react';
import { useScrollAnimations } from '@/hooks/useScrollAnimations';

const features = [
  {
    id: 1,
    icon: CreditCard,
    iconColor: '#FF9013', // Orange
    bgColor: 'bg-orange-50',
    title: 'Paiement Sécurisé',
    description: 'Orange Money, MTN Money, Wave et cartes bancaires acceptés',
  },
  {
    id: 2,
    icon: Ticket,
    iconColor: '#73C8D2', // Cyan
    bgColor: 'bg-cyan-50',
    title: 'Billet Électronique',
    description: 'Reçu instantanément par email avec code QR de validation',
  },
  {
    id: 3,
    icon: Zap,
    iconColor: '#0046FF', // Blue
    bgColor: 'bg-blue-50',
    title: 'Réservation Rapide',
    description: 'Réservez votre siège en moins de 2 minutes chrono',
  },
  {
    id: 4,
    icon: Shield,
    iconColor: '#10b981', // Green
    bgColor: 'bg-emerald-50',
    title: 'Compagnies Vérifiées',
    description: 'Uniquement des partenaires de transport certifiés et fiables',
  },
];

export default function FeaturesSection() {
  // Initialize scroll animations
  useScrollAnimations();

  return (
    <section className="relative bg-white px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32 overflow-hidden">
      {/* Animated background decorations */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-[#73C8D2]/5 rounded-full blur-3xl parallax-slow" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#FF9013]/5 rounded-full blur-3xl parallax-slow" />

      <div className="mx-auto max-w-7xl relative z-10">
        
        {/* Section Header - Fade up animation */}
        <div className="mb-16 text-center animate-fade-up">
          <h2 className="mb-4 text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
            Pourquoi choisir{' '}
            <span className="bg-gradient-to-r from-[#73C8D2] to-[#0046FF] bg-clip-text text-transparent">
              Navticket
            </span>
            {' '}?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 sm:text-xl">
            Découvrez les avantages qui font de nous la meilleure plateforme de réservation
          </p>
        </div>

        {/* Features Grid - Stagger animation */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10 animate-stagger-group">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="animate-stagger-item group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                {/* Background decoration */}
                <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full ${feature.bgColor} opacity-50 blur-2xl transition-opacity group-hover:opacity-70`} />

                {/* Icon Container */}
                <div className="relative mb-6 inline-flex items-center justify-center">
                  <div className={`rounded-2xl ${feature.bgColor} p-4 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon 
                      className="h-10 w-10 sm:h-12 sm:w-12" 
                      style={{ color: feature.iconColor }}
                      strokeWidth={2}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="mb-3 text-xl font-bold text-gray-900 sm:text-2xl">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Hover border effect */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100"
                  style={{
                    border: `2px solid ${feature.iconColor}20`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}