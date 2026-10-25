import React, { useState } from 'react';
import { NewsItem } from '../../types/news';
import { InteractiveTickerText } from './InteractiveTickerText';
import {
  X,
  Clock,
  Zap,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  CheckCircle2,
  FileText,
  Bookmark,
  ExternalLink,
} from 'lucide-react';

interface NewsReaderModalProps {
  item: NewsItem | null;
  onClose: () => void;
  onOpenOrder: (symbol: string) => void;
  onSelectTicker?: (symbol: string) => void;
}

export const NewsReaderModal: React.FC<NewsReaderModalProps> = ({
  item,
  onClose,
  onOpenOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'full'>('summary');

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0F1523] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover Photo (if available) */}
        {item.imageUrl && (
          <div className="relative w-full h-44 sm:h-52 bg-slate-900 overflow-hidden shrink-0">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            {/* Dark overlay gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F1523] via-[#0F1523]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F1523]/80 via-transparent to-transparent" />

            {/* Close button on image */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-colors z-10"
              title="Fechar"
            >
              <X size={18} />
            </button>

            {/* Source & Sentiment Badges over Image */}
            <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold uppercase bg-black/60 text-[#60A5FA] border border-blue-500/40 backdrop-blur-md">
                  {item.source}
                </span>

                {item.sentiment === 'bullish' && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[#38BDF8] bg-sky-950/80 border border-sky-500/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
                    <TrendingUp size={12} /> Otimista
                  </span>
                )}
                {item.sentiment === 'bearish' && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/80 border border-rose-500/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
                    <TrendingDown size={12} /> Baixista
                  </span>
                )}
                {item.sentiment === 'neutral' && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-slate-300 bg-slate-900/80 border border-slate-700 backdrop-blur-md px-2.5 py-1 rounded-lg">
                    <Minus size={12} /> Fato Neutro
                  </span>
                )}
              </div>

              <span className="text-[#CBD5E1] flex items-center gap-1 font-mono text-[11px] bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md">
                <Clock size={12} />
                {item.publishedAt}
              </span>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-5 pb-3 border-b border-[#1E293B]">
          {!item.imageUrl && (
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase bg-[#161F33] text-[#60A5FA] border border-blue-500/30">
                  {item.source}
                </span>
                <span className="text-[#64748B] flex items-center gap-1 font-mono text-[11px]">
                  <Clock size={12} />
                  {item.publishedAt}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors"
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Interactive Title with clickable tickers */}
          <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
            <InteractiveTickerText
              text={item.title}
              onSelectTicker={(symbol) => {
                onClose();
                onOpenOrder(symbol);
              }}
            />
          </h2>

          {/* Tickers Quick Bar */}
          {item.relatedTickers.length > 0 && (
            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#1E293B]/60 flex-wrap">
              <span className="text-[11px] font-mono text-[#64748B]">Ativos citados:</span>
              {item.relatedTickers.map((ticker) => (
                <button
                  key={ticker}
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenOrder(ticker);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/20 text-[#60A5FA] hover:bg-[#2962FF] hover:text-white border border-blue-500/40 text-xs font-mono font-bold transition-all shadow-sm"
                  title={`Abrir boleta de ${ticker}`}
                >
                  <Zap size={12} className="text-amber-400" />
                  <span>Operar ${ticker}</span>
                  <ArrowRight size={11} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab switcher: Quick TL;DR vs Full News */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-[#1E293B] bg-[#0D1424]">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 py-2 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'summary'
                ? 'border-[#2962FF] text-[#60A5FA]'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <Sparkles size={14} className="text-amber-400" />
            Resumo Rápido (TL;DR)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('full')}
            className={`flex items-center gap-2 py-2 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'full'
                ? 'border-[#2962FF] text-[#60A5FA]'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <FileText size={14} />
            Matéria Completa
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm leading-relaxed text-[#CBD5E1]">
          {activeTab === 'summary' ? (
            <div className="space-y-4">
              {/* Executive Summary Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-950/40 via-[#161F33] to-[#0F1523] border border-blue-500/30 shadow-inner">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#60A5FA] mb-2 uppercase font-mono tracking-wider">
                  <Sparkles size={14} className="text-amber-400" />
                  Resumo Executivo para Decisão:
                </div>
                <p className="text-sm font-medium text-white leading-relaxed">
                  <InteractiveTickerText
                    text={item.aiSummary || item.summary}
                    onSelectTicker={(symbol) => {
                      onClose();
                      onOpenOrder(symbol);
                    }}
                  />
                </p>
              </div>

              {/* Key Takeaways */}
              {item.keyTakeaways && item.keyTakeaways.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                    <Bookmark size={13} className="text-[#60A5FA]" />
                    Pontos-Chave (Impacto no Mercado):
                  </h4>
                  <ul className="space-y-2">
                    {item.keyTakeaways.map((point, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-[#161F33]/60 border border-[#1E293B] text-xs sm:text-sm text-[#E2E8F0]"
                      >
                        <CheckCircle2 size={16} className="text-[#38BDF8] shrink-0 mt-0.5" />
                        <InteractiveTickerText
                          text={point}
                          onSelectTicker={(symbol) => {
                            onClose();
                            onOpenOrder(symbol);
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#161F33]/60 border border-[#1E293B] font-medium text-white italic">
                "<InteractiveTickerText
                  text={item.summary}
                  onSelectTicker={(symbol) => {
                    onClose();
                    onOpenOrder(symbol);
                  }}
                />"
              </div>

              <p className="whitespace-pre-line text-sm text-[#94A3B8] leading-7">
                <InteractiveTickerText
                  text={item.content || item.summary}
                  onSelectTicker={(symbol) => {
                    onClose();
                    onOpenOrder(symbol);
                  }}
                />
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0B0F19] border-t border-[#1E293B] flex items-center justify-between gap-3 text-xs text-[#64748B]">
          <div className="flex items-center gap-3">
            <span>Canal verificado via {item.source}</span>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 text-[#60A5FA] border border-blue-500/30 text-xs font-semibold transition-all"
              >
                <span>Ler matéria no {item.source}</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-[#334155] text-white font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
