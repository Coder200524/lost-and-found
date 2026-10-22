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
      where: {
        OR: [
          { claimantId: user.id },
          { claimantEmail: user.email },
          { claimantName: user.name },
        ],
      },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const points = user.points ?? 50;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* HERO (from profile.html) */}
      <div className="profile-hero">
        <div className="profile-avatar">{user.avatar || '😊'}</div>
        <div className="profile-info">
          <h1 className="profile-name">{user.name}</h1>
          <div className="profile-sap">
            SAP ID: {user.sapId || '60017240146'} &nbsp;·&nbsp; {user.email}
          </div>
          <div className="profile-badges">
            <span className="badge badge-verified">✓ Verified SVKM Student</span>
            <span className="badge badge-dept">📘 {user.department || 'AIML'}</span>
            <span className="badge badge-year">🎓 {user.badge || 'Campus Hero'}</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div className="points-circle">
            <span className="points-num">{points}</span>
            <span className="points-label">Points</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-s)', fontWeight: 600 }}>
            🏅 {user.badge || 'SVKM Scout'} Tier
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
              background: 'var(--card-bg)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid var(--card-border, rgba(255,255,255,0.95))',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: 'var(--shadow)',
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

          {/* MY CLAIMS (Requirement A.3 & F) */}
          <div
            id="my-claims"
            style={{
              background: 'var(--card-bg)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid var(--card-border, rgba(255,255,255,0.95))',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📋</span> My Submitted Claims ({userClaims.length})
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-s)' }}>
                Private Verification Records
              </span>
            </div>

            {userClaims.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-s)', marginBottom: '12px' }}>
                  You have not submitted any ownership claims yet.
                </p>
                <Link
                  href="/browse?type=FOUND"
                  className="post-btn"
                  style={{ display: 'inline-block', padding: '6px 14px', fontSize: '0.78rem' }}
                >
                  Browse Found Items to Claim
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {userClaims.map((claim) => (
                  <div
                    key={claim.id}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '14px',
                      background: 'rgba(0,0,0,0.02)',
                      border: '1px solid rgba(0,0,0,0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                      <div>
                        <Link
                          href={`/items/${claim.itemId}`}
                          style={{
                            fontWeight: 700,
                            fontSize: '0.92rem',
                            color: 'inherit',
                            textDecoration: 'none',
                          }}
                        >
                          {claim.item.title} ↗
                        </Link>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-s)', marginTop: '2px' }}>
                          📍 {claim.item.location} &nbsp;•&nbsp; 📅 Submitted {new Date(claim.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '50px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          flexShrink: 0,
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

                    {/* Private Details (Roll No & SAP ID) */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.72rem' }}>
                      {claim.rollNo && (
                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.05)', fontFamily: 'monospace' }}>
                          Roll: {claim.rollNo}
                        </span>
                      )}
                      {claim.sapId && (
                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.05)', fontFamily: 'monospace' }}>
                          SAP: {claim.sapId}
                        </span>
                      )}
                      {claim.department && (
                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.05)' }}>
                          {claim.department}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-s)' }}>
                      <strong>Your Proof:</strong> &quot;{claim.proofDetails}&quot;
                    </div>

                    {/* Relevant Status Update Guidance */}
                    <div
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        background:
                          claim.status === 'APPROVED'
                            ? 'rgba(91, 191, 142, 0.12)'
                            : claim.status === 'REJECTED'
                            ? 'rgba(232, 132, 143, 0.12)'
                            : 'rgba(253, 243, 192, 0.4)',
                        color:
                          claim.status === 'APPROVED'
                            ? 'var(--mint-d)'
                            : claim.status === 'REJECTED'
                            ? 'var(--rose-d)'
                            : '#7a6800',
                      }}
                    >
                      {claim.status === 'APPROVED' ? (
                        <span>
                          🎉 <strong>Claim Approved!</strong> Visit the Ground Floor Security Desk with your SVKM ID card for physical handover.
                        </span>
                      ) : claim.status === 'REJECTED' ? (
                        <span>
                          ✕ <strong>Claim Not Approved:</strong> Evidence did not sufficiently match the reported item. Contact campus security if you have more details.
                        </span>
                      ) : (
                        <span>
                          ⏳ <strong>Pending Review:</strong> Campus faculty administrators are reviewing your submitted ownership proof.
                        </span>
                      )}
                    </div>
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
                background: 'var(--card-bg)',
                borderRadius: '14px',
                padding: '16px',
                textAlign: 'center',
                border: '1.5px solid var(--card-border, rgba(255,255,255,0.9))',
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
                background: 'var(--card-bg)',
                borderRadius: '14px',
                padding: '16px',
                textAlign: 'center',
                border: '1.5px solid var(--card-border, rgba(255,255,255,0.9))',
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
              background: 'var(--card-bg)',
              backdropFilter: 'blur(10px)',
              border: '1.5px solid var(--card-border, rgba(255,255,255,0.95))',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: 'var(--shadow)',
            }}
          >
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🏆</span> Campus Badges &amp; Achievements
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Campus Hero - documented reward for returning items */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: user.badge === 'Campus Hero' ? 'rgba(98, 222, 180, 0.12)' : 'var(--white)',
                  border: user.badge === 'Campus Hero' ? '1.5px solid var(--mint-d)' : '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ fontSize: '1.5rem' }}>🏅</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '0.85rem' }}>Campus Hero (+50 Pts)</strong>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: user.badge === 'Campus Hero' ? 'var(--mint-d)' : 'var(--text-s)',
                      }}
                    >
                      {user.badge === 'Campus Hero' ? '✓ Unlocked' : 'Locked'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-s)' }}>
                    Awarded upon administrative approval for safely returning a found belonging
                  </span>
                </div>
              </div>

              {/* First Report */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: userItems.length > 0 ? 'rgba(232, 132, 143, 0.12)' : 'var(--white)',
                  border: userItems.length > 0 ? '1.5px solid var(--rose-d)' : '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ fontSize: '1.5rem' }}>🌟</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '0.85rem' }}>First Report</strong>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: userItems.length > 0 ? 'var(--rose-d)' : 'var(--text-s)',
                      }}
                    >
                      {userItems.length > 0 ? '✓ Unlocked' : 'Locked'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-s)' }}>
                    Reported missing or found belongings on FinDora
                  </span>
                </div>
              </div>

              {/* Campus Samaritan */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: userClaims.some((c) => c.status === 'APPROVED') ? 'rgba(189, 168, 249, 0.15)' : 'var(--white)',
                  border: userClaims.some((c) => c.status === 'APPROVED') ? '1.5px solid var(--lav-d)' : '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ fontSize: '1.5rem' }}>🤝</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '0.85rem' }}>Campus Samaritan</strong>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: userClaims.some((c) => c.status === 'APPROVED') ? 'var(--lav-d)' : 'var(--text-s)',
                      }}
                    >
                      {userClaims.some((c) => c.status === 'APPROVED') ? '✓ Verified' : 'In Progress'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-s)' }}>
                    Completed successful claim verification on campus
                  </span>
                </div>
              </div>

              {/* AI Match Pioneer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: 'var(--white)',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ fontSize: '1.5rem' }}>🤖</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '0.85rem' }}>AI Match Pioneer</strong>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--mint-d)' }}>
                      ✓ Active
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-s)' }}>
                    Gemini AI neural matching active for your campus reports
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
