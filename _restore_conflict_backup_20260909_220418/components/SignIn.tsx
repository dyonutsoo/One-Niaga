'use client';

import { useState } from 'react';
import { ArrowRight, Check, KeyRound, Link2, Loader2, LogIn, Mail } from 'lucide-react';
import { BORDER, CREAM, GREEN, INK, MUTED, NAVY } from '@/lib/theme';
import { PLATFORMS } from '@/lib/platforms';
import { useLang } from '@/lib/i18n';
import { LangPicker } from './ui';
import { useBilling } from '@/lib/billing';
import { canConnect, getPlan } from '@/lib/plans';
import type { PlatformId } from '@/lib/types';

export function SignIn({ onSignIn }: { onSignIn: (email: string) => void }) {
  const { lang, setLang, t } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative" style={{ background: CREAM }}>
      <div className="absolute top-5 right-6">
        <LangPicker lang={lang} setLang={setLang} />
      </div>
      <div className="w-full max-w-sm mx-4 rounded-2xl p-7" style={{ background: 'white' }}>
        <div className="text-center mb-6">
          <div className="font-bold text-2xl" style={{ color: NAVY }}>{t('signin.title')}</div>
          <div className="text-xs mt-1" style={{ color: MUTED }}>{t('signin.subtitle')}</div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ border: `1px solid ${BORDER}`, background: CREAM }}>
            <Mail size={15} style={{ color: MUTED }} />
            <input className="flex-1 bg-transparent outline-none text-sm" type="email" autoComplete="email" aria-label={t('signin.email')} placeholder={t('signin.email')} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ border: `1px solid ${BORDER}`, background: CREAM }}>
            <KeyRound size={15} style={{ color: MUTED }} />
            <input type="password" autoComplete="current-password" aria-label={t('signin.password')} className="flex-1 bg-transparent outline-none text-sm" placeholder={t('signin.password')} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button onClick={() => onSignIn(email || 'demo@oneniaga.my')} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: '#E8552F' }}>
            <LogIn size={15} /> {t('signin.signIn')}
          </button>
          <button onClick={() => onSignIn('demo@oneniaga.my')} className="w-full text-center text-[12px] font-medium py-1" style={{ color: NAVY }}>
            {t('signin.demo')}
          </button>
        </div>
        <p className="text-[11px] text-center mt-5" style={{ color: '#9AA6C0' }}>{t('signin.note')}</p>
      </div>
    </div>
  );
}

export function ConnectPlatforms({
  linked,
  setLinked,
  onContinue,
}: {
  linked: Record<PlatformId, boolean>;
  setLinked: (updater: (prev: Record<PlatformId, boolean>) => Record<PlatformId, boolean>) => void;
  onContinue: () => void;
}) {
  const { t } = useLang();
  const { plan } = useBilling();
  const limit = getPlan(plan).storeLimit;
  const connectedCount = Object.values(linked).filter(Boolean).length;
  const [connecting, setConnecting] = useState<PlatformId | null>(null);
  function connect(id: PlatformId) {
    if (connecting || linked[id] || !canConnect(plan, connectedCount)) return;
    setConnecting(id);
    setTimeout(() => {
      setLinked((prev) => canConnect(plan, Object.values(prev).filter(Boolean).length) ? { ...prev, [id]: true } : prev);
      setConnecting(null);
    }, 900);
  }
  const anyLinked = Object.values(linked).some(Boolean);
  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ background: CREAM }}>
      <div className="w-full max-w-md mx-4 rounded-2xl p-7" style={{ background: 'white' }}>
        <div className="mb-5">
          <div className="font-bold text-xl" style={{ color: NAVY }}>{t('connect.title')}</div>
          <p className="text-[12.5px] mt-1" style={{ color: MUTED }}>{t('billing.onboarding')}</p>
        </div>
        <p className="text-sm text-slate-600 mb-4">{getPlan(plan).name} · {connectedCount} / {limit} {t('billing.stores')} · {getPlan(plan).aiCredits} {t('billing.creditsMonth')}</p><div className="space-y-2.5">
          {PLATFORMS.map((p) => {
            const isLinked = linked[p.id];
            const isConnecting = connecting === p.id;
            return (
              <div key={p.id} className="flex items-center justify-between rounded-lg px-4 py-3" style={{ border: `1px solid ${BORDER}` }}>
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                  <span className="text-sm font-medium" style={{ color: INK }}>{p.name}</span>
                </div>
                {isLinked ? (
                  <span className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: GREEN }}>
                    <Check size={14} /> {t('connect.connected')}
                  </span>
                ) : (
                  <button onClick={() => connect(p.id)} disabled={connecting !== null || connectedCount >= limit} className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: NAVY, opacity: connecting !== null || connectedCount >= limit ? 0.5 : 1 }}>
                    {isConnecting ? <Loader2 size={12} className="animate-spin" /> : <Link2 size={12} />}
                    {isConnecting ? t('connect.connecting') : connectedCount >= limit ? t('billing.storeLimit') : t('connect.connect')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
<p className="text-xs text-slate-500 mt-4">{t('billing.onboardingLater')}</p>
        <button onClick={onContinue} disabled={!anyLinked} className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: anyLinked ? '#E8552F' : '#D8B5A6' }}>
          {t('connect.continue')} <ArrowRight size={15} />
        </button>
        {!anyLinked && <p className="text-[11px] text-center mt-2" style={{ color: '#9AA6C0' }}>{t('connect.needOne')}</p>}
      </div>
    </div>
  );
}



