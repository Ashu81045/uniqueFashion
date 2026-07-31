import { createRoot } from 'react-dom/client'
// html2canvas-pro (not html2canvas) — the original html2canvas can't parse
// oklch()/color-mix(), which is what Tailwind v4 compiles color-opacity
// utilities (e.g. bg-blue-950/50) to; it throws while scanning the page's
// stylesheet during capture. -pro is a maintained drop-in fork that adds
// support for these modern CSS color functions.
import html2canvas from 'html2canvas-pro'
import { jsPDF } from 'jspdf'
import { I18nProvider } from '../../i18n/I18nContext'
import { A4BillLayout } from '../../components/print/A4BillLayout'
import { getCachedBusinessSettings } from '../../hooks/useBusinessSettings'
import type { BillPreviewData } from '../../features/billing/components/BillPreview'

const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297

function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

/** Slices a source canvas into a single page-height segment, drawn onto a new canvas. */
function sliceCanvas(source: HTMLCanvasElement, startPx: number, heightPx: number): HTMLCanvasElement {
  const slice = document.createElement('canvas')
  slice.width = source.width
  slice.height = heightPx
  const ctx = slice.getContext('2d')!
  ctx.drawImage(source, 0, startPx, source.width, heightPx, 0, 0, source.width, heightPx)
  return slice
}

/**
 * Rasterizes the A4 invoice layout (off-screen, not the on-screen preview)
 * into a downloadable/shareable PDF File. Used by both the "Download PDF"
 * action and the WhatsApp share flow (see shareToWhatsapp.ts).
 */
export async function generateBillPdf(data: BillPreviewData): Promise<File> {
  const settings = await getCachedBusinessSettings()

  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-10000px'
  container.style.top = '0'
  container.setAttribute('aria-hidden', 'true')
  document.body.appendChild(container)

  const root = createRoot(container)
  root.render(
    <I18nProvider>
      <A4BillLayout data={data} settings={settings} />
    </I18nProvider>,
  )

  try {
    await waitForPaint()
    const canvas = await html2canvas(container, { scale: 2 })

    const pxPerMm = canvas.width / A4_WIDTH_MM
    const pageHeightPx = Math.floor(A4_HEIGHT_MM * pxPerMm)

    const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
    let renderedPx = 0
    let firstPage = true

    while (renderedPx < canvas.height) {
      const segmentHeightPx = Math.min(pageHeightPx, canvas.height - renderedPx)
      const segment = sliceCanvas(canvas, renderedPx, segmentHeightPx)
      const segmentHeightMm = segmentHeightPx / pxPerMm

      if (!firstPage) pdf.addPage()
      pdf.addImage(segment.toDataURL('image/png'), 'PNG', 0, 0, A4_WIDTH_MM, segmentHeightMm)

      renderedPx += segmentHeightPx
      firstPage = false
    }

    const blob = pdf.output('blob')
    const billLabel = data.billNo === 'draft' ? 'draft' : data.billNo
    return new File([blob], `Bill-${billLabel}.pdf`, { type: 'application/pdf' })
  } finally {
    root.unmount()
    document.body.removeChild(container)
  }
}
