import { SALON, STYLISTS } from '@/lib/salon';

export const metadata = {
  title: `About ${SALON.name}`,
  description: 'Learn about Iconiq Hair & Beauty and our team of expert stylists.',
};

export default function About() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-serif mb-4">About Iconiq</h1>
          <p className="text-xl opacity-90">Your hair, your way. Since 2019.</p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <h2 className="text-4xl font-serif mb-8 text-center text-slate-800">Our Story</h2>
        <div className="prose max-w-none text-lg text-slate-700 space-y-6">
          <p>
            Iconiq Hair & Beauty was founded in 2019 with a simple belief: that great hair care
            should combine expertise with a personal touch. We started as a small salon with a big vision
            to become the most trusted beauty destination in Nawanshahr.
          </p>
          <p>
            Today, we're proud to serve hundreds of happy clients who trust us with their hair, skin,
            nails, and makeup needs. Our success is built on three pillars: exceptional technique,
            premium products, and genuine care for every client who walks through our doors.
          </p>
          <p>
            Whether you're looking for a fresh cut, a bold color change, or complete beauty transformation,
            Iconiq is your go-to salon. We combine the latest trends with timeless techniques to create
            looks that make you feel confident and beautiful.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-serif mb-12 text-center text-slate-800">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Excellence</h3>
              <p className="text-slate-600">We pursue perfection in every service, using premium products and proven techniques.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Care</h3>
              <p className="text-slate-600">We genuinely care about our clients and treat every person like family.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Trust</h3>
              <p className="text-slate-600">We build lasting relationships through honesty, integrity, and consistent results.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <h2 className="text-4xl font-serif mb-12 text-center text-slate-800">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STYLISTS.map((stylist) => (
            <div key={stylist.id} className="text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-slate-900">
                {stylist.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="text-xl font-semibold text-slate-800">{stylist.name}</h3>
              <p className="text-amber-600 font-semibold text-sm mb-3">{stylist.title}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {stylist.specialties.map((spec) => (
                  <span key={spec} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-serif mb-4">Ready to Experience Iconiq?</h2>
          <p className="text-lg mb-8 opacity-90">
            Visit us today and discover why Iconiq is Nawanshahr's favorite salon.
          </p>
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
