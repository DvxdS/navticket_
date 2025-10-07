import { TrendingUp, BarChart3, Users, Check, X, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const benefits = [
  {
    icon: TrendingUp,
    title: 'Augmentez vos ventes',
    description: 'Atteignez des milliers de voyageurs en ligne',
  },
  {
    icon: BarChart3,
    title: 'Analysez vos performances',
    description: 'Tableaux de bord et statistiques en temps réel',
  },
  {
    icon: Users,
    title: 'Gérez votre business',
    description: 'Outils modernes pour simplifier la gestion',
  },
];

const plans = [
  {
    name: 'Basic',
    price: 'Gratuit',
    description: 'Pour commencer à vendre en ligne',
    color: '#6b7280',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: Zap,
    features: [
      { text: 'Vente de billets en ligne', included: true },
      { text: 'Page compagnie personnalisée', included: true },
      { text: 'Support client basique', included: true },
      { text: 'Commission par vente: 8%', included: true },
      { text: 'Tableau de bord analytique', included: false },
      { text: 'Gestion de flotte', included: false },
      { text: 'Rapports avancés', included: false },
    ],
    cta: 'Commencer gratuitement',
    popular: false,
  },
  {
    name: 'Pro',
    price: '25 000 FCFA',
    period: '/mois',
    description: 'Pour les compagnies en croissance',
    color: '#73C8D2',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-500',
    icon: TrendingUp,
    features: [
      { text: 'Tout du plan Basic', included: true },
      { text: 'Tableau de bord analytique', included: true },
      { text: 'Gestion de flotte complète', included: true },
      { text: 'Rapports de ventes détaillés', included: true },
      { text: 'Support prioritaire', included: true },
      { text: 'Commission réduite: 5%', included: true },
      { text: 'API pour intégration', included: false },
    ],
    cta: 'Essayer 30 jours gratuits',
    popular: true,
  },
  {
    name: 'Premium',
    price: '50 000 FCFA',
    period: '/mois',
    description: 'Pour les grandes entreprises',
    color: '#0046FF',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    icon: Crown,
    features: [
      { text: 'Tout du plan Pro', included: true },
      { text: 'API complète pour intégration', included: true },
      { text: 'Comptes multi-utilisateurs', included: true },
      { text: 'Comptabilité avancée', included: true },
      { text: 'Manager dédié 24/7', included: true },
      { text: 'Commission minimale: 3%', included: true },
      { text: 'Formation du personnel', included: true },
    ],
    cta: 'Contactez-nous',
    popular: false,
  },
];

export default function CompaniesSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8 lg:py-32">
      
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-[#73C8D2] blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-[#0046FF] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        
        {/* Section Header */}
        <div className="mb-16 text-center">
          <Badge className="mb-4 bg-[#FF9013] text-white hover:bg-[#FF9013]/90">
            Pour les professionnels
          </Badge>
          <h2 className="mb-6 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
            Vous êtes une{' '}
            <span className="bg-gradient-to-r from-[#73C8D2] to-[#0046FF] bg-clip-text text-transparent">
              compagnie de transport
            </span>
            {' '}?
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-300 sm:text-xl">
            Rejoignez Navticket et développez votre activité avec nos outils modernes de gestion et de vente
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mb-20 grid gap-8 md:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="group rounded-2xl bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10"
              >
                <div className="mb-4 inline-flex rounded-xl bg-[#73C8D2]/10 p-4">
                  <Icon className="h-8 w-8 text-[#73C8D2]" strokeWidth={2} />
                </div>
                <h3 className="mb-2 text-xl font-bold">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        {/* Pricing Plans */}
        <div className="mb-16">
          <h3 className="mb-12 text-center text-3xl font-bold sm:text-4xl">
            Choisissez votre plan
          </h3>
          
          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan) => {
              const PlanIcon = plan.icon;
              return (
                <div
                  key={plan.name}
                  className={`group relative overflow-hidden rounded-3xl bg-white p-8 text-gray-900 shadow-2xl transition-all hover:-translate-y-2 ${
                    plan.popular ? 'ring-4 ring-[#73C8D2]' : ''
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute right-4 top-4">
                      <Badge className="bg-[#73C8D2] text-white">
                        ⭐ Populaire
                      </Badge>
                    </div>
                  )}

                  {/* Background decoration */}
                  <div 
                    className={`absolute -right-10 -top-10 h-40 w-40 rounded-full ${plan.bgColor} opacity-50 blur-3xl`}
                  />

                  {/* Plan Header */}
                  <div className="relative mb-6">
                    <div 
                      className={`mb-4 inline-flex rounded-2xl ${plan.bgColor} p-4`}
                    >
                      <PlanIcon 
                        className="h-10 w-10" 
                        style={{ color: plan.color }}
                        strokeWidth={2}
                      />
                    </div>
                    <h4 className="mb-2 text-2xl font-bold">{plan.name}</h4>
                    <p className="mb-4 text-sm text-gray-600">{plan.description}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-gray-600">{plan.period}</span>
                      )}
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="relative mb-8 space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 flex-shrink-0 text-green-500" strokeWidth={3} />
                        ) : (
                          <X className="h-5 w-5 flex-shrink-0 text-gray-300" strokeWidth={3} />
                        )}
                        <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    className={`w-full rounded-xl py-6 font-bold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-[#73C8D2] to-[#0046FF] text-white hover:shadow-2xl'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-3xl bg-gradient-to-r from-[#FF9013] to-[#ff7a00] p-12 text-center shadow-2xl">
          <h3 className="mb-4 text-3xl font-extrabold sm:text-4xl">
            Prêt à révolutionner votre activité ?
          </h3>
          <p className="mb-8 text-lg text-white/90">
            Rejoignez les compagnies qui font déjà confiance à Navticket
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button className="rounded-full bg-white px-8 py-6 text-lg font-bold text-[#FF9013] shadow-xl hover:bg-gray-100">
              Devenir partenaire
            </Button>
            <Button variant="outline" className="rounded-full border-2 border-white bg-transparent px-8 py-6 text-lg font-bold text-white hover:bg-white/10">
              Planifier une démo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}