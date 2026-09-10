'use client';
import { useBilling } from '@/lib/billing';
import { getPlan } from '@/lib/plans';
import { useLang } from '@/lib/i18n';
export function AiAllowance({ onManage }: { onManage: () => void }) {
  const { plan, remaining, resetDate } = useBilling();
  const { t, lang } = useLang();
  const total = getPlan(plan).aiCredits ?? remaining;
  return <div className="surface mx-4 sm:mx-8 mt-6 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-sm" role="status"><div><span className="font-medium">{remaining} / {total} {t('billing.remaining')}</span><p className="text-xs text-slate-500 mt-1">{remaining === 0 ? 'Upgrade required before the next AI action' : t('billing.oneCredit')} · {t('billing.resets')} {resetDate.toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang === 'ms' ? 'ms-MY' : 'en-MY', { day: 'numeric', month: 'short' })}</p></div><button onClick={onManage} className={`rounded-lg px-3 py-2 text-sm font-medium ${remaining === 0 ? 'bg-[#E8552F] text-white' : 'text-slate-700'}`}>{remaining === 0 ? 'Upgrade to continue' : t('billing.manage')}</button></div>;
}
