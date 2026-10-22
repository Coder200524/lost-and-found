'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    // Render a subtle placeholder with same dimensions to prevent layout shift during hydration
    return (
      <div
        className="theme-toggle-btn skeleton"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          opacity: 0,
        }}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle-btn"
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        border: '1.5px solid var(--toggle-border, rgba(232, 132, 143, 0.35))',
        background: 'var(--toggle-bg, rgba(255, 255, 255, 0.75))',
        color: 'var(--toggle-color, var(--text))',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isDark
          ? '0 2px 10px rgba(0, 0, 0, 0.4), inset 0 0 6px rgba(247, 141, 167, 0.2)'
          : '0 2px 8px rgba(140, 100, 130, 0.12)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: isDark ? 'rotate(360deg)' : 'rotate(0deg)',
        }}
      >
        {isDark ? (
          <Sun size={18} className="text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.5)]" />
        ) : (
          <Moon size={17} className="text-purple-600" />
        )}
      </span>
    </button>
  );
}
