import React, { useState } from 'react';
import { TerminalPreferences } from '../../types/settings';
import {
  Volume2,
  VolumeX,
  BellRing,
  Cpu,
  CheckCircle2,
  Sliders,
  DollarSign,
  TrendingUp,
  Percent,
} from 'lucide-react';

interface TerminalPreferencesTabProps {
  preferences: TerminalPreferences;
  onSave: (updated: TerminalPreferences) => void;
}

export const TerminalPreferencesTab: React.FC<TerminalPreferencesTabProps> = ({
  preferences,
  onSave,
}) => {
  const [prefs, setPrefs] = useState<TerminalPreferences>(preferences);
  const [isSaved, setIsSaved] = useState(false);

  const handleToggle = (key: keyof TerminalPreferences) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleModeChange = (mode: 'DEMO' | 'LIVE') => {
    setPrefs((prev) => ({
      ...prev,
      defaultMode: mode,
    }));
  };

  // Play subtle trade chime with Web Audio API for sound preview
  const playSoundPreview = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // AudioContext fallback
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(prefs);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
      {/* Save Success Banner */}
      {isSaved && (
        <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs text-[#38BDF8] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>Preferências do terminal salvas com sucesso!</span>
        </div>
      )}

      {/* Mode Selection */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0F1523] border border-[#1E293B]">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#1E293B]">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#60A5FA] flex items-center justify-center">
            <Sliders size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Ambiente Padrão ao Abrir</h3>
            <p className="text-xs text-[#94A3B8]">
              Defina com qual modo o cockpit será inicializado em novos logins.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* DEMO Mode Option */}
          <div
            onClick={() => handleModeChange('DEMO')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              prefs.defaultMode === 'DEMO'
                ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5'
                : 'bg-[#141C2E] border-[#1E293B] hover:border-[#334155]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                Modo DEMO (Simulador)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F59E0B]/20 text-[#F59E0B] border border-amber-500/30">
                Sem Risco
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Saldo fictício de R$ 50.000,00 com livro de ofertas realista da B3 e cálculo exato de
              emolumentos para treino sem risco de capital.
            </p>
          </div>

          {/* LIVE Mode Option */}
          <div
            onClick={() => handleModeChange('LIVE')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              prefs.defaultMode === 'LIVE'
                ? 'bg-sky-500/10 border-sky-500/40 shadow-lg shadow-sky-500/5'
                : 'bg-[#141C2E] border-[#1E293B] hover:border-[#334155]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                Modo LIVE (Conta Real)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#38BDF8]/20 text-[#38BDF8] border border-sky-500/30">
                Capital Real
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Ordens roteadas diretamente via corretoras conectadas (XP, BTG, Clear) com liquidação
              oficial na câmara B3 e exchanges cripto.
            </p>
          </div>
        </div>
      </div>

      {/* Maya IA Co-Pilot Toggles */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0F1523] border border-[#1E293B]">
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#1E293B]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600/20 to-sky-500/20 text-[#38BDF8] flex items-center justify-center border border-sky-500/30">
            <Cpu size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Maya IA Co-Piloto</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#38BDF8]/10 text-[#38BDF8] border border-sky-500/25">
                INTELIGÊNCIA B3
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Alertas inteligentes e análise de fluxo em tempo real operando no segundo plano.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Breakout Alerts */}
          <div className="p-4 rounded-xl bg-[#141C2E] border border-[#1E293B] flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-[#60A5FA] flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Alertas de Rompimento & Volume Alto (Breakouts)
                </span>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                  Notifica quando ativos como PETR4, VALE3 e Mini-Índice romperem topos históricos com
                  agressão compradora.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('mayaBreakoutAlerts')}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                prefs.mayaBreakoutAlerts ? 'bg-[#2962FF]' : 'bg-[#1E293B]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white block transition-transform absolute top-0.5 ${
                  prefs.mayaBreakoutAlerts ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Dividend Alerts */}
          <div className="p-4 rounded-xl bg-[#141C2E] border border-[#1E293B] flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-[#38BDF8] flex items-center justify-center shrink-0 mt-0.5">
                <DollarSign size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Avisos de Dividendos & Datas-Com (48h de antecedência)
                </span>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                  Alerta no cockpit para você não perder o corte de proventos e JCP das ações da sua
                  carteira.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('mayaDividendAlerts')}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                prefs.mayaDividendAlerts ? 'bg-[#2962FF]' : 'bg-[#1E293B]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white block transition-transform absolute top-0.5 ${
                  prefs.mayaDividendAlerts ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* CVM News Alerts */}
          <div className="p-4 rounded-xl bg-[#141C2E] border border-[#1E293B] flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-[#818CF8] flex items-center justify-center shrink-0 mt-0.5">
                <BellRing size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Radar CVM de Fatos Relevantes & Notícias de Impacto
                </span>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                  Filtro por IA para avisos corporativos de Fusões & Aquisições, OPA e balanços de
                  empresas B3.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('mayaNewsAlerts')}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                prefs.mayaNewsAlerts ? 'bg-[#2962FF]' : 'bg-[#1E293B]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white block transition-transform absolute top-0.5 ${
                  prefs.mayaNewsAlerts ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Sound & Audio Feedback */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0F1523] border border-[#1E293B]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#60A5FA] flex items-center justify-center shrink-0">
              {prefs.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Efeitos Sonoros de Ordens</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Emite sinal sonoro suave ao executar compras, vendas e atingir Stop Loss ou Gain.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {prefs.soundEnabled && (
              <button
                type="button"
                onClick={playSoundPreview}
                className="px-3 py-1.5 rounded-lg bg-[#141C2E] border border-[#1E293B] text-[11px] font-semibold text-[#38BDF8] hover:bg-[#1E293B] transition-colors"
                title="Tocar som de teste"
              >
                Testar Som
              </button>
            )}

            <button
              type="button"
              onClick={() => handleToggle('soundEnabled')}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                prefs.soundEnabled ? 'bg-[#2962FF]' : 'bg-[#1E293B]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white block transition-transform absolute top-0.5 ${
                  prefs.soundEnabled ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Costs Transparency Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0F19] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#94A3B8]">
        <div className="flex items-center gap-2">
          <Percent size={15} className="text-[#38BDF8]" />
          <span>
            Corretagem TradeCraft: <strong className="text-[#38BDF8]">ZERO</strong> | Emolumentos B3:{' '}
            <strong className="text-white font-mono">0,030%</strong>
          </span>
        </div>
        <span className="text-[11px] text-[#64748B]">
          Tabela regulada conforme Instrução CVM nº 178
        </span>
      </div>

      {/* Footer Submit */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2962FF] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all"
        >
          Salvar Preferências
        </button>
      </div>
    </form>
  );
};
