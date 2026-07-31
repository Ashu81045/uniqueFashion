import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight, HandCoins, ReceiptText, Search } from 'lucide-react'
import { useT } from '../../i18n/I18nContext'
import { useCustomersList } from '../../hooks/useCustomersList'
import { useLedgerFeed } from '../../hooks/useLedgerFeed'
import { formatPaiseAsRupees } from '../../lib/billing/formatCurrency'
import { formatDisplayDate } from '../../lib/utils/date'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { RoleGate } from '../../components/layout/RoleGate'

export function LedgerPage() {
  const t = useT()
  const { customers, loading, hasMore, loadMore } = useCustomersList()
  const { entries: feed, loading: feedLoading } = useLedgerFeed()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter((c) => c.name.toLowerCase().includes(q) || c.mobile.includes(q))
  }, [customers, search])

  return (
    <div className="flex animate-fade-in flex-col gap-4 p-4">
      <h1 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <BookOpen size={20} className="text-blue-600" />
        {t('nav.ledger')}
      </h1>

      {/* Recent transactions — bills (debits) and payments (credits) across every customer. */}
      <Card className="p-0">
        <p className="border-b border-slate-200 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">
          {t('ledger.recentTransactions')}
        </p>
        {feedLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : feed.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-400">—</p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-200">
            {feed.map((entry, i) => (
              <Link
                key={entry.key}
                to={entry.customerMobile ? `/ledger/${entry.customerMobile}` : '#'}
                style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                className="flex animate-fade-in items-center gap-3 px-4 py-2.5 [animation-fill-mode:both] transition-colors hover:bg-blue-950/30"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    entry.type === 'bill' ? 'bg-red-950/50 text-red-400' : 'bg-green-950/50 text-green-400'
                  }`}
                >
                  {entry.type === 'bill' ? <ReceiptText size={15} /> : <HandCoins size={15} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {entry.customerName || entry.customerMobile || '—'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDisplayDate(entry.date)}
                    {entry.billNo != null && ` · Bill #${entry.billNo}`}
                    {entry.mode && ` · ${t(`bill.paymentMode.${entry.mode}`)}`}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-sm font-semibold ${
                    entry.type === 'bill' ? 'text-red-400' : 'text-green-400'
                  }`}
                >
                  {entry.type === 'bill' ? '+' : '−'}
                  {formatPaiseAsRupees(entry.amountPaise)}
                </span>
              </Link>
            ))}
          </div>
        )}
        <RoleGate roles={['admin']}>
          <Link
            to="/collections"
            className="block border-t border-slate-200 px-4 py-2.5 text-center text-xs font-medium text-blue-400 hover:bg-blue-950/40"
          >
            {t('common.viewAll')}
          </Link>
        </RoleGate>
      </Card>

      {/* Customer-wise due — pick a customer to view/update their ledger. */}
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t('ledger.allCustomers')}</p>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('customers.search')}
          className="min-h-11 w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm transition-shadow focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>

      {loading && customers.length === 0 ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <Card className="flex flex-col divide-y divide-slate-200 overflow-hidden p-0">
          {filtered.map((c, i) => (
            <Link
              key={c.mobile}
              to={`/ledger/${c.mobile}`}
              style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
              className="flex animate-fade-in items-center gap-3 px-4 py-3 [animation-fill-mode:both] transition-colors hover:bg-blue-950/30"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-950/50 text-sm font-semibold text-blue-400">
                {c.name[0]?.toUpperCase() ?? '?'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">{c.name}</p>
                <p className="text-xs text-slate-500">{c.mobile}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">{t('customers.due')}</p>
                <p
                  className={`text-sm font-semibold ${c.outstandingBalancePaise > 0 ? 'text-red-400' : 'text-green-400'}`}
                >
                  {formatPaiseAsRupees(c.outstandingBalancePaise)}
                </p>
              </div>
              <ChevronRight size={16} className="shrink-0 text-slate-300" />
            </Link>
          ))}
        </Card>
      )}

      {hasMore && !search && (
        <Button variant="secondary" onClick={loadMore} disabled={loading} className="self-center">
          {loading ? <Spinner /> : t('common.viewAll')}
        </Button>
      )}
    </div>
  )
}
