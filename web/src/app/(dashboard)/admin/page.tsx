import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { resolveClaimAction } from '@/actions/claims';

export default async function AdminPage() {
  const user = await getCurrentUser();

  // Role-Based Authorization Guard (FST Unit 5)
  if (!user || user.role !== 'ADMIN') {
    redirect('/browse?error=unauthorized');
  }

  const [totalItems, pendingClaims, resolvedItems, allUsers, categories] = await Promise.all([
    prisma.item.count(),
    prisma.claim.findMany({
      where: { status: 'PENDING' },
      include: { item: true, claimant: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.item.count({ where: { status: 'RESOLVED' } }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, department: true },
    }),
    prisma.item.groupBy({
      by: ['category'],
      _count: { id: true },
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      {/* Admin Header */}
      <div className="glass-card p-6 sm:p-8 border-l-4 border-l-rose-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🛡️</span>
            <h1 className="text-2xl font-black text-slate-800">
              Campus Security & Moderation Console
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            DJSCE Faculty Administration • Role-Based Access Control Active (ADMIN)
          </p>
        </div>

        <div className="text-xs bg-rose-50 text-rose-700 px-3 py-1.5 rounded-full font-bold border border-rose-200">
          Logged in as: {user.name} ({user.email})
        </div>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="text-2xl font-black text-slate-800">{totalItems}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Total Items Logged</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-2xl font-black text-amber-600">{pendingClaims.length}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Pending Claims</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-2xl font-black text-emerald-600">{resolvedItems}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Items Resolved</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-2xl font-black text-purple-600">{allUsers.length}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Registered Users</div>
        </div>
      </div>

      {/* Pending Claims Queue */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            Verification Claims Queue ({pendingClaims.length})
          </h2>
          <span className="text-xs text-slate-400">Review proof before releasing items</span>
        </div>

        {pendingClaims.length === 0 ? (
          <div className="glass-card p-8 text-center text-xs text-slate-500">
            ✅ No pending claims at this moment! All student verification requests have been addressed.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {pendingClaims.map((claim) => (
              <div
                key={claim.id}
                className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-l-4 border-l-amber-400"
              >
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-white">
                      Item: {claim.item.title}
                    </span>
                    <span className="text-xs text-slate-500">
                      Found/Lost at: 📍 {claim.item.location}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700">
                    <span className="font-bold">Claimant:</span> {claim.claimantName} (
                    {claim.claimantEmail})
                  </div>

                  <div className="p-3 bg-white/80 rounded-lg border border-pink-100 text-xs text-slate-600 italic">
                    <span className="font-semibold text-slate-400 block not-italic mb-1">
                      Submitted Proof of Ownership:
                    </span>
                    &quot;{claim.proofDetails}&quot;
                  </div>
                </div>

                {/* Approve / Reject Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <form
                    action={async () => {
                      'use server';
                      await resolveClaimAction(claim.id, 'APPROVED');
                    }}
                  >
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                    >
                      ✓ Approve Claim
                    </button>
                  </form>

                  <form
                    action={async () => {
                      'use server';
                      await resolveClaimAction(claim.id, 'REJECTED');
                    }}
                  >
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition"
                    >
                      ✕ Reject
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Breakdown & Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4">
            Items by Category Distribution
          </h3>
          <div className="flex flex-col gap-2">
            {categories.map((c) => (
              <div key={c.category} className="flex justify-between items-center text-xs py-1.5 border-b border-pink-50">
                <span className="font-medium text-slate-700">{c.category}</span>
                <span className="font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                  {c._count.id} items
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4">
            User Directory & Access Tiers
          </h3>
          <div className="flex flex-col gap-2">
            {allUsers.map((u) => (
              <div key={u.id} className="flex justify-between items-center text-xs py-1.5 border-b border-pink-50">
                <div>
                  <div className="font-bold text-slate-800">{u.name}</div>
                  <div className="text-[11px] text-slate-400">{u.email}</div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    u.role === 'ADMIN'
                      ? 'bg-rose-100 text-rose-800'
                      : u.role === 'USER'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
