'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  SparklesLineIcon,
  SearchLineIcon,
  LocationLineIcon,
  CalendarLineIcon,
  ShieldLineIcon,
} from '@/components/LineIcons';

interface MatchItem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  dateOccurred: string;
  status: string;
  imageUrl?: string | null;
}

interface MatchResult {
  item: MatchItem;
  similarityScore: number;
  aiAnalysis: string;
}

export default function GeminiMatcherClient() {
  const [query, setQuery] = useState('AirPods Pro with blue cover');
  const [reportType, setReportType] = useState<'LOST' | 'FOUND'>('LOST');
  const [category, setCategory] = useState('Electronics');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [provider, setProvider] = useState('');
  const [matches, setMatches] = useState<MatchResult[]>([]);

  const categories = ['Electronics', 'ID Cards', 'Bags', 'Water Bottles', 'Stationery', 'Accessories', 'Others'];

  const quickPrompts = [
    'AirPods Pro with blue cover',
    'DJSCE College ID Card SVKM',
    'Navy Blue Dell Laptop Bag',
    'Casio fx-991EX scientific calculator',
    'Milton thermosteel flask 750ml',
  ];

  async function handleMatch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: query,
          description: query,
          category,
          type: reportType,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }


      const data = await res.json();
      if (data.success) {
        setMatches(data.matches || []);
        setAiSummary(data.aiSummary || '');
        setProvider(data.provider || 'Gemini Semantic Engine');
      } else {
        setAiSummary(data.error || 'AI match query failed. Please try again.');
        setMatches([]);
      }
    } catch (err) {
      console.error('Match failed:', err);
      setAiSummary('Could not connect to Gemini AI backend service.');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 20px 80px' }}>
      {/* HEADER */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '999px',
            background: 'var(--lavender)',
            color: 'var(--lav-d)',
            fontSize: '0.82rem',
            fontWeight: 700,
            marginBottom: '14px',
          }}
        >
          <SparklesLineIcon size={14} />
          <span>ADF Mini Project I &bull; Gemini for Developers</span>
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.4rem',
            fontWeight: 700,
            color: 'var(--text-p)',
            marginBottom: '10px',
          }}
        >
          Gemini AI Campus Matcher
        </h1>
        <p
          style={{
            color: 'var(--text-s)',
            fontSize: '0.98rem',
            maxWidth: '620px',
            margin: '0 auto',
            lineHeight: 1.5,
          }}
        >
          Describe your lost item or something you found around DJSCE. Gemini analyzes semantic keywords,
          categories, and location overlap to find matching reports with high confidence.
        </p>
      </div>

      {/* INPUT CARD */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px 28px',
          boxShadow: 'var(--card-shadow)',
          marginBottom: '32px',
        }}
      >
        <form onSubmit={handleMatch}>
          {/* TYPE SELECTOR */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-s)', marginBottom: '8px' }}>
              I AM REPORTING / SEARCHING FOR:
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setReportType('LOST')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: reportType === 'LOST' ? '2px solid var(--rose-d)' : '1px solid var(--border)',
                  background: reportType === 'LOST' ? 'var(--rose)' : 'transparent',
                  color: reportType === 'LOST' ? 'var(--rose-d)' : 'var(--text-s)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                🔴 I Lost an Item (Match Against Found)
              </button>
              <button
                type="button"
                onClick={() => setReportType('FOUND')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: reportType === 'FOUND' ? '2px solid var(--mint-d)' : '1px solid var(--border)',
                  background: reportType === 'FOUND' ? 'var(--mint)' : 'transparent',
                  color: reportType === 'FOUND' ? 'var(--mint-d)' : 'var(--text-s)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                🟢 I Found an Item (Match Against Lost)
              </button>
            </div>
          </div>

          {/* QUERY INPUT */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-s)', marginBottom: '8px' }}>
              ITEM DESCRIPTION OR DISTINCTIVE DETAILS
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Navy blue Dell laptop bag with charger left in 4th fl IT lab"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '0.95rem',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text-p)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Quick Prompts */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-s)', fontWeight: 600 }}>Try sample:</span>
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setQuery(prompt)}
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.75rem',
                    color: 'var(--text-s)',
                    cursor: 'pointer',
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* CATEGORY SELECTOR */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-s)', marginBottom: '8px' }}>
              CATEGORY
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: category === c ? '1.5px solid var(--lav-d)' : '1px solid var(--border)',
                    background: category === c ? 'var(--lavender)' : 'transparent',
                    color: category === c ? 'var(--lav-d)' : 'var(--text-s)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading || !query.trim()}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 4px 14px rgba(109, 40, 217, 0.25)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            <SparklesLineIcon size={18} />
            <span>{loading ? 'Gemini Analyzing & Matching...' : 'Run Gemini Semantic Match'}</span>
          </button>
        </form>
      </div>

      {/* RESULTS SECTION */}
      {searched && (
        <div>
          {/* AI SUMMARY BOX */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--lav-d)',
              borderRadius: '14px',
              padding: '20px 24px',
              marginBottom: '28px',
              boxShadow: '0 4px 18px rgba(109, 40, 217, 0.08)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--lav-d)', fontWeight: 700, fontSize: '0.92rem' }}>
                <SparklesLineIcon size={16} />
                <span>Gemini Match Intelligence</span>
              </div>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'var(--lavender)',
                  color: 'var(--lav-d)',
                }}
              >
                {provider}
              </span>
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-p)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
              {aiSummary}
            </p>
          </div>

          {/* MATCHES LIST */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-p)', marginBottom: '16px' }}>
              Candidate Matches ({matches.length})
            </h3>

            {matches.length === 0 ? (
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px dashed var(--border)',
                  borderRadius: '14px',
                  padding: '40px 24px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-p)' }}>
                  No Direct Matches Found Right Now
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-s)', maxWidth: '480px', margin: '0 auto 20px' }}>
                  No active reports scored above the 20% similarity threshold. Don&apos;t worry — your item report will remain open and students will receive notifications upon new submissions.
                </p>
                <Link
                  href="/post"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    background: 'var(--text-p)',
                    color: 'var(--bg)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  Create an Official Report &rarr;
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                {matches.map(({ item, similarityScore, aiAnalysis }) => (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '14px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--card-shadow)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div>
                      {/* Top Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '999px',
                            background: similarityScore >= 70 ? 'var(--mint)' : 'var(--lemon)',
                            color: similarityScore >= 70 ? 'var(--mint-d)' : 'var(--lem-d)',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <SparklesLineIcon size={12} />
                          <span>{similarityScore}% Match</span>
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'var(--bg)',
                            color: 'var(--text-s)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {item.category}
                        </span>
                      </div>

                      {/* Title & Desc */}
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-p)' }}>
                        {item.title}
                      </h4>
                      <p
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-s)',
                          lineHeight: 1.45,
                          marginBottom: '14px',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {item.description}
                      </p>

                      {/* Meta */}
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-s)', display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <LocationLineIcon size={13} />
                          <span>{item.location}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CalendarLineIcon size={13} />
                          <span>Reported on: {item.dateOccurred}</span>
                        </div>
                      </div>

                      {/* AI Analysis Explanation */}
                      <div
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          fontSize: '0.78rem',
                          color: 'var(--text-s)',
                          lineHeight: 1.4,
                          marginBottom: '16px',
                        }}
                      >
                        <strong style={{ color: 'var(--lav-d)', display: 'block', marginBottom: '2px' }}>
                          AI Match Reasoning:
                        </strong>
                        {aiAnalysis}
                      </div>
                    </div>

                    {/* Action */}
                    <Link
                      href={`/items/${item.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'var(--text-p)',
                        color: 'var(--bg)',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        transition: 'opacity 0.15s ease',
                      }}
                    >
                      <ShieldLineIcon size={14} />
                      <span>Inspect &amp; File Claim</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CAMPUS RETRIEVAL ADVISOR (From GeminiService on Mobile) */}
      <div
        style={{
          marginTop: '48px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px 28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--text-p)' }}>
          <ShieldLineIcon size={18} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
            Gemini Campus Lost &amp; Found Retrieval Tips
          </h3>
        </div>
        <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-s)', fontSize: '0.88rem', lineHeight: 1.7 }}>
          <li>Check with the <strong>Ground Floor Security Desk</strong> and Central Administrative Office.</li>
          <li>Inquire at the <strong>Central Library 3rd Floor</strong> lost collection repository.</li>
          <li>Visit departmental <strong>Lab In-charges</strong> if your item was misplaced near computer or electronics labs.</li>
          <li>Always verify ownership credentials at designated SVKM security checkpoints before handover.</li>
        </ul>
      </div>
    </div>
  );
}
