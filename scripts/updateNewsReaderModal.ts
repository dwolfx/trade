import fs from 'fs';

let code = fs.readFileSync('src/components/news/NewsReaderModal.tsx', 'utf8');

// 1. Add ShieldAlert if not present
if (!code.includes('ShieldAlert')) {
  code = code.replace("  ExternalLink,", "  ExternalLink,\n  ShieldAlert,");
}

// 2. Add helper functions inside component
const targetFunc = "const [activeTab, setActiveTab] = useState<'summary' | 'full'>('summary');";
const helperCode = `const [activeTab, setActiveTab] = useState<'summary' | 'full'>('summary');

  // Strip leading source prefix (e.g. "Brazil Journal: ", "InfoMoney: ", "Reuters: ")
  const cleanExecutiveSummary = (text: string) => {
    if (!text) return '';
    return text.replace(/^(?:Brazil Journal|InfoMoney|Valor PRO|Reuters|CVM \\/ B3|CryptoPanic)\\s*:\\s*/i, '');
  };

  const articleParagraphs = React.useMemo(() => {
    if (!item) return [];
    const sourceText = item.content || item.summary || '';
    return sourceText
      .split(/\\n\\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
  }, [item]);`;

if (!code.includes('cleanExecutiveSummary')) {
  code = code.replace(targetFunc, helperCode);
}

// 3. Replace summary card & full article body
const oldBodyTarget = `        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm leading-relaxed text-[#CBD5E1]">
          {activeTab === 'summary' ? (
            <div className="space-y-4">
              {/* Executive Summary Card */}`;

const newBodyCode = `        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm leading-relaxed text-[#CBD5E1]">
          {activeTab === 'summary' ? (
            <div className="space-y-4">
              {/* Action Signal Banner (Comprar / Vender / Manter) */}
              {item.action && (
                <div
                  className={\`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg \${
                    item.action.signal === 'COMPRAR'
                      ? 'bg-gradient-to-r from-sky-950/70 via-[#0F1523] to-[#0F1523] border-sky-500/40 shadow-sky-500/5'
                      : item.action.signal === 'VENDER'
                      ? 'bg-gradient-to-r from-rose-950/70 via-[#0F1523] to-[#0F1523] border-rose-500/40 shadow-rose-500/5'
                      : 'bg-gradient-to-r from-amber-950/50 via-[#0F1523] to-[#0F1523] border-amber-500/40 shadow-amber-500/5'
                  }\`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={\`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 \${
                        item.action.signal === 'COMPRAR'
                          ? 'bg-sky-500/20 text-[#38BDF8] border border-sky-500/30'
                          : item.action.signal === 'VENDER'
                          ? 'bg-rose-500/20 text-[#F43F5E] border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }\`}
                    >
                      {item.action.signal === 'COMPRAR' ? (
                        <TrendingUp size={20} />
                      ) : item.action.signal === 'VENDER' ? (
                        <TrendingDown size={20} />
                      ) : (
                        <Minus size={20} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] font-bold">
                          Indicação TradeCraft
                        </span>
                        <span
                          className={\`px-2.5 py-0.5 rounded-md text-xs font-mono font-black tracking-wide border \${
                            item.action.signal === 'COMPRAR'
                              ? 'bg-sky-500/25 text-[#38BDF8] border-sky-400/50'
                              : item.action.signal === 'VENDER'
                              ? 'bg-rose-500/25 text-[#F43F5E] border-rose-400/50'
                              : 'bg-amber-500/25 text-amber-300 border-amber-400/50'
                          }\`}
                        >
                          {item.action.signal} {item.action.targetSymbol || ''}
                        </span>
                      </div>
                      <p className="text-xs text-[#CBD5E1] mt-1 font-medium">
                        {item.action.reason}
                      </p>
                    </div>
                  </div>

                  {item.action.targetSymbol && (
                    <button
                      type="button"
                      onClick={() => {
                        const sym = item.action!.targetSymbol!;
                        onClose();
                        onOpenOrder(sym);
                      }}
                      className={\`px-3.5 py-2 rounded-xl text-white font-mono font-bold text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all shrink-0 \${
                        item.action.signal === 'COMPRAR'
                          ? 'bg-[#2962FF] hover:bg-[#1D4ED8] shadow-blue-500/25'
                          : item.action.signal === 'VENDER'
                          ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/25'
                          : 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/25'
                      }\`}
                    >
                      <Zap size={13} className="fill-white" />
                      <span>{item.action.signal === 'VENDER' ? 'Vender' : 'Operar'} \${item.action.targetSymbol}</span>
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              )}

              {/* Executive Summary Card */}`;

code = code.replace(oldBodyTarget, newBodyCode);

code = code.replace("text={item.aiSummary || item.summary}", "text={cleanExecutiveSummary(item.aiSummary || item.summary)}");
code = code.replace("text={point}", "text={cleanExecutiveSummary(point)}");
code = code.replace("text={item.summary}", "text={cleanExecutiveSummary(item.summary)}");

const oldFullTarget = `              <p className="whitespace-pre-line text-sm text-[#94A3B8] leading-7">
                <InteractiveTickerText
                  text={item.content || item.summary}
                  onSelectTicker={(symbol) => {
                    onClose();
                    onOpenOrder(symbol);
                  }}
                />
              </p>`;

const newFullCode = `              <div className="text-sm text-[#CBD5E1] leading-7 space-y-3 font-normal">
                {articleParagraphs.map((paragraph, idx) => (
                  <p key={idx} className="leading-relaxed">
                    <InteractiveTickerText
                      text={paragraph}
                      onSelectTicker={(symbol) => {
                        onClose();
                        onOpenOrder(symbol);
                      }}
                    />
                  </p>
                ))}
              </div>`;

code = code.replace(oldFullTarget, newFullCode);

fs.writeFileSync('src/components/news/NewsReaderModal.tsx', code, 'utf8');
console.log('Successfully updated NewsReaderModal.tsx!');
