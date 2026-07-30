import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PiggyBank } from 'lucide-react'
import { useT } from '../../i18n/I18nContext'
import { useAuthStore } from '../../stores/authStore'
import { Spinner } from '../../components/ui/Spinner'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { formatPaiseAsRupees, rupeesToPaise } from '../../lib/billing/formatCurrency'
import { getCustomerByMobile } from '../customers/customerService'
import { fetchCustomerLedger, recordPayment, type LedgerRow } from './ledgerService'
import { LedgerTable } from './components/LedgerTable'
import type { Customer } from '../../types/customer'
import type { PaymentMode } from '../../types/payment'

const PAYMENT_MODES: PaymentMode[] = ['cash', 'upi', 'gpay', 'phonepe', 'bank_transfer', 'other']

export function CustomerLedgerPage() {
  const t = useT()
  const { mobile } = useParams<{ mobile: string }>()
  const session = useAuthStore((s) => s.session)

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [rows, setRows] = useState<LedgerRow[]>([])
  const [loading, setLoading] = useState(true)

  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState<PaymentMode>('cash')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!mobile) return
    setLoading(true)
    try {
      const [c, ledgerRows] = await Promise.all([
        getCustomerByMobile(mobile),
        fetchCustomerLedger(mobile),
      ])
      setCustomer(c)
      setRows(ledgerRows)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobile])

  async function handleRecordPayment() {
    if (!mobile || !session) return
    const amountPaise = rupeesToPaise(Number(amount))
    if (amountPaise <= 0) return
    setSaving(true)
    try {
      await recordPayment(mobile, amountPaise, mode, note, session.uid, session.role)
      setAmount('')
      setNote('')
      await load()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }

  if (!customer) {
    return <p className="p-4 text-sm text-slate-500">—</p>
  }

  const fetchedDebits = rows.reduce((total, r) => total + r.debitPaise, 0)
  const fetchedCredits = rows.reduce((total, r) => total + r.creditPaise, 0)
  const openingBalancePaise = customer.outstandingBalancePaise - (fetchedDebits - fetchedCredits)
  const hasOutstanding = customer.outstandingBalancePaise > 0

  return (
    <div className="flex animate-fade-in flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-base font-semibold text-blue-700">
          {customer.name[0]?.toUpperCase() ?? '?'}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-slate-900">{customer.name}</h1>
          <p className="text-sm text-slate-500">{customer.mobile}</p>
        </div>
        <div
          className={`shrink-0 rounded-lg px-3 py-1.5 text-right ${
            hasOutstanding ? 'bg-red-50' : 'bg-green-50'
          }`}
        >
          <p className={`text-xs ${hasOutstanding ? 'text-red-600' : 'text-green-600'}`}>
            {t('ledger.outstandingBalance')}
          </p>
          <p className={`text-sm font-semibold ${hasOutstanding ? 'text-red-700' : 'text-green-700'}`}>
            {formatPaiseAsRupees(customer.outstandingBalancePaise)}
          </p>
        </div>
      </div>

      <Card className="flex flex-col gap-3 p-3 sm:flex-row sm:items-end">
        <Input
          label={t('ledger.recordPayment')}
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
        />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">{t('bill.paymentMode')}</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as PaymentMode)}
            className="min-h-11 rounded-lg border border-slate-300 px-3 py-2.5 text-sm transition-shadow focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            {PAYMENT_MODES.map((m) => (
              <option key={m} value={m}>
                {t(`bill.paymentMode.${m}`)}
              </option>
            ))}
          </select>
        </label>
        <Input label={t('ledger.remarks')} value={note} onChange={(e) => setNote(e.target.value)} />
        <Button onClick={handleRecordPayment} disabled={saving || !amount}>
          {saving ? <Spinner tone="white" /> : <PiggyBank size={16} />}
          {t('common.save')}
        </Button>
      </Card>

      <LedgerTable rows={rows} openingBalancePaise={openingBalancePaise} />
    </div>
  )
}
