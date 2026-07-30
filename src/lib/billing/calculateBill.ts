export interface BillLineItemInput {
  name: string
  qty: number
  ratePaise: number
  itemDiscountPct: number // 0-100
}

export interface BillLineItemComputed extends BillLineItemInput {
  amountPaise: number
  itemDiscountPaise: number
  discountedAmountPaise: number
}

export interface BillCalculationResult {
  items: BillLineItemComputed[]
  totalProductAmountPaise: number
  totalItemDiscountPaise: number
  subtotalAfterItemDiscountPaise: number
  overallDiscountPct: number
  overallDiscountPaise: number
  totalDiscountPaise: number
  netPayableAmountPaise: number
}

/**
 * Item discounts apply first (per line), then the overall bill discount applies
 * to the post-item-discount subtotal. See plan doc for the worked example this
 * mirrors exactly (Shirt/Jeans/T-shirt).
 */
export function calculateBill(
  items: BillLineItemInput[],
  overallDiscountPct: number,
): BillCalculationResult {
  const computedItems: BillLineItemComputed[] = items.map((item) => {
    const amountPaise = Math.round(item.qty * item.ratePaise)
    const itemDiscountPaise = Math.round((amountPaise * item.itemDiscountPct) / 100)
    const discountedAmountPaise = amountPaise - itemDiscountPaise
    return { ...item, amountPaise, itemDiscountPaise, discountedAmountPaise }
  })

  const totalProductAmountPaise = sum(computedItems.map((i) => i.amountPaise))
  const totalItemDiscountPaise = sum(computedItems.map((i) => i.itemDiscountPaise))
  const subtotalAfterItemDiscountPaise = sum(computedItems.map((i) => i.discountedAmountPaise))

  const overallDiscountPaise = Math.round(
    (subtotalAfterItemDiscountPaise * overallDiscountPct) / 100,
  )
  const netPayableAmountPaise = subtotalAfterItemDiscountPaise - overallDiscountPaise
  const totalDiscountPaise = totalItemDiscountPaise + overallDiscountPaise

  return {
    items: computedItems,
    totalProductAmountPaise,
    totalItemDiscountPaise,
    subtotalAfterItemDiscountPaise,
    overallDiscountPct,
    overallDiscountPaise,
    totalDiscountPaise,
    netPayableAmountPaise,
  }
}

function sum(values: number[]): number {
  return values.reduce((total, v) => total + v, 0)
}
