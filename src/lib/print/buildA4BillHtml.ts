import { formatPaiseAsRupees } from '../billing/formatCurrency'
import { formatDisplayDate } from '../utils/date'
import type { BillPreviewData } from '../../features/billing/components/BillPreview'
import type { BusinessSettings } from '../../types/settings'
import type { BillLabels } from '../billing/billLabels'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function addDays(date: string | Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/**
 * Builds a full, standalone HTML document for the A4 invoice — plain inline
 * <style>, no Tailwind, no React component, and deliberately no flexbox or
 * <colgroup> — just plain HTML tables with column widths on the <th>/<td>
 * elements directly. Tables are the single most universally and
 * consistently supported layout primitive across every rendering engine
 * (this was tested against a notoriously weak HTML renderer as a
 * worst-case check, and every column stayed fully visible with no
 * collision). No dependency on the app's own stylesheet, JIT-generated
 * utility classes, or html2canvas correctly interpreting any of it.
 *
 * Kept in sync by hand with `A4BillLayout.tsx` (the React/Tailwind version
 * used for on-screen preview + the html2canvas share flow). Same structure,
 * same font-weight hierarchy, same all-black/no-grey palette, same due-date
 * rule. If you change one, change the other.
 *
 * DUE DATE: bill date + 75 days, computed here with `addDays` so it always
 * stays in sync with the bill date even if that's edited later.
 *
 * ⚠️ `data.customerAddress` is a field this layout expects on
 * `BillPreviewData`. If it doesn't exist on the type yet, add
 * `customerAddress?: string` there and wire up a manual text input
 * wherever customerName/customerMobile are currently collected.
 */
export function buildA4BillHtml(
  data: BillPreviewData,
  settings: BusinessSettings | null | undefined,
  labels: BillLabels,
): string {
  const dueDate = addDays(data.date, 75)

  const itemRows = data.items
    .map(
      (item, i) => `
    <tr${i === data.items.length - 1 ? ' class="last"' : ''}>
      <td>${escapeHtml(item.name)}</td>
      <td class="num">${formatPaiseAsRupees(item.ratePaise)}</td>
      <td class="num">${item.qty}</td>
      <td class="num">${item.itemDiscountPct > 0 ? `${item.itemDiscountPct}%` : '—'}</td>
      <td class="num">${formatPaiseAsRupees(item.discountedAmountPaise)}</td>
    </tr>`,
    )
    .join('')

  const paymentModeText =
    data.paymentModes.map((m) => labels.paymentModeLabel(m.mode)).join(', ') || '—'

  const contactLine = [
    settings?.phone ? `Ph: ${escapeHtml(settings.phone)}` : '',
    settings?.gstNumber ? `GSTIN: ${escapeHtml(settings.gstNumber)}` : '',
  ]
    .filter(Boolean)
    .join(' &nbsp;|&nbsp; ')

  const titleBillNo = data.billNo === 'draft' ? '' : ` ${data.billNo}`

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(labels.billNumber)}${titleBillNo}</title>
<style>
  @page { size: A4; margin: 15mm; }
  body { font-family: Arial, Helvetica, sans-serif; color: #000; margin: 0; }
  table { border-collapse: collapse; }

  /* 1. Brand name — centered, bold, big */
  .brand { text-align: center; border-bottom: 4px solid #000; padding-bottom: 16px; margin-bottom: 16px; }
  .business-name { font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em; margin: 0; }
  .business-address { font-size: 14px; font-weight: 600; margin: 6px 0 0; color: #000; }
  .business-contact { font-size: 12px; font-weight: 500; margin: 2px 0 0; color: #000; }

  /* Bill No + Bill Date */
  .meta-table { width: 100%; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 16px; font-size: 14px; font-weight: bold; }
  .meta-table td.right { text-align: right; }

  /* 2. Customer row: Name / Number / Address — bordered columns */
  .customer-table { width: 100%; border: 2px solid #000; margin-bottom: 24px; font-size: 14px; }
  .customer-table td { padding: 8px; border-right: 2px solid #000; vertical-align: top; width: 33.33%; }
  .customer-table td:last-child { border-right: none; }
  .customer-table .label { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.03em; margin: 0 0 4px; color: #000; }
  .customer-table .value { font-size: 16px; font-weight: bold; margin: 0; color: #000; }

  /* 3 & 4. Bigger/bolder fonts + full row & column grid lines */
  .items-table { width: 100%; font-size: 14px; border: 2px solid #000; }
  .items-table th, .items-table td { padding: 8px; text-align: left; border-right: 2px solid #000; }
  .items-table th:last-child, .items-table td:last-child { border-right: none; }
  .items-table thead tr { border-bottom: 2px solid #000; font-weight: 800; }
  .items-table th.num, .items-table td.num { text-align: right; }
  .items-table tbody tr { border-bottom: 2px solid #000; font-weight: 600; page-break-inside: avoid; }
  .items-table tbody tr.last { border-bottom: none; }

  .bottom-row { width: 100%; margin-top: 24px; }
  .bottom-row td { vertical-align: top; }
  .payment-mode { font-size: 14px; font-weight: 600; color: #000; }

  .summary-table { width: 288px; margin-left: auto; font-size: 14px; font-weight: 600; }
  .summary-table td { padding: 3px 0; color: #000; }
  .summary-table td.val { text-align: right; }
  .net-payable td { font-weight: 800; font-size: 18px; }

  /* 5. Due date — biggest, most visible element in the breakup */
  .due-date-box { border: 4px solid #000; padding: 12px; margin-top: 12px; text-align: right; }
  .due-date-label { font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.03em; display: block; }
  .due-date-value { font-size: 32px; font-weight: 800; line-height: 1; display: block; margin-top: 4px; }

  .footer { margin-top: 40px; border-top: 2px solid #000; padding-top: 16px; text-align: center; font-size: 12px; font-weight: 600; color: #000; }
</style>
</head>
<body>
  <div class="brand">
    <p class="business-name">${escapeHtml(settings?.businessName || labels.appName)}</p>
    <p class="business-address">${escapeHtml(settings?.address || 'Wholesale Garments')}</p>
    ${contactLine ? `<p class="business-contact">${contactLine}</p>` : ''}
  </div>

  <table class="meta-table"><tr>
    <td>${escapeHtml(labels.billNumber)}: <strong>${data.billNo === 'draft' ? '—' : data.billNo}</strong></td>
    <td class="right">Bill Date: <strong>${formatDisplayDate(data.date)}</strong></td>
  </tr></table>

  <table class="customer-table"><tr>
    <td>
      <p class="label">${escapeHtml(labels.customer)}</p>
      <p class="value">${escapeHtml(data.customerName)}</p>
    </td>
    <td>
      <p class="label">Number</p>
      <p class="value">${escapeHtml(data.customerMobile)}</p>
    </td>
    <td>
      <p class="label">Address</p>
      <p class="value">${data.customerAddress ? escapeHtml(data.customerAddress) : '—'}</p>
    </td>
  </tr></table>

  <table class="items-table">
    <thead><tr>
      <th style="width:38%">${escapeHtml(labels.productName)}</th>
      <th class="num" style="width:16%">${escapeHtml(labels.rate)}</th>
      <th class="num" style="width:10%">${escapeHtml(labels.qty)}</th>
      <th class="num" style="width:16%">${escapeHtml(labels.itemDiscount)}</th>
      <th class="num" style="width:20%">${escapeHtml(labels.amount)}</th>
    </tr></thead>
    <tbody>${itemRows}
    </tbody>
  </table>

  <table class="bottom-row"><tr>
    <td>
      <p class="payment-mode">${escapeHtml(labels.paymentMode)}: ${escapeHtml(paymentModeText)}</p>
    </td>
    <td style="width:288px;">
      <table class="summary-table">
        <tr><td>${escapeHtml(labels.totalProductAmount)}</td><td class="val">${formatPaiseAsRupees(data.totalProductAmountPaise)}</td></tr>
        <tr><td>${escapeHtml(labels.overallDiscount)} (${data.overallDiscountPct}%)</td><td class="val">${formatPaiseAsRupees(-data.overallDiscountPaise)}</td></tr>
        <tr><td>${escapeHtml(labels.totalItemDiscount)}</td><td class="val">${formatPaiseAsRupees(-data.totalItemDiscountPaise)}</td></tr>
        <tr><td>${escapeHtml(labels.totalDiscount)}</td><td class="val">${formatPaiseAsRupees(-data.totalDiscountPaise)}</td></tr>
        <tr class="net-payable"><td>${escapeHtml(labels.netPayable)}</td><td class="val">${formatPaiseAsRupees(data.netPayableAmountPaise)}</td></tr>
        <tr><td>${escapeHtml(labels.amountPaid)}</td><td class="val">${formatPaiseAsRupees(data.amountPaidPaise)}</td></tr>
        <tr><td>${escapeHtml(labels.due)}</td><td class="val">${formatPaiseAsRupees(data.dueAmountPaise)}</td></tr>
      </table>
      <div class="due-date-box">
        <span class="due-date-label">Due Date</span>
        <span class="due-date-value">${formatDisplayDate(dueDate)}</span>
      </div>
    </td>
  </tr></table>

  <div class="footer">${escapeHtml(settings?.invoiceFooter || 'Thank you for your business!')}</div>
</body>
</html>`
}