import { Link } from 'react-router-dom'
import { HandCoins, Inbox } from 'lucide-react'
import { useT } from '../../i18n/I18nContext'
import { useCollectionsList } from '../../hooks/useCollectionsList'
import { formatPaiseAsRupees } from '../../lib/billing/formatCurrency'
import { formatDisplayDate } from '../../lib/utils/date'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'

export function CollectionsPage() {
  const t = useT()
  const { payments, loading, hasMore, loadMore } = useCollectionsList()

  return (
    <div className="flex animate-fade-in flex-col gap-4 p-4">
      <h1 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <HandCoins size={20} className="text-blue-600" />
        {t('collections.title')}
      </h1>

      {loading && payments.length === 0 ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : payments.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-12 text-center">
          <Inbox size={28} className="text-slate-300" />
          <p className="text-sm text-slate-500">—</p>
        </Card>
      ) : (
        <Card className="flex flex-col divide-y divide-slate-100 overflow-hidden p-0">
          {payments.map((p) => (
            <Link
              key={p.id}
              to={p.customerMobile ? `/ledger/${p.customerMobile}` : '#'}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-blue-50/50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                <HandCoins size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">{p.customerMobile ?? '—'}</p>
                <p className="text-xs text-slate-500">
                  {formatDisplayDate(p.createdAt?.toDate?.() ?? new Date())} · {t(`bill.paymentMode.${p.mode}`)}
                </p>
              </div>
              <p className="text-sm font-semibold text-green-700">{formatPaiseAsRupees(p.amountPaise)}</p>
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
