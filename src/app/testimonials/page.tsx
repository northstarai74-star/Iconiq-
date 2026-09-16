export const metadata = {
  title: 'Testimonials | Iconiq Hair & Beauty',
  description: 'Read what our happy clients say about their experience at Iconiq.',
};

const testimonials = [
  {
    name: 'Priya Singh',
    service: 'Hair Colouring',
    rating: 5,
    text: 'The best hair color I\'ve ever had! The team took time to understand what I wanted and delivered perfectly. Highly recommended!',
  },
  {
    name: 'Aisha Patel',
    service: 'Haircut & Styling',
    rating: 5,
    text: 'Finally found a salon that understands my hair type. The haircut is perfect and lasts so well. Will be coming back!',
  },
  {
    name: 'Simran Kaur',
    service: 'Bridal Makeup',
    rating: 5,
    text: 'Made me feel like a queen on my wedding day! The makeup was flawless and held up beautifully. Thank you Iconiq!',
  },
  {
    name: 'Neha Verma',
    service: 'Facial & Skincare',
    rating: 5,
    text: 'My skin has never looked better. The staff is so knowledgeable and genuinely cares about your skin health.',
  },
  {
    name: 'Divya Sharma',
    service: 'Hair Treatment',
    rating: 5,
    text: 'The keratin treatment changed my life! My hair is so smooth and manageable now. Worth every penny.',
  },
  {
    name: 'Aadhya Nair',
    service: 'Nail Services',
    rating: 5,
    text: 'Beautiful nails and amazing customer service. They remember my preferences and nail art style. Truly personal care!',
  },
];

export default function Testimonials() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-serif mb-4">What Our Clients Say</h1>
          <p className="text-xl opacity-90">⭐⭐⭐⭐⭐ 4.9 Rating from 200+ Happy Clients</p>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-slate-50 p-8 rounded-lg border border-slate-200 hover:shadow-lg transition">
              {/* Stars */}
              <div className="text-amber-400 text-lg mb-3">
                {'⭐'.repeat(testimonial.rating)}
              </div>

              {/* Text */}
              <p className="text-slate-700 mb-6 italic">"{testimonial.text}"</p>

              {/* Author */}
              <div className="border-t border-slate-200 pt-4">
                <p className="font-semibold text-slate-800">{testimonial.name}</p>
                <p className="text-sm text-slate-600">{testimonial.service}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-50 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-amber-600 mb-2">200+</div>
              <p className="text-slate-700">Happy Clients</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-amber-600 mb-2">4.9★</div>
              <p className="text-slate-700">Average Rating</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-amber-600 mb-2">5+</div>
              <p className="text-slate-700">Years Experience</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-amber-600 mb-2">100%</div>
              <p className="text-slate-700">Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-serif mb-4">Join Our Happy Clients</h2>
          <p className="text-lg mb-8 opacity-90">
            Experience the Iconiq difference today. Book your appointment now!
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
