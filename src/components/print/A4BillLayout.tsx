import { useT } from '../../i18n/I18nContext'
import { formatPaiseAsRupees } from '../../lib/billing/formatCurrency'
import { formatDisplayDate } from '../../lib/utils/date'
import type { BillPreviewData } from '../../features/billing/components/BillPreview'
import type { BusinessSettings } from '../../types/settings'

/**
 * Full-page invoice layout for A4 printing. Also reused (rasterized via
 * html2canvas) as the source for the shareable PDF — see lib/share/generateBillPdf.ts.
 * `settings` is optional so this still renders sensibly before Settings has
 * ever been filled in (generic placeholders) or if the read hasn't resolved yet.
 *
 * NOTE: this component assumes the page/print context sets:
 *   @media print { @page { size: A4; margin: 0; } html, body { margin: 0; padding: 0; } }
 * Without that reset, the browser's own print margins can squeeze this
 * 210mm-wide box into a narrower printable area and clip the right edge.
 */
export function A4BillLayout({ data, settings }: { data: BillPreviewData; settings?: BusinessSettings | null }) {
  const t = useT()
  return (
    <div className="w-[210mm] bg-white p-[15mm] text-black">
      <div className="mb-6 flex items-start justify-between border-b-2 border-black pb-4">
        <div>
          <h1 className="text-2xl font-bold">{settings?.businessName || t('app.name')}</h1>
          <p className="text-sm text-neutral-600">{settings?.address || 'Wholesale Garments'}</p>
          {(settings?.phone || settings?.gstNumber) && (
            <p className="text-xs text-neutral-500">
              {settings?.phone && `Ph: ${settings.phone}`}
              {settings?.phone && settings?.gstNumber && ' | '}
              {settings?.gstNumber && `GSTIN: ${settings.gstNumber}`}
            </p>
          )}
        </div>
        <div className="text-right text-sm">
          <p>
            {t('bill.number')}: <strong>{data.billNo === 'draft' ? '—' : data.billNo}</strong>
          </p>
          <p>{formatDisplayDate(data.date)}</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs uppercase text-neutral-500">{t('bill.customer')}</p>
        <p className="text-lg font-medium">{data.customerName}</p>
        <p className="text-sm text-neutral-600">{data.customerMobile}</p>
      </div>

      <table className="w-full table-fixed border-collapse text-sm">
        <colgroup>
          <col className="w-[38%]" />
          <col className="w-[16%]" />
          <col className="w-[10%]" />
          <col className="w-[16%]" />
          <col className="w-[20%]" />
        </colgroup>
        <thead>
          <tr className="border-b-2 border-black text-left">
            <th className="py-2">{t('bill.productName')}</th>
            <th className="py-2 text-right">{t('bill.rate')}</th>
            <th className="py-2 text-right">{t('bill.qty')}</th>
            <th className="py-2 text-right">{t('bill.itemDiscount')}</th>
            <th className="py-2 text-right">{t('bill.amount')}</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, i) => (
            <tr key={i} className="border-b border-neutral-200">
              <td className="break-words py-2 pr-2">{item.name}</td>
              <td className="py-2 text-right">{formatPaiseAsRupees(item.ratePaise)}</td>
              <td className="py-2 text-right">{item.qty}</td>
              <td className="py-2 text-right">
                {item.itemDiscountPct > 0 ? `${item.itemDiscountPct}%` : '—'}
              </td>
              <td className="py-2 text-right">{formatPaiseAsRupees(item.discountedAmountPaise)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto mt-4 flex w-64 flex-col gap-1 text-sm">
        <Row label={t('bill.totalProductAmount')} value={data.totalProductAmountPaise} />
        <Row label={`${t('bill.overallDiscount')} (${data.overallDiscountPct}%)`} value={-data.overallDiscountPaise} />
        <Row label={t('bill.totalItemDiscount')} value={-data.totalItemDiscountPaise} />
        <Row label={t('bill.totalDiscount')} value={-data.totalDiscountPaise} />
        <Row label={t('bill.netPayable')} value={data.netPayableAmountPaise} emphasize />
        <Row label={t('bill.amountPaid')} value={data.amountPaidPaise} />
        <Row label={t('bill.due')} value={data.dueAmountPaise} />
      </div>

      <div className="mt-6 text-sm text-neutral-600">
        <p>
          {t('bill.paymentMode')}:{' '}
          {data.paymentModes.map((m) => t(`bill.paymentMode.${m.mode}`)).join(', ') || '—'}
        </p>
      </div>

      <p className="mt-10 border-t border-neutral-200 pt-4 text-center text-xs text-neutral-500">
        {settings?.invoiceFooter || 'Thank you for your business!'}
      </p>
    </div>
  )
}

function Row({ label, value, emphasize }: { label: string; value: number; emphasize?: boolean }) {
  return (
    <div className={`flex justify-between ${emphasize ? 'text-base font-bold' : ''}`}>
      <span>{label}</span>
      <span>{formatPaiseAsRupees(value)}</span>
    </div>
  )
}
