'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackParam = searchParams.get('callbackUrl');
  const callbackUrl = callbackParam || '/browse';

  const [activeTab, setActiveTab] = useState<'student' | 'admin' | 'demo'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [identifier, setIdentifier] = useState('60017240146');
  const [password, setPassword] = useState('student123');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Check compulsory email suffix if user types an email address
    if (identifier.includes('@') && !identifier.toLowerCase().endsWith('@svkmmumbai.onmicrosoft.com') && activeTab !== 'admin') {
      setError('Compulsory SVKM Email Suffix required: email must end with @svkmmumbai.onmicrosoft.com');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, sapId: identifier, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Authentication failed. Please verify SAP ID and password.');
        return;
      }

      // If user is ADMIN and logs in via Admin tab or has no special callback, go to /admin
      let destination = callbackUrl;
      if (data.user?.role === 'ADMIN' && (activeTab === 'admin' || !callbackParam || callbackParam === '/browse')) {
        destination = '/admin';
      }

      router.push(destination);
      router.refresh();
    } catch {
      setError('Network error, please check connection.');
    } finally {
      setLoading(false);
    }
  }

  function handleTabChange(tab: 'student' | 'admin' | 'demo') {
    setActiveTab(tab);
    setError('');
    if (tab === 'student') {
      setIdentifier('60017240146');
      setPassword('student123');
    } else if (tab === 'admin') {
      setIdentifier('admin@djsce.edu.in');
      setPassword('admin123');
    } else if (tab === 'demo') {
      setIdentifier('SURUCHI.MAKWANA46@svkmmumbai.onmicrosoft.com');
      setPassword('student123');
    }
  }

  return (
    <div
      style={{
        background: 'var(--card-bg)',
        backdropFilter: 'blur(20px)',
        border: '1.5px solid var(--card-border, rgba(255, 255, 255, 0.95))',
        borderRadius: '24px',
        padding: '44px 40px',
        boxShadow: 'var(--shadow)',
      }}
    >
      {/* LOGO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--rose), var(--lavender))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
          }}
        >
          🔍
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text)' }}>
          Fin<span style={{ color: 'var(--rose-d)' }}>Dora</span>
        </div>
      </div>

      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 700, marginBottom: '6px' }}>
        Welcome back
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-s)', marginBottom: '28px' }}>
        Sign in with your SVKM SAP ID to continue
      </p>

      {/* AUTH REQUIRED NOTICE */}
      {callbackParam && (
        <div
          style={{
            background: 'var(--rose)',
            color: 'var(--rose-d)',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '0.82rem',
            fontWeight: 600,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>🔒</span>
          <span>Authentication required to access {callbackParam}. Please sign in below.</span>
        </div>
      )}

      {/* TABS */}
      <div
        style={{
          display: 'flex',
          background: 'rgba(0,0,0,0.05)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '24px',
        }}
      >
        <button
          type="button"
          onClick={() => handleTabChange('student')}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '9px',
            borderRadius: '9px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            border: 'none',
            background: activeTab === 'student' ? 'var(--white)' : 'transparent',
            color: activeTab === 'student' ? 'var(--text)' : 'var(--text-s)',
            boxShadow: activeTab === 'student' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          👨‍🎓 Student
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('admin')}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '9px',
            borderRadius: '9px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            border: 'none',
            background: activeTab === 'admin' ? 'var(--white)' : 'transparent',
            color: activeTab === 'admin' ? 'var(--text)' : 'var(--text-s)',
            boxShadow: activeTab === 'admin' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          🛡️ Admin
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('demo')}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '9px',
            borderRadius: '9px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            border: 'none',
            background: activeTab === 'demo' ? 'var(--white)' : 'transparent',
            color: activeTab === 'demo' ? 'var(--text)' : 'var(--text-s)',
            boxShadow: activeTab === 'demo' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          ⚡ Quick Demo
        </button>
      </div>

      {error && (
        <div
          style={{
            background: 'var(--rose)',
            color: 'var(--rose-d)',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '18px',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="form-label">
            {activeTab === 'admin' ? 'Faculty Admin Email' : 'SVKM SAP ID'}
          </label>
          <input
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={activeTab === 'admin' ? 'admin@djsce.edu.in' : 'SURUCHI.MAKWANA46@svkmmumbai.onmicrosoft.com or 60017240146'}
            className="form-input"
          />
        </div>

        <div className="field">
          <label className="form-label">Password / Portal Key</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password..."
            className="form-input"
          />
        </div>

        {/* INFO BANNER */}
        <div
          style={{
            background: 'var(--lemon)',
            border: '1.5px solid #f0d870',
            borderRadius: '12px',
            padding: '12px 14px',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start',
            fontSize: '0.8rem',
            color: '#6a5a00',
            margin: '18px 0',
          }}
        >
          <span>ℹ️</span>
          <span>
            {activeTab === 'student' && 'Student account pre-filled with demo credentials (student123).'}
            {activeTab === 'admin' && 'Admin account pre-filled for faculty moderation access (admin123).'}
            {activeTab === 'demo' && 'Alternate student profile pre-filled for peer-to-peer testing.'}
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', borderRadius: '12px', padding: '14px' }}
        >
          {loading ? 'Authenticating...' : 'Sign In →'}
        </button>
      </form>

      <div
        style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '0.82rem',
          color: 'var(--text-s)',
        }}
      >
        Trouble signing in? Contact{' '}
        <span style={{ color: 'var(--rose-d)', fontWeight: 600 }}>DJSCE IT Support</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-s)',
            textDecoration: 'none',
            fontSize: '0.88rem',
            marginBottom: '24px',
          }}
        >
          ← Back to Home
        </Link>

        <Suspense fallback={<div style={{ textAlign: 'center', color: 'var(--text-s)' }}>Loading login form...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
