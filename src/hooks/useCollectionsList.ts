import { useCallback, useEffect, useState } from 'react'
import type { QueryDocumentSnapshot } from 'firebase/firestore'
import { fetchCollectionsPage } from '../features/collections/collectionsQuery'
import type { CustomerPayment } from '../types/payment'

export function useCollectionsList() {
  const [payments, setPayments] = useState<CustomerPayment[]>([])
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<CustomerPayment> | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadFirstPage = useCallback(async () => {
    setLoading(true)
    try {
      const page = await fetchCollectionsPage(null)
      setPayments(page.payments)
      setLastDoc(page.lastDoc)
      setHasMore(page.hasMore)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (!lastDoc) return
    setLoading(true)
    try {
      const page = await fetchCollectionsPage(lastDoc)
      setPayments((prev) => [...prev, ...page.payments])
      setLastDoc(page.lastDoc)
      setHasMore(page.hasMore)
    } finally {
      setLoading(false)
    }
  }, [lastDoc])

  useEffect(() => {
    loadFirstPage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { payments, loading, hasMore, loadMore, refresh: loadFirstPage }
}
