'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createItemAction } from '@/actions/items';
import { SparklesLineIcon } from '@/components/LineIcons';

export default function PostClient() {
  const router = useRouter();
  const [reportType, setReportType] = useState<'LOST' | 'FOUND'>('LOST');
  const [titleValue, setTitleValue] = useState('');
  const [selectedCat, setSelectedCat] = useState('ID Cards');
  const [locationValue, setLocationValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [aiMessage, setAiMessage] = useState('');

  const categories = [
    { name: 'ID Cards', emoji: '🪪' },
    { name: 'Electronics', emoji: '📱' },
    { name: 'Bags', emoji: '🎒' },
    { name: 'Water Bottles', emoji: '🍶' },
    { name: 'Stationery', emoji: '✏️' },
    { name: 'Accessories', emoji: '⌚' },
    { name: 'Others', emoji: '📦' },
  ];

  const quickLocations = [
    'Canteen (Ground Fl)',
    'Central Library (1st Fl)',
    '4th Fl IT Lab',
    'Ground Fl Foyer',
    '6th Fl Classrooms',
    'Gymkhana & Turf',
  ];

  function handleGeminiAutoDetect() {
    if (!titleValue.trim()) {
      setAiMessage('⚠️ Enter an item title first to detect category.');
      setTimeout(() => setAiMessage(''), 3500);
      return;
    }

    const lower = titleValue.toLowerCase();
    let detected = 'Others';

    if (
      lower.includes('airpod') ||
      lower.includes('phone') ||
      lower.includes('laptop') ||
      lower.includes('charger') ||
      lower.includes('watch') ||
      lower.includes('earphone') ||
      lower.includes('mouse') ||
      lower.includes('keyboard') ||
      lower.includes('cable') ||
      lower.includes('headphone')
    ) {
      detected = 'Electronics';
    } else if (
      lower.includes('id') ||
      lower.includes('card') ||
      lower.includes('wallet') ||
      lower.includes('license') ||
      lower.includes('pan') ||
      lower.includes('aadhaar') ||
      lower.includes('purse')
    ) {
      detected = 'ID Cards';
    } else if (
      lower.includes('bag') ||
      lower.includes('backpack') ||
      lower.includes('pouch') ||
      lower.includes('sack')
    ) {
      detected = 'Bags';
    } else if (
      lower.includes('bottle') ||
      lower.includes('flask') ||
      lower.includes('sipper') ||
      lower.includes('thermos')
    ) {
      detected = 'Water Bottles';
    } else if (
      lower.includes('calculator') ||
      lower.includes('book') ||
      lower.includes('notes') ||
      lower.includes('pen') ||
      lower.includes('pencil') ||
      lower.includes('kumbhojkar') ||
      lower.includes('journal') ||
      lower.includes('file')
    ) {
      detected = 'Stationery';
    } else if (
      lower.includes('umbrella') ||
      lower.includes('key') ||
      lower.includes('chain') ||
      lower.includes('jacket') ||
      lower.includes('hoodie') ||
      lower.includes('ring') ||
      lower.includes('bracelet') ||
      lower.includes('glasses') ||
      lower.includes('specs')
    ) {
      detected = 'Accessories';
    }

    setSelectedCat(detected);
    setAiMessage(`✨ Gemini AI suggested category: "${detected}"`);
    setTimeout(() => setAiMessage(''), 4500);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    formData.set('type', reportType);
    formData.set('category', selectedCat);

    try {
      const res = await createItemAction(formData);
      if (res.success) {
        router.push('/browse');
      } else {
        setErrorMessage(res.error || 'Failed to submit report. Please check fields.');
      }
    } catch (err: unknown) {
      const errorObj = err as Error;
      setErrorMessage(errorObj.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="post-page-wrap">
      <Link href="/browse" className="back" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-s)', textDecoration: 'none', fontSize: '0.88rem', marginBottom: '24px' }}>
        ← Back to Browse
      </Link>

      <h1 className="page-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '2.1rem', fontWeight: 700, marginBottom: '6px' }}>
        Post an Item
      </h1>
      <p className="page-sub" style={{ fontSize: '0.93rem', color: 'var(--text-s)', marginBottom: '36px' }}>
        Fill in the details below to report a lost or found item on the SVKM campus.
      </p>

      {/* TYPE TOGGLE (from post.html) */}
      <div className="type-toggle">
        <div
          onClick={() => setReportType('LOST')}
          className={`type-card lost ${reportType === 'LOST' ? 'active' : ''}`}
        >
          <div className="icon">🔴</div>
          <h3>I Lost Something</h3>
          <p>I am looking for an item I misplaced</p>
        </div>

        <div
          onClick={() => setReportType('FOUND')}
          className={`type-card found ${reportType === 'FOUND' ? 'active' : ''}`}
        >
          <div className="icon">🟢</div>
          <h3>I Found Something</h3>
          <p>I found an item and want to return it</p>
        </div>
      </div>

      {errorMessage && (
        <div style={{ background: 'var(--rose)', color: 'var(--rose-d)', padding: '12px 18px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 600, marginBottom: '24px' }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {/* FORM CARD */}
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {/* SECTION 1: ITEM OVERVIEW */}
          <div className="form-section">
            <div className="form-section-title">Item Overview</div>
            
            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Item Title <span className="req">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGeminiAutoDetect}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--lav-d)',
                    background: 'var(--lavender)',
                    color: 'var(--lav-d)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title="Analyze title with Gemini AI to auto-select the best category"
                >
                  <SparklesLineIcon size={13} />
                  <span>Gemini: Auto-Detect Category</span>
                </button>
              </div>
              <input
                type="text"
                name="title"
                required
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                placeholder="e.g. Navy Blue Dell 15.6 Laptop Bag or Casio Calculator"
                className="form-input"
              />
              {aiMessage && (
                <div
                  style={{
                    marginTop: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--lav-d)',
                    background: 'var(--lavender)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    display: 'inline-block',
                  }}
                >
                  {aiMessage}
                </div>
              )}
            </div>

            <div className="field">
              <label className="form-label">
                Category <span className="req">*</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                {categories.map((c) => {
                  const isActive = selectedCat === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedCat(c.name)}
                      className={`cat-pill ${isActive ? 'active' : ''}`}
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      <span>{c.emoji}</span> {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>


          {/* SECTION 2: WHEN & WHERE */}
          <div className="form-section">
            <div className="form-section-title">When &amp; Where</div>

            <div className="field-row">
              <div className="field">
                <label className="form-label">
                  Date Occurred <span className="req">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="form-input"
                />
              </div>

              <div className="field">
                <label className="form-label">
                  Campus Location <span className="req">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  value={locationValue}
                  onChange={(e) => setLocationValue(e.target.value)}
                  placeholder="e.g. 4th Floor IT Lab Terminal 14"
                  className="form-input"
                />
              </div>
            </div>

            <label className="form-label" style={{ marginBottom: '8px' }}>
              Quick Pick Frequent Campus Locations:
            </label>
            <div className="loc-quick">
              {quickLocations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocationValue(loc)}
                  className={`loc-chip ${locationValue === loc ? 'active' : ''}`}
                >
                  📍 {loc}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 3: DESCRIPTION */}
          <div className="form-section">
            <div className="form-section-title">Detailed Description</div>
            <div className="field">
              <label className="form-label">
                Identifying Marks &amp; Features <span className="req">*</span>
              </label>
              <textarea
                name="description"
                required
                placeholder="Include color, scratches, stickers, brand name, keychain, or contents to verify identity..."
                className="form-input"
                rows={4}
              ></textarea>
            </div>
          </div>

          {/* SECTION 4: PHOTO EVIDENCE (from post.html) */}
          <div className="form-section">
            <div className="form-section-title">Photo Attachment</div>
            <div className="upload-area">
              <div className="upload-icon">📷</div>
              <div className="upload-text">Upload item photo evidence</div>
              <div className="upload-sub">PNG, JPG or WebP up to 10MB</div>
              <input
                type="text"
                name="imageUrl"
                placeholder="Or paste public image URL..."
                className="form-input"
                style={{ maxWidth: '360px', margin: '14px auto 0', textAlign: 'center' }}
              />
              <div className="mandatory-note">
                ⚠️ Mandatory for found items to protect student privacy and verify claims.
              </div>
            </div>
          </div>

          {/* SECTION 5: ETHICS PLEDGE */}
          <div style={{ marginBottom: '28px', padding: '14px 18px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input type="checkbox" required style={{ width: '18px', height: '18px', accentColor: 'var(--rose-d)' }} />
              <span>
                I certify that this report is honest and adheres to the <strong>SVKM Code of Conduct</strong>.
              </span>
            </label>
          </div>

          {/* SUBMIT ROW */}
          <div className="submit-row">
            <Link href="/browse" className="btn-draft">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className={`btn-submit ${reportType === 'FOUND' ? 'found-mode' : ''}`}
            >
              {submitting ? 'Submitting...' : 'Submit Report →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
