import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import ClaimForm from '@/components/ClaimForm';

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

  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      user: true,
      claims: true,
    },
  });

  if (!item) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Back button */}
      <Link
        href="/browse"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-pink-600 mb-6 transition"
      >
        ← Back to Browse
      </Link>

      <div className="glass-card overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="bg-slate-100 flex items-center justify-center relative min-h-[320px]">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover max-h-[460px]"
              />
            ) : (
              <div className="text-7xl">📦</div>
            )}
            <div className="absolute top-4 left-4">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm ${
                  item.type === 'LOST' ? 'badge-lost' : 'badge-found'
                }`}
              >
                {item.type}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700">
                  📁 {item.category}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                    item.status === 'RESOLVED'
                      ? 'badge-resolved'
                      : item.status === 'CLAIMED'
                      ? 'badge-claimed'
                      : 'badge-found'
                  }`}
                >
                  Status: {item.status}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-3">
                {item.title}
              </h1>

              <p className="text-sm text-slate-600 leading-relaxed mb-6 whitespace-pre-line">
                {item.description}
              </p>

              {item.reward && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2 mb-4">
                  <span>🎁</span> Reward Offered: {item.reward}
                </div>
              )}

              {/* Attributes table */}
              <div className="flex flex-col gap-2.5 text-xs text-slate-600 border-t border-b border-pink-100/80 py-4 my-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-400">Campus Location:</span>
                  <span className="font-medium text-slate-800">📍 {item.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-400">Date Reported:</span>
                  <span className="font-medium text-slate-800">📅 {item.dateOccurred}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-400">Reported By:</span>
                  <span className="font-medium text-slate-800">
                    {item.contactName} ({item.user?.department || 'Student'})
                  </span>
                </div>
                {item.contactPhone && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">Contact Number:</span>
                    <span className="font-medium text-slate-800">📞 {item.contactPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Claim Submission Section (Server Action) */}
            <div className="bg-pink-50/60 p-4 rounded-xl border border-pink-100 flex flex-col gap-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>🛡️</span> Is this yours or do you have information?
              </h3>

              {item.status === 'RESOLVED' ? (
                <div className="text-xs text-emerald-700 font-semibold bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                  🎉 This item has been verified and returned to its rightful owner!
                </div>
              ) : (
                <ClaimForm
                  itemId={item.id}
                  defaultName={currentUser?.name}
                  defaultEmail={currentUser?.email}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
