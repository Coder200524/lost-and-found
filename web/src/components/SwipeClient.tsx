'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  location: string;
  dateOccurred?: string;
  date?: string;
  isHotspot?: boolean;
}

export default function SwipeClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'FOUND' | 'LOST'>('FOUND');
  const [matchedItem, setMatchedItem] = useState<Item | null>(null);

  // Drag gesture states
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [flyOutDirection, setFlyOutDirection] = useState<'left' | 'right' | null>(null);
  const startPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    fetchItems(activeTab);
  }, [activeTab]);

  async function fetchItems(type: 'FOUND' | 'LOST') {
    setLoading(true);
    try {
      const res = await fetch(`/api/items?type=${type}&status=OPEN`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setItems(data.data);
        setCurrentIndex(0);
      }
    } catch (e) {
      console.error('Failed to load items:', e);
    } finally {
      setLoading(false);
    }
  }

  function handleSwipe(direction: 'left' | 'right') {
    if (currentIndex >= items.length || flyOutDirection) return;
    const current = items[currentIndex];

    setFlyOutDirection(direction);

    setTimeout(() => {
      if (direction === 'right') {
        setMatchedItem(current);
      }
      setFlyOutDirection(null);
      setDragOffset({ x: 0, y: 0 });
      setCurrentIndex((prev) => prev + 1);
    }, 320);
  }

  // Pointer / Mouse events for realistic physics drag
  function handlePointerDown(e: React.PointerEvent) {
    if (flyOutDirection) return;
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging || flyOutDirection) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    setDragOffset({ x: dx, y: dy });
  }

  function handlePointerUp() {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset.x > 90) {
      handleSwipe('right');
    } else if (dragOffset.x < -90) {
      handleSwipe('left');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  }

  const categoryEmojiMap: Record<string, string> = {
    'ID Cards': '🪪',
    'Electronics': '📱',
    'Bags': '🎒',
    'Water Bottles': '🍶',
    'Stationery': '✏️',
    'Accessories': '⌚',
    'Others': '📦',
  };

  const currentItem = items[currentIndex];
  const nextItem1 = items[currentIndex + 1];
  const nextItem2 = items[currentIndex + 2];

  // Dynamic label opacities during drag
  const likeOpacity = flyOutDirection === 'right' ? 1 : Math.min(Math.max(dragOffset.x / 80, 0), 1);
  const nopeOpacity = flyOutDirection === 'left' ? 1 : Math.min(Math.max(-dragOffset.x / 80, 0), 1);

  // Compute transform
  let activeTransform = 'none';
  if (flyOutDirection === 'right') {
    activeTransform = 'translateX(650px) rotate(22deg)';
  } else if (flyOutDirection === 'left') {
    activeTransform = 'translateX(-650px) rotate(-22deg)';
  } else if (isDragging) {
    activeTransform = `translateX(${dragOffset.x}px) translateY(${dragOffset.y * 0.25}px) rotate(${dragOffset.x * 0.08}deg)`;
  }

  return (
    <>
      {/* MATCH OVERLAY POPUP */}
      <div className={`match-overlay ${matchedItem ? 'show' : ''}`}>
        <div className="match-emoji">🎉</div>
        <h2 className="match-title">It&apos;s a Match!</h2>
        <p className="match-sub">
          Both parties swiped right!<br />
          You can now chat in private to verify ownership and arrange handover.
        </p>

        <div className="match-cards">
          <div className="match-card-mini">
            <div className="icon">🎒</div>
            <strong>{activeTab === 'FOUND' ? 'Your Lost Report' : 'Your Found Report'}</strong>
            <p>Verified SVKM Student</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.8rem' }}>💫</div>
          <div className="match-card-mini">
            <div className="icon">{matchedItem ? categoryEmojiMap[matchedItem.category] || '📦' : '📦'}</div>
            <strong>{matchedItem?.title || 'Reported Belonging'}</strong>
            <p>📍 {matchedItem?.location}</p>
          </div>
        </div>

        <div className="match-actions">
          <Link href="/chat" className="match-chat">
            💬 Open In-App Chat
          </Link>
          <button className="match-keep" onClick={() => setMatchedItem(null)}>
            Keep Swiping
          </button>
        </div>
      </div>

      <div className="page-wrap">
        <div className="page-header">
          <h1>Swipe to Find Your Item</h1>
          <p>👈 Swipe left = Not mine &nbsp;·&nbsp; Swipe right = Could be mine! 👉</p>

          {/* Mode Switcher */}
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(0,0,0,0.05)',
              borderRadius: '50px',
              padding: '4px',
              marginTop: '16px',
            }}
          >
            <button
              onClick={() => {
                setActiveTab('FOUND');
                setDragOffset({ x: 0, y: 0 });
              }}
              style={{
                padding: '7px 18px',
                borderRadius: '50px',
                border: 'none',
                background: activeTab === 'FOUND' ? 'white' : 'transparent',
                color: activeTab === 'FOUND' ? 'var(--text)' : 'var(--text-s)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'FOUND' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              I Lost Something (Review Found)
            </button>
            <button
              onClick={() => {
                setActiveTab('LOST');
                setDragOffset({ x: 0, y: 0 });
              }}
              style={{
                padding: '7px 18px',
                borderRadius: '50px',
                border: 'none',
                background: activeTab === 'LOST' ? 'white' : 'transparent',
                color: activeTab === 'LOST' ? 'var(--text)' : 'var(--text-s)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'LOST' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              I Found Something (Review Lost)
            </button>
          </div>
        </div>

        {/* MY ITEM CONTEXT */}
        <div className="my-item-bar">
          <div className="my-item-icon">🎒</div>
          <div className="my-item-info">
            <small>Matching against campus database</small>
            <strong>
              {activeTab === 'FOUND'
                ? 'Lost belongings reported on SVKM Campus'
                : 'Found items submitted by campus classmates'}
            </strong>
          </div>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '50px',
              background: 'var(--lavender)',
              color: 'var(--lav-d)',
              fontSize: '0.78rem',
              fontWeight: 700,
            }}
          >
            🤖 AI Match Active
          </span>
        </div>

        {/* CARD STACK */}
        <div className="card-stack">
          {loading ? (
            <div
              className="swipe-card"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            >
              <div style={{ textAlign: 'center', color: 'var(--text-s)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🤖</div>
                <p style={{ fontWeight: 600 }}>Loading Gemini neural matcher...</p>
              </div>
            </div>
          ) : !currentItem ? (
            <div
              className="swipe-card"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            >
              <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🎉</div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '8px' }}>
                  All caught up!
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-s)', marginBottom: '20px' }}>
                  No more unreviewed items in this category right now.
                </p>
                <button
                  onClick={() => {
                    setCurrentIndex(0);
                    fetchItems(activeTab);
                  }}
                  className="btn-primary"
                  style={{ fontSize: '0.88rem', padding: '10px 22px' }}
                >
                  Start Over
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Background card 2 */}
              {nextItem2 && (
                <div className="swipe-card" style={{ transform: 'rotate(2deg) scale(0.92)', zIndex: 0 }}>
                  <div className="card-img" style={{ background: '#e0f4ff' }}>
                    <span className="card-img-emoji">{categoryEmojiMap[nextItem2.category] || '📦'}</span>
                  </div>
                </div>
              )}

              {/* Background card 1 */}
              {nextItem1 && (
                <div className="swipe-card" style={{ transform: 'rotate(-2deg) scale(0.96)', zIndex: 1 }}>
                  <div className="card-img" style={{ background: '#fff9e0' }}>
                    <span className="card-img-emoji">{categoryEmojiMap[nextItem1.category] || '📦'}</span>
                  </div>
                </div>
              )}

              {/* Active Card with Mouse / Touch Drag Gesture */}
              <div
                className="swipe-card"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{
                  zIndex: 2,
                  transform: activeTransform,
                  transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  cursor: isDragging ? 'grabbing' : 'grab',
                }}
              >
                {/* LIKE & NOPE LABELS */}
                <div className="like-label" style={{ opacity: likeOpacity }}>
                  ✓ MINE
                </div>
                <div className="nope-label" style={{ opacity: nopeOpacity }}>
                  ✕ NOPE
                </div>

                <div className="card-img" style={{ background: '#fdf3c0' }}>
                  <span className="card-img-emoji">{categoryEmojiMap[currentItem.category] || '📦'}</span>
                  <div className={`card-type-badge ${currentItem.type === 'LOST' ? 'badge-lost' : 'badge-found'}`}>
                    {currentItem.type === 'LOST' ? '🔴 Lost' : '🟢 Found'}
                  </div>
                  <div className="match-pct">
                    🤖 94% match
                  </div>
                </div>

                <div className="card-body">
                  <div className="card-cat">{currentItem.category}</div>
                  <h3 className="card-name">{currentItem.title}</h3>
                  <p className="card-desc">{currentItem.description}</p>
                  <div className="card-meta">
                    <span>📍 {currentItem.location}</span>
                    <span>🗓️ {currentItem.dateOccurred || currentItem.date || 'Recent'}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* SWIPE BUTTONS */}
        {currentItem && (
          <div className="swipe-btns">
            <div className="swipe-btn-wrap">
              <button
                onClick={() => handleSwipe('left')}
                className="swipe-no"
                title="Not mine"
              >
                ✕
              </button>
              <span className="btn-label">Not mine</span>
            </div>

            <div className="swipe-btn-wrap">
              <Link
                href={`/items/${currentItem.id}`}
                className="swipe-info"
                title="More info"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                ℹ️
              </Link>
              <span className="btn-label">Details</span>
            </div>

            <div className="swipe-btn-wrap">
              <button
                onClick={() => handleSwipe('right')}
                className="swipe-yes"
                title="Could be mine!"
              >
                ♥
              </button>
              <span className="btn-label">Could be mine!</span>
            </div>
          </div>
        )}

        <p className="counter">
          <strong>{Math.max(0, items.length - currentIndex)}</strong> items left to review
        </p>
      </div>
    </>
  );
}
