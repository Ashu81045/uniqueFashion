import { Plus, X } from 'lucide-react'
import { useT } from '../../../i18n/I18nContext'
import { paiseToRupees, rupeesToPaise, formatPaiseAsRupees } from '../../../lib/billing/formatCurrency'
import { numberInputValue, parseNumberInput } from '../../../lib/utils/number'
import { Card } from '../../../components/ui/Card'
import type { BillPaymentModeSplit, PaymentStatus } from '../../../types/bill'
import type { PaymentMode } from '../../../types/payment'

const PAYMENT_MODES: PaymentMode[] = ['cash', 'upi', 'gpay', 'phonepe', 'bank_transfer', 'other']
const PAYMENT_STATUSES: PaymentStatus[] = ['paid', 'partial', 'credit']

function sumSplits(splits: BillPaymentModeSplit[]) {
  return splits.reduce((total, s) => total + s.amountPaise, 0)
}

/**
 * paymentModes is a list of {mode, amountPaise} splits — one row for a single
 * payment mode, multiple rows naturally cover "Mixed Payment" (e.g. part cash,
 * part UPI) without a separate "mixed" enum value.
 */
export function PaymentModeForm({
  netPayableAmountPaise,
  paymentStatus,
  paymentModes,
  onPaymentStatusChange,
  onPaymentModesChange,
}: {
  netPayableAmountPaise: number
  paymentStatus: PaymentStatus
  paymentModes: BillPaymentModeSplit[]
  onPaymentStatusChange: (status: PaymentStatus) => void
  onPaymentModesChange: (modes: BillPaymentModeSplit[]) => void
}) {
  const t = useT()
  const amountPaidPaise = sumSplits(paymentModes)
  const dueAmountPaise = netPayableAmountPaise - amountPaidPaise

  function handleStatusChange(status: PaymentStatus) {
    onPaymentStatusChange(status)
    if (status === 'paid') onPaymentModesChange([{ mode: 'cash', amountPaise: netPayableAmountPaise }])
    if (status === 'credit') onPaymentModesChange([])
  }

  function updateSplit(index: number, patch: Partial<BillPaymentModeSplit>) {
    onPaymentModesChange(paymentModes.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  function addSplit() {
    onPaymentModesChange([...paymentModes, { mode: 'cash', amountPaise: 0 }])
  }

  function removeSplit(index: number) {
    onPaymentModesChange(paymentModes.filter((_, i) => i !== index))
  }

  return (
    <Card className="flex flex-col gap-3 p-3">
      <div className="flex gap-2 rounded-lg bg-slate-200 p-1">
        {PAYMENT_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => handleStatusChange(status)}
            className={`flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition-all duration-150 ${
              paymentStatus === status
                ? 'bg-blue-600 text-slate-50 shadow-sm'
                : 'text-slate-600 hover:bg-slate-300/60'
            }`}
          >
            {t(`bill.${status}`)}
          </button>
        ))}
      </div>

      {paymentStatus !== 'credit' && (
        <div className="flex flex-col gap-2">
          {paymentModes.map((split, i) => (
            <div key={i} className="flex animate-fade-in items-center gap-2">
              <select
                value={split.mode}
                onChange={(e) => updateSplit(i, { mode: e.target.value as PaymentMode })}
                className="min-h-9 flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm transition-shadow focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {PAYMENT_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {t(`bill.paymentMode.${mode}`)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                value={numberInputValue(paiseToRupees(split.amountPaise))}
                onChange={(e) => updateSplit(i, { amountPaise: rupeesToPaise(parseNumberInput(e.target.value)) })}
                className="min-h-9 w-24 rounded-md border border-slate-300 px-2 py-1.5 text-right text-sm transition-shadow focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button
                type="button"
                onClick={() => removeSplit(i)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-950/50 hover:text-red-400"
                aria-label={t('common.remove')}
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSplit}
            className="flex items-center gap-1 self-start text-sm font-medium text-blue-400 hover:underline"
          >
            <Plus size={14} />
            {t('bill.paymentMode')}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-1 border-t border-slate-200 pt-2 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>{t('bill.amountPaid')}</span>
          <span>{formatPaiseAsRupees(amountPaidPaise)}</span>
        </div>
        <div
          className={`flex justify-between font-medium ${dueAmountPaise > 0 ? 'text-red-400' : 'text-slate-900'}`}
        >
          <span>{t('bill.due')}</span>
          <span>{formatPaiseAsRupees(dueAmountPaise)}</span>
        </div>
      </div>
    </Card>
  )
}
