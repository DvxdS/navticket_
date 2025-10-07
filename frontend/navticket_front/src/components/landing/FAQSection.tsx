import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    id: 1,
    question: 'Comment réserver un billet sur Navticket ?',
    answer: 'C\'est très simple ! Sélectionnez votre ville de départ, votre destination et la date de voyage. Choisissez votre bus préféré parmi les options disponibles, renseignez vos informations et payez en ligne. Vous recevrez votre billet électronique immédiatement par email.',
  },
  {
    id: 2,
    question: 'Quels modes de paiement acceptez-vous ?',
    answer: 'Nous acceptons tous les moyens de paiement populaires en Côte d\'Ivoire : Orange Money, MTN Money, Wave, Moov Money, ainsi que les cartes bancaires Visa et Mastercard. Tous les paiements sont 100% sécurisés.',
  },
  {
    id: 3,
    question: 'Puis-je annuler ou modifier ma réservation ?',
    answer: 'Oui, vous pouvez annuler votre réservation jusqu\'à 24 heures avant le départ pour obtenir un remboursement complet. Pour les modifications, connectez-vous à votre compte et accédez à "Mes réservations". Des frais peuvent s\'appliquer selon la politique de la compagnie.',
  },
  {
    id: 4,
    question: 'Comment recevoir mon billet ?',
    answer: 'Après paiement, votre billet électronique avec code QR est envoyé instantanément à votre adresse email. Vous pouvez également le télécharger depuis votre compte. Il suffit de présenter le code QR sur votre téléphone le jour du voyage.',
  },
  {
    id: 5,
    question: 'Est-ce que mes informations sont sécurisées ?',
    answer: 'Absolument ! Nous utilisons un cryptage SSL de niveau bancaire pour protéger toutes vos données. Vos informations de paiement ne sont jamais stockées sur nos serveurs. Nous respectons strictement les normes de sécurité internationales.',
  },
  {
    id: 6,
    question: 'Que faire si j\'ai un problème le jour du voyage ?',
    answer: 'Notre équipe support est disponible 24/7 pour vous aider. Vous pouvez nous contacter par téléphone, email ou WhatsApp. En cas de problème avec votre billet, montrez votre email de confirmation et votre pièce d\'identité au chauffeur.',
  },
  {
    id: 7,
    question: 'Les prix incluent-ils les bagages ?',
    answer: 'Les conditions de bagages dépendent de chaque compagnie de transport. Généralement, un bagage en soute (jusqu\'à 20kg) et un bagage à main sont inclus. Les détails sont indiqués lors de la réservation et sur votre billet.',
  },
];

export default function FAQSection() {
  const [openId, setOpenId] = useState<number | null>(1); // First question open by default

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="bg-white px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-4xl">
        
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-[#73C8D2]/10 p-4">
              <HelpCircle className="h-12 w-12 text-[#73C8D2]" strokeWidth={2} />
            </div>
          </div>
          <h2 className="mb-4 text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
            Questions{' '}
            <span className="bg-gradient-to-r from-[#73C8D2] to-[#0046FF] bg-clip-text text-transparent">
              fréquentes
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 sm:text-xl">
            Tout ce que vous devez savoir sur Navticket
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white transition-all hover:border-[#73C8D2]/50"
              >
                {/* Question Button */}
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="flex w-full items-center justify-between gap-4 p-6 text-left transition-colors hover:bg-gray-50"
                >
                  <span className="text-lg font-bold text-gray-900 sm:text-xl">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-6 w-6 flex-shrink-0 text-[#73C8D2] transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Answer */}
                <div
                  className={`grid transition-all ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-gray-200 bg-gray-50 p-6">
                      <p className="leading-relaxed text-gray-700">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-2xl bg-gradient-to-r from-[#73C8D2]/10 to-[#0046FF]/10 p-8 text-center">
          <h3 className="mb-4 text-2xl font-bold text-gray-900">
            Vous avez d'autres questions ?
          </h3>
          <p className="mb-6 text-gray-600">
            Notre équipe est là pour vous aider 24/7
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="rounded-full bg-[#FF9013] px-8 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105">
              Contactez-nous
            </button>
            <button className="rounded-full border-2 border-gray-300 bg-white px-8 py-3 font-bold text-gray-900 transition-colors hover:bg-gray-50">
              Voir le centre d'aide
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}