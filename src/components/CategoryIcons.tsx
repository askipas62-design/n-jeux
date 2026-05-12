import React from "react";

interface IconProps {
  className?: string;
}

export const BabyFootIcon = ({ className = "w-full h-full" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <path d="M12 4v16" />
    <circle cx="12" cy="12" r="3" />
    <path d="M2 10h2v4H2z" />
    <path d="M20 10h2v4h-2z" />
    <circle cx="7" cy="12" r="0.5" fill="currentColor" />
    <circle cx="17" cy="12" r="0.5" fill="currentColor" />
  </svg>
);

export const PingPongIcon = ({ className = "w-full h-full" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="15" cy="9" r="6" />
    <path d="M10.5 13.5l-6 6" />
    <circle cx="19" cy="5" r="1.5" fill="currentColor" stroke="none" />
    <path d="M9 15l2 2" />
  </svg>
);

export const BillardIcon = ({ className = "w-full h-full" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="7" r="4" />
    <circle cx="7" cy="15" r="4" />
    <circle cx="17" cy="15" r="4" />
    <path d="M11 6.5h2" />
    <path d="M6 14.5h2" />
    <path d="M16 14.5h2" />
  </svg>
);

export const TrampolineIcon = ({ className = "w-full h-full" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 12c5 0 9-1.5 9-3.5S17 5 12 5 3 6.5 3 8.5s4 3.5 9 3.5z" opacity="0.3" />
    <path d="M12 15c5 0 9-1.5 9-3.5" />
    <path d="M3 11.5v4" />
    <path d="M21 11.5v4" />
    <path d="M12 15v4" />
    <path d="M12 5V2" />
    <path d="M10 2h4" />
    <path d="M7 14v2" />
    <path d="M17 14v2" />
  </svg>
);

export const AccessoriesIcon = ({ className = "w-full h-full" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="3" width="7" height="7" rx="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" />
    <circle cx="17.5" cy="17.5" r="3.5" />
    <path d="M17.5 15.5v4" />
    <path d="M15.5 17.5h4" />
  </svg>
);

export const ConsoleIcon = ({ className = "w-full h-full" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="6" width="20" height="12" rx="3" />
    <rect x="6" y="9" width="3" height="1" />
    <rect x="7" y="8" width="1" height="3" />
    <circle cx="15.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="18.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
  </svg>
);
