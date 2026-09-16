import { STYLISTS } from '@/lib/salon';

export const metadata = {
  title: 'Our Team | Iconiq Hair & Beauty',
  description: 'Meet the talented stylists and beauty experts at Iconiq.',
};

export default function Team() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-serif mb-4">Meet Our Team</h1>
          <p className="text-xl opacity-90">Expert stylists dedicated to your beauty</p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {STYLISTS.map((stylist) => (
            <div key={stylist.id} className="text-center">
              {/* Avatar */}
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center mx-auto mb-6 text-5xl font-bold text-slate-900 shadow-lg">
                {stylist.name.split(' ').map(n => n[0]).join('')}
              </div>

              {/* Name & Title */}
              <h3 className="text-2xl font-semibold text-slate-800 mb-2">{stylist.name}</h3>
              <p className="text-amber-600 font-semibold text-lg mb-4">{stylist.title}</p>

              {/* Bio */}
              <p className="text-slate-600 mb-6">
                {stylist.title === 'Founder · Colour Director'
                  ? 'Visionary founder with expertise in complex color corrections and creative styling.'
                  : stylist.title === 'Senior Stylist'
                  ? 'Master of precision cutting with a reputation for creating perfect shapes and styles.'
                  : 'Specialist in hair health and beauty treatments for complete transformations.'}
              </p>

              {/* Specialties */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-800 mb-3">SPECIALTIES</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {stylist.specialties.map((specialty) => (
                    <span key={specialty} className="text-xs bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full font-medium">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Book Button */}
              <a
                href="/book"
                className="inline-block bg-amber-600 text-white px-6 py-2 rounded font-semibold hover:bg-amber-700 transition text-sm"
              >
                Book with {stylist.name.split(' ')[0]}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Our Team */}
      <section className="bg-slate-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-serif mb-12 text-center text-slate-800">Why Choose Our Team?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg border border-slate-200">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Expert Training</h3>
              <p className="text-slate-600">Our team undergoes continuous professional development and stays updated with latest trends and techniques.</p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-slate-200">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Years of Experience</h3>
              <p className="text-slate-600">Collectively, our stylists bring decades of professional experience and proven expertise.</p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-slate-200">
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Personal Care</h3>
              <p className="text-slate-600">We listen, understand your goals, and deliver personalized solutions tailored to you.</p>
            </div>

            <div className="bg-white p-8 rounded-lg border border-slate-200">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Premium Quality</h3>
              <p className="text-slate-600">We use only the finest products and professional-grade tools for best results.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-serif mb-4">Ready to Experience Our Expertise?</h2>
          <p className="text-lg mb-8 opacity-90">
            Book with your preferred stylist today!
          </p>
          <a
            href="/book"
            className="inline-block bg-amber-400 text-slate-900 px-8 py-3 rounded font-semibold hover:bg-amber-300 transition"
          >
            Book Now
          </a>
        </div>
      </section>
    </main>
  );
}
