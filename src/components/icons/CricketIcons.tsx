import React from 'react';

export const CricketBat: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 19.5l3-3" />
    <path d="M7.5 16.5l9-9c1.5-1.5 3.5-1.5 4.5-.5s1 3-.5 4.5l-9 9" />
    <path d="M7 17l-2.5 2.5" />
    <rect x="6" y="15" width="3" height="4" rx="0.5" transform="rotate(-45 7.5 17)" />
  </svg>
);

export const CricketBall: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="M8 6c0 4-1 6 0 12" strokeLinecap="round" />
    <path d="M16 6c0 4 1 6 0 12" strokeLinecap="round" />
  </svg>
);

export const Stumps: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="7" y1="4" x2="7" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
    <line x1="17" y1="4" x2="17" y2="20" />
    <line x1="5" y1="5" x2="19" y2="5" />
    <line x1="5" y1="7" x2="19" y2="7" />
  </svg>
);

export const Trophy: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

export const LiveBadge: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-live text-primary-foreground text-xs font-bold ${className}`}>
    <span className="w-2 h-2 bg-primary-foreground rounded-full live-pulse" />
    LIVE
  </div>
);
