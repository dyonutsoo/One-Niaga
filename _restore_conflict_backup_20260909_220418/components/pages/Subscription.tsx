'use client';
import { Check } from 'lucide-react';
import { PLAN_DEFS, canSwitchPlan, getPlan } from '@/lib/plans';
import { useBilling } from '@/lib/billing';
import { useLang } from '@/lib/i18n';
import { PageHeader } from '../ui';
export function SubscriptionPage({ connectedCount, onManageStores }: { connectedCount: number; onManageStores: () => void }) {
  const { plan, changePlan, used, pending, resetDate } = useBilling();
  const { t, lang } = useLang();
  const current = getPlan(plan);
  return <div>
    <PageHeader title={t('billing.title')} desc={t('billing.desc')} />
    <div className="px-4 sm:px-8 pb-8 space-y-6">
      <section className="surface p-5 flex flex-wrap justify-between gap-5"><div><p className="text-xs text-slate-500">{t('billing.current')}</p><p className="text-lg font-semibold mt-1">{current.name}</p></div><div><p className="text-xs text-slate-500">{t('billing.stores')}</p><p className="text-sm font-medium mt-2">{connectedCount} / {current.storeLimit}</p></div><div><p className="text-xs text-slate-500">{t('billing.used')}</p><p className="text-sm font-medium mt-2">{used} / {current.aiCredits}{pending > 0 ? ` (+${pending} ${t('billing.pending')})` : ''}</p></div><p className="text-xs text-slate-500 self-center">{t('billing.resets')} {resetDate.toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang === 'ms' ? 'ms-MY' : 'en-MY')}</p></section>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {PLAN_DEFS.map(pl => {
          const active = plan === pl.id;
          const blocked = !canSwitchPlan(pl.id, connectedCount);
          return <section key={pl.id} className="surface p-6 flex flex-col" style={{ borderColor: active ? '#E8552F' : undefined }}>
            <div className="flex justify-between items-center gap-2"><h2 className="font-semibold text-lg">{pl.name}</h2>{active && <span className="rounded-full bg-orange-50 text-orange-800 text-xs px-2 py-1">{t('billing.current')}</span>}</div>
            <p className="text-sm text-slate-500 mt-2">{t(`billing.${pl.id}Desc`)}</p>
            <p className="mt-6"><strong className="text-3xl font-semibold">{pl.price}</strong><span className="text-sm text-slate-500"> {t('billing.month')}</span></p>
            <ul className="my-6 space-y-3 text-sm flex-1">
              {[`${pl.storeLimit} ${t('billing.stores')}`, `${pl.aiCredits.toLocaleString()} ${t('billing.creditsMonth')}`, t('billing.allAi'), t('billing.core')].map(feature => <li className="flex gap-2" key={feature}><Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />{feature}</li>)}
            </ul>
            <button disabled={active || blocked || pending > 0} onClick={() => changePlan(pl.id)} className="w-full rounded-lg py-3 text-sm font-medium disabled:bg-slate-100 disabled:text-slate-500 bg-slate-900 text-white">{active ? t('billing.current') : `${t('billing.switch')} ${pl.name}`}</button>
            {blocked && <p className="text-xs text-slate-500 mt-3">{t('billing.disconnectFirst')} {connectedCount - pl.storeLimit}. <button onClick={onManageStores} className="underline py-1">{t('simple.manageStores')}</button></p>}
          </section>;
        })}
      </div>
      <details className="surface p-5 space-y-3"><summary className="font-semibold text-sm cursor-pointer">{t('billing.how')}</summary><p className="text-sm text-slate-600">{t('billing.creditRule')}</p><p className="text-sm text-slate-600">{t('billing.storeRule')}</p><p className="text-sm text-slate-600">{t('billing.switchRule')}</p></details>
      <p className="text-xs text-slate-500">{t('billing.demo')}</p>
    </div>
  </div>;
}

