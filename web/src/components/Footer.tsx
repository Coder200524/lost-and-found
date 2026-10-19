import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="findora-footer">
      <p>
        Made with 💕 by <strong>Group 7, TY IT</strong> · SVKM · 2025–26 &nbsp;|&nbsp;{' '}
        <Link href="/admin">Admin Panel</Link>
      </p>
    </footer>
  );
}
