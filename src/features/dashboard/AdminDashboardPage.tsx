import { Link } from 'react-router-dom'
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

          {/* TopNav hides Settings/Users/Collections links on mobile — surface them here instead. */}
          <div className="flex flex-wrap gap-2 md:hidden">
            <Link
              to="/collections"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              <HandCoins size={16} />
              {t('dashboard.viewCollections')}
            </Link>
            <Link
              to="/settings"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              <Settings size={16} />
              {t('nav.settings')}
            </Link>
            <Link
              to="/users"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              <UserCog size={16} />
              {t('nav.users')}
            </Link>
          </div>

          <Link
            to="/collections"
            className="hidden items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50 md:flex"
          >
            <HandCoins size={16} />
            {t('dashboard.viewCollections')}
          </Link>
        </>
      )}
    </div>
  )
}
