import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { logoutAction } from '@/actions/auth';
import styles from './Navbar.module.css';

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <nav className={styles.navContainer}>
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">🌸</span>
          <span className={styles.logoText}>FinDora</span>
        </Link>
        <span className={styles.navBadge}>DJSCE Campus</span>
      </div>

      <div className="hidden md:flex items-center gap-2">
        <Link
          href="/browse"
          className="px-3.5 py-1.5 rounded-full text-sm font-medium text-slate-700 hover:bg-[#f9c8cf]/40 transition"
        >
          🔍 Browse Items
        </Link>
        <Link
          href="/swipe"
          className="px-3.5 py-1.5 rounded-full text-sm font-medium text-slate-700 hover:bg-[#f9c8cf]/40 transition"
        >
          ✨ AI Matcher
        </Link>
        <Link
          href="/post"
          className="px-3.5 py-1.5 rounded-full text-sm font-medium text-slate-700 hover:bg-[#f9c8cf]/40 transition"
        >
          ➕ Report Item
        </Link>

        {user?.role === 'ADMIN' && (
          <Link
            href="/admin"
            className="px-3.5 py-1.5 rounded-full text-sm font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 transition"
          >
            🛡️ Admin Panel
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-pink-200 hover:bg-white text-sm font-medium text-slate-800 transition"
            >
              <span>{user.avatar || '🎓'}</span>
              <span className="hidden sm:inline font-semibold">{user.name.split(' ')[0]}</span>
              <span className="text-xs bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full uppercase text-[10px]">
                {user.role}
              </span>
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-xs text-slate-500 hover:text-red-600 px-2.5 py-1 rounded-md hover:bg-red-50 transition"
              >
                Logout
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 rounded-full text-sm font-semibold bg-[#e8848f] text-white hover:bg-[#d86f7b] shadow-sm transition"
          >
            Sign In / Register
          </Link>
        )}
      </div>
    </nav>
  );
}
