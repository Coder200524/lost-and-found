import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { logoutAction } from '@/actions/auth';
import ThemeToggle from '@/components/ThemeToggle';
import { SearchLineIcon } from '@/components/LineIcons';

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <nav className="findora-nav">
      <Link href="/" className="nav-logo" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--rose-d)' }}>
          <SearchLineIcon size={20} />
        </span>
        <span>FinDora</span>
      </Link>

      <div className="nav-links">
        <Link href="/browse">Browse</Link>
        <Link href="/post">Post Item</Link>
        <Link href="/swipe">Swipe</Link>
        <Link href="/chat">Chat</Link>
        {user?.role === 'ADMIN' && <Link href="/admin">Admin</Link>}

        <ThemeToggle />

        {user ? (
          <div className="nav-user">
            <Link
              href="/profile"
              className="flex items-center gap-2 no-underline text-inherit hover:opacity-85 transition"
            >
              <div className="avatar">{user.avatar || '👤'}</div>
              <span className="font-medium text-xs sm:text-sm">{user.sapId || user.name}</span>
            </Link>
            <form action={logoutAction} className="inline-block">
              <button
                type="submit"
                className="text-xs text-rose-600 hover:text-rose-800 bg-transparent border-0 cursor-pointer px-2 py-1 rounded hover:bg-rose-50 transition"
              >
                Logout
              </button>
            </form>
          </div>
        ) : (
          <Link href="/login" className="nav-cta">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
