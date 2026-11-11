import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  Clock,
  Brain,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Save,
  Flame,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { StudyTrack } from '../../types/study';
import { supabaseClient, isSupabaseConfigured } from '../../lib/supabaseClient';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  tracks: StudyTrack[];
  onProfileUpdated?: (profile: StudentProfile) => void;
}

export interface StudentProfile {
  fullName: string;
  dailyCapacityMinutes: number;
  weeklyDeepWorkGoalMinutes: number;
}

const PROFILE_KEY_PREFIX = 'cadence:student_profile_';

export function getStoredStudentProfile(userId?: string): StudentProfile {
  const defaultProfile: StudentProfile = {
    fullName: 'Erick Nava',
    dailyCapacityMinutes: 270, // 4h 30m
    weeklyDeepWorkGoalMinutes: 600, // 10h
  };

  if (typeof window === 'undefined') return defaultProfile;

  try {
    const raw = localStorage.getItem(`${PROFILE_KEY_PREFIX}${userId || 'demo'}`);
    if (!raw) return defaultProfile;
    return { ...defaultProfile, ...JSON.parse(raw) };
  } catch {
    return defaultProfile;
  }
}

export function saveStoredStudentProfile(profile: StudentProfile, userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${PROFILE_KEY_PREFIX}${userId || 'demo'}`, JSON.stringify(profile));
  } catch (err) {
    console.error('Falha ao salvar perfil localmente:', err);
  }
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  tracks,
  onProfileUpdated,
}) => {
  const [profile, setProfile] = useState<StudentProfile>(() => getStoredStudentProfile(user?.id));
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = getStoredStudentProfile(user?.id);
      // Se houver metadata no Supabase, usar como prioridade
      if (user?.user_metadata?.full_name) {
        current.fullName = user.user_metadata.full_name;
      }
      setProfile(current);
      setSuccessMsg(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);

    // Salva localmente
    saveStoredStudentProfile(profile, user?.id);

    // Se conectado ao Supabase, atualiza user_metadata
    if (isSupabaseConfigured() && user) {
      try {
        await supabaseClient.auth.updateUser({
          data: {
            full_name: profile.fullName,
            daily_capacity_minutes: profile.dailyCapacityMinutes,
            weekly_deep_work_goal_minutes: profile.weeklyDeepWorkGoalMinutes,
          },
        });
      } catch (err) {
        console.warn('[Supabase Profile Update Warning]:', err);
      }
    }

    if (onProfileUpdated) {
      onProfileUpdated(profile);
    }

    setIsSaving(false);
    setSuccessMsg('Perfil e metas cognitivas atualizados com sucesso!');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#090B0E]/95 border border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl backdrop-blur-3xl relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-100 p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#88C0A8]/30 to-[#569DAA]/20 border border-[#88C0A8]/40 flex items-center justify-center text-[#88C0A8] shadow-[0_0_20px_rgba(136,192,168,0.2)]">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-display">
              Perfil do Estudante
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              {user ? user.email : 'Modo Demonstração (Visitante)'}
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Nome Completo */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300">Nome Completo</label>
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
              placeholder="Seu nome ou apelido"
              className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#88C0A8] font-mono"
            />
          </div>

          {/* Parâmetros de Capacidade Fisiológica */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#88C0A8]" />
                  Teto Diário (RCCP)
                </span>
                <span className="text-[#88C0A8] font-bold">
                  {(profile.dailyCapacityMinutes / 60).toFixed(1)}h
                </span>
              </label>
              <input
                type="range"
                min={60}
                max={480}
                step={30}
                value={profile.dailyCapacityMinutes}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, dailyCapacityMinutes: Number(e.target.value) }))
                }
                className="w-full accent-[#88C0A8] cursor-pointer"
              />
              <span className="text-[10px] font-mono text-slate-500 block">
                {profile.dailyCapacityMinutes} minutos úteis reais
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Brain className="w-3 h-3 text-[#FB7185]" />
                  Meta Deep Work
                </span>
                <span className="text-[#FB7185] font-bold">
                  {(profile.weeklyDeepWorkGoalMinutes / 60).toFixed(0)}h/sem
                </span>
              </label>
              <input
                type="range"
                min={180}
                max={1200}
                step={60}
                value={profile.weeklyDeepWorkGoalMinutes}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, weeklyDeepWorkGoalMinutes: Number(e.target.value) }))
                }
                className="w-full accent-[#FB7185] cursor-pointer"
              />
              <span className="text-[10px] font-mono text-slate-500 block">
                {profile.weeklyDeepWorkGoalMinutes} min semanais de alto esforço
              </span>
            </div>
          </div>

          {/* Histórico de Matérias Ativas */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                Matérias Ativas na Linha de Produção
              </span>
              <span>{tracks.length} trilhas</span>
            </div>

            {tracks.length === 0 ? (
              <p className="text-xs font-mono text-slate-500 py-2">
                Nenhuma trilha cadastrada no momento.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {tracks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-xs font-mono"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: t.color_hex || '#88C0A8' }}
                      />
                      <span className="text-slate-200 truncate">{t.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 bg-black/40 px-2 py-0.5 rounded-full border border-white/5 shrink-0">
                      {t.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-mono text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono font-bold bg-[#88C0A8] hover:bg-[#9ad0b8] text-slate-950 shadow-[0_0_20px_rgba(136,192,168,0.25)] transition-all cursor-pointer disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Preferências'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
