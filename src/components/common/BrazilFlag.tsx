import React from 'react';

interface BrazilFlagProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BrazilFlag: React.FC<BrazilFlagProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-3',
    md: 'w-5 h-3.5',
    lg: 'w-6 h-4.5',
  };

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 rounded-[3px] overflow-hidden shadow-sm border border-black/20 ${sizeClasses[size]} ${className}`}
      title="B3 Brasil"
    >
      <svg
        viewBox="0 0 20 14"
        className="w-full h-full block"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Green Field */}
        <rect width="20" height="14" fill="#009B3A" />
        {/* Yellow Rhombus */}
        <polygon points="10,1.5 18.5,7 10,12.5 1.5,7" fill="#FEDF00" />
        {/* Blue Circle */}
        <circle cx="10" cy="7" r="3.5" fill="#002776" />
        {/* White Arc (Ordem e Progresso curve) */}
        <path
          d="M 6.8,7.8 Q 10,6.2 13.2,7.8"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          fill="none"
        />
      </svg>
    </div>
  );
};
