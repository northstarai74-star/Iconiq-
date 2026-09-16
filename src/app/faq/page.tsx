'use client';

import { useState } from 'react';

export const metadata = {
  title: 'FAQ | Iconiq Hair & Beauty',
  description: 'Frequently asked questions about Iconiq Hair & Beauty services.',
};

const faqs = [
  {
    q: 'Do I need to book an appointment in advance?',
    a: 'Yes, we recommend booking in advance to ensure your preferred time slot is available. Walk-ins are welcome based on stylist availability.',
  },
  {
    q: 'What is your cancellation policy?',
    a: 'Cancellations must be made 24 hours before your appointment. Late cancellations may incur a 50% service charge.',
  },
  {
    q: 'Do you use organic/natural products?',
    a: 'We use high-quality professional products from trusted brands. We\'re happy to discuss product options during your consultation.',
  },
  {
    q: 'How long do hair color results last?',
    a: 'Hair color typically lasts 4-6 weeks depending on the type of color and your hair care routine. We recommend touch-ups every 4-6 weeks for best results.',
  },
  {
    q: 'Can I see a specific stylist?',
    a: 'Absolutely! You can request your preferred stylist when booking. If they\'re unavailable, we\'ll suggest our best alternative.',
  },
  {
    q: 'Do you offer bridal packages?',
    a: 'Yes! We offer complete bridal packages including hair, makeup, and skin treatments. Book consultations 3-4 weeks before the event.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept cash, card, and digital payments. Online booking also accepts all major payment methods.',
  },
  {
    q: 'Are there any first-time client discounts?',
    a: 'Yes! New clients get 10% off their first service. Mention it when booking!',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-serif mb-4">Frequently Asked Questions</h1>
          <p className="text-xl opacity-90">Everything you need to know about our services</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 max-w-3xl mx-auto">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left bg-white hover:bg-slate-50 transition flex justify-between items-center"
              >
                <span className="font-semibold text-slate-800">{faq.q}</span>
                <span className="text-amber-600 text-xl">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                  <p className="text-slate-700">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="bg-slate-50 py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-serif mb-4 text-slate-800">Didn't Find Your Answer?</h2>
          <p className="text-slate-700 mb-6">
            Contact us directly and our team will be happy to help!
          </p>
          <div className="space-y-2">
            <p className="text-lg">
              <strong>📞 Call:</strong> <a href="tel:+917901895498" className="text-amber-600 hover:underline">+91 79018-95498</a>
            </p>
            <p className="text-lg">
              <strong>📧 Email:</strong> <a href="mailto:hello@iconiq.salon" className="text-amber-600 hover:underline">hello@iconiq.salon</a>
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-serif mb-4">Ready to Book?</h2>
          <a
            href="/book"
            className="inline-block bg-amber-400 text-slate-900 px-8 py-3 rounded font-semibold hover:bg-amber-300 transition"
          >
            Book Your Appointment
          </a>
        </div>
      </section>
    </main>
  );
}
