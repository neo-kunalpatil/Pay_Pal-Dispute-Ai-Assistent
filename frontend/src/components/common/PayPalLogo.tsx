import React from 'react';

export const PayPalLogo: React.FC<{ className?: string; showWordmark?: boolean; white?: boolean }> = ({ 
  className = 'h-7', 
  showWordmark = true,
  white = false
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* PayPal Double P Icon */}
      <svg viewBox="0 0 34 40" className="h-full w-auto aspect-[34/40]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M26.4 11.2C25.8 8.8 24.3 6.9 22.1 5.7C20.2 4.7 17.8 4.2 15.2 4.2H5.6C4.8 4.2 4.1 4.8 4.0 5.6L0.2 33.8C0.1 34.4 0.5 35 1.1 35H9.2L11.4 19.3C11.5 18.5 12.2 17.9 13.0 17.9H16.7C23.2 17.9 27.6 14.8 26.4 11.2Z"
          fill="#0079C1"
        />
        <path
          d="M29.8 14.3C29.2 11.9 27.7 10 25.5 8.8C23.6 7.8 21.2 7.3 18.6 7.3H11.5C10.7 7.3 10.0 7.9 9.9 8.7L6.8 33.8C6.7 34.4 7.1 35 7.7 35H15.0L16.8 21.4C16.9 20.6 17.6 20.0 18.4 20.0H21.3C27.0 20.0 30.8 17.4 29.8 14.3Z"
          fill="#00457C"
        />
        <path
          d="M24.8 13.7C24.4 11.8 23.2 10.3 21.5 9.3C19.9 8.5 18.0 8.1 15.8 8.1H10.1C9.4 8.1 8.8 8.6 8.7 9.3L5.9 29.6C5.8 30.1 6.2 30.6 6.7 30.6H12.7L14.2 18.8C14.3 18.2 14.9 17.7 15.5 17.7H17.9C22.6 17.7 25.7 15.6 24.8 13.7Z"
          fill="#0079C1"
        />
      </svg>
      {showWordmark && (
        <span className={`text-xl font-extrabold tracking-tight italic ${white ? 'text-white' : 'text-[#003087]'}`}>
          PayPal
        </span>
      )}
    </div>
  );
};

export const DisputePilotBadge: React.FC = () => {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#EAF4FC] text-[#0070BA] border border-[#BDE0FE]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#0070BA] animate-pulse"></span>
      DisputePilot AI
    </span>
  );
};
