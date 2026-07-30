/** Local (not UTC) YYYY-MM-DD key, used as dailyStats doc ids so dashboards read known ids. */
export function toDateKey(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayDateKey(): string {
  return toDateKey(new Date())
}

/** Last `days` date keys ending today (inclusive), oldest first. */
export function lastNDateKeys(days: number): string[] {
  const keys: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    keys.push(toDateKey(d))
  }
  return keys
}

/** Local YYYY-MM key, used as monthlyStats doc ids. */
export function toMonthKey(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function currentMonthKey(): string {
  return toMonthKey(new Date())
}

/** Month key for `monthsAgo` months before today (0 = current month), oldest-first when mapped. */
export function monthKeyOffset(monthsAgo: number): string {
  const d = new Date()
  d.setDate(1) // avoid month-length rollover surprises before subtracting months
  d.setMonth(d.getMonth() - monthsAgo)
  return toMonthKey(d)
}

export function formatDisplayDate(d: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d)
}
