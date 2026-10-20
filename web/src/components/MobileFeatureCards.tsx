'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface FeatureItem {
  title: string;
  desc: string;
  icon: string;
  bg: string;
  href: string;
}

const FEATURES: FeatureItem[] = [
  {
    href: '/post',
    icon: '📝',
    bg: 'var(--rose)',
    title: 'Post Lost & Found',
    desc: 'Report a lost or found item with details, photos, and location in under a minute.',
  },
  {
    href: '/swipe',
    icon: '👆',
    bg: 'var(--lavender)',
    title: 'Swipe to Match',
    desc: 'Tinder-style card swiping to find potential matches — swipe right if it could be yours.',
  },
  {
    href: '/browse',
    icon: '🔎',
    bg: 'var(--mint)',
    title: 'Smart Search & Filter',
    desc: 'Search by category, date, location or keyword to quickly locate your missing item.',
  },
  {
    href: '/chat',
    icon: '💬',
    bg: 'var(--sky)',
    title: 'Secure In-App Chat',
    desc: 'Chat unlocks only after a match — your identity and contact info stays private.',
  },
  {
    href: '/swipe',
    icon: '🤖',
    bg: 'var(--peach)',
    title: 'AI Match Suggestions',
    desc: 'Our AI engine analyses descriptions and metadata to proactively suggest likely matches.',
  },
  {
    href: '/profile',
    icon: '⭐',
    bg: 'var(--lemon)',
    title: 'Rewards & Points',
    desc: 'Earn points each time you successfully return a found item to its rightful owner.',
  },
];

export default function MobileFeatureCards() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const center = container.scrollLeft + container.clientWidth / 2;
    const children = container.children;

    let closest = 0;
    let minDistance = Infinity;

    for (let i = 0; i < children.length; i++) {
      const card = children[i] as HTMLElement;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(center - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closest = i;
      }
    }

    setActiveIndex(closest);
  }, []);

  const scrollToCard = (index: number) => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.children[index] as HTMLElement;
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  return (
    <div className="mobile-features-section">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="mobile-features-track"
      >
        {FEATURES.map((feat, i) => (
          <Link
            key={i}
            href={feat.href}
            className="feature-card mobile-feature-card"
          >
            <div className="feature-icon" style={{ background: feat.bg }}>
              {feat.icon}
            </div>
            <h3>{feat.title}</h3>
            <p>{feat.desc}</p>
          </Link>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="mobile-features-dots" aria-label="Feature slides">
        {FEATURES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollToCard(i)}
            className={`mobile-dot ${activeIndex === i ? 'mobile-dot-active' : ''}`}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={activeIndex === i ? 'true' : 'false'}
          />
        ))}
      </div>
    </div>
  );
}
