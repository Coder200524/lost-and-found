import Link from 'next/link';
import { prisma } from '@/lib/prisma';

// React Server Component (FST Unit 1 & Unit 3: Native async RSC data fetching)
export default async function HomePage() {
  const [totalItems, openCount, resolvedCount, recentItems] = await Promise.all([
    prisma.item.count(),
    prisma.item.count({ where: { status: 'OPEN' } }),
    prisma.item.count({ where: { status: { in: ['CLAIMED', 'RESOLVED'] } } }),
    prisma.item.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    }),
  ]);

  const categories = [
    { name: 'Electronics', icon: '🎧', count: 'AirPods, Laptops, Phones', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { name: 'ID & Cards', icon: '🪪', count: 'College IDs, Metro Cards', color: 'bg-rose-50 border-rose-200 text-rose-700' },
    { name: 'Books & Stationery', icon: '📚', count: 'Textbooks, Notes, Calculators', color: 'bg-amber-50 border-amber-200 text-amber-700' },
    { name: 'Accessories', icon: '🎒', count: 'Bottles, Bags, Umbrellas', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { name: 'Keys', icon: '🔑', count: 'Bike, Car & Locker Keys', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { name: 'Clothing', icon: '🧥', count: 'Jackets, Hoodies, Caps', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-16">
      {/* Hero Section */}
      <section className="text-center flex flex-col items-center gap-6 pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-pink-700 text-xs font-semibold tracking-wide uppercase">
          <span>✨</span> Official SVKM DJSCE Portal
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-800 tracking-tight max-w-3xl leading-[1.15]">
          Lost something on campus? <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e8848f] via-[#9b8bdb] to-[#5b9fd4]">
            FinDora helps you reunite.
          </span>
        </h1>

        <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed">
          The smart campus lost and found system with Gemini AI-assisted matching, instant claim verifications,
          and cross-platform support for Web & Mobile.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/browse"
            className="px-6 py-3.5 rounded-full bg-[#e8848f] hover:bg-[#d86f7b] text-white font-semibold text-sm shadow-md hover:shadow-lg transition flex items-center gap-2"
          >
            <span>🔍</span> Browse Lost & Found
          </Link>
          <Link
            href="/post"
            className="px-6 py-3.5 rounded-full bg-white/90 hover:bg-white text-slate-800 font-semibold text-sm border border-pink-200 shadow-sm hover:shadow transition flex items-center gap-2"
          >
            <span>➕</span> Report Item
          </Link>
          <Link
            href="/swipe"
            className="px-6 py-3.5 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold text-sm border border-purple-200 shadow-sm transition flex items-center gap-2"
          >
            <span>✨</span> Gemini Smart Matcher
          </Link>
        </div>

        {/* Live Campus Counter */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-6 w-full max-w-xl">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">{totalItems}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Total Reported</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{resolvedCount}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Recovered / Claimed</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-500">{openCount}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Actively Seeking</div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Browse by Category</h2>
            <p className="text-xs sm:text-sm text-slate-500">Quickly filter through everyday campus items</p>
          </div>
          <Link href="/browse" className="text-xs sm:text-sm font-semibold text-pink-600 hover:underline">
            View All Categories →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/browse?category=${encodeURIComponent(cat.name)}`}
              className="glass-card p-4 flex flex-col items-center text-center gap-2 hover:-translate-y-1 hover:shadow-md transition cursor-pointer"
            >
              <span className="text-3xl">{cat.icon}</span>
              <div className="font-semibold text-slate-800 text-xs sm:text-sm">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Items Grid */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Recently Reported on Campus</h2>
            <p className="text-xs sm:text-sm text-slate-500">Directly fetched via React Server Components</p>
          </div>
          <Link href="/browse" className="text-xs sm:text-sm font-semibold text-pink-600 hover:underline">
            Search All {totalItems} Items →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentItems.map((item) => (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              className="glass-card overflow-hidden flex flex-col group hover:-translate-y-1 hover:shadow-lg transition duration-200"
            >
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
                />
              ) : (
                <div className="w-full h-44 bg-gradient-to-br from-pink-100 to-indigo-100 flex items-center justify-center text-4xl">
                  📦
                </div>
              )}

              <div className="p-5 flex flex-col flex-1 gap-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      item.type === 'LOST' ? 'badge-lost' : 'badge-found'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">📍 {item.location}</span>
                </div>

                <h3 className="font-bold text-slate-800 text-base line-clamp-1 group-hover:text-pink-600 transition">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed flex-1">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-pink-100/60 text-xs">
                  <span className="text-slate-500">📅 {item.dateOccurred}</span>
                  <span className="font-semibold text-pink-600 group-hover:underline">
                    View & Claim →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Gemini AI Spotlight */}
      <section className="glass-card p-8 sm:p-10 bg-gradient-to-r from-purple-50 via-pink-50 to-sky-50 border-purple-200 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col gap-3 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-200/70 text-purple-800 text-xs font-bold w-fit mx-auto md:mx-0">
            🤖 Gemini for Application Developers (ADF & FST)
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            AI-Powered Lost & Found Matching
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Our dual-stack system pairs Next.js with Flutter via REST APIs. Use the Gemini AI Assistant
            to automatically match lost items with newly found objects based on natural language descriptions!
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/swipe"
            className="px-6 py-3 rounded-full bg-purple-700 hover:bg-purple-800 text-white font-semibold text-sm shadow transition text-center"
          >
            Launch AI Matcher
          </Link>
          <Link
            href="/api/items"
            className="px-6 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 transition text-center"
          >
            Test REST Endpoints
          </Link>
        </div>
      </section>
    </div>
  );
}
