import {
  AlertTriangle,
  CalendarDays,
  CalendarRange,
  Clock,
  FileText,
  HandCoins,
  Package,
  RefreshCw,
  Settings,
  Sparkles,
  TrendingUp,
  UserCog,
  Users2,
} from 'lucide-react'
import { useT } from '../../i18n/I18nContext'
import { useDailyStatsRange, sumStats } from '../../hooks/useDailyStats'
import { useGlobalStats } from '../../hooks/useGlobalStats'
import { useComparisonStats } from '../../hooks/useComparisonStats'
import { useTopLists } from '../../hooks/useTopLists'
import { formatPaiseAsRupees } from '../../lib/billing/formatCurrency'
import { StatCard } from './components/StatCard'
import { CollectionSplitCard } from './components/CollectionSplitCard'
import { SalesTrendChart } from './components/SalesTrendChart'
import { ComparisonCard } from './components/ComparisonCard'
import { TopList } from './components/TopList'
import { NavTile } from './components/NavTile'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'

export function AdminDashboardPage() {
  const t = useT()
  const { stats, loading, refresh } = useDailyStatsRange(31)
  const {
    totalOutstandingPaise,
    totalRevenuePaise,
    loading: outstandingLoading,
    refresh: refreshOutstanding,
  } = useGlobalStats()
  const { monthComparison, yearComparison } = useComparisonStats()
  const { topCustomers, topProducts } = useTopLists()

  const today = stats[stats.length - 1]
  const week = sumStats(stats.slice(-7))
  const month = sumStats(stats)

  function refreshAll() {
    refresh()
    refreshOutstanding()
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">{t('dashboard.title')}</h1>
        <Button variant="secondary" onClick={refreshAll} disabled={loading || outstandingLoading}>
          <RefreshCw size={14} className={loading || outstandingLoading ? 'animate-spin' : ''} />
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
              label={t('dashboard.revenue')}
              value={formatPaiseAsRupees(totalRevenuePaise)}
              icon={Sparkles}
              tone="blue"
            />
            <StatCard
              label={t('dashboard.todaySale')}
              value={formatPaiseAsRupees(today?.totalSalesPaise ?? 0)}
              icon={TrendingUp}
              tone="green"
            />
            <StatCard
              label={t('dashboard.weeklySale')}
              value={formatPaiseAsRupees(week.totalSalesPaise)}
              icon={CalendarDays}
              tone="amber"
            />
            <StatCard
              label={t('dashboard.monthlySale')}
              value={formatPaiseAsRupees(month.totalSalesPaise)}
              icon={CalendarRange}
              tone="blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label={t('dashboard.outstandingAmount')}
              value={formatPaiseAsRupees(totalOutstandingPaise)}
              icon={AlertTriangle}
              tone="red"
            />
            <StatCard
              label={t('dashboard.billsCreated')}
              value={String(today?.billCount ?? 0)}
              icon={FileText}
              tone="amber"
            />
            <StatCard
              label={t('dashboard.pendingPayments')}
              value={formatPaiseAsRupees(month.creditAmountPaise)}
              icon={Clock}
              tone="red"
            />
          </div>

          <SalesTrendChart stats={stats} />

          {monthComparison && yearComparison && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ComparisonCard
                label={t('dashboard.monthComparison')}
                currentPaise={monthComparison.currentPaise}
                previousPaise={monthComparison.previousPaise}
              />
              <ComparisonCard
                label={t('dashboard.yearComparison')}
                currentPaise={yearComparison.currentPaise}
                previousPaise={yearComparison.previousPaise}
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TopList title={t('dashboard.topCustomers')} icon={Users2} rows={topCustomers} />
            <TopList title={t('dashboard.topProducts')} icon={Package} rows={topProducts} />
          </div>

          <CollectionSplitCard
            cashPaise={month.cashCollectedPaise}
            upiPaise={month.upiCollectedPaise}
            bankTransferPaise={month.bankTransferCollectedPaise}
            otherPaise={month.otherCollectedPaise}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <NavTile to="/collections" label={t('dashboard.collections')} icon={HandCoins} />
            {/* TopNav already shows these on desktop — surface them here too for mobile. */}
            <div className="sm:hidden">
              <NavTile to="/settings" label={t('nav.settings')} icon={Settings} />
            </div>
            <div className="sm:hidden">
              <NavTile to="/users" label={t('nav.users')} icon={UserCog} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
