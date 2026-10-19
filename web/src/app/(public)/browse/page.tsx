import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

interface BrowsePageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    type?: string;
    location?: string;
  }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?callbackUrl=/browse');
  }

  const params = await searchParams;
  const q = params.q || '';
  const selectedCategory = params.category || 'All';
  const selectedType = params.type || 'ALL';
  const selectedLocation = params.location || '';

  const whereClause: Record<string, unknown> = {};

  if (q) {
    whereClause.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { location: { contains: q } },
    ];
  }

  if (selectedCategory && selectedCategory !== 'All') {
    whereClause.category = selectedCategory;
  }

  if (selectedType && selectedType !== 'ALL') {
    whereClause.type = selectedType.toUpperCase();
  }

  if (selectedLocation) {
    whereClause.location = { contains: selectedLocation };
  }

  const [items, categoryCounts] = await Promise.all([
    prisma.item.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    }),
    prisma.item.groupBy({
      by: ['category'],
      _count: { id: true },
    }),
  ]);

  const countMap: Record<string, number> = {};
  categoryCounts.forEach((c) => {
    countMap[c.category] = c._count.id;
  });

  const categories = [
    { name: 'All', emoji: '✨' },
    { name: 'ID Cards', emoji: '🪪' },
    { name: 'Electronics', emoji: '📱' },
    { name: 'Bags', emoji: '🎒' },
    { name: 'Water Bottles', emoji: '🍶' },
    { name: 'Stationery', emoji: '✏️' },
    { name: 'Accessories', emoji: '⌚' },
    { name: 'Others', emoji: '📦' },
  ];

  const commonLocations = [
    { label: 'Canteen (Ground Fl)', query: 'Canteen' },
    { label: 'Central Library (1st Fl)', query: 'Library' },
    { label: '4th Floor IT Labs', query: 'Lab' },
    { label: 'Ground Floor Foyer', query: 'Ground' },
    { label: '6th Floor Classrooms', query: '6th Floor' },
    { label: 'Gymkhana & Turf', query: 'Gymkhana' },
  ];

  const buildUrl = (updates: Partial<{ q: string; category: string; type: string; location: string }>) => {
    const p = new URLSearchParams();
    const newQ = updates.q !== undefined ? updates.q : q;
    const newCat = updates.category !== undefined ? updates.category : selectedCategory;
    const newType = updates.type !== undefined ? updates.type : selectedType;
    const newLoc = updates.location !== undefined ? updates.location : selectedLocation;

    if (newQ) p.set('q', newQ);
    if (newCat && newCat !== 'All') p.set('category', newCat);
    if (newType && newType !== 'ALL') p.set('type', newType);
    if (newLoc) p.set('location', newLoc);

    const qs = p.toString();
    return `/browse${qs ? `?${qs}` : ''}`;
  };

  return (
    <div className="layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <form method="GET" action="/browse" className="search-wrap">
          <span className="search-icon">🔎</span>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search items…"
          />
          {selectedCategory !== 'All' && <input type="hidden" name="category" value={selectedCategory} />}
          {selectedType !== 'ALL' && <input type="hidden" name="type" value={selectedType} />}
          {selectedLocation && <input type="hidden" name="location" value={selectedLocation} />}
        </form>

        <div className="filter-section">
          <div className="filter-title">Type</div>
          <div className="type-filter">
            <Link
              href={buildUrl({ type: 'ALL' })}
              className={`type-btn all ${selectedType === 'ALL' ? 'active' : ''}`}
            >
              All
            </Link>
            <Link
              href={buildUrl({ type: 'LOST' })}
              className={`type-btn lost ${selectedType === 'LOST' ? 'active' : ''}`}
            >
              🔴 Lost
            </Link>
            <Link
              href={buildUrl({ type: 'FOUND' })}
              className={`type-btn found ${selectedType === 'FOUND' ? 'active' : ''}`}
            >
              🟢 Found
            </Link>
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-title">Category</div>
          <div className="cat-filter">
            {categories.map((c) => {
              const isActive = selectedCategory === c.name;
              const count = c.name === 'All' ? items.length : countMap[c.name] || 0;
              return (
                <Link
                  key={c.name}
                  href={buildUrl({ category: c.name })}
                  className={`cat-btn ${isActive ? 'active' : ''}`}
                >
                  <span>{c.emoji}</span>
                  <span>{c.name}</span>
                  <span className="cat-count">{count}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-title">Common Locations</div>
          <div className="loc-options">
            {commonLocations.map((loc) => {
              const isActive = selectedLocation === loc.query;
              return (
                <Link
                  key={loc.query}
                  href={buildUrl({ location: isActive ? '' : loc.query })}
                  className={`loc-btn ${isActive ? 'active' : ''}`}
                >
                  📍 {loc.label}
                </Link>
              );
            })}
          </div>
        </div>

        <Link href="/browse" className="clear-btn">
          ✕ Clear Filters
        </Link>
      </aside>

      {/* MAIN */}
      <main className="main">
        <div className="main-header">
          <h1 className="main-title">
            Browse Items{' '}
            <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-s)' }}>
              ({items.length} {items.length === 1 ? 'item' : 'items'})
            </span>
          </h1>
          <div className="main-actions">
            <Link href="/post" className="post-btn">
              + Post New Item
            </Link>
          </div>
        </div>

        {/* HOTSPOT BAR */}
        <div className="hotspot-bar">
          <span>🔥</span>
          <div>
            <strong>Campus Hotspot Alert:</strong> Canteen and 1st Floor Central Library are
            today&apos;s top reported locations. Check the security counter first!
          </div>
        </div>

        {/* AI BANNER */}
        <Link href="/swipe" className="ai-banner">
          <div className="ai-icon">🤖</div>
          <div className="ai-text">
            <h4>Gemini AI Match Suggestions Active</h4>
            <p>Our smart neural model automatically analyzes descriptions, categories, and timestamps to surface matches.</p>
          </div>
          <div className="ai-arrow">→</div>
        </Link>

        {/* ITEMS GRID */}
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-s)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔎</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>
              No items match your criteria
            </h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '18px' }}>
              Try searching with fewer filters or post a new lost/found report.
            </p>
            <Link href="/browse" className="post-btn" style={{ display: 'inline-block' }}>
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="items-grid">
            {items.map((item) => {
              const catObj = categories.find((c) => c.name === item.category);
              const emoji = catObj?.emoji || '📦';
              const isLost = item.type === 'LOST';

              return (
                <div key={item.id} className="item-card">
                  <div className="item-img">
                    <span className="item-img-bg">{emoji}</span>
                    <span style={{ position: 'relative', zIndex: 1 }}>{emoji}</span>
                    <span className={`item-type-badge ${isLost ? 'badge-lost' : 'badge-found'}`}>
                      {item.type}
                    </span>
                    {item.isHotspot && (
                      <span className="ai-match-badge">🔥 Hotspot</span>
                    )}
                  </div>
                  <div className="item-body">
                    <div className="item-cat">{item.category}</div>
                    <div className="item-name">{item.title}</div>
                    <div className="item-desc">{item.description}</div>
                    <div className="item-meta">
                      <span>📍 {item.location}</span>
                      <span>📅 {item.dateOccurred}</span>
                    </div>
                    <div className="item-footer">
                      <Link href={`/items/${item.id}`} className="btn-sm btn-view">
                        View Details
                      </Link>
                      <Link href={`/swipe`} className="btn-sm btn-swipe">
                        Match / Swipe
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
