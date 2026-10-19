import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?callbackUrl=/profile');
  }

  const [userItems, userClaims] = await Promise.all([
    prisma.item.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { claims: true },
    }),
    prisma.claim.findMany({
      where: { claimantId: user.id },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const points = user.points ?? 120;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* HERO (from profile.html) */}
      <div className="profile-hero">
        <div className="profile-avatar">{user.avatar || '😊'}</div>
        <div className="profile-info">
          <h1 className="profile-name">{user.name}</h1>
          <div className="profile-sap">
            SAP ID: {user.sapId || '60004210045'} &nbsp;·&nbsp; {user.email}
          </div>
          <div className="profile-badges">
            <span className="badge badge-verified">✓ Verified SVKM Student</span>
            <span className="badge badge-dept">📘 {user.department || 'Information Technology'}</span>
            <span className="badge badge-year">🎓 Class of 2026</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div className="points-circle">
            <span className="points-num">{points}</span>
            <span className="points-label">Points</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-s)', fontWeight: 600 }}>
            🏅 Rank #12 on campus
          </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* MY POSTED ITEMS */}
          <div
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(255,255,255,0.95)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 6px 24px rgba(140,100,130,0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📋</span> My Reported Items ({userItems.length})
              </h3>
              <Link href="/post" className="post-btn" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
                + Post Item
              </Link>
            </div>

            {userItems.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-s)', padding: '16px 0', textAlign: 'center' }}>
                You haven&apos;t reported any items yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {userItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/items/${item.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: 'rgba(0,0,0,0.02)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-s)', marginTop: '2px' }}>
                        📍 {item.location} &nbsp;•&nbsp; 📅 {item.dateOccurred}
                      </div>
                    </div>
                    <span
                      className={`item-type-badge ${
                        item.type === 'LOST' ? 'badge-lost' : 'badge-found'
                      }`}
                      style={{ position: 'static' }}
                    >
                      {item.type}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* MY CLAIMS */}
          <div
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(255,255,255,0.95)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 6px 24px rgba(140,100,130,0.08)',
            }}
          >
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🔍</span> My Claims &amp; Verifications ({userClaims.length})
            </h3>

            {userClaims.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-s)', padding: '16px 0', textAlign: 'center' }}>
                No active claims submitted. Browse items to claim your belongings.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {userClaims.map((claim) => (
                  <div
                    key={claim.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: 'rgba(0,0,0,0.02)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{claim.item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-s)', marginTop: '2px' }}>
                        Proof: {claim.proofDetails}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '50px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background:
                          claim.status === 'APPROVED'
                            ? 'var(--mint)'
                            : claim.status === 'REJECTED'
                            ? 'var(--rose)'
                            : 'var(--lemon)',
                        color:
                          claim.status === 'APPROVED'
                            ? 'var(--mint-d)'
                            : claim.status === 'REJECTED'
                            ? 'var(--rose-d)'
                            : '#8a7a00',
                      }}
                    >
                      {claim.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* MINI STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.85)',
                borderRadius: '14px',
                padding: '16px',
                textAlign: 'center',
                border: '1.5px solid rgba(255,255,255,0.9)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700 }}>
                {userItems.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-s)', marginTop: '2px' }}>
                Items Reported
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.85)',
                borderRadius: '14px',
                padding: '16px',
                textAlign: 'center',
                border: '1.5px solid rgba(255,255,255,0.9)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700 }}>
                {userClaims.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-s)', marginTop: '2px' }}>
                Claims Filed
              </div>
            </div>
          </div>

          {/* ACHIEVEMENTS */}
          <div
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(255,255,255,0.95)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 6px 24px rgba(140,100,130,0.08)',
            }}
          >
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🏆</span> Campus Badges
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: 'white',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ fontSize: '1.5rem' }}>🌟</div>
                <div>
                  <strong style={{ fontSize: '0.85rem', display: 'block' }}>First Report</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-s)' }}>
                    Reported missing belongings on FinDora
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: 'white',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ fontSize: '1.5rem' }}>🤝</div>
                <div>
                  <strong style={{ fontSize: '0.85rem', display: 'block' }}>Campus Samaritan</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-s)' }}>
                    Helped classmate reunite with lost item
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: 'white',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ fontSize: '1.5rem' }}>🤖</div>
                <div>
                  <strong style={{ fontSize: '0.85rem', display: 'block' }}>AI Match Pioneer</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-s)' }}>
                    Used Gemini AI Swiper for automated match
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
