'use client';
import { useBilling } from '@/lib/billing';
import { getPlan } from '@/lib/plans';
import { useLang } from '@/lib/i18n';
export function AiAllowance({ onManage }: { onManage: () => void }) {
  const { plan, remaining, resetDate } = useBilling();
  const { t, lang } = useLang();
  const total = getPlan(plan).aiCredits ?? remaining;
  return <div className="surface mx-4 mt-6 flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm sm:mx-8" role="status"><div><span className="font-medium text-[#090b18]">{remaining} / {total} {t('billing.remaining')}</span><p className="mt-1 text-xs text-[#85847e]">{remaining === 0 ? 'Upgrade required before the next AI action' : t('billing.oneCredit')} · {t('billing.resets')} {resetDate.toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang === 'ms' ? 'ms-MY' : 'en-MY', { day: 'numeric', month: 'short' })}</p></div><button onClick={onManage} className={`rounded-full px-4 py-2 text-sm font-medium ${remaining === 0 ? 'bg-[#FB725D] text-white' : 'bg-white/60 text-[#090b18]'}`}>{remaining === 0 ? 'Upgrade to continue' : t('billing.manage')}</button></div>;
}
