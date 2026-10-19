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

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      {/* Profile Header */}
      <div className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 border border-pink-200">
        <div className="w-20 h-20 rounded-full bg-pink-100 border-2 border-pink-300 flex items-center justify-center text-4xl shadow-inner shrink-0">
          {user.avatar || '🎓'}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-slate-800">{user.name}</h1>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 w-fit mx-auto sm:mx-0">
              {user.role}
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-4">{user.email}</p>

          <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-slate-600">
            <div className="bg-white/80 px-3 py-1.5 rounded-lg border border-pink-100">
              <span className="font-semibold text-slate-400">Department:</span>{' '}
              <span className="font-bold">{user.department || 'Information Technology'}</span>
            </div>
            <div className="bg-white/80 px-3 py-1.5 rounded-lg border border-pink-100">
              <span className="font-semibold text-slate-400">ID / Roll No:</span>{' '}
              <span className="font-bold">{user.collegeId || 'DJSCE-2024'}</span>
            </div>
          </div>
        </div>

        <Link
          href="/post"
          className="px-5 py-2.5 rounded-full bg-[#e8848f] hover:bg-[#d86f7b] text-white text-xs font-bold shadow transition shrink-0"
        >
          ➕ Report Another Item
        </Link>
      </div>

      {/* Grid of User Items and Claims */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Items Posted By User */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              Items You Reported ({userItems.length})
            </h2>
          </div>

          {userItems.length === 0 ? (
            <div className="glass-card p-6 text-center text-xs text-slate-500">
              You haven&apos;t reported any lost or found items yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {userItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/items/${item.id}`}
                  className="glass-card p-4 flex items-center justify-between hover:bg-white transition"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.type === 'LOST' ? 'badge-lost' : 'badge-found'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="font-bold text-slate-800 text-xs">{item.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      📍 {item.location} • 📅 {item.dateOccurred}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      item.status === 'RESOLVED'
                        ? 'badge-resolved'
                        : item.status === 'CLAIMED'
                        ? 'badge-claimed'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Claims Filed By User */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              Your Claims & Verification ({userClaims.length})
            </h2>
          </div>

          {userClaims.length === 0 ? (
            <div className="glass-card p-6 text-center text-xs text-slate-500">
              No claims submitted. Browse items to claim your lost belongings!
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {userClaims.map((claim) => (
                <div key={claim.id} className="glass-card p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">
                      Claim for: {claim.item.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        claim.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : claim.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {claim.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic bg-white/60 p-2 rounded border border-pink-100/50">
                    &quot;{claim.proofDetails}&quot;
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Submitted on: {new Date(claim.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
