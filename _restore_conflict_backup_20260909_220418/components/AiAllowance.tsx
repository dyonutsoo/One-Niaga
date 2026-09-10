'use client';
import { useBilling } from '@/lib/billing';
import { getPlan } from '@/lib/plans';
import { useLang } from '@/lib/i18n';
export function AiAllowance({ onManage }: { onManage: () => void }) {
  const { plan, remaining, resetDate } = useBilling();
  const { t, lang } = useLang();
  return <div className="mx-4 sm:mx-8 mt-6 rounded-xl border border-slate-200 bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-sm" role="status"><div><span className="font-medium">{remaining} / {getPlan(plan).aiCredits} {t('billing.remaining')}</span><p className="text-xs text-slate-500 mt-1">{remaining === 0 ? t('billing.exhausted') : t('billing.oneCredit')} · {t('billing.resets')} {resetDate.toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang === 'ms' ? 'ms-MY' : 'en-MY', { day: 'numeric', month: 'short' })}</p></div><button onClick={onManage} className="text-sm font-medium text-orange-700 py-2">{t('billing.manage')}</button></div>;
}
