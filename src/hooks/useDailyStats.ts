import { useCallback, useEffect, useState } from 'react'
import { getDoc } from 'firebase/firestore'
import { dailyStatsDocRef } from '../firebase/firestore'
import { emptyDailyStats, type DailyStats } from '../types/dailyStats'
import { lastNDateKeys } from '../lib/utils/date'

/**
 * Reads the last `days` dailyStats docs by known date-key id (no query, no
 * index needed — see plan doc). Missing docs (no bills that day) resolve to
 * a zero-value stand-in rather than being skipped, so callers can always
 * index by position (today = last element).
 */
export function useDailyStatsRange(days: number) {
  const [stats, setStats] = useState<DailyStats[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const keys = lastNDateKeys(days)
      const docs = await Promise.all(
        keys.map(async (key) => {
          const snap = await getDoc(dailyStatsDocRef(key))
          return snap.exists() ? snap.data() : emptyDailyStats(key)
        }),
      )
      setStats(docs)
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { stats, loading, refresh }
}

export function sumStats(stats: DailyStats[]): Omit<DailyStats, 'date' | 'lastUpdatedAt'> {
  return stats.reduce(
    (total, s) => ({
      totalSalesPaise: total.totalSalesPaise + s.totalSalesPaise,
      cashCollectedPaise: total.cashCollectedPaise + s.cashCollectedPaise,
      upiCollectedPaise: total.upiCollectedPaise + s.upiCollectedPaise,
      bankTransferCollectedPaise: total.bankTransferCollectedPaise + s.bankTransferCollectedPaise,
      otherCollectedPaise: total.otherCollectedPaise + s.otherCollectedPaise,
      billCount: total.billCount + s.billCount,
      creditAmountPaise: total.creditAmountPaise + s.creditAmountPaise,
    }),
    {
      totalSalesPaise: 0,
      cashCollectedPaise: 0,
      upiCollectedPaise: 0,
      bankTransferCollectedPaise: 0,
      otherCollectedPaise: 0,
      billCount: 0,
      creditAmountPaise: 0,
    },
  )
}
