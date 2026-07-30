import { CalendarDays, Clock, FileText, RefreshCw, TrendingUp } from 'lucide-react'
import { useT } from '../../i18n/I18nContext'
import { useDailyStatsRange, sumStats } from '../../hooks/useDailyStats'
import { formatPaiseAsRupees } from '../../lib/billing/formatCurrency'
import { StatCard } from './components/StatCard'
import { CollectionSplitCard } from './components/CollectionSplitCard'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'

export function AccountantDashboardPage() {
  const t = useT()
  const { stats, loading, refresh } = useDailyStatsRange(7)

  const today = stats[stats.length - 1]
  const week = sumStats(stats)

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">{t('dashboard.title')}</h1>
        <Button variant="secondary" onClick={refresh} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {t('common.refresh')}
        </Button>
      </div>

      {loading && stats.length === 0 ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label={t('dashboard.todaySale')}
              value={formatPaiseAsRupees(today?.totalSalesPaise ?? 0)}
              icon={TrendingUp}
              tone="blue"
            />
            <StatCard
              label={t('dashboard.weeklySale')}
              value={formatPaiseAsRupees(week.totalSalesPaise)}
              icon={CalendarDays}
              tone="green"
            />
            <StatCard
              label={t('dashboard.billsCreated')}
              value={String(today?.billCount ?? 0)}
              icon={FileText}
              tone="amber"
            />
            <StatCard
              label={t('dashboard.pendingPayments')}
              value={formatPaiseAsRupees(today?.creditAmountPaise ?? 0)}
              icon={Clock}
              tone="red"
            />
          </div>

          <CollectionSplitCard
            cashPaise={today?.cashCollectedPaise ?? 0}
            upiPaise={today?.upiCollectedPaise ?? 0}
            bankTransferPaise={today?.bankTransferCollectedPaise ?? 0}
            otherPaise={today?.otherCollectedPaise ?? 0}
          />
        </>
      )}
    </div>
  )
}
