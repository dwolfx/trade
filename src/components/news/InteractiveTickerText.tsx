import React from 'react';

interface InteractiveTickerTextProps {
  text: string;
  onSelectTicker: (symbol: string) => void;
  className?: string;
}

const TICKER_REGEX = /\b([A-Z]{4}[0-9]{1,2}|BTC|ETH|SOL|USDT)\b/g;

export const InteractiveTickerText: React.FC<InteractiveTickerTextProps> = ({
  text,
  onSelectTicker,
  className = '',
}) => {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Clone regex to reset state
  const regex = new RegExp(TICKER_REGEX);

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    const ticker = match[0];

    // Push text before match
    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex));
    }

    // Push clickable interactive ticker button
    parts.push(
      <button
        key={`${ticker}-${matchIndex}`}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelectTicker(ticker);
        }}
        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 rounded bg-blue-500/20 hover:bg-blue-600 text-[#60A5FA] hover:text-white font-mono font-bold text-[0.95em] border border-blue-500/40 hover:border-blue-400 transition-all cursor-pointer shadow-sm align-baseline"
        title={`Abrir cotação e gráfico de ${ticker}`}
      >
        <span className="text-[10px] text-amber-400">⚡</span>
        {ticker}
      </button>
    );

    lastIndex = matchIndex + ticker.length;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span className={className}>{parts}</span>;
};
