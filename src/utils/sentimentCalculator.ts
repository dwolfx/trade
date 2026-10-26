export interface MarketSentiment {
  value: number; // 0 to 100
  classification: string;
  colorClass: string;
  badgeBg: string;
  description: string;
}

export function calculateB3Sentiment(assets: { changePercent: number }[]): MarketSentiment {
  if (!assets || assets.length === 0) {
    return {
      value: 52,
      classification: 'Neutro',
      colorClass: 'text-[#F59E0B]',
      badgeBg: 'border-amber-500/30',
      description: 'Termômetro de Sentimento B3: Mercado equilibrado sem viés direcional forte.',
    };
  }

  const positiveCount = assets.filter(a => a.changePercent > 0).length;
  const advanceDeclineRatio = positiveCount / assets.length; // 0 to 1
  const avgChange = assets.reduce((acc, a) => acc + a.changePercent, 0) / assets.length;

  // Baseline at 50, advance/decline contributes up to ±25, avgChange contributes up to ±20
  let score = 50 + (advanceDeclineRatio - 0.5) * 50 + avgChange * 10;
  score = Math.max(5, Math.min(95, Math.round(score)));

  let classification = 'Neutro';
  let colorClass = 'text-[#F59E0B]';
  let badgeBg = 'border-amber-500/30';

  if (score < 25) {
    classification = 'Medo Extremo';
    colorClass = 'text-[#F43F5E]';
    badgeBg = 'border-rose-500/30';
  } else if (score < 45) {
    classification = 'Cautela / Medo';
    colorClass = 'text-[#FB7185]';
    badgeBg = 'border-rose-500/20';
  } else if (score <= 55) {
    classification = 'Neutro';
    colorClass = 'text-[#F59E0B]';
    badgeBg = 'border-amber-500/30';
  } else if (score <= 75) {
    classification = 'Otimismo';
    colorClass = 'text-[#38BDF8]';
    badgeBg = 'border-sky-500/30';
  } else {
    classification = 'Euforia / Ganância';
    colorClass = 'text-[#34D399]';
    badgeBg = 'border-emerald-500/40';
  }

  return {
    value: score,
    classification,
    colorClass,
    badgeBg,
    description: `Termômetro B3: ${score}/100 (${classification}). Baseado no avanço/declínio das ações da B3 (${positiveCount}/${assets.length} em alta) e volatilidade intradiária.`,
  };
}
