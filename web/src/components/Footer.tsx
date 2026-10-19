import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-pink-100 bg-white/60 backdrop-blur-md py-8 px-6 sm:px-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-xl">🌸</span>
            <span className="font-bold text-slate-800 tracking-tight">FinDora</span>
            <span className="text-xs bg-pink-100 text-pink-700 font-semibold px-2 py-0.5 rounded-full">
              SVKM DJSCE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Dwarkadas J. Sanghvi College of Engineering — Full Stack & Mobile Application Platform
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-600 font-medium">
          <Link href="/browse" className="hover:text-pink-600 transition">Browse Items</Link>
          <Link href="/swipe" className="hover:text-pink-600 transition">Gemini Matcher</Link>
          <Link href="/post" className="hover:text-pink-600 transition">Report Lost / Found</Link>
          <Link href="/api/items" className="hover:text-pink-600 transition">REST API Docs</Link>
          <Link href="/login" className="hover:text-pink-600 transition">Account Portal</Link>
        </div>

        <p className="text-xs text-slate-400">
          Built with Next.js App Router, Prisma ORM, Mongoose & Flutter
        </p>
      </div>
    </footer>
  );
}
