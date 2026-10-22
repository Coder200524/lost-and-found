import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="findora-footer">
      <div className="footer-glow" aria-hidden="true" />
      <div className="footer-inner">
        <div className="footer-main">
          {/* Brand info */}
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              <span className="footer-logo-icon">🔍</span>
              <span className="footer-logo-text">FinDora</span>
            </Link>
            <p className="footer-tagline">
              SVKM Campus Lost &amp; Found Portal
            </p>
            <p className="footer-desc">
              Dwarkadas J. Sanghvi College of Engineering (DJSCE) · Dedicated to reuniting students with misplaced belongings quickly, securely, and ethically.
            </p>
            <div className="footer-status-pill">
              <span className="footer-status-pulse" />
              <span>SVKM Campus Network Active</span>
            </div>
          </div>

          {/* Column 1: Explore */}
          <div className="footer-col">
            <h4 className="footer-col-title">Navigation</h4>
            <ul className="footer-links">
              <li>
                <Link href="/browse">Browse Reports</Link>
              </li>
              <li>
                <Link href="/post">Post an Item</Link>
              </li>
              <li>
                <Link href="/swipe">Swipe Matcher</Link>
              </li>
              <li>
                <Link href="/chat">In-App Chat</Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Hotspots */}
          <div className="footer-col">
            <h4 className="footer-col-title">Campus Hubs</h4>
            <ul className="footer-links">
              <li>
                <Link href="/browse?location=Central+Library">Central Library (3rd Fl)</Link>
              </li>
              <li>
                <Link href="/browse?location=Canteen">Campus Canteen</Link>
              </li>
              <li>
                <Link href="/browse?location=IT+Lab+3">IT Lab 3 &amp; Room 402</Link>
              </li>
              <li>
                <Link href="/browse?location=Foyer">Ground Floor Foyer</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Safety */}
          <div className="footer-col">
            <h4 className="footer-col-title">Trust &amp; Admin</h4>
            <ul className="footer-links">
              <li>
                <Link href="/profile">Student Dashboard</Link>
              </li>
              <li>
                <Link href="/admin">Admin Oversight</Link>
              </li>
              <li>
                <span className="footer-badge-link">
                  🔒 Safe Handover Protocol
                </span>
              </li>
              <li>
                <span className="footer-badge-link">
                  🛡️ Anti-Fraud Verification
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-copyright">
            Made with <span className="heart-icon">💕</span> by{' '}
            <strong>Group 7, TY IT</strong> · SVKM · 2025–26
          </p>

          <div className="footer-actions">
            <span className="footer-pill-subtle">DJSCE Autonomous</span>
            <Link href="/admin" className="footer-admin-link">
              <span className="shield-icon">🛡️</span> Admin Panel
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
