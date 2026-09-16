export const metadata = {
  title: 'Blog | Iconiq Hair & Beauty',
  description: 'Tips, trends, and expert advice on hair care, beauty, and wellness from Iconiq.',
};

const blogPosts = [
  {
    title: '5 Pro Tips for Healthy Hair Between Salon Visits',
    excerpt: 'Learn expert tips to keep your hair healthy and beautiful between appointments...',
    date: 'Sept 15, 2026',
    category: 'Hair Care',
    read_time: '5 min',
  },
  {
    title: 'This Fall\'s Hottest Hair Color Trends',
    excerpt: 'Discover the trending hair colors for autumn 2026 and how to rock them...',
    date: 'Sept 10, 2026',
    category: 'Trends',
    read_time: '4 min',
  },
  {
    title: 'Keratin Treatment: Worth the Investment?',
    excerpt: 'Everything you need to know about keratin treatments, benefits, and aftercare...',
    date: 'Sept 5, 2026',
    category: 'Treatments',
    read_time: '6 min',
  },
  {
    title: 'How to Choose the Right Haircut for Your Face Shape',
    excerpt: 'Find the perfect haircut that flatters your unique facial features...',
    date: 'Aug 28, 2026',
    category: 'Styling',
    read_time: '5 min',
  },
  {
    title: 'Men\'s Grooming: Beard Care Essentials',
    excerpt: 'Essential tips for maintaining a healthy, well-groomed beard...',
    date: 'Aug 20, 2026',
    category: 'Grooming',
    read_time: '4 min',
  },
  {
    title: 'Wedding Season: Bridal Hair Guide',
    excerpt: 'Everything you need to know to plan your perfect bridal hair for the big day...',
    date: 'Aug 15, 2026',
    category: 'Bridal',
    read_time: '7 min',
  },
];

export default function Blog() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-serif mb-4">Beauty & Hair Blog</h1>
          <p className="text-xl opacity-90">Expert tips, trends, and advice from our stylists</p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <article key={index} className="bg-slate-50 rounded-lg overflow-hidden hover:shadow-lg transition border border-slate-200">
              {/* Placeholder Image */}
              <div className="h-48 bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center text-4xl">
                📝
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-amber-600 uppercase">{post.category}</span>
                  <span className="text-xs text-slate-500">{post.read_time} read</span>
                </div>

                <h3 className="text-xl font-semibold text-slate-800 mb-3 line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-slate-600 mb-4 text-sm line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <span className="text-xs text-slate-500">{post.date}</span>
                  <a href="#" className="text-amber-600 hover:text-amber-700 font-semibold text-sm">
                    Read More →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-slate-50 py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-serif mb-4 text-slate-800">Stay Updated</h2>
          <p className="text-slate-700 mb-6">
            Subscribe to get the latest beauty tips and salon updates delivered to your inbox.
          </p>
          <form className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-4 py-3 border border-slate-300 rounded focus:outline-none focus:border-amber-600"
            />
            <button
              type="submit"
              className="bg-amber-600 text-white px-6 py-3 rounded font-semibold hover:bg-amber-700 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-serif mb-4">Ready for a Transformation?</h2>
          <p className="text-lg mb-8 opacity-90">
            Book a consultation with our experts today!
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
