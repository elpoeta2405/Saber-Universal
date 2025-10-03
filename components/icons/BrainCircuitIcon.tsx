import React from 'react';

const BrainCircuitIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    viewBox="0 0 24 24" 
    strokeWidth="1.5" 
    stroke="currentColor" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M15.532 12.704a2.5 2.5 0 1 0 -3.532 -3.534a2.5 2.5 0 0 0 3.532 3.534" />
    <path d="M12 14v7" />
    <path d="M9 5.5v-1.5" />
    <path d="M15 5.5v-1.5" />
    <path d="M12 4v-1" />
    <path d="M12 14c-2.333 -1.333 -4.667 -1.333 -7 -1" />
    <path d="M12 14c2.333 -1.333 4.667 -1.333 7 -1" />
    <path d="M5 13v-2.5" />
    <path d="M19 13v-2.5" />
    <path d="M3 10.5h1" />
    <path d="M20 10.5h1" />
  </svg>
);

export default BrainCircuitIcon;