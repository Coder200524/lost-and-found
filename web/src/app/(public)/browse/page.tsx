import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface BrowsePageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    type?: string;
    status?: string;
  }>;
}

// React Server Component (FST Unit 3: Native async data fetching with search parameters)
export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const q = params.q || '';
  const category = params.category || 'All';
  const type = params.type || 'ALL';
  const status = params.status || 'ALL';

  const whereClause: Record<string, unknown> = {};

  if (q) {
    whereClause.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { location: { contains: q } },
    ];
  }

  if (category && category !== 'All') {
    whereClause.category = category;
  }

  if (type && type !== 'ALL') {
    whereClause.type = type.toUpperCase();
  }

  if (status && status !== 'ALL') {
    whereClause.status = status.toUpperCase();
  }

  const items = await prisma.item.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  });

  const categories = [
    'All',
    'ID Cards',
    'Bottles',
    'Stationery',
    'Electronics',
    'Bags',
    'Accessories',
    'Others',
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Browse Lost & Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Displaying {items.length} items from SVKM DJSCE campus database
          </p>
        </div>

        {/* Search form */}
        <form method="GET" action="/browse" className="w-full md:w-80 relative">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search items, rooms, or keys..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/90 border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 shadow-sm"
          />
          <span className="absolute left-3.5 top-2.5 text-slate-400">🔍</span>
          {category !== 'All' && <input type="hidden" name="category" value={category} />}
          {type !== 'ALL' && <input type="hidden" name="type" value={type} />}
        </form>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Type pills: ALL, LOST, FOUND */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">Type:</span>
          {['ALL', 'LOST', 'FOUND'].map((t) => {
            const isActive = type === t;
            const queryParams = new URLSearchParams();
            if (q) queryParams.set('q', q);
            if (category !== 'All') queryParams.set('category', category);
            if (t !== 'ALL') queryParams.set('type', t);
            if (status !== 'ALL') queryParams.set('status', status);

            return (
              <Link
                key={t}
                href={`/browse?${queryParams.toString()}`}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                  isActive
                    ? 'bg-slate-800 text-white shadow'
                    : 'bg-white/70 text-slate-600 hover:bg-white border border-pink-100'
                }`}
              >
                {t}
              </Link>
            );
          })}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 shrink-0">
            Category:
          </span>
          {categories.map((c) => {
            const isActive = category === c;
            const queryParams = new URLSearchParams();
            if (q) queryParams.set('q', q);
            if (c !== 'All') queryParams.set('category', c);
            if (type !== 'ALL') queryParams.set('type', type);
            if (status !== 'ALL') queryParams.set('status', status);

            return (
              <Link
                key={c}
                href={`/browse?${queryParams.toString()}`}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition ${
                  isActive
                    ? 'bg-[#e8848f] text-white shadow-sm'
                    : 'bg-white/70 text-slate-700 hover:bg-pink-100/50 border border-pink-200/50'
                }`}
              >
                {c}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-4">
          <span className="text-5xl">🔍</span>
          <h3 className="text-xl font-bold text-slate-800">No matching items found</h3>
          <p className="text-sm text-slate-500 max-w-md">
            Try adjusting your search keywords, clearing filters, or report this item if you lost or found it!
          </p>
          <div className="flex gap-3">
            <Link
              href="/browse"
              className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
            >
              Reset Filters
            </Link>
            <Link
              href="/post"
              className="px-4 py-2 rounded-full bg-[#e8848f] text-white text-xs font-semibold transition"
            >
              Report New Item
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
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
                  className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-pink-100 to-indigo-100 flex items-center justify-center text-5xl">
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
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      item.status === 'RESOLVED'
                        ? 'badge-resolved'
                        : item.status === 'CLAIMED'
                        ? 'badge-claimed'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-base line-clamp-1 group-hover:text-pink-600 transition">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed flex-1">
                  {item.description}
                </p>

                <div className="text-xs text-slate-500 flex flex-col gap-1 pt-2 border-t border-pink-100/60">
                  <div className="flex items-center justify-between">
                    <span>📍 {item.location}</span>
                    <span>📁 {item.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>📅 {item.dateOccurred}</span>
                    <span className="font-semibold text-pink-600 group-hover:underline">Details & Claim →</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
