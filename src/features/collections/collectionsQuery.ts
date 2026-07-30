import { getDocs, limit, orderBy, query, startAfter, type QueryDocumentSnapshot } from 'firebase/firestore'
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
