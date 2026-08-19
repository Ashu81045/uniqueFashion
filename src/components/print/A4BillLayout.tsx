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
 *
 * The item grid intentionally uses CSS Grid, not <table>/<colgroup>. Native
 * table column-width hints (via <col>) are unreliable across both browser
 * print engines and html2canvas — columns can collide/overlap instead of
 * respecting their assigned widths. `grid-template-columns` is rendered
 * consistently by all three (screen, print, html2canvas capture).
 */
const ITEM_GRID_COLS = 'grid-cols-[3.8fr_1.6fr_1fr_1.6fr_2fr]'

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

      <div className="text-sm">
        <div className={`grid ${ITEM_GRID_COLS} gap-x-3 border-b-2 border-black pb-2 text-left font-semibold`}>
          <div>{t('bill.productName')}</div>
          <div className="text-right">{t('bill.rate')}</div>
          <div className="text-right">{t('bill.qty')}</div>
          <div className="text-right">{t('bill.itemDiscount')}</div>
          <div className="text-right">{t('bill.amount')}</div>
        </div>
        {data.items.map((item, i) => (
          <div
            key={i}
            className={`grid ${ITEM_GRID_COLS} gap-x-3 border-b border-neutral-200 py-2`}
          >
            <div className="break-words">{item.name}</div>
            <div className="text-right">{formatPaiseAsRupees(item.ratePaise)}</div>
            <div className="text-right">{item.qty}</div>
            <div className="text-right">
              {item.itemDiscountPct > 0 ? `${item.itemDiscountPct}%` : '—'}
            </div>
            <div className="text-right">{formatPaiseAsRupees(item.discountedAmountPaise)}</div>
          </div>
        ))}
      </div>

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
