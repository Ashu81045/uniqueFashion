import { Percent } from 'lucide-react'
import { useT } from '../../../i18n/I18nContext'
import { formatPaiseAsRupees } from '../../../lib/billing/formatCurrency'
import { Card } from '../../../components/ui/Card'
import type { BillCalculationResult } from '../../../lib/billing/calculateBill'

export function DiscountSummary({
  calculation,
  overallDiscountPct,
  onOverallDiscountChange,
}: {
  calculation: BillCalculationResult
  overallDiscountPct: number
  onOverallDiscountChange: (pct: number) => void
}) {
  const t = useT()

  return (
    <Card className="flex flex-col gap-3 p-3">
      <label className="flex items-center justify-between text-sm font-medium text-slate-700">
        <span className="flex items-center gap-1.5">
          <Percent size={14} />
          {t('bill.overallDiscountPct')}
        </span>
        <input
          type="number"
          min={0}
          max={100}
          value={overallDiscountPct}
          onChange={(e) => onOverallDiscountChange(Number(e.target.value))}
          className="min-h-9 w-20 rounded-md border border-slate-300 px-2 py-1 text-right text-sm transition-shadow focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </label>

      <div className="flex flex-col gap-1.5 border-t border-slate-200 pt-3 text-sm">
        <Row label={t('bill.totalProductAmount')} value={calculation.totalProductAmountPaise} />
        <Row label={t('bill.totalItemDiscount')} value={-calculation.totalItemDiscountPaise} />
        <Row label={t('bill.overallDiscount')} value={-calculation.overallDiscountPaise} />
        <Row label={t('bill.totalDiscount')} value={-calculation.totalDiscountPaise} />
      </div>

      <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2.5 text-base font-semibold text-blue-900">
        <span>{t('bill.netPayable')}</span>
        <span>{formatPaiseAsRupees(calculation.netPayableAmountPaise)}</span>
      </div>
    </Card>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-slate-600">
      <span>{label}</span>
      <span>{formatPaiseAsRupees(value)}</span>
    </div>
  )
}
