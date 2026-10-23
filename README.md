# ⚡ TradeCraft PRO — Terminal B3 Multi-Mercado

TradeCraft é um terminal financeiro moderno e de alta performance inspirado no Bloomberg Terminal e TradingView, projetado especificamente para investidores e traders da Bolsa Brasileira (B3).

## ✨ Principais Funcionalidades

- **Gráfico de Candles Interativo:** Suporte a múltiplos tempos gráficos (1m, 5m, 15m, 1h, 1D, 1S, 1M, 1A) com modo Multi-Gráfico (2×2) e dados em tempo real via Brapi & Yahoo Finance.
- **Minha Carteira Consolidada:** Alocação macro estratégica (Ações, FIIs, Renda Fixa e Caixa), desempenho individual dos ativos ponderado pelo Preço Médio (PM) e projeção de dividendos com cálculo de Yield on Cost (YoC).
- **Boleta de Ordem Independente:** Execução rápida com ordens a Mercado e Limitada, Take Profit / Stop Loss, cálculo automático de corretagem e emolumentos B3.
- **Modos DEMO & LIVE:** Transição instantânea entre simulador sem risco e conta real com personalização visual total.
- **Terminal de Notícias & Fatos Relevantes:** Radar prioritário para a carteira e favoritos integrado à B3, CVM e canais institucionais.
- **Design System Acessível:** Paleta com alto contraste adaptada para daltonismo (azul claro para altas/lucro, amarelo/âmbar para simulação e rosa/coral para correções).
- **100% Responsivo:** Otimizado tanto para monitores ultrawide quanto para smartphones com Dock de navegação inferior.

## 🛠️ Tecnologias

- **Frontend:** React 18, TypeScript, Vite
- **Estilização:** Tailwind CSS, CSS Custom Properties & Design Tokens
- **Ícones:** Lucide React
- **Testes:** Vitest & React Testing Library (70+ testes unitários e de integração)
- **APIs:** Brapi API (Cotações B3 em tempo real), Yahoo Finance, feeds RSS institucional

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Executar suíte de testes
npm run test

# Gerar build de produção
npm run build
```

---
Criado por Victor Hugo.
