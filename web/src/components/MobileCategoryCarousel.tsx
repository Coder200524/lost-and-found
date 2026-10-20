'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface CategoryItem {
  name: string;
  emoji: string;
  href: string;
}

const CATEGORIES: CategoryItem[] = [
  { name: 'ID Cards', emoji: '🪪', href: '/browse?category=ID+Cards' },
  { name: 'Electronics', emoji: '📱', href: '/browse?category=Electronics' },
  { name: 'Bags', emoji: '🎒', href: '/browse?category=Bags' },
  { name: 'Water Bottles', emoji: '🍶', href: '/browse?category=Water+Bottles' },
  { name: 'Stationery', emoji: '✏️', href: '/browse?category=Stationery' },
  { name: 'Accessories', emoji: '⌚', href: '/browse?category=Accessories' },
  { name: 'Others', emoji: '📦', href: '/browse?category=Others' },
];

export default function MobileCategoryCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // We repeat categories 4 times to ensure seamless infinite looping with zero gaps
  const repeatedCategories = [...CATEGORIES, ...CATEGORIES, ...CATEGORIES, ...CATEGORIES];

  const offsetRef = useRef(0);
  const singleSetWidthRef = useRef(0);
  const isInteractingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [itemWidth, setItemWidth] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Measure single set width (7 items + 7 gaps) and compute item width for 3 visible items
  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      if (containerWidth > 0) {
        // Exactly 3 items visible at a time with 2 gaps of 8px
        const computed = (containerWidth - 16) / 3;
        setItemWidth(computed);
      }
    }

    if (!trackRef.current || trackRef.current.children.length <= CATEGORIES.length) return;
    const firstItem = trackRef.current.children[0] as HTMLElement;
    const eighthItem = trackRef.current.children[CATEGORIES.length] as HTMLElement;
    if (firstItem && eighthItem) {
      singleSetWidthRef.current = eighthItem.offsetLeft - firstItem.offsetLeft;
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handleMotionChange);

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    let lastTime = performance.now();
    const speed = 0.55; // Pixels per frame (~33px/sec at 60fps)

    const loop = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      if (!isInteractingRef.current && !mq.matches && singleSetWidthRef.current > 0 && trackRef.current) {
        offsetRef.current += speed * (delta / 16.67);
        if (offsetRef.current >= singleSetWidthRef.current) {
          offsetRef.current -= singleSetWidthRef.current;
        }
        trackRef.current.style.transform = `translate3d(-${offsetRef.current}px, 0, 0)`;
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      mq.removeEventListener('change', handleMotionChange);
      window.removeEventListener('resize', updateDimensions);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, [updateDimensions]);

  // Touch & Pointer Gesture Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isInteractingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isInteractingRef.current) return;
    const delta = e.clientX - lastXRef.current;
    if (Math.abs(e.clientX - startXRef.current) > 5) {
      hasDraggedRef.current = true;
    }
    lastXRef.current = e.clientX;

    if (singleSetWidthRef.current > 0 && trackRef.current) {
      offsetRef.current -= delta;
      while (offsetRef.current < 0) {
        offsetRef.current += singleSetWidthRef.current;
      }
      while (offsetRef.current >= singleSetWidthRef.current) {
        offsetRef.current -= singleSetWidthRef.current;
      }
      trackRef.current.style.transform = `translate3d(-${offsetRef.current}px, 0, 0)`;
    }
  };

  const handlePointerUp = () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    // Pause briefly after user interaction before resuming continuous auto-loop
    resumeTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 1800);
  };

  return (
    <div
      ref={containerRef}
      className="mobile-cats-container"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => {
        isInteractingRef.current = true;
      }}
      onMouseLeave={() => {
        if (!hasDraggedRef.current) {
          isInteractingRef.current = false;
        }
      }}
      style={{
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        touchAction: 'pan-y',
        padding: '6px 0',
      }}
    >
      <div
        ref={trackRef}
        className="mobile-cats-track"
        style={{
          display: 'flex',
          gap: '8px',
          width: 'max-content',
          willChange: 'transform',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {repeatedCategories.map((cat, idx) => (
          <Link
            key={idx}
            href={cat.href}
            onClick={(e) => {
              if (hasDraggedRef.current) {
                e.preventDefault();
              }
            }}
            className="mobile-cat-card"
            style={itemWidth ? { width: `${itemWidth}px`, minWidth: `${itemWidth}px`, maxWidth: `${itemWidth}px` } : undefined}
          >
            <span className="mobile-cat-emoji">{cat.emoji}</span>
            <span className="mobile-cat-label">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
