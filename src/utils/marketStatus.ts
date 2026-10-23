export interface MarketStatus {
  isOpen: boolean;
  message: string;
  badgeText: string;
  badgeColor: 'sky' | 'amber' | 'rose';
}

export function getB3MarketStatus(): MarketStatus {
  // Brazilian market operates Monday-Friday 10:00 - 17:00 (UTC-3)
  const now = new Date();
  
  // Format to America/Sao_Paulo timezone
  const spTimeStr = now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
  const spDate = new Date(spTimeStr);
  const dayOfWeek = spDate.getDay(); // 0 is Sunday, 6 is Saturday
  const hours = spDate.getHours();
  const minutes = spDate.getMinutes();
  const currentMinute = hours * 60 + minutes;

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const marketOpenMinute = 10 * 60; // 10:00
  const marketCloseMinute = 17 * 60; // 17:00
  const afterMarketCloseMinute = 18 * 60; // 18:00

  if (isWeekend) {
    return {
      isOpen: false,
      message: 'Mercado B3 fechado aos finais de semana.',
      badgeText: 'MERCADO FECHADO · FIM DE SEMANA',
      badgeColor: 'rose'
    };
  }

  if (currentMinute < marketOpenMinute) {
    return {
      isOpen: false,
      message: 'Pré-abertura da B3. O pregão oficial abre às 10:00.',
      badgeText: 'MERCADO FECHADO · ABRE ÀS 10:00',
      badgeColor: 'amber'
    };
  }

  if (currentMinute >= marketOpenMinute && currentMinute < marketCloseMinute) {
    return {
      isOpen: true,
      message: 'Pregão Oficial B3 em andamento.',
      badgeText: 'PREGÃO AO VIVO · B3 ABERTA',
      badgeColor: 'sky'
    };
  }

  if (currentMinute >= marketCloseMinute && currentMinute < afterMarketCloseMinute) {
    return {
      isOpen: false,
      message: 'After-Market B3 finalizado.',
      badgeText: 'AFTER-MARKET ENCERRADO',
      badgeColor: 'amber'
    };
  }

  return {
    isOpen: false,
    message: 'Pregão oficial encerrado às 17:00. Preços de fechamento congelados.',
    badgeText: 'MERCADO FECHADO · ENCERRADO ÀS 17:00',
    badgeColor: 'rose'
  };
}
