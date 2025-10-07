import SearchForm from '@/components/search/SearchForm';
import TrustBadges from './TrustBadges';
import AnimatedMap from '@/components/animations/AnimatedMap';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-gray-50 to-[#73C8D2]/5 px-4 pb-16 pt-20 sm:px-6 sm:pt-24 lg:px-8 lg:pt-28">
      
      {/* Animated Map Background - Full Width */}
      <div className="absolute inset-0 w-full h-full">
        <AnimatedMap />
      </div>

      {/* Center overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

      {/* Main Content - Centered with higher z-index */}
      <div className="relative z-10 mx-auto max-w-6xl">
        
        {/* Centered Content */}
        <div className="space-y-8 text-center lg:space-y-10">
          
          {/* Heading & Subheading */}
          <div className="space-y-4">
            <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Réservez vos billets
              <br />
              <span className="bg-gradient-to-r from-[#73C8D2] to-[#0046FF] bg-clip-text text-transparent">
                de Car en ligne
              </span>
            </h1>

            <div className="mx-auto max-w-xl text-base text-gray-600 sm:text-lg lg:text-xl">
              <p className="mb-2">
                Voyagez facilement et en toute sécurité partout en
              </p>
              
              {/* Côte d'Ivoire pill */}
              <div className="inline-flex items-center justify-center">
                <span className="relative inline-block rounded-full bg-[#FF9013] px-4 py-1.5 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-[#FF9013]/40">
                  {/* Subtle inner reflection */}
                  <span className="absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-white/20 mix-blend-overlay" />

                  {/* Text */}
                  <span className="relative z-10">Côte d'Ivoire</span>

                  {/* Bottom soft shadow */}
                  <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-black/20 blur-[2px]" />
                </span>
              </div>
            </div>
          </div>

          {/* Search Form */}
          <div className="flex justify-center mt-4">
            <SearchForm />
          </div>

          {/* Trust Badges */}
          <div className="mt-4">
            <TrustBadges />
          </div>
        </div>
      </div>

      {/* Bottom Fade Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />
    </section>
  );
}