import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { resolveClaimFormAction, resolveHandoverFormAction } from '@/actions/claims';
import { moderateReportedItemFormAction } from '@/actions/items';

export default async function AdminPage() {
  const user = await getCurrentUser();

  // Role-Based Authorization Guard
  if (!user || user.role !== 'ADMIN') {
    redirect('/browse?error=unauthorized');
  }

  const [totalItems, pendingClaims, handoverItems, resolvedItems, allUsers, reportedItems] = await Promise.all([
    prisma.item.count(),
    prisma.claim.findMany({
      where: { status: 'PENDING' },
      include: { item: true, claimant: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.item.findMany({
      where: { status: 'CLAIMED' },
      include: {
        claims: { where: { status: 'APPROVED' } },
        user: true,
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.item.count({ where: { status: 'RESOLVED' } }),
    prisma.user.findMany({
      select: { id: true, sapId: true, name: true, email: true, role: true, department: true, points: true },
      orderBy: { points: 'desc' },
      take: 10,
    }),
    prisma.item.findMany({
      where: { reportsCount: { gt: 0 } },
      include: { user: true },
      orderBy: { reportsCount: 'desc' },
    }),
  ]);

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 68px)', margin: '-32px -16px' }}>
      {/* ADMIN SIDEBAR (from admin.html) */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="logo">🔍 FinDora Admin</div>
          <small>SVKM Security Console</small>
        </div>

        <div className="sidebar-section">Moderation</div>
        <Link href="/admin" className="sidebar-link active">
          <span>📊</span> Dashboard
        </Link>
        <Link href="#claims-queue" className="sidebar-link">
          <span>🛡️</span> Claims Queue
          {pendingClaims.length > 0 && (
            <span className="badge">{pendingClaims.length}</span>
          )}
        </Link>
        <Link href="#handover-queue" className="sidebar-link">
          <span>🤝</span> Handover Queue
          {handoverItems.length > 0 && (
            <span className="badge" style={{ background: 'var(--sky-d)' }}>
              {handoverItems.length}
            </span>
          )}
        </Link>
        <Link href="#reported-items" className="sidebar-link">
          <span>🚩</span> Flagged Reports
          {reportedItems.length > 0 && (
            <span className="badge" style={{ background: 'var(--rose-d)' }}>
              {reportedItems.length}
            </span>
          )}
        </Link>
        <Link href="#campus-heatmap" className="sidebar-link">
          <span>🗺️</span> Campus Heatmap
        </Link>
        <Link href="#user-directory" className="sidebar-link">
          <span>👥</span> User Directory
        </Link>

        <div style={{ marginTop: 'auto', padding: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.07)',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--lavender)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
              }}
            >
              🛡️
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'white' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)' }}>
                Faculty Administrator
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ADMIN MAIN CONTENT */}
      <main style={{ flex: 1, padding: '28px 36px', overflowY: 'auto' }}>
        {/* TOPBAR */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '28px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.65rem', fontWeight: 700 }}>
              Campus Security &amp; Moderation Console
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-s)', marginTop: '2px' }}>
              Dwarkadas J. Sanghvi College of Engineering • RBAC Active
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--lemon)',
              border: '1px solid #f0d870',
              padding: '7px 16px',
              borderRadius: '50px',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#8a7a00',
            }}
          >
            🛡️ Authorized Administrator
          </div>
        </div>

        {/* STATS GRID (from admin.html) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              background: 'var(--card-bg)',
              borderRadius: '16px',
              padding: '22px',
              border: '1.5px solid var(--card-border, rgba(255,255,255,0.95))',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-s)', marginBottom: '8px' }}>
              Total Reports
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700 }}>
              {totalItems}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--mint-d)', fontWeight: 600 }}>
              ↑ Live Campus Sync
            </div>
          </div>

          <div
            style={{
              background: 'var(--card-bg)',
              borderRadius: '16px',
              padding: '22px',
              border: '1.5px solid var(--card-border, rgba(255,255,255,0.95))',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-s)', marginBottom: '8px' }}>
              Pending Claims
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: 'var(--rose-d)' }}>
              {pendingClaims.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--rose-d)', fontWeight: 600 }}>
              Requires verification
            </div>
          </div>

          <div
            style={{
              background: 'var(--card-bg)',
              borderRadius: '16px',
              padding: '22px',
              border: '1.5px solid var(--card-border, rgba(255,255,255,0.95))',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-s)', marginBottom: '8px' }}>
              Items Reunited
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: 'var(--mint-d)' }}>
              {resolvedItems}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--mint-d)', fontWeight: 600 }}>
              Verified handover
            </div>
          </div>

          <div
            style={{
              background: 'var(--card-bg)',
              borderRadius: '16px',
              padding: '22px',
              border: '1.5px solid var(--card-border, rgba(255,255,255,0.95))',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-s)', marginBottom: '8px' }}>
              Active Students
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700 }}>
              {allUsers.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--sky-d)', fontWeight: 600 }}>
              SVKM Verified
            </div>
          </div>
        </div>

        {/* PENDING CLAIMS VERIFICATION TABLE */}
        <div id="claims-queue" style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Pending Claims Moderation Queue ({pendingClaims.length})
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-s)' }}>
              Verify student identification before handover
            </span>
          </div>

          <div className="table-card">
            {pendingClaims.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-s)', fontSize: '0.9rem' }}>
                ✅ All student claims have been reviewed and approved! No items pending moderation.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Claimant (Student)</th>
                    <th>Proof / Identifying Details</th>
                    <th>Date Filed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingClaims.map((claim) => (
                    <tr key={claim.id}>
                      <td>
                        <strong>{claim.item.title}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-s)' }}>
                          📍 {claim.item.location}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{claim.claimant?.name || claim.claimantName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-s)', fontFamily: 'monospace' }}>
                          SAP: {claim.sapId || claim.claimant?.sapId || 'SVKM Student'}
                        </div>
                        {claim.rollNo && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-s)', fontFamily: 'monospace' }}>
                            Roll: {claim.rollNo}
                          </div>
                        )}
                        {(claim.department || claim.claimant?.department) && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--sky-d)', marginTop: '2px' }}>
                            {claim.department || claim.claimant?.department}
                            {claim.academicYear ? ` (${claim.academicYear})` : ''}
                          </div>
                        )}
                      </td>
                      <td style={{ maxWidth: '280px', lineHeight: 1.5 }}>
                        <div style={{ fontSize: '0.82rem' }}>{claim.proofDetails}</div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-s)' }}>
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <form action={resolveClaimFormAction}>
                            <input type="hidden" name="claimId" value={claim.id} />
                            <input type="hidden" name="action" value="APPROVED" />
                            <button
                              type="submit"
                              style={{
                                padding: '6px 12px',
                                borderRadius: '7px',
                                border: 'none',
                                background: 'var(--mint)',
                                color: 'var(--mint-d)',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              ✓ Approve (+50 Pts)
                            </button>
                          </form>

                          <form action={resolveClaimFormAction}>
                            <input type="hidden" name="claimId" value={claim.id} />
                            <input type="hidden" name="action" value="REJECTED" />
                            <button
                              type="submit"
                              style={{
                                padding: '6px 12px',
                                borderRadius: '7px',
                                border: 'none',
                                background: 'var(--rose)',
                                color: 'var(--rose-d)',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              ✕ Reject
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* SAFE HANDOVER & RESOLUTION QUEUE (Requirement D.7, E.10) */}
        <div id="handover-queue" style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🤝</span> Safe Handover &amp; Resolution Queue ({handoverItems.length})
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-s)' }}>
              Claims approved • Mark item RESOLVED after physical student handover
            </span>
          </div>

          <div className="table-card">
            {handoverItems.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-s)', fontSize: '0.85rem' }}>
                ✅ No items currently awaiting physical collection.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Verified Claimant</th>
                    <th>Campus Handover Point</th>
                    <th>Approval Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {handoverItems.map((item) => {
                    const approvedClaim = item.claims[0];
                    return (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.title}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-s)' }}>
                            📁 {item.category} • 📍 {item.location}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>
                            {approvedClaim ? approvedClaim.claimantName : 'Verified Student'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-s)', fontFamily: 'monospace' }}>
                            SAP: {approvedClaim?.sapId || 'Verified'} • Roll: {approvedClaim?.rollNo || 'Verified'}
                          </div>
                          {approvedClaim?.department && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--sky-d)' }}>
                              {approvedClaim.department}
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>
                          📍 Ground Floor Security Desk
                        </td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-s)' }}>
                          {approvedClaim ? new Date(approvedClaim.createdAt).toLocaleDateString() : 'Recent'}
                        </td>
                        <td>
                          <form action={resolveHandoverFormAction}>
                            <input type="hidden" name="itemId" value={item.id} />
                            <button
                              type="submit"
                              style={{
                                padding: '6px 14px',
                                borderRadius: '7px',
                                border: 'none',
                                background: 'var(--mint)',
                                color: 'var(--mint-d)',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              ✓ Complete Handover (Mark Resolved)
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* FLAGGED / REPORTED ITEMS MODERATION QUEUE */}
        <div id="reported-items" style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Reported-Item Moderation Queue ({reportedItems.length})
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-s)' }}>
              Moderate suspicious reports and student-reported misuse
            </span>
          </div>

          <div className="table-card">
            {reportedItems.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-s)', fontSize: '0.9rem' }}>
                🛡️ No items currently flagged for misuse or fake claims. Campus portal is clean!
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Item Title</th>
                    <th>Category &amp; Location</th>
                    <th>Flagged Count</th>
                    <th>Current Status</th>
                    <th>Moderation Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportedItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.title}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-s)' }}>
                          Reported by: {item.contactName} ({item.user?.department || 'Student'})
                        </div>
                      </td>
                      <td>
                        <div>📁 {item.category}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-s)' }}>
                          📍 {item.location}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '50px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: 'var(--rose)',
                            color: 'var(--rose-d)',
                          }}
                        >
                          🚩 {item.reportsCount} {item.reportsCount === 1 ? 'Report' : 'Reports'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`item-type-badge ${
                            item.status === 'RESOLVED'
                              ? 'badge-resolved'
                              : item.status === 'CLAIMED'
                              ? 'badge-claimed'
                              : 'badge-found'
                          }`}
                          style={{ position: 'static' }}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <Link
                            href={`/items/${item.id}`}
                            target="_blank"
                            style={{
                              padding: '6px 12px',
                              borderRadius: '7px',
                              border: '1px solid var(--border)',
                              background: 'var(--white)',
                              color: 'var(--text)',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              textDecoration: 'none',
                            }}
                          >
                            Inspect
                          </Link>

                          <form action={moderateReportedItemFormAction}>
                            <input type="hidden" name="itemId" value={item.id} />
                            <input type="hidden" name="decision" value="DISMISS" />
                            <button
                              type="submit"
                              style={{
                                padding: '6px 12px',
                                borderRadius: '7px',
                                border: 'none',
                                background: 'var(--mint)',
                                color: 'var(--mint-d)',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              ✓ Dismiss Flag
                            </button>
                          </form>

                          <form action={moderateReportedItemFormAction}>
                            <input type="hidden" name="itemId" value={item.id} />
                            <input type="hidden" name="decision" value="CLOSE" />
                            <button
                              type="submit"
                              style={{
                                padding: '6px 12px',
                                borderRadius: '7px',
                                border: 'none',
                                background: 'var(--rose)',
                                color: 'var(--rose-d)',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              ⛔ Close Item
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* CAMPUS HEATMAP (from admin.html) */}
        <div id="campus-heatmap" style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
            Campus Incident Hotspot Heatmap
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-s)', marginBottom: '16px' }}>
            Density visualization of reported lost and found belongings across SVKM DJSCE premises
          </p>

          <div className="campus-map">
            {/* Zone 1: Canteen */}
            <div className="map-zone heat-5" style={{ top: '24px', left: '32px', width: '130px', height: '90px' }}>
              <span className="zone-icon">🍔</span>
              <span>Canteen Ground Fl</span>
              <span className="zone-count">High Frequency (🔥 Hotspot)</span>
            </div>

            {/* Zone 2: Library */}
            <div className="map-zone heat-4" style={{ top: '24px', right: '40px', width: '140px', height: '90px' }}>
              <span className="zone-icon">📚</span>
              <span>Central Library 1st Fl</span>
              <span className="zone-count">Frequent Reports</span>
            </div>

            {/* Zone 3: IT Labs */}
            <div className="map-zone heat-3" style={{ bottom: '28px', left: '32px', width: '130px', height: '85px' }}>
              <span className="zone-icon">💻</span>
              <span>4th Fl IT Labs</span>
              <span className="zone-count">Electronics &amp; Bags</span>
            </div>

            {/* Zone 4: Foyer */}
            <div className="map-zone heat-2" style={{ bottom: '28px', left: '42%', width: '130px', height: '85px' }}>
              <span className="zone-icon">🏫</span>
              <span>Ground Fl Foyer</span>
              <span className="zone-count">ID Cards &amp; Keys</span>
            </div>

            {/* Zone 5: Gymkhana */}
            <div className="map-zone heat-1" style={{ bottom: '28px', right: '40px', width: '130px', height: '85px' }}>
              <span className="zone-icon">⚽</span>
              <span>Gymkhana &amp; Turf</span>
              <span className="zone-count">Bottles &amp; Gear</span>
            </div>
          </div>
        </div>

        {/* USER DIRECTORY */}
        <div id="user-directory">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '14px' }}>
            Student Leaderboard &amp; Directory
          </h2>
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>SAP ID</th>
                  <th>Department</th>
                  <th>Reward Points</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td style={{ fontFamily: 'monospace' }}>{u.sapId || '60017240146'}</td>
                    <td>{u.department || 'AIML'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--mint-d)' }}>{u.points ?? 50} pts</td>
                    <td>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '50px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: u.role === 'ADMIN' ? 'var(--rose)' : 'var(--lavender)',
                          color: u.role === 'ADMIN' ? 'var(--rose-d)' : 'var(--lav-d)',
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
