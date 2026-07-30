import { useT } from '../../../i18n/I18nContext'
import { formatPaiseAsRupees } from '../../../lib/billing/formatCurrency'
import { formatDisplayDate } from '../../../lib/utils/date'
import type { BillLineItemComputed } from '../../../lib/billing/calculateBill'
import type { BillPaymentModeSplit, PaymentStatus } from '../../../types/bill'

export interface BillPreviewData {
  billNo: number | 'draft'
  date: Date
  customerName: string
  customerMobile: string
  items: BillLineItemComputed[]
  totalProductAmountPaise: number
  totalItemDiscountPaise: number
  overallDiscountPct: number
  overallDiscountPaise: number
  totalDiscountPaise: number
  netPayableAmountPaise: number
  paymentStatus: PaymentStatus
  amountPaidPaise: number
  dueAmountPaise: number
  paymentModes: BillPaymentModeSplit[]
}

/**
 * Classic Indian wholesale "kacchi bill" layout: line items, then
 * Total Product Amount -> Overall Discount -> Additional Item Discounts ->
 * Total Discount -> Net Amount Payable, in that exact order. Shared by the
 * on-screen preview, thermal/A4 print layouts, and PDF/WhatsApp share.
 */
export function BillPreview({ data }: { data: BillPreviewData }) {
  const t = useT()

  return (
    <div className="animate-fade-in rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
      <div className="mb-3 flex items-center justify-between border-b border-dashed border-slate-300 pb-2">
        <div>
          <p className="font-semibold text-slate-900">{t('app.name')}</p>
          <p className="text-slate-500">
            {t('bill.number')}: {data.billNo === 'draft' ? '—' : data.billNo}
          </p>
        </div>
        <div className="text-right text-slate-500">
          <p>{formatDisplayDate(data.date)}</p>
        </div>
      </div>

      <div className="mb-3 border-b border-dashed border-slate-300 pb-2">
        <p className="font-medium text-slate-900">{data.customerName}</p>
        <p className="text-slate-500">{data.customerMobile}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-300 text-xs uppercase text-slate-500">
              <th className="py-1">{t('bill.productName')}</th>
              <th className="py-1 text-right">{t('bill.qty')}</th>
              <th className="py-1 text-right">{t('bill.rate')}</th>
              <th className="py-1 text-right">{t('bill.itemDiscount')}</th>
              <th className="py-1 text-right">{t('bill.amount')}</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-1.5">{item.name}</td>
                <td className="py-1.5 text-right">{item.qty}</td>
                <td className="py-1.5 text-right">{formatPaiseAsRupees(item.ratePaise)}</td>
                <td className="py-1.5 text-right">
                  {item.itemDiscountPct > 0 ? `${item.itemDiscountPct}%` : '—'}
                </td>
                <td className="py-1.5 text-right">{formatPaiseAsRupees(item.discountedAmountPaise)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-col gap-1 border-t border-dashed border-slate-300 pt-2">
        <SummaryRow label={t('bill.totalProductAmount')} value={data.totalProductAmountPaise} />
        <SummaryRow
          label={`${t('bill.overallDiscount')} (${data.overallDiscountPct}%)`}
          value={-data.overallDiscountPaise}
        />
        <SummaryRow label={t('bill.totalItemDiscount')} value={-data.totalItemDiscountPaise} />
        <SummaryRow label={t('bill.totalDiscount')} value={-data.totalDiscountPaise} />
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2.5 text-base font-semibold text-blue-900">
        <span>{t('bill.netPayable')}</span>
        <span>{formatPaiseAsRupees(data.netPayableAmountPaise)}</span>
      </div>

      <div className="mt-3 flex flex-col gap-1 border-t border-dashed border-slate-300 pt-2">
        <SummaryRow label={t('bill.amountPaid')} value={data.amountPaidPaise} />
        <SummaryRow label={t('bill.due')} value={data.dueAmountPaise} />
        <p className="text-slate-500">
          {t('bill.paymentMode')}:{' '}
          {data.paymentModes.map((m) => t(`bill.paymentMode.${m.mode}`)).join(', ') || '—'}
        </p>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-slate-600">
      <span>{label}</span>
      <span>{formatPaiseAsRupees(value)}</span>
    </div>
  )
}
