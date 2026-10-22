import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import ClaimForm from '@/components/ClaimForm';
import { LocationLineIcon, CalendarLineIcon, CategoryLineIcon, ShieldLineIcon, LockLineIcon, GiftLineIcon, FireLineIcon, AlertLineIcon } from '@/components/LineIcons';

interface ItemPageProps {
  params: Promise<{ id: string }>;
}

// Dynamic SEO Engineering (FST Unit 6: Metadata API with dynamic generateMetadata)
export async function generateMetadata({ params }: ItemPageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await prisma.item.findUnique({ where: { id } });

  if (!item) {
    return { title: 'Item Not Found | FinDora' };
  }

  return {
    title: `${item.title} (${item.type})`,
    description: `${item.type} item in ${item.location} on ${item.dateOccurred}. ${item.description.slice(0, 150)}...`,
    openGraph: {
      title: `${item.title} - DJSCE Lost & Found`,
      description: item.description,
      images: item.imageUrl ? [item.imageUrl] : [],
    },
  };
}

// React Server Component (FST Unit 1: Dynamic segments [id])
export default async function ItemDetailPage({ params }: ItemPageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(`/login?callbackUrl=/items/${id}`);
  }

  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      user: true,
      claims: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!item) {
    notFound();
  }

  const existingUserClaim = item.claims.find(
    (c) =>
      c.claimantId === currentUser.id ||
      c.claimantEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  return (
    <div className="item-detail-wrap">
      {/* Top Navigation */}
      <div className="item-detail-nav">
        <Link href="/browse" className="item-detail-back">
          <span>←</span> Back to Browse
        </Link>
        <ReportMisuseButton itemId={item.id} />
      </div>

      <div className="item-detail-card">
        {/* Left Column: Image or Visual Media */}
        <div className="item-detail-media">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt={item.title}
            />
          ) : (
            <div className="item-detail-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CategoryLineIcon category={item.category} size={64} />
            </div>
          )}
          <div className="item-detail-badge-float">
            <span
              className={`item-type-badge ${
                item.type === 'LOST' ? 'badge-lost' : 'badge-found'
              }`}
            >
              {item.type}
            </span>
          </div>
        </div>

        {/* Right Column: Details & Claim Action */}
        <div className="item-detail-content">
          <div className="item-detail-topline">
            <span className="item-cat-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CategoryLineIcon category={item.category} size={14} />
              <span>{item.category}</span>
            </span>
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
              Status: {item.status}
            </span>
          </div>

          <h1 className="item-detail-heading">
            {item.title}
          </h1>

          <p className="item-detail-desc">
            {item.description}
          </p>

          {item.reward && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(253, 243, 192, 0.4)',
                border: '1.5px solid #e8db9a',
                color: '#8a7a00',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <GiftLineIcon size={16} />
              <span>Reward Offered: {item.reward}</span>
            </div>
          )}

          {/* Hotspot & Privacy Badges (SVKM Mindmap) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {item.isHotspot && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '5px 12px',
                  borderRadius: '50px',
                  background: 'rgba(255, 180, 150, 0.3)',
                  border: '1px solid rgba(255, 180, 150, 0.8)',
                  color: '#9c4500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <FireLineIcon size={13} />
                <span>Hotspot Incident Zone</span>
              </span>
            )}
            {item.isMasked && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '5px 12px',
                  borderRadius: '50px',
                  background: 'var(--lavender)',
                  border: '1px solid var(--lav-d)',
                  color: 'var(--lav-d)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <LockLineIcon size={13} />
                <span>Sensitive ID Info Masked for Student Privacy</span>
              </span>
            )}
            {item.isUrgent && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '5px 12px',
                  borderRadius: '50px',
                  background: 'var(--rose)',
                  border: '1px solid var(--rose-d)',
                  color: 'var(--rose-d)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <AlertLineIcon size={13} />
                <span>Urgent Lost Alert</span>
              </span>
            )}
          </div>

          {/* Attributes List */}
          <div className="item-detail-meta-list">
            <div className="item-meta-entry">
              <span className="item-meta-k">Campus Location:</span>
              <span className="item-meta-v" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <LocationLineIcon size={14} />
                <span>{item.location}</span>
              </span>
            </div>
            <div className="item-meta-entry">
              <span className="item-meta-k">Date Reported:</span>
              <span className="item-meta-v" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <CalendarLineIcon size={14} />
                <span>{item.dateOccurred}</span>
              </span>
            </div>
            <div className="item-meta-entry">
              <span className="item-meta-k">Reported By:</span>
              <span className="item-meta-v">
                {item.contactName} ({item.user?.department || 'Student'})
              </span>
            </div>
            <div
              className="item-meta-entry"
              style={{
                marginTop: '4px',
                paddingTop: '8px',
                borderTop: '1px dashed rgba(0, 0, 0, 0.08)',
              }}
            >
              <span className="item-meta-k">Contact Privacy:</span>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--rose-d)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <LockLineIcon size={13} />
                <span>Phone/Email Protected (Hidden from Public)</span>
              </span>
            </div>
          </div>

          {/* SVKM Handover Safety Protocol */}
          <div className="item-safety-protocol">
            <div className="item-safety-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldLineIcon size={16} />
              <span>SVKM Handover Safety Protocol:</span>
            </div>
            <p className="item-safety-text">
              Always meet at the Ground Floor Security Desk or Central Library reception. Verify proof of ownership before releasing items.
            </p>
          </div>

          {/* Ownership & Claim Action Section */}
          <div className="claim-box">
            <div className="claim-box-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldLineIcon size={16} />
              <span>Ownership &amp; Claim Status</span>
            </div>

            {item.status === 'RESOLVED' ? (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'var(--mint)',
                  border: '1.5px solid var(--mint-d)',
                  color: 'var(--mint-d)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
                  Handover Completed &amp; Item Resolved
                </div>
                <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>
                  This item has been officially verified and reunited with its rightful owner
                  {item.claims.find((c) => c.status === 'APPROVED')
                    ? ` (${item.claims.find((c) => c.status === 'APPROVED')?.claimantName})`
                    : ''}.
                </div>
              </div>
            ) : item.status === 'CLAIMED' ? (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'var(--sky, #e2f0fb)',
                  border: '1.5px solid var(--sky-d, #1f6fad)',
                  color: 'var(--sky-d, #1f6fad)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
                  Claim Approved — Awaiting Safe Handover
                </div>
                <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>
                  An ownership claim has been verified by campus administration
                  {item.claims.find((c) => c.status === 'APPROVED')
                    ? ` for ${item.claims.find((c) => c.status === 'APPROVED')?.claimantName}`
                    : ''}.
                  Awaiting physical collection at Ground Floor Security Desk. Competing claims are closed.
                </div>
              </div>
            ) : existingUserClaim ? (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'white',
                  border: '1.5px solid rgba(0, 0, 0, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.88rem' }}>Your Verification Claim:</strong>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '50px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background:
                        existingUserClaim.status === 'APPROVED'
                          ? 'var(--mint)'
                          : existingUserClaim.status === 'REJECTED'
                          ? 'var(--rose)'
                          : 'var(--lemon)',
                      color:
                        existingUserClaim.status === 'APPROVED'
                          ? 'var(--mint-d)'
                          : existingUserClaim.status === 'REJECTED'
                          ? 'var(--rose-d)'
                          : '#8a7a00',
                    }}
                  >
                    {existingUserClaim.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-s)', marginBottom: '6px' }}>
                  Proof details: &quot;{existingUserClaim.proofDetails}&quot;
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-s)' }}>
                  Submitted on {new Date(existingUserClaim.createdAt).toLocaleDateString()} •{' '}
                  {existingUserClaim.status === 'PENDING'
                    ? 'Pending administrative decision.'
                    : existingUserClaim.status === 'APPROVED'
                    ? 'Approved! Proceed to Ground Floor Security Desk for physical handover.'
                    : 'Claim reviewed. Please contact campus security if you have more evidence.'}
                </div>
              </div>
            ) : (
              <ClaimForm
                itemId={item.id}
                itemTitle={item.title}
                itemLocation={item.location}
                itemCategory={item.category}
                itemDate={item.dateOccurred}
                defaultName={currentUser?.name}
                defaultEmail={currentUser?.email}
                defaultSapId={currentUser?.sapId || ''}
                defaultDepartment={currentUser?.department || ''}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
