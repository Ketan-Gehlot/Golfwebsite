import React from 'react';

export function MIcon({ icon, className = '', fill = false, size = 'text-2xl' }) {
  return (
    <span
      className={`material-symbols-outlined ${size} ${className}`}
      style={fill ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
    >
      {icon}
    </span>
  );
}
