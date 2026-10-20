import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import MobileCategoryCarousel from '@/components/MobileCategoryCarousel';
import MobileFeatureCards from '@/components/MobileFeatureCards';

export default async function HomePage() {
  const [totalItems, resolvedCount, recentItems, currentUser] = await Promise.all([
    prisma.item.count(),
    prisma.item.count({ where: { status: { in: ['CLAIMED', 'RESOLVED'] } } }),
    prisma.item.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    }),
    getCurrentUser(),
  ]);

  const categoryEmojiMap: Record<string, string> = {
    'ID Cards': '🪪',
    'Electronics': '📱',
    'Bags': '🎒',
    'Water Bottles': '🍶',
    'Stationery': '✏️',
    'Accessories': '⌚',
    'Others': '📦',
  };

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            {currentUser ? `✦ Welcome Back, ${currentUser.name.split(' ')[0]}` : '✦ SVKM Students Only'}
          </div>
          <h1>
            Lost something?<br />
            <em>Swipe to find it.</em>
          </h1>
          <p>
            A smart, secure Lost &amp; Found platform exclusively for the SVKM campus community. Post,
            match, and reunite — all in one place.
          </p>
          <div className="hero-actions">
            {currentUser ? (
              <>
                <Link href="/browse" className="btn-primary">
                  🔍 Browse Catalog
                </Link>
                <Link href="/post" className="btn-secondary">
                  ➕ Report Item
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-primary">
                  🚀 Student Sign In
                </Link>
                <Link href="/login?callbackUrl=/browse" className="btn-secondary">
                  🔒 Browse Items
                </Link>
              </>
            )}
          </div>
          <div className="stats">
            <div className="stat">
              <div className="stat-num">{resolvedCount > 0 ? `${resolvedCount}+` : '240+'}</div>
              <div className="stat-label">Items Reunited</div>
            </div>
            <div className="stat-div"></div>
            <div className="stat">
              <div className="stat-num">1.2k</div>
              <div className="stat-label">Verified Students</div>
            </div>
            <div className="stat-div"></div>
            <div className="stat">
              <div className="stat-num">92%</div>
              <div className="stat-label">Match Rate</div>
            </div>
          </div>
        </div>
        <div className="scroll-cue">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 3v10M3 9l5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      {/* FEATURES */}
      <div className="section">
        <div className="section-label">Core Features</div>
        <h2 className="section-title">
          Everything you need to<br />
          recover what&apos;s yours
        </h2>
        <p className="section-sub">
          From smart AI matching to secure in-app chat — FinDora has you covered.
        </p>

        <div className="features-grid">
          <Link href="/post" className="feature-card">
            <div className="feature-icon" style={{ background: 'var(--rose)' }}>
              📝
            </div>
            <h3>Post Lost &amp; Found</h3>
            <p>Report a lost or found item with details, photos, and location in under a minute.</p>
          </Link>
          <Link href="/swipe" className="feature-card">
            <div className="feature-icon" style={{ background: 'var(--lavender)' }}>
              👆
            </div>
            <h3>Swipe to Match</h3>
            <p>Tinder-style card swiping to find potential matches — swipe right if it could be yours.</p>
          </Link>
          <Link href="/browse" className="feature-card">
            <div className="feature-icon" style={{ background: 'var(--mint)' }}>
              🔎
            </div>
            <h3>Smart Search &amp; Filter</h3>
            <p>Search by category, date, location or keyword to quickly locate your missing item.</p>
          </Link>
          <Link href="/chat" className="feature-card">
            <div className="feature-icon" style={{ background: 'var(--sky)' }}>
              💬
            </div>
            <h3>Secure In-App Chat</h3>
            <p>Chat unlocks only after a match — your identity and contact info stays private.</p>
          </Link>
          <Link href="/swipe" className="feature-card">
            <div className="feature-icon" style={{ background: 'var(--peach)' }}>
              🤖
            </div>
            <h3>AI Match Suggestions</h3>
            <p>Our AI engine analyses descriptions and metadata to proactively suggest likely matches.</p>
          </Link>
          <Link href="/profile" className="feature-card">
            <div className="feature-icon" style={{ background: 'var(--lemon)' }}>
              ⭐
            </div>
            <h3>Rewards &amp; Points</h3>
            <p>Earn points each time you successfully return a found item to its rightful owner.</p>
          </Link>
        </div>

        {/* Mobile Swipeable Feature Cards Carousel */}
        <MobileFeatureCards />
      </div>

      {/* HOW IT WORKS */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 0 96px' }}>
        <div className="how-section">
          <div className="section-label" style={{ color: 'var(--lav-d)' }}>
            How It Works
          </div>
          <h2 className="section-title">
            From lost to found<br />
            in 7 simple steps
          </h2>

          <div className="steps">
            <div className="steps-timeline-line" aria-hidden="true" />
            <div className="step step-1">
              <div className="step-num" style={{ background: 'var(--rose)', color: 'var(--rose-d)' }}>
                1
              </div>
              <div className="step-card">
                <h4>Login with SAP ID</h4>
                <p>Authenticate securely using your SVKM SAP ID &amp; OTP</p>
              </div>
            </div>
            <div className="step step-2">
              <div
                className="step-num"
                style={{ background: 'var(--lavender)', color: 'var(--lav-d)' }}
              >
                2
              </div>
              <div className="step-card">
                <h4>Choose Action</h4>
                <p>Report a lost item or a found item</p>
              </div>
            </div>
            <div className="step step-3">
              <div className="step-num" style={{ background: 'var(--mint)', color: 'var(--mint-d)' }}>
                3
              </div>
              <div className="step-card">
                <h4>Fill Details</h4>
                <p>Add description, category, location &amp; photo</p>
              </div>
            </div>
            <div className="step step-4">
              <div className="step-num" style={{ background: 'var(--sky)', color: 'var(--sky-d)' }}>
                4
              </div>
              <div className="step-card">
                <h4>Browse &amp; Swipe</h4>
                <p>Swipe through potential matches or use search</p>
              </div>
            </div>
            <div className="step step-5">
              <div className="step-num" style={{ background: 'var(--peach)', color: '#c07a3a' }}>
                5
              </div>
              <div className="step-card">
                <h4>Get Matched</h4>
                <p>Both parties confirm — you both get notified</p>
              </div>
            </div>
            <div className="step step-6">
              <div className="step-num" style={{ background: 'var(--lemon)', color: '#8a7a00' }}>
                6
              </div>
              <div className="step-card">
                <h4>Chat &amp; Verify</h4>
                <p>Prove ownership via secure in-app chat</p>
              </div>
            </div>
            <div className="step step-7">
              <div className="step-num" style={{ background: 'var(--rose)', color: 'var(--rose-d)' }}>
                7
              </div>
              <div className="step-card">
                <h4>Return Item 🎉</h4>
                <p>Arrange handover at college security desk</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="section-label">Item Categories</div>
        <h2 className="section-title">What can you post?</h2>
        
        {/* Desktop Categories Grid */}
        <div className="cats-grid cats-grid-desktop">
          <Link href="/browse?category=ID+Cards" className="cat-pill">
            <span>🪪</span> ID Cards
          </Link>
          <Link href="/browse?category=Electronics" className="cat-pill">
            <span>📱</span> Electronics
          </Link>
          <Link href="/browse?category=Bags" className="cat-pill">
            <span>🎒</span> Bags
          </Link>
          <Link href="/browse?category=Water+Bottles" className="cat-pill">
            <span>🍶</span> Water Bottles
          </Link>
          <Link href="/browse?category=Stationery" className="cat-pill">
            <span>✏️</span> Stationery
          </Link>
          <Link href="/browse?category=Accessories" className="cat-pill">
            <span>⌚</span> Accessories
          </Link>
          <Link href="/browse?category=Others" className="cat-pill">
            <span>📦</span> Others
          </Link>
        </div>

        {/* Mobile Infinite Circular Carousel */}
        <div className="cats-mobile-wrapper">
          <MobileCategoryCarousel />
        </div>
      </div>

      {/* RECENTLY REPORTED SHOWCASE */}
      {recentItems.length > 0 && (
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="section-label">Live Campus Feed</div>
              <h2 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '4px' }}>
                Recently Reported Items
              </h2>
            </div>
            <Link href="/browse" className="text-sm font-semibold text-rose-600 hover:underline">
              View All {totalItems} Items →
            </Link>
          </div>

          <div className="items-grid">
            {recentItems.map((item) => {
              const emoji = categoryEmojiMap[item.category] || '📦';
              const isLost = item.type === 'LOST';
              return (
                <div key={item.id} className="item-card">
                  <div className="item-img">
                    <span className="item-img-bg">{emoji}</span>
                    <span style={{ position: 'relative', zIndex: 1 }}>{emoji}</span>
                    <span
                      className={`item-type-badge ${isLost ? 'badge-lost' : 'badge-found'}`}
                    >
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
        </div>
      )}
    </>
  );
}
