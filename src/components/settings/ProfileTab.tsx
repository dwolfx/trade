import React, { useState } from 'react';
import { UserProfile } from '../../types/settings';
import { Check, Shield, User, Mail, Phone, FileText, Sparkles, AlertCircle } from 'lucide-react';

interface ProfileTabProps {
  profile: UserProfile;
  onSave: (updated: UserProfile) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);
  const [showCPF, setShowCPF] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Designer & Trader Identity */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-[#161F33] to-[#121A2B] border border-blue-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#2962FF] to-[#3B82F6] flex items-center justify-center font-black text-white text-2xl sm:text-3xl shadow-xl shadow-blue-500/20 border-2 border-blue-400/40">
              {formData.avatarInitials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#38BDF8] border-2 border-[#0B0F19] flex items-center justify-center" title="Conta Verificada">
              <Check size={11} className="text-black stroke-[3]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {formData.name}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-[#60A5FA] border border-blue-500/30">
                PRO TRADER
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5 font-medium">
              {formData.role}
            </p>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-[#64748B]">
              <span className="flex items-center gap-1 text-[#38BDF8]">
                <Shield size={12} /> B3 Compliance Ativo
              </span>
              <span>•</span>
              <span>ID: TC-84920</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="px-3 py-1.5 rounded-xl bg-[#0F1523] border border-[#1E293B] text-right font-mono">
            <span className="text-[10px] text-[#64748B] uppercase block">Plano</span>
            <span className="text-xs font-black text-[#F59E0B] flex items-center gap-1">
              <Sparkles size={11} /> TradeCraft Vitalício
            </span>
          </div>
        </div>
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="text-xs font-bold text-[#94A3B8] block mb-1.5 flex items-center gap-1.5">
            <User size={13} className="text-[#60A5FA]" /> Nome Completo
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-[#141C2E] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#2962FF] transition-all font-sans font-medium"
            required
          />
        </div>

        {/* Professional Role */}
        <div>
          <label className="text-xs font-bold text-[#94A3B8] block mb-1.5">
            Cargo / Atuação
          </label>
          <input
            type="text"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full bg-[#141C2E] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#2962FF] transition-all font-sans font-medium"
            placeholder="Ex: Product Designer & Trader"
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-xs font-bold text-[#94A3B8] block mb-1.5 flex items-center gap-1.5">
            <Mail size={13} className="text-[#60A5FA]" /> E-mail Principal
          </label>
          <div className="relative">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#141C2E] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#2962FF] transition-all font-mono"
              required
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#38BDF8] bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              Verificado
            </span>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="text-xs font-bold text-[#94A3B8] block mb-1.5 flex items-center gap-1.5">
            <Phone size={13} className="text-[#60A5FA]" /> Celular / WhatsApp
          </label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-[#141C2E] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#2962FF] transition-all font-mono"
            placeholder="+55 (11) 99999-9999"
          />
        </div>

        {/* CPF Document (For Tax / B3 Reports) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-[#94A3B8] flex items-center gap-1.5">
              <FileText size={13} className="text-[#60A5FA]" /> CPF (Para DARF & B3)
            </label>
            <button
              type="button"
              onClick={() => setShowCPF(!showCPF)}
              className="text-[11px] text-[#60A5FA] hover:underline"
            >
              {showCPF ? 'Ocultar' : 'Exibir'}
            </button>
          </div>
          <input
            type="text"
            value={showCPF ? formData.cpf : '•••.458.918-••'}
            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
            className="w-full bg-[#141C2E] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#2962FF] transition-all font-mono tracking-wider"
          />
        </div>

        {/* Avatar Initials */}
        <div>
          <label className="text-xs font-bold text-[#94A3B8] block mb-1.5">
            Iniciais do Avatar (Header)
          </label>
          <input
            type="text"
            maxLength={3}
            value={formData.avatarInitials}
            onChange={(e) => setFormData({ ...formData, avatarInitials: e.target.value.toUpperCase() })}
            className="w-full bg-[#141C2E] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#2962FF] transition-all font-mono uppercase font-black"
          />
        </div>
      </div>

      {/* Bio / Profile Notes */}
      <div>
        <label className="text-xs font-bold text-[#94A3B8] block mb-1.5">
          Biografia / Notas Profissionais
        </label>
        <textarea
          rows={3}
          value={formData.bio || ''}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="w-full bg-[#141C2E] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#2962FF] transition-all leading-relaxed"
          placeholder="Conte um pouco sobre sua trajetória como Product Designer e investidor..."
        />
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <AlertCircle size={14} className="text-[#38BDF8]" />
          <span>Dados criptografados de ponta a ponta.</span>
        </div>

        <button
          type="submit"
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            isSaved
              ? 'bg-sky-500/20 text-[#38BDF8] border border-sky-500/40'
              : 'bg-[#2962FF] hover:bg-[#1D4ED8] text-white shadow-lg shadow-blue-500/25 active:scale-95'
          }`}
        >
          {isSaved ? (
            <>
              <Check size={14} />
              <span>Salvo com Sucesso!</span>
            </>
          ) : (
            <span>Salvar Alterações</span>
          )}
        </button>
      </div>
    </form>
  );
};
