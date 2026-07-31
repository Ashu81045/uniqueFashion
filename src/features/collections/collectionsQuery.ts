import {
  Timestamp,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { paymentsCollectionGroup } from '../../firebase/firestore'
import type { CustomerPayment } from '../../types/payment'

export const COLLECTIONS_PAGE_SIZE = 20

export interface CollectionsPage {
  payments: CustomerPayment[]
  lastDoc: QueryDocumentSnapshot<CustomerPayment> | null
  hasMore: boolean
}

/** Global "Payment History" — every payment recorded against any customer. */
export async function fetchCollectionsPage(
  cursor: QueryDocumentSnapshot<CustomerPayment> | null,
): Promise<CollectionsPage> {
  const q = cursor
    ? query(
        paymentsCollectionGroup(),
        orderBy('createdAt', 'desc'),
        startAfter(cursor),
        limit(COLLECTIONS_PAGE_SIZE),
      )
    : query(paymentsCollectionGroup(), orderBy('createdAt', 'desc'), limit(COLLECTIONS_PAGE_SIZE))

  const snap = await getDocs(q)
  const payments = snap.docs.map((d) => d.data())
  const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null
  return { payments, lastDoc, hasMore: snap.docs.length === COLLECTIONS_PAGE_SIZE }
}

/**
 * Every payment recorded since `sinceDate`, across all customers — powers
 * the per-collector summary (grouped client-side by createdByUid). A single
 * range+orderBy on the same field (createdAt) needs no composite index.
 */
export async function fetchPaymentsSince(sinceDate: Date, limitCount = 300): Promise<CustomerPayment[]> {
  const q = query(
    paymentsCollectionGroup(),
    where('createdAt', '>=', Timestamp.fromDate(sinceDate)),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data())
}
