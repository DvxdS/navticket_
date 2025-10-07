import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Kouassi Kofi',
    city: 'Abidjan',
    avatar: 'K',
    rating: 5,
    text: 'Service impeccable ! J\'ai réservé mon billet en 2 minutes. Le QR code est arrivé instantanément par email. Plus besoin de faire la queue à la gare !',
    route: 'Abidjan → Yamoussoukro',
  },
  {
    id: 2,
    name: 'Adjoua Aya',
    city: 'Bouaké',
    avatar: 'A',
    rating: 5,
    text: 'Très pratique pour voyager ! Les prix sont clairs, pas de surprise. J\'ai même pu payer avec Orange Money. Je recommande vivement Navticket.',
    route: 'Bouaké → Abidjan',
  },
  {
    id: 3,
    name: 'Yao Michel',
    city: 'San-Pédro',
    avatar: 'Y',
    rating: 5,
    text: 'Application moderne et facile à utiliser. Le support client est réactif. C\'est maintenant mon application préférée pour voyager en Côte d\'Ivoire !',
    route: 'San-Pédro → Abidjan',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-gradient-to-br from-white to-gray-50 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
            Ce que nos clients{' '}
            <span className="bg-gradient-to-r from-[#73C8D2] to-[#0046FF] bg-clip-text text-transparent">
              disent de nous
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 sm:text-xl">
            Rejoignez des milliers de voyageurs satisfaits qui font confiance à Navticket
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              {/* Quote Icon */}
              <div className="absolute right-4 top-4 opacity-10">
                <Quote className="h-16 w-16 text-[#73C8D2]" fill="currentColor" />
              </div>

              {/* Rating Stars */}
              <div className="relative mb-4 flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-[#FF9013] text-[#FF9013]"
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="relative mb-6 text-gray-700 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Route Badge */}
              <div className="mb-4">
                <span className="inline-block rounded-full bg-[#73C8D2]/10 px-3 py-1 text-sm font-medium text-[#73C8D2]">
                  {testimonial.route}
                </span>
              </div>

              {/* Customer Info */}
              <div className="relative flex items-center gap-3">
                {/* Avatar */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#73C8D2] to-[#0046FF] text-lg font-bold text-white">
                  {testimonial.avatar}
                </div>
                {/* Name & City */}
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.city}</p>
                </div>
              </div>

              {/* Hover border effect */}
              <div className="absolute inset-0 rounded-2xl border-2 border-[#73C8D2] opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid gap-8 rounded-2xl bg-gradient-to-r from-[#73C8D2]/10 to-[#0046FF]/10 p-8 text-center sm:grid-cols-3">
          <div>
            <p className="mb-2 text-4xl font-extrabold text-gray-900">10,000+</p>
            <p className="text-gray-600">Voyageurs satisfaits</p>
          </div>
          <div>
            <p className="mb-2 text-4xl font-extrabold text-gray-900">4.8/5</p>
            <p className="text-gray-600">Note moyenne</p>
          </div>
          <div>
            <p className="mb-2 text-4xl font-extrabold text-gray-900">98%</p>
            <p className="text-gray-600">Recommandent Navticket</p>
          </div>
        </div>
      </div>
    </section>
  );
}