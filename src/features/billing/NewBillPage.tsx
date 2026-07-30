import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, ListPlus, ReceiptText } from 'lucide-react'
import { useT } from '../../i18n/I18nContext'
import { useAuthStore } from '../../stores/authStore'
import { calculateBill, type BillLineItemInput } from '../../lib/billing/calculateBill'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { BillHeaderForm } from './components/BillHeaderForm'
import { LineItemsTable } from './components/LineItemsTable'
import { DiscountSummary } from './components/DiscountSummary'
import { PaymentModeForm } from './components/PaymentModeForm'
import { BillPreview, type BillPreviewData } from './components/BillPreview'
import { saveBill } from './billService'
import type { Customer } from '../../types/customer'
import type { BillPaymentModeSplit, PaymentStatus } from '../../types/bill'

export function NewBillPage() {
  const t = useT()
  const navigate = useNavigate()
  const session = useAuthStore((s) => s.session)

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [items, setItems] = useState<BillLineItemInput[]>([
    { name: '', qty: 1, ratePaise: 0, itemDiscountPct: 0 },
  ])
  const [overallDiscountPct, setOverallDiscountPct] = useState(0)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid')
  const [paymentModes, setPaymentModes] = useState<BillPaymentModeSplit[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculation = calculateBill(items, overallDiscountPct)

  // Keep the "paid in full" split amount in sync as line items/discounts change.
  useEffect(() => {
    if (paymentStatus === 'paid') {
      setPaymentModes((modes) =>
        modes.length === 1
          ? [{ ...modes[0], amountPaise: calculation.netPayableAmountPaise }]
          : [{ mode: 'cash', amountPaise: calculation.netPayableAmountPaise }],
      )
    }
  }, [calculation.netPayableAmountPaise, paymentStatus])

  const validItems = items.filter((i) => i.name.trim() && i.qty > 0 && i.ratePaise > 0)
  const canSave = Boolean(customer && validItems.length > 0 && session && !saving)

  async function handleSave() {
    if (!customer || !session) return
    setSaving(true)
    setError(null)
    try {
      const bill = await saveBill({
        items: validItems,
        overallDiscountPct,
        customerId: customer.mobile,
        customerName: customer.name,
        customerMobile: customer.mobile,
        paymentStatus,
        paymentModes,
        createdByUid: session.uid,
        createdByRole: session.role,
      })
      navigate(`/bills/${bill.id}`)
    } catch {
      setError('Failed to save bill. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const previewData: BillPreviewData = {
    billNo: 'draft',
    date: new Date(),
    customerName: customer?.name ?? '—',
    customerMobile: customer?.mobile ?? '—',
    items: calculation.items,
    totalProductAmountPaise: calculation.totalProductAmountPaise,
    totalItemDiscountPaise: calculation.totalItemDiscountPaise,
    overallDiscountPct: calculation.overallDiscountPct,
    overallDiscountPaise: calculation.overallDiscountPaise,
    totalDiscountPaise: calculation.totalDiscountPaise,
    netPayableAmountPaise: calculation.netPayableAmountPaise,
    paymentStatus,
    amountPaidPaise: paymentModes.reduce((total, s) => total + s.amountPaise, 0),
    dueAmountPaise:
      calculation.netPayableAmountPaise - paymentModes.reduce((total, s) => total + s.amountPaise, 0),
    paymentModes,
  }

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <h1 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <ReceiptText size={20} className="text-blue-600" />
          {t('bill.create')}
        </h1>
        <BillHeaderForm onCustomerSelect={setCustomer} />
        <Card className="p-3">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            <ListPlus size={16} />
            {t('bill.lineItems')}
          </h2>
          <LineItemsTable items={items} onChange={setItems} />
        </Card>
        <DiscountSummary
          calculation={calculation}
          overallDiscountPct={overallDiscountPct}
          onOverallDiscountChange={setOverallDiscountPct}
        />
        <PaymentModeForm
          netPayableAmountPaise={calculation.netPayableAmountPaise}
          paymentStatus={paymentStatus}
          paymentModes={paymentModes}
          onPaymentStatusChange={setPaymentStatus}
          onPaymentModesChange={setPaymentModes}
        />
        {error && (
          <div className="flex animate-fade-in items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}
        <Button onClick={handleSave} disabled={!canSave} className="w-full">
          {saving ? <Spinner tone="white" /> : t('common.save')}
        </Button>
      </div>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">{t('bill.preview')}</h2>
        <BillPreview data={previewData} />
      </div>
    </div>
  )
}
