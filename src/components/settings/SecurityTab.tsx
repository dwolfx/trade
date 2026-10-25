import React, { useState } from 'react';
import { ActiveSession } from '../../types/settings';
import {
  Shield,
  KeyRound,
  Smartphone,
  Laptop,
  CheckCircle2,
  Eye,
  EyeOff,
  Copy,
  Check,
  LogOut,
  QrCode,
} from 'lucide-react';

interface SecurityTabProps {
  sessions: ActiveSession[];
  onRevokeOtherSessions: () => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  sessions,
  onRevokeOtherSessions,
}) => {
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [show2FASetupModal, setShow2FASetupModal] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [twoFaSuccess, setTwoFaSuccess] = useState(false);

  // Sessions feedback
  const [sessionsRevokedSuccess, setSessionsRevokedSuccess] = useState(false);

  const mockSecret2FA = 'JBSWY3DPEHPK3PXP';

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(newPassword);

  const getStrengthLabel = () => {
    if (!newPassword) return { text: 'Digite uma senha', color: 'text-[#64748B]', bar: 'bg-[#1E293B]' };
    if (strength <= 1) return { text: 'Fraca', color: 'text-[#F43F5E]', bar: 'bg-[#F43F5E]' };
    if (strength === 2) return { text: 'Média', color: 'text-[#F59E0B]', bar: 'bg-[#F59E0B]' };
    if (strength === 3) return { text: 'Forte', color: 'text-[#38BDF8]', bar: 'bg-[#38BDF8]' };
    return { text: 'Excelente', color: 'text-blue-400', bar: 'bg-blue-400' };
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('A nova senha e a confirmação não coincidem.');
      return;
    }
    if (strength < 2) {
      alert('A nova senha precisa ter pelo menos 8 caracteres e uma combinação de letras e números.');
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 3500);
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(mockSecret2FA);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleConfirm2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length === 6) {
      setIs2FAEnabled(true);
      setShow2FASetupModal(false);
      setTwoFaSuccess(true);
      setTotpCode('');
      setTimeout(() => setTwoFaSuccess(false), 3500);
    }
  };

  const handleRevokeSessions = () => {
    onRevokeOtherSessions();
    setSessionsRevokedSuccess(true);
    setTimeout(() => setSessionsRevokedSuccess(false), 3500);
  };

  const strengthInfo = getStrengthLabel();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 2FA Section */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0F1523] border border-[#1E293B] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1E293B]">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 text-[#60A5FA] flex items-center justify-center shrink-0">
              <Shield size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Autenticação em Dois Fatores (2FA)
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    is2FAEnabled
                      ? 'bg-sky-500/15 text-[#38BDF8] border border-sky-500/30'
                      : 'bg-rose-500/15 text-[#F43F5E] border border-rose-500/30'
                  }`}
                >
                  {is2FAEnabled ? 'ATIVO' : 'DESATIVADO'}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-1">
                Adiciona uma camada extra de proteção via aplicativo autenticador (Google Authenticator,
                1Password ou Authy) para ordens de alto valor e novos acessos.
              </p>
            </div>
          </div>

          <div className="self-start sm:self-center">
            {is2FAEnabled ? (
              <button
                type="button"
                onClick={() => setIs2FAEnabled(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#141C2E] text-[#F43F5E] hover:bg-rose-500/10 border border-[#1E293B] hover:border-rose-500/30 transition-colors"
              >
                Desativar 2FA
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShow2FASetupModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2962FF] hover:bg-[#1D4ED8] text-white shadow-lg shadow-blue-500/25 transition-all"
              >
                Configurar 2FA Agora
              </button>
            )}
          </div>
        </div>

        {twoFaSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs text-[#38BDF8] flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} />
            <span>Autenticação em dois fatores ativada e validada com sucesso!</span>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-[#64748B]">
          <span>Método preferencial: TOTP Time-based Code</span>
          <span className="font-mono text-white">6 dígitos</span>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0F1523] border border-[#1E293B]">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#1E293B]">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#60A5FA] flex items-center justify-center">
            <KeyRound size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Trocar Senha de Acesso</h3>
            <p className="text-xs text-[#94A3B8]">
              Recomendamos o uso de senhas fortes com números e caracteres especiais.
            </p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs text-[#38BDF8] flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} />
            <span>Sua senha foi atualizada com sucesso em todos os terminais!</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Password */}
            <div>
              <label className="text-xs font-semibold text-[#CBD5E1] block mb-1.5">
                Senha Atual
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#141C2E] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-blue-500 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs font-semibold text-[#CBD5E1] block mb-1.5">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo de 8 caracteres"
                  className="w-full bg-[#141C2E] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-blue-500 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="text-xs font-semibold text-[#CBD5E1] block mb-1.5">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full bg-[#141C2E] border border-[#1E293B] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-blue-500 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Strength Meter */}
          {newPassword && (
            <div className="p-3.5 rounded-xl bg-[#141C2E] border border-[#1E293B] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94A3B8]">Força da senha:</span>
                <span className={`font-bold ${strengthInfo.color}`}>{strengthInfo.text}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                <div
                  className={`rounded-full ${
                    strength >= 1 ? strengthInfo.bar : 'bg-[#1E293B]'
                  }`}
                />
                <div
                  className={`rounded-full ${
                    strength >= 2 ? strengthInfo.bar : 'bg-[#1E293B]'
                  }`}
                />
                <div
                  className={`rounded-full ${
                    strength >= 3 ? strengthInfo.bar : 'bg-[#1E293B]'
                  }`}
                />
                <div
                  className={`rounded-full ${
                    strength >= 4 ? strengthInfo.bar : 'bg-[#1E293B]'
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-[#64748B]">
                <span className={newPassword.length >= 8 ? 'text-[#38BDF8]' : ''}>
                  • 8+ caracteres
                </span>
                <span className={/[A-Z]/.test(newPassword) ? 'text-[#38BDF8]' : ''}>
                  • Letra maiúscula
                </span>
                <span className={/[0-9]/.test(newPassword) ? 'text-[#38BDF8]' : ''}>
                  • Número
                </span>
                <span className={/[^A-Za-z0-9]/.test(newPassword) ? 'text-[#38BDF8]' : ''}>
                  • Símbolo especial
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!newPassword || newPassword !== confirmPassword}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2962FF] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all"
            >
              Atualizar Senha
            </button>
          </div>
        </form>
      </div>

      {/* Active Sessions Section */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0F1523] border border-[#1E293B]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Sessões & Dispositivos</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Locais e terminais onde sua conta Victor Hugo está ativa atualmente.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRevokeSessions}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#F43F5E] hover:bg-rose-500/10 border border-rose-500/30 transition-colors self-start sm:self-center"
          >
            <LogOut size={14} />
            <span>Desconectar Outras Sessões</span>
          </button>
        </div>

        {sessionsRevokedSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs text-[#38BDF8] flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} />
            <span>Todas as outras sessões foram encerradas com segurança!</span>
          </div>
        )}

        <div className="mt-4 divide-y divide-[#1E293B]">
          {sessions.map((sess) => (
            <div key={sess.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#141C2E] border border-[#1E293B] text-[#60A5FA] flex items-center justify-center shrink-0">
                  {sess.device.toLowerCase().includes('iphone') ? (
                    <Smartphone size={18} />
                  ) : (
                    <Laptop size={18} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{sess.device}</span>
                    <span className="text-[11px] text-[#94A3B8]">({sess.browser})</span>
                    {sess.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#38BDF8]/15 text-[#38BDF8] border border-sky-500/30">
                        ESTA SESSÃO
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#64748B] flex items-center gap-2 mt-0.5">
                    <span>{sess.location}</span>
                    <span>•</span>
                    <span className="font-mono">IP: {sess.ip}</span>
                  </div>
                </div>
              </div>

              <div className="text-right font-mono text-[11px] text-[#94A3B8]">
                <span>{sess.lastActive}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {show2FASetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0F1523] border border-[#1E293B] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-[#60A5FA] flex items-center justify-center">
                  <QrCode size={18} />
                </div>
                <h3 className="text-base font-bold text-white">Configurar Autenticador 2FA</h3>
              </div>
              <button
                type="button"
                onClick={() => setShow2FASetupModal(false)}
                className="text-[#94A3B8] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirm2FA} className="mt-4 space-y-4">
              <p className="text-xs text-[#94A3B8]">
                1. Escaneie o código QR abaixo com seu aplicativo (Google Authenticator, Microsoft
                Authenticator ou 1Password):
              </p>

              {/* Mock QR Visual */}
              <div className="p-4 bg-white rounded-xl flex items-center justify-center w-40 h-40 mx-auto shadow-inner">
                <div className="grid grid-cols-6 gap-1 w-full h-full p-1 bg-black rounded">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30 || i === 35
                          ? 'bg-white'
                          : 'bg-black'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Secret key manual entry */}
              <div className="p-3 bg-[#141C2E] rounded-xl border border-[#1E293B] flex items-center justify-between text-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#64748B]">Chave manual</span>
                  <span className="font-mono font-bold text-white tracking-wider">
                    {mockSecret2FA}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0F1523] border border-[#1E293B] text-[#94A3B8] hover:text-white text-[11px] font-semibold flex items-center gap-1.5"
                >
                  {copiedKey ? <Check size={12} className="text-[#38BDF8]" /> : <Copy size={12} />}
                  <span>{copiedKey ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#CBD5E1] block mb-1.5">
                  2. Digite o código de 6 dígitos gerado:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000 000"
                  className="w-full text-center tracking-[0.4em] font-mono text-base font-bold bg-[#141C2E] border border-[#1E293B] rounded-xl py-2.5 text-white placeholder-[#64748B] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShow2FASetupModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#141C2E] hover:bg-[#1E293B] text-xs font-semibold text-[#94A3B8] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={totpCode.length !== 6}
                  className="px-5 py-2.5 rounded-xl bg-[#2962FF] hover:bg-[#1D4ED8] disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-blue-500/25"
                >
                  Validar e Ativar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
