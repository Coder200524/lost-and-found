import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { LocationLineIcon, CalendarLineIcon } from '@/components/LineIcons';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?callbackUrl=/profile');
  }

  if (user.role === 'ADMIN') {
    redirect('/admin');
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

  const points = user.points ?? 250;
  const sapId = user.sapId || '60017240146';
  const email = user.email || 'SURUCHI.MAKWANA46@svkmmumbai.onmicrosoft.com';
  const department = user.department || 'Artificial Intelligence & Machine Learning';

  return (
    <div className="profile-container">
      {/* HERO BANNER */}
      <div className="profile-hero-v2">
        <div className="profile-hero-left">
          <div className="profile-avatar">
            {user.avatar && user.avatar !== '👤' ? user.avatar : '👩‍💻'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="profile-name" style={{ fontSize: '2.1rem', marginBottom: '4px' }}>
              {user.name}
            </h1>

            {/* Clean, Non-wrapping Metadata Pills */}
            <div className="profile-hero-meta-pills">
              <span className="profile-meta-pill">
                <span>🆔</span>
                <span>SAP:</span>
                <code>{sapId}</code>
              </span>
              <span className="profile-meta-pill">
                <span>🎫</span>
                <span>Roll:</span>
                <code>A090</code>
              </span>
              <span className="profile-meta-pill" title={email}>
                <span>✉️</span>
                <span>{email}</span>
              </span>
            </div>

            {/* Department and SVKM Status Badges */}
            <div className="profile-badges">
              <span className="badge badge-verified">✓ Verified SVKM Student</span>
              <span className="badge badge-dept">📘 {department}</span>
              <span className="badge badge-year">🎓 {user.badge || 'Campus Hero'}</span>
            </div>
          </div>
        </div>

        {/* Hero Right: Points Circle & Status */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div className="points-circle">
            <span className="points-num">{points}</span>
            <span className="points-label">Points</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-s)', fontWeight: 700 }}>
            🏅 {user.badge || 'Campus Hero'} Tier
          </div>
        </div>
      </div>

      {/* 4-COLUMN DESKTOP KPI BAR */}
      <div className="profile-kpis">
        <div className="profile-kpi-card">
          <div className="profile-kpi-icon" style={{ background: 'rgba(232, 132, 143, 0.15)', color: 'var(--rose-d)' }}>
            📋
          </div>
          <div>
            <div className="profile-kpi-num">{userItems.length}</div>
            <div className="profile-kpi-label">Reported Belongings</div>
          </div>
        </div>

        <div className="profile-kpi-card">
          <div className="profile-kpi-icon" style={{ background: 'rgba(91, 191, 142, 0.15)', color: 'var(--mint-d)' }}>
            🛡️
          </div>
          <div>
            <div className="profile-kpi-num">{userClaims.length}</div>
            <div className="profile-kpi-label">Claims Submitted</div>
          </div>
        </div>

        <div className="profile-kpi-card">
          <div className="profile-kpi-icon" style={{ background: 'rgba(253, 243, 192, 0.8)', color: '#8a6a00' }}>
            🌟
          </div>
          <div>
            <div className="profile-kpi-num">{points}</div>
            <div className="profile-kpi-label">SVKM Reward Points</div>
          </div>
        </div>

        <div className="profile-kpi-card">
          <div className="profile-kpi-icon" style={{ background: 'rgba(189, 168, 249, 0.2)', color: 'var(--lav-d)' }}>
            🪪
          </div>
          <div>
            <div className="profile-kpi-num" style={{ fontSize: '1.25rem' }}>Active</div>
            <div className="profile-kpi-label">RFID &amp; Student ID</div>
          </div>
        </div>
      </div>

      {/* ASYMMETRIC 2-COLUMN DESKTOP WORKSPACE */}
      <div className="profile-main-grid">
        {/* LEFT / PRIMARY COLUMN (65% on Desktop) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '26px', minWidth: 0 }}>
          {/* MY REPORTED ITEMS */}
          <div className="profile-card" id="my-items">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                  <span>📋</span> My Reported Belongings ({userItems.length})
                </h2>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-s)', marginTop: '4px' }}>
                  Items you have logged as Lost or Found on campus
                </div>
              </div>
              <Link href="/post" className="post-btn" style={{ padding: '8px 18px', fontSize: '0.82rem', flexShrink: 0 }}>
                + Post Item
              </Link>
            </div>

            {userItems.length === 0 ? (
              <div style={{ padding: '36px 0', textAlign: 'center', color: 'var(--text-s)' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '14px' }}>
                  You have not reported any items yet.
                </p>
                <Link href="/post" className="post-btn" style={{ display: 'inline-block', padding: '8px 16px', fontSize: '0.8rem' }}>
                  Report a Lost or Found Belonging
                </Link>
              </div>
            ) : (
              <div className="profile-items-grid">
                {userItems.map((item) => (
                  <Link key={item.id} href={`/items/${item.id}`} className="profile-item-tile">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                        <span
                          className={`item-type-badge ${
                            item.type === 'LOST' ? 'badge-lost' : 'badge-found'
                          }`}
                          style={{ position: 'static' }}
                        >
                          {item.type}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: item.status === 'CLAIMED' ? 'var(--mint)' : 'rgba(0,0,0,0.05)',
                            color: item.status === 'CLAIMED' ? 'var(--mint-d)' : 'var(--text-s)',
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px', color: 'var(--text)' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-s)', lineHeight: 1.4, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <LocationLineIcon size={13} />
                        <span>{item.location}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: '0.74rem', color: 'var(--text-s)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CalendarLineIcon size={13} />
                        <span>{item.dateOccurred}</span>
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--rose-d)' }}>
                        {item.claims?.length || 0} claims
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* MY SUBMITTED CLAIMS */}
          <div className="profile-card" id="my-claims">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                  <span>🛡️</span> My Submitted Claims ({userClaims.length})
                </h2>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-s)', marginTop: '4px' }}>
                  Confidential verification records and administrative claim status
                </div>
              </div>
              <Link
                href="/browse?type=FOUND"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--rose-d)',
                  textDecoration: 'none',
                }}
              >
                Browse Found Items →
              </Link>
            </div>

            {userClaims.length === 0 ? (
              <div style={{ padding: '36px 0', textAlign: 'center', color: 'var(--text-s)' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '14px' }}>
                  You have not submitted any ownership claims yet.
                </p>
                <Link
                  href="/browse?type=FOUND"
                  className="post-btn"
                  style={{ display: 'inline-block', padding: '8px 18px', fontSize: '0.8rem' }}
                >
                  Browse Recovered Campus Items
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {userClaims.map((claim) => (
                  <div
                    key={claim.id}
                    style={{
                      padding: '18px 20px',
                      borderRadius: '16px',
                      background: 'rgba(0, 0, 0, 0.02)',
                      border: '1.5px solid rgba(0, 0, 0, 0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
                      <div>
                        <Link
                          href={`/items/${claim.itemId}`}
                          style={{
                            fontWeight: 700,
                            fontSize: '1rem',
                            color: 'inherit',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <span>{claim.item.title}</span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--rose-d)' }}>↗</span>
                        </Link>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-s)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <LocationLineIcon size={13} />
                            <span>{claim.item.location}</span>
                          </span>
                          <span>•</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CalendarLineIcon size={13} />
                            <span>Submitted {new Date(claim.createdAt).toLocaleDateString()}</span>
                          </span>
                        </div>
                      </div>

                      <span
                        style={{
                          padding: '5px 14px',
                          borderRadius: '50px',
                          fontSize: '0.76rem',
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
                          border: `1px solid ${
                            claim.status === 'APPROVED'
                              ? 'rgba(91, 191, 142, 0.4)'
                              : claim.status === 'REJECTED'
                              ? 'rgba(232, 132, 143, 0.4)'
                              : 'rgba(240, 216, 112, 0.6)'
                          }`,
                        }}
                      >
                        {claim.status}
                      </span>
                    </div>

                    {/* Private Student Identity Verification Strip */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '0.74rem' }}>
                      <span style={{ padding: '3px 9px', borderRadius: '6px', background: 'rgba(0,0,0,0.04)', fontFamily: 'monospace', fontWeight: 600 }}>
                        🎫 Roll: {claim.rollNo || 'A090'}
                      </span>
                      <span style={{ padding: '3px 9px', borderRadius: '6px', background: 'rgba(0,0,0,0.04)', fontFamily: 'monospace', fontWeight: 600 }}>
                        🆔 SAP: {claim.sapId || sapId}
                      </span>
                      <span style={{ padding: '3px 9px', borderRadius: '6px', background: 'rgba(0,0,0,0.04)' }}>
                        📘 {claim.department || department}
                      </span>
                    </div>

                    {/* Ownership Proof Quote */}
                    <div style={{ fontSize: '0.82rem', color: 'var(--text)', background: 'rgba(255,255,255,0.6)', padding: '10px 14px', borderRadius: '10px', borderLeft: '3px solid var(--rose-d)' }}>
                      <strong>Your Stated Proof:</strong> &ldquo;{claim.proofDetails}&rdquo;
                    </div>

                    {/* Security Handover Guidance Alert */}
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        fontSize: '0.78rem',
                        lineHeight: 1.5,
                        background:
                          claim.status === 'APPROVED'
                            ? 'rgba(91, 191, 142, 0.12)'
                            : claim.status === 'REJECTED'
                            ? 'rgba(232, 132, 143, 0.12)'
                            : 'rgba(253, 243, 192, 0.45)',
                        border: `1px solid ${
                          claim.status === 'APPROVED'
                            ? 'rgba(91, 191, 142, 0.3)'
                            : claim.status === 'REJECTED'
                            ? 'rgba(232, 132, 143, 0.3)'
                            : 'rgba(240, 216, 112, 0.5)'
                        }`,
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
                          🎉 <strong>Claim Approved by Administration:</strong> Please visit the <strong>Ground Floor Security Desk</strong> with your physical <strong>SVKM Student ID card</strong> to complete handover.
                        </span>
                      ) : claim.status === 'REJECTED' ? (
                        <span>
                          ✕ <strong>Claim Not Approved:</strong> The provided ownership evidence did not sufficiently match the recovered item. If you have serial numbers or additional proof, contact the security office.
                        </span>
                      ) : (
                        <span>
                          ⏳ <strong>Verification In Progress:</strong> Campus security and the student finder are reviewing your submitted ownership evidence.
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT / SIDEBAR COLUMN (35% on Desktop: 380px) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
          {/* CAMPUS BADGES & ACHIEVEMENTS */}
          <div className="profile-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0' }}>
              <span>🏆</span> Campus Badges &amp; Achievements
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Campus Hero */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: 'rgba(98, 222, 180, 0.12)',
                  border: '1.5px solid var(--mint-d)',
                }}
              >
                <div style={{ fontSize: '1.6rem' }}>🏅</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '0.85rem' }}>Campus Hero (+50 Pts)</strong>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--mint-d)' }}>
                      ✓ Unlocked
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-s)', marginTop: '2px' }}>
                    Awarded upon approval for safely returning a campus belonging
                  </div>
                </div>
              </div>

              {/* First Report */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: userItems.length > 0 ? 'rgba(232, 132, 143, 0.12)' : 'rgba(0,0,0,0.02)',
                  border: userItems.length > 0 ? '1.5px solid var(--rose-d)' : '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ fontSize: '1.6rem' }}>🌟</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '0.85rem' }}>First Report</strong>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: userItems.length > 0 ? 'var(--rose-d)' : 'var(--text-s)' }}>
                      {userItems.length > 0 ? '✓ Unlocked' : 'Locked'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-s)', marginTop: '2px' }}>
                    Logged missing or found belongings on FinDora
                  </div>
                </div>
              </div>

              {/* Campus Samaritan */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: userClaims.some((c) => c.status === 'APPROVED') ? 'rgba(189, 168, 249, 0.15)' : 'rgba(0,0,0,0.02)',
                  border: userClaims.some((c) => c.status === 'APPROVED') ? '1.5px solid var(--lav-d)' : '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ fontSize: '1.6rem' }}>🤝</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '0.85rem' }}>Campus Samaritan</strong>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: userClaims.some((c) => c.status === 'APPROVED') ? 'var(--lav-d)' : 'var(--text-s)' }}>
                      {userClaims.some((c) => c.status === 'APPROVED') ? '✓ Verified' : 'In Progress'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-s)', marginTop: '2px' }}>
                    Completed successful claim verification on campus
                  </div>
                </div>
              </div>

              {/* AI Match Pioneer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: 'rgba(0,0,0,0.02)',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ fontSize: '1.6rem' }}>🤖</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '0.85rem' }}>AI Match Pioneer</strong>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--mint-d)' }}>
                      ✓ Active
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-s)', marginTop: '2px' }}>
                    Gemini AI neural matching active for your reports
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECURITY DESK PHYSICAL HANDOVER INFORMATION */}
          <div className="profile-card" style={{ background: 'linear-gradient(135deg, rgba(221, 214, 243, 0.25) 0%, rgba(249, 200, 207, 0.25) 100%)' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 14px 0' }}>
              <span>🏢</span> SVKM Security Desk
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-s)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📍</span>
                <span><strong>Desk:</strong> Ground Floor Atrium, Gate 2</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⏰</span>
                <span><strong>Hours:</strong> Mon – Sat: 8:30 AM – 5:30 PM</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🪪</span>
                <span><strong>Notice:</strong> Physical SVKM RFID Card required</span>
              </div>
            </div>
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link
                href="/chat"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 14px',
                  borderRadius: '10px',
                  background: 'var(--card-bg)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  color: 'var(--text)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                💬 Open Campus Safety Chat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
