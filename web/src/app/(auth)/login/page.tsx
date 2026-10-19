'use client';

// Authentication & RBAC Control (FST Unit 5: Multi-tenant protection & Role-based authorization)
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Information Technology');
  const [collegeId, setCollegeId] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister
      ? { name, email, password, department, collegeId }
      : { email, password };

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

  // Quick preset login for quick testing & evaluation
  function handleQuickFill(presetEmail: string, presetPass: string) {
    setEmail(presetEmail);
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
          <h2 className="text-xl font-bold text-slate-800">
            {isRegister ? 'Create Campus Account' : 'Sign In to FinDora'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            DJSCE SVKM Campus Identity & Session Portal
          </p>
        </div>

        {/* Quick Demo Role Fillers */}
        <div className="bg-pink-50/70 p-3 rounded-xl border border-pink-100 mb-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            ⚡ Quick Evaluation Logins:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@djsce.edu', 'admin123')}
              className="px-2 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-bold transition"
            >
              🛡️ Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('rahul@djsce.edu', 'student123')}
              className="px-2 py-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 text-[11px] font-bold transition"
            >
              👨‍🎓 Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('guest@djsce.edu', 'guest123')}
              className="px-2 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-[11px] font-bold transition"
            >
              👤 Guest
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {isRegister && (
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
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">College Roll / SAP ID</label>
                <input
                  type="text"
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  placeholder="e.g. 60004210045"
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-white border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">College Email</label>
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
            {loading ? 'Authenticating...' : isRegister ? 'Complete Registration' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-pink-600 font-bold hover:underline"
          >
            {isRegister ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
