'use client';

// Gemini AI Matcher & Swiper Client Component (FST Unit 1 Client Components & ADF Gemini AI)
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  location: string;
  dateOccurred: string;
  imageUrl?: string;
  status: string;
  contactName: string;
}

export default function SwipeMatcherPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'FOUND' | 'LOST'>('FOUND');
  const [savedMatches, setSavedMatches] = useState<Item[]>([]);

  useEffect(() => {
    fetchItems(activeTab);
  }, [activeTab]);

  async function fetchItems(type: 'FOUND' | 'LOST') {
    setLoading(true);
    try {
      const res = await fetch(`/api/items?type=${type}&status=OPEN`);
      const data = await res.json();
      if (data.success) {
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
    if (currentIndex >= items.length) return;
    const current = items[currentIndex];

    if (direction === 'right') {
      setSavedMatches((prev) => [...prev, current]);
    }

    setCurrentIndex((prev) => prev + 1);
  }

  const currentItem = items[currentIndex];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Mode toggle */}
      <div className="flex flex-col items-center gap-2 mb-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
          ✨ Gemini AI Assistant Swiper
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
          Match Belongings Instantly
        </h1>
        <p className="text-xs text-slate-500 max-w-sm">
          Swipe through campus reports. Swipe right if you recognize the item, or left to skip!
        </p>

        {/* Tab switch */}
        <div className="flex bg-white/70 p-1 rounded-full border border-pink-200 mt-2">
          <button
            onClick={() => setActiveTab('FOUND')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              activeTab === 'FOUND'
                ? 'bg-[#e8848f] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            I Lost Something (Show Found)
          </button>
          <button
            onClick={() => setActiveTab('LOST')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              activeTab === 'LOST'
                ? 'bg-[#e8848f] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            I Found Something (Show Lost)
          </button>
        </div>
      </div>

      {/* Card area */}
      {loading ? (
        <div className="glass-card w-full h-[450px] flex items-center justify-center text-slate-400 text-sm">
          Loading campus reports...
        </div>
      ) : currentItem ? (
        <div className="w-full flex flex-col items-center">
          <div className="glass-card overflow-hidden w-full max-w-md shadow-xl border border-pink-200/80 transition-all duration-300">
            {currentItem.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentItem.imageUrl}
                alt={currentItem.title}
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-pink-100 via-purple-100 to-sky-100 flex items-center justify-center text-6xl">
                📦
              </div>
            )}

            <div className="p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    currentItem.type === 'LOST' ? 'badge-lost' : 'badge-found'
                  }`}
                >
                  {currentItem.type}
                </span>
                <span className="text-xs text-slate-500 font-medium">📍 {currentItem.location}</span>
              </div>

              <h2 className="text-xl font-bold text-slate-800">{currentItem.title}</h2>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {currentItem.description}
              </p>

              <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-pink-100">
                <span>📁 {currentItem.category}</span>
                <span>📅 {currentItem.dateOccurred}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-6 mt-6">
            <button
              onClick={() => handleSwipe('left')}
              className="w-14 h-14 rounded-full bg-white shadow-md hover:shadow-lg border border-slate-200 text-2xl flex items-center justify-center hover:scale-110 transition active:scale-95"
              title="Skip"
            >
              ❌
            </button>
            <Link
              href={`/items/${currentItem.id}`}
              className="px-5 py-2.5 rounded-full bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 shadow transition"
            >
              Inspect Details
            </Link>
            <button
              onClick={() => handleSwipe('right')}
              className="w-14 h-14 rounded-full bg-emerald-500 text-white shadow-md hover:shadow-lg text-2xl flex items-center justify-center hover:scale-110 transition active:scale-95"
              title="It's Mine / Potential Match"
            >
              💚
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-10 text-center w-full max-w-md flex flex-col items-center gap-4">
          <span className="text-5xl">🎉</span>
          <h3 className="text-xl font-bold text-slate-800">You&apos;ve reviewed all reports!</h3>
          <p className="text-xs text-slate-500">
            {savedMatches.length > 0
              ? `You saved ${savedMatches.length} potential matches during this session.`
              : 'No more items in this category right now.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => fetchItems(activeTab)}
              className="px-4 py-2 rounded-full bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition"
            >
              Review Again
            </button>
            <Link
              href="/browse"
              className="px-4 py-2 rounded-full bg-pink-100 text-pink-700 text-xs font-bold hover:bg-pink-200 transition"
            >
              Browse List View
            </Link>
          </div>
        </div>
      )}

      {/* Saved list */}
      {savedMatches.length > 0 && (
        <div className="w-full max-w-md mt-10">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Your Matched Shortlist ({savedMatches.length})
          </h4>
          <div className="flex flex-col gap-2">
            {savedMatches.map((m) => (
              <Link
                key={m.id}
                href={`/items/${m.id}`}
                className="glass-card p-3 flex items-center justify-between hover:bg-white transition text-xs"
              >
                <div className="flex items-center gap-2">
                  <span>{m.type === 'LOST' ? '🔴' : '🟢'}</span>
                  <span className="font-semibold text-slate-800 line-clamp-1">{m.title}</span>
                </div>
                <span className="text-pink-600 font-bold shrink-0">Claim →</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
