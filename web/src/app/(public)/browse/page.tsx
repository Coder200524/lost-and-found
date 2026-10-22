import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  SearchLineIcon,
  LocationLineIcon,
  CalendarLineIcon,
  CategoryLineIcon,
} from '@/components/LineIcons';

interface BrowsePageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    type?: string;
    location?: string;
    sort?: string;
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
  const selectedType = params.type || 'ALL'; // ALL, LOST, FOUND, CLAIMED
  const selectedLocation = params.location || '';
  const selectedSort = params.sort || 'latest';

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

  // Separate Item Sections (Requirement A)
  // 1. Lost Items: Active reports of items students lost (status: OPEN)
  // 2. Found Items: Active reports of recovered items (status: OPEN)
  // 3. Claimed Items: Items with an approved claim (status: CLAIMED or RESOLVED)
  if (selectedType === 'CLAIMED') {
    whereClause.status = { in: ['CLAIMED', 'RESOLVED'] };
  } else if (selectedType === 'LOST') {
    whereClause.type = 'LOST';
    whereClause.status = 'OPEN';
  } else if (selectedType === 'FOUND') {
    whereClause.type = 'FOUND';
    whereClause.status = 'OPEN';
  } else {
    // ALL Active Reports
    whereClause.status = 'OPEN';
  }

  if (selectedLocation) {
    whereClause.location = { contains: selectedLocation };
  }

  const orderBy = selectedSort === 'oldest' ? { createdAt: 'asc' as const } : { createdAt: 'desc' as const };

  const [
    items,
    categoryCounts,
    allCount,
    lostCount,
    foundCount,
    claimedCount,
    userClaimsCount,
  ] = await Promise.all([
    prisma.item.findMany({
      where: whereClause,
      orderBy,
      include: {
        user: true,
        claims: {
          where: { status: 'APPROVED' },
        },
      },
    }),
    prisma.item.groupBy({
      by: ['category'],
      _count: { id: true },
    }),
    prisma.item.count({ where: { status: 'OPEN' } }),
    prisma.item.count({ where: { type: 'LOST', status: 'OPEN' } }),
    prisma.item.count({ where: { type: 'FOUND', status: 'OPEN' } }),
    prisma.item.count({ where: { status: { in: ['CLAIMED', 'RESOLVED'] } } }),
    prisma.claim.count({
      where: { claimantId: user.id },
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
    { label: 'All Locations', query: '', emoji: '📍' },
    { label: 'Canteen (Ground Fl)', query: 'Canteen', emoji: '🍽️' },
    { label: 'Central Library (1st Fl)', query: 'Library', emoji: '📚' },
    { label: '4th Floor IT Labs', query: 'Lab', emoji: '💻' },
    { label: 'Ground Floor Foyer', query: 'Ground', emoji: '🏫' },
    { label: '6th Floor Classrooms', query: '6th Floor', emoji: '🚪' },
    { label: 'Gymkhana & Turf', query: 'Gymkhana', emoji: '🏃' },
  ];

  const buildUrl = (updates: Partial<{ q: string; category: string; type: string; location: string; sort: string }>) => {
    const p = new URLSearchParams();
    const newQ = updates.q !== undefined ? updates.q : q;
    const newCat = updates.category !== undefined ? updates.category : selectedCategory;
    const newType = updates.type !== undefined ? updates.type : selectedType;
    const newLoc = updates.location !== undefined ? updates.location : selectedLocation;
    const newSort = updates.sort !== undefined ? updates.sort : selectedSort;

    if (newQ) p.set('q', newQ);
    if (newCat && newCat !== 'All') p.set('category', newCat);
    if (newType && newType !== 'ALL') p.set('type', newType);
    if (newLoc) p.set('location', newLoc);
    if (newSort && newSort !== 'latest') p.set('sort', newSort);

    const qs = p.toString();
    return `/browse${qs ? `?${qs}` : ''}`;
  };

  return (
    <div className="layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        {/* Search */}
        <form method="GET" action="/browse" className="search-wrap">
          <span className="search-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <SearchLineIcon size={16} />
          </span>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search items, locations…"
          />
          {selectedCategory !== 'All' && <input type="hidden" name="category" value={selectedCategory} />}
          {selectedType !== 'ALL' && <input type="hidden" name="type" value={selectedType} />}
          {selectedLocation && <input type="hidden" name="location" value={selectedLocation} />}
        </form>

        {/* Category Filter */}
        <div className="filter-section">
          <div className="filter-title">Category</div>
          <div className="cat-filter">
            {categories.map((c) => {
              const isActive = selectedCategory === c.name;
              const count = c.name === 'All' ? allCount : countMap[c.name] || 0;
              return (
                <Link
                  key={c.name}
                  href={buildUrl({ category: c.name })}
                  className={`cat-btn ${isActive ? 'active' : ''}`}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <CategoryLineIcon category={c.name} size={16} />
                  </span>
                  <span>{c.name}</span>
                  <span className="cat-count">{count}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Campus Hotspots Locations */}
        <div className="filter-section">
          <div className="filter-title">Campus Locations</div>
          <div className="loc-options">
            {commonLocations.map((loc) => {
              const isActive = (!selectedLocation && !loc.query) || selectedLocation === loc.query;
              return (
                <Link
                  key={loc.label}
                  href={buildUrl({ location: loc.query })}
                  className={`loc-btn ${isActive ? 'active' : ''}`}
                >
                  <span>{loc.emoji}</span> {loc.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Clear Filters */}
        {(q || selectedCategory !== 'All' || selectedType !== 'ALL' || selectedLocation) && (
          <div className="filter-section">
            <Link href="/browse" className="clear-btn">
              <span>✕</span> Clear All Filters
            </Link>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main">
        {/* Main Header */}
        <div className="main-header">
          <div>
            <h1 className="main-title">Browse Items</h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-s)', marginTop: '4px' }}>
              Showing <strong>{items.length}</strong>{' '}
              {selectedType === 'CLAIMED'
                ? 'claimed & reunited items'
                : selectedType === 'LOST'
                ? 'active lost reports'
                : selectedType === 'FOUND'
                ? 'active found reports'
                : 'active reports'}
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
              {selectedLocation && ` near ${selectedLocation}`}
              {' '}across SVKM DJSCE campus
            </p>
          </div>

          <div className="main-actions">
            <Link href="/post" className="post-btn">
              <span>+</span> Post Item
            </Link>
            <Link
              href="/swipe"
              className="btn-secondary"
              style={{ padding: '9px 18px', borderRadius: '10px', fontSize: '0.86rem' }}
            >
              <span>🃏</span> Swipe Matcher
            </Link>
          </div>
        </div>

        {/* 4 Separate Sections Navigation Tabs (Prominent & Spacious) */}
        <div className="view-tabs">
          <Link
            href={buildUrl({ type: 'ALL' })}
            className={`view-tab ${selectedType === 'ALL' ? 'active' : ''}`}
          >
            <span>✨ All Active</span>
            <span className="tab-count">{allCount}</span>
          </Link>
          <Link
            href={buildUrl({ type: 'LOST' })}
            className={`view-tab ${selectedType === 'LOST' ? 'active' : ''}`}
          >
            <span>🔴 Lost Items</span>
            <span className="tab-count">{lostCount}</span>
          </Link>
          <Link
            href={buildUrl({ type: 'FOUND' })}
            className={`view-tab ${selectedType === 'FOUND' ? 'active' : ''}`}
          >
            <span>🟢 Found Items</span>
            <span className="tab-count">{foundCount}</span>
          </Link>
          <Link
            href={buildUrl({ type: 'CLAIMED' })}
            className={`view-tab ${selectedType === 'CLAIMED' ? 'active' : ''}`}
          >
            <span>🤝 Claimed Items</span>
            <span className="tab-count">{claimedCount}</span>
          </Link>
          <Link
            href="/profile#my-claims"
            className="view-tab"
            style={{
              marginLeft: 'auto',
              border: '1.5px dashed var(--rose-d)',
              background: 'rgba(232, 132, 143, 0.08)',
            }}
          >
            <span>📋 My Claims</span>
            <span
              className="tab-count"
              style={{ background: 'var(--rose-d)', color: 'white' }}
            >
              {userClaimsCount}
            </span>
          </Link>
        </div>

        {/* AI Semantic Matcher Banner */}
        <div className="ai-banner">
          <div className="ai-icon">🤖</div>
          <div className="ai-text">
            <h4>SVKM AI Semantic Item Matcher</h4>
            <p>
              Looking for a lost item? Our AI analyzes visual and descriptive clues across reports to find candidate matches automatically.
            </p>
          </div>
          <Link
            href="/swipe"
            className="ai-arrow"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            Launch AI Swipe →
          </Link>
        </div>

        {/* Hotspot Alert Bar */}
        <div className="hotspot-bar">
          🔥 <strong>Campus Hotspot Alert:</strong> Canteen, Central Library 3rd Floor, and 4th Floor IT Labs are today&apos;s most-reported loss areas.
        </div>

        {/* Items Grid */}
        {items.length === 0 ? (
          <div className="empty" style={{ textAlign: 'center', padding: '64px 20px' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>📭</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>
              {selectedType === 'CLAIMED'
                ? 'No claimed items found'
                : 'No reports match your filters'}
            </h3>
            <p style={{ color: 'var(--text-s)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Try searching with fewer filters or post a new lost/found report.
            </p>
            <Link href="/browse" className="post-btn" style={{ display: 'inline-flex' }}>
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="items-grid">
            {items.map((item) => {
              const catObj = categories.find((c) => c.name === item.category);
              const emoji = catObj?.emoji || '📦';
              const isLost = item.type === 'LOST';
              const approvedClaim = item.claims?.[0];

              return (
                <div key={item.id} className="item-card">
                  <div className="item-img">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <>
                        <span className="item-img-bg" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CategoryLineIcon category={item.category} size={64} style={{ opacity: 0.2 }} />
                        </span>
                        <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>
                          <CategoryLineIcon category={item.category} size={36} />
                        </span>
                      </>
                    )}
                    <span className={`item-type-badge ${isLost ? 'badge-lost' : 'badge-found'}`}>
                      {item.type}
                    </span>
                    {item.isHotspot && (
                      <span className="ai-match-badge">🔥 Hotspot</span>
                    )}
                    {item.status === 'CLAIMED' && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '10px',
                          left: '10px',
                          background: 'rgba(91, 159, 212, 0.95)',
                          color: 'white',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                        }}
                      >
                        ⏳ Claim Approved
                      </span>
                    )}
                    {item.status === 'RESOLVED' && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '10px',
                          left: '10px',
                          background: 'rgba(91, 191, 142, 0.95)',
                          color: 'white',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                        }}
                      >
                        🎉 Reunited
                      </span>
                    )}
                  </div>
                  <div className="item-body">
                    <div className="item-cat">{item.category}</div>
                    <div className="item-name">{item.title}</div>
                    <div className="item-desc">{item.description}</div>
                    <div className="item-meta">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <LocationLineIcon size={13} />
                        <span>{item.location}</span>
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CalendarLineIcon size={13} />
                        <span>{item.dateOccurred}</span>
                      </span>
                    </div>

                    {/* Claimed Items Section Details (Requirement F) */}
                    {(item.status === 'CLAIMED' || item.status === 'RESOLVED') && (
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: 'rgba(91, 159, 212, 0.08)',
                          border: '1px solid rgba(91, 159, 212, 0.25)',
                          fontSize: '0.75rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, color: 'var(--sky-d)' }}>
                            Verified Owner:
                          </span>
                          <span style={{ fontWeight: 600 }}>
                            {approvedClaim ? approvedClaim.claimantName : 'Verified Student'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-s)', marginTop: '2px' }}>
                          Status: {item.status === 'RESOLVED' ? 'Reunited (Handover Completed)' : 'Awaiting Security Desk Handover'}
                        </div>
                      </div>
                    )}

                    <div className="item-footer">
                      <Link href={`/items/${item.id}`} className="btn-sm btn-view">
                        View Details
                      </Link>
                      {item.status === 'OPEN' && (
                        <Link href={`/swipe`} className="btn-sm btn-swipe">
                          Match / Swipe
                        </Link>
                      )}
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
