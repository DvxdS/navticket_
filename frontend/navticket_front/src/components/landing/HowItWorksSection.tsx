import { Search, CheckCircle, CreditCard, Ticket } from 'lucide-react';
import { useScrollAnimations } from '@/hooks/useScrollAnimations';

const steps = [
  {
    id: 1,
    icon: Search,
    color: '#FF9013', // Orange
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500',
    title: 'Recherchez votre trajet',
    description: 'Indiquez votre ville de départ, destination et date de voyage souhaités',
    position: 'left',
  },
  {
    id: 2,
    icon: CheckCircle,
    color: '#73C8D2', // Cyan
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-500',
    title: 'Choisissez votre bus',
    description: 'Comparez les horaires, prix et compagnies pour trouver le meilleur trajet',
    position: 'right',
  },
  {
    id: 3,
    icon: CreditCard,
    color: '#0046FF', // Blue
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    title: 'Payez en toute sécurité',
    description: 'Réglez par mobile money ou carte bancaire de manière 100% sécurisée',
    position: 'left',
  },
  {
    id: 4,
    icon: Ticket,
    color: '#10b981', // Green
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-500',
    title: 'Recevez votre billet',
    description: 'Votre billet électronique avec QR code arrive instantanément par email',
    position: 'right',
  },
];

export default function HowItWorksSection() {
  // Initialize scroll animations
  useScrollAnimations();

  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-white px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32 overflow-hidden">
      {/* Animated background decorations */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-[#FF9013]/10 rounded-full blur-3xl parallax-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#0046FF]/10 rounded-full blur-3xl parallax-slow" />

      <div className="mx-auto max-w-5xl relative z-10">
        
        {/* Section Header - Fade up animation */}
        <div className="mb-20 text-center animate-fade-up">
          <h2 className="mb-4 text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
            Comment{' '}
            <span className="bg-gradient-to-r from-[#73C8D2] to-[#0046FF] bg-clip-text text-transparent">
              ça marche
            </span>
            {' '}?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 sm:text-xl">
            Réservez votre billet en 4 étapes simples
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          
          {/* Vertical Connecting Line (Hidden on mobile, visible on tablet+) */}
          <div className="absolute left-1/2 top-0 hidden h-full w-1 -translate-x-1/2 md:block">
            <div className="h-full w-full rounded-full bg-gradient-to-b from-[#FF9013] via-[#73C8D2] via-[#0046FF] to-[#10b981] opacity-20" />
          </div>

          {/* Steps - Stagger animation container */}
          <div className="space-y-16 md:space-y-24 animate-stagger-group">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLeft = step.position === 'left';
              
              return (
                <div
                  key={step.id}
                  className={`animate-stagger-item group relative flex items-center ${
                    isLeft 
                      ? 'md:flex-row' 
                      : 'md:flex-row-reverse'
                  } flex-col gap-8`}
                >
                  {/* Content Card */}
                  <div className={`w-full md:w-5/12 ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                      
                      {/* Background decoration */}
                      <div 
                        className={`absolute -right-8 -top-8 h-40 w-40 rounded-full ${step.bgColor} opacity-50 blur-3xl transition-opacity group-hover:opacity-70`}
                      />

                      {/* Step Number Badge */}
                      <div 
                        className={`absolute ${isLeft ? 'right-4' : 'left-4'} top-4 flex h-8 w-8 items-center justify-center rounded-full font-bold text-white`}
                        style={{ backgroundColor: step.color }}
                      >
                        {step.id}
                      </div>

                      {/* Icon - Mobile only */}
                      <div className="mb-4 flex justify-center md:hidden">
                        <div className={`rounded-2xl ${step.bgColor} p-4`}>
                          <Icon 
                            className="h-10 w-10" 
                            style={{ color: step.color }}
                            strokeWidth={2}
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="relative text-center md:text-inherit">
                        <h3 className="mb-3 text-2xl font-bold text-gray-900">
                          {step.title}
                        </h3>
                        <p className="leading-relaxed text-gray-600">
                          {step.description}
                        </p>
                      </div>

                      {/* Hover border */}
                      <div 
                        className={`absolute inset-0 rounded-2xl border-2 opacity-0 transition-opacity group-hover:opacity-100 ${step.borderColor}`}
                      />
                    </div>
                  </div>

                  {/* Center Circle Marker (Desktop only) */}
                  <div className="relative z-10 hidden md:block">
                    <div 
                      className={`flex h-20 w-20 items-center justify-center rounded-full ${step.bgColor} shadow-lg ring-4 ring-white transition-transform group-hover:scale-125`}
                    >
                      <Icon 
                        className="h-10 w-10" 
                        style={{ color: step.color }}
                        strokeWidth={2.5}
                      />
                    </div>
                    
                    {/* Connecting line to card (Desktop) */}
                    <div 
                      className={`absolute top-1/2 h-0.5 w-12 -translate-y-1/2 ${
                        isLeft ? 'left-full' : 'right-full'
                      }`}
                      style={{ backgroundColor: step.color, opacity: 0.3 }}
                    />
                  </div>

                  {/* Empty space for layout balance */}
                  <div className="hidden w-5/12 md:block" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA - Scale animation */}
        <div className="mt-20 text-center animate-scale">
          <p className="mb-6 text-xl font-semibold text-gray-900">
            Prêt à commencer votre voyage ?
          </p>
          <button className="rounded-full bg-gradient-to-r from-[#FF9013] to-[#ff7a00] px-8 py-4 text-lg font-bold text-white shadow-xl transition-transform hover:scale-105 hover:shadow-2xl">
            Réserver maintenant
          </button>
        </div>
      </div>
    </section>
  );
}