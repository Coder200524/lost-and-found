'use client';

// SVKM Authentication & Role-Based Access Control (Mindmap: SAP ID + Password Login)
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [identifier, setIdentifier] = useState('60004210045');
  const [password, setPassword] = useState('student123');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sapId, setSapId] = useState('');
  const [department, setDepartment] = useState('Information Technology');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister
      ? { name, email, sapId, password, department, collegeId: sapId }
      : { email: identifier, sapId: identifier, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Authentication failed');
        return;
      }

      router.push('/browse');
      router.refresh();
    } catch {
      setError('Network error, please try again');
    } finally {
      setLoading(false);
    }
  }

  function handleQuickFill(presetId: string, presetPass: string) {
    setIdentifier(presetId);
    setPassword(presetPass);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="glass-card w-full max-w-md p-8 shadow-2xl border border-pink-200">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <span className="text-3xl">🌸</span>
            <span className="text-2xl font-black text-slate-800 tracking-tight">FinDora</span>
          </Link>
          <div className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold uppercase tracking-wider mb-2">
            🔒 SVKM Members Only (Restricted)
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            {isRegister ? 'Register SVKM Student' : 'SVKM SAP ID Sign In'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Dwarkadas J. Sanghvi College of Engineering
          </p>
        </div>

        {/* Quick Demo Role Fillers */}
        <div className="bg-pink-50/70 p-3.5 rounded-xl border border-pink-100 mb-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2 flex justify-between">
            <span>⚡ SVKM SAP ID Presets:</span>
            <span className="text-pink-600 font-semibold">One-Click</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('60004210045', 'student123')}
              className="px-2.5 py-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 text-[11px] font-bold transition text-left"
            >
              👨‍🎓 Rahul: <code className="font-mono text-[10px]">60004210045</code>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('60004210088', 'student123')}
              className="px-2.5 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 text-[11px] font-bold transition text-left"
            >
              👩‍🎓 Priya: <code className="font-mono text-[10px]">60004210088</code>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('ADMIN-001', 'admin123')}
              className="px-2.5 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-bold transition text-left"
            >
              🛡️ Admin: <code className="font-mono text-[10px]">ADMIN-001</code>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('GUEST-999', 'guest123')}
              className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-[11px] font-bold transition text-left"
            >
              👤 Guest: <code className="font-mono text-[10px]">GUEST-999</code>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {isRegister ? (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aryan Patel"
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-white border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">SVKM SAP ID (11 digits)</label>
                <input
                  type="text"
                  required
                  value={sapId}
                  onChange={(e) => setSapId(e.target.value)}
                  placeholder="e.g. 60004210099"
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-white border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">College Email (@djsce.edu)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@djsce.edu"
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-white border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-white border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
                >
                  <option value="Information Technology">Information Technology</option>
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Data Science / AI&DS">Data Science / AI&DS</option>
                  <option value="Electronics & Telecomm">Electronics & Telecomm</option>
                </select>
              </div>
            </>
          ) : (
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                SVKM SAP ID or College Email
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 60004210045 or student@djsce.edu"
                className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-white border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 font-medium"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-white border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-full bg-[#e8848f] hover:bg-[#d86f7b] text-white font-bold text-xs shadow-md transition disabled:opacity-50"
          >
            {loading ? 'Verifying SVKM Credentials...' : isRegister ? 'Register SVKM Account' : 'Sign In via SAP ID'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          {isRegister ? 'Already registered?' : 'New SVKM student/staff?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-pink-600 font-bold hover:underline"
          >
            {isRegister ? 'Sign In via SAP ID' : 'Register Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
