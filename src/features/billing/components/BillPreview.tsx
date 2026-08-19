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
    <div className="animate-fade-in rounded-xl border border-slate-200 bg-slate-100 p-4 text-sm shadow-sm shadow-black/20">
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

      {/* Mobile: stacked rows (no horizontal scroll). Desktop/tablet: full table. */}
      <div className="flex flex-col divide-y divide-slate-200 sm:hidden">
        {data.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-2 py-1.5">
            <div className="min-w-0">
              <p className="truncate text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-500">
                {item.qty} × {formatPaiseAsRupees(item.ratePaise)}
                {item.itemDiscountPct > 0 ? ` · -${item.itemDiscountPct}%` : ''}
              </p>
            </div>
            <span className="shrink-0 font-medium text-slate-900">
              {formatPaiseAsRupees(item.discountedAmountPaise)}
            </span>
          </div>
        ))}
      </div>

      {/*
        table-fixed + colgroup: without this, an auto-layout table sizes its
        Product Name column to fit the longest name, which can push the
        Amount column past the card's right edge (clipped, not scrolled,
        since this container has no overflow-x-auto).
      */}
      <table className="hidden w-full table-fixed border-collapse text-left sm:table">
        <colgroup>
          <col className="w-[38%]" />
          <col className="w-[16%]" />
          <col className="w-[10%]" />
          <col className="w-[16%]" />
          <col className="w-[20%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-slate-300 text-xs uppercase text-slate-500">
            <th className="py-1">{t('bill.productName')}</th>
            <th className="py-1 text-right">{t('bill.rate')}</th>
            <th className="py-1 text-right">{t('bill.qty')}</th>
            <th className="py-1 text-right">{t('bill.itemDiscount')}</th>
            <th className="py-1 text-right">{t('bill.amount')}</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr key={i} className="border-b border-slate-200">
              <td className="truncate py-1.5 pr-2">{item.name}</td>
              <td className="py-1.5 text-right">{formatPaiseAsRupees(item.ratePaise)}</td>
              <td className="py-1.5 text-right">{item.qty}</td>
              <td className="py-1.5 text-right">
                {item.itemDiscountPct > 0 ? `${item.itemDiscountPct}%` : '—'}
              </td>
              <td className="py-1.5 text-right">{formatPaiseAsRupees(item.discountedAmountPaise)}</td>
            </tr>
          ))}
        </tbody>
      </table>

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
