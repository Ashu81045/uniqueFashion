import { Link } from 'react-router-dom'
import { ChevronRight, Inbox, RefreshCw } from 'lucide-react'
import { useT } from '../../i18n/I18nContext'
import { useBillsList } from '../../hooks/useBillsList'
import { formatPaiseAsRupees } from '../../lib/billing/formatCurrency'
import { formatDisplayDate } from '../../lib/utils/date'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import type { PaymentStatus } from '../../types/bill'

const statusTone: Record<PaymentStatus, 'green' | 'amber' | 'red'> = {
  paid: 'green',
  partial: 'amber',
  credit: 'red',
}

export function BillsListPage() {
  const t = useT()
  const { bills, loading, hasMore, loadMore, refresh } = useBillsList()

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">{t('nav.bills')}</h1>
        <Button variant="secondary" onClick={refresh} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {t('common.refresh')}
        </Button>
      </div>

      {loading && bills.length === 0 ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : bills.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-12 text-center">
          <Inbox size={28} className="text-slate-300" />
          <p className="text-sm text-slate-500">—</p>
        </Card>
      ) : (
        <Card className="flex flex-col divide-y divide-slate-200 overflow-hidden p-0">
          {bills.map((bill, i) => (
            <Link
              key={bill.id}
              to={`/bills/${bill.id}`}
              style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
              className="flex animate-fade-in items-center gap-3 px-4 py-3 [animation-fill-mode:both] transition-colors hover:bg-blue-950/30"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-950/50 text-sm font-semibold text-blue-400">
                {bill.customerName?.[0]?.toUpperCase() ?? '#'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">
                  #{bill.billNo} — {bill.customerName}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDisplayDate(bill.createdAt?.toDate?.() ?? new Date())}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatPaiseAsRupees(bill.netPayableAmountPaise)}
                  </p>
                  <Badge tone={statusTone[bill.paymentStatus]}>{t(`bill.${bill.paymentStatus}`)}</Badge>
                </div>
                <ChevronRight size={16} className="shrink-0 text-slate-300" />
              </div>
            </Link>
          ))}
        </Card>
      )}

      {hasMore && (
        <Button variant="secondary" onClick={loadMore} disabled={loading} className="self-center">
          {loading ? <Spinner /> : t('common.viewAll')}
        </Button>
      )}
    </div>
  )
}
