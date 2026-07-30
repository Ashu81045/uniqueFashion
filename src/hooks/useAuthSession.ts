import { useEffect } from 'react'
import { getDoc } from 'firebase/firestore'
import { onAuthChanged } from '../firebase/auth'
import { userDocRef } from '../firebase/firestore'
import { useAuthStore } from '../stores/authStore'

/**
 * Bootstraps the auth session once per app load: listens for Firebase Auth
 * state, then reads users/{uid} exactly once to resolve the role. Role is
 * cached in the persisted authStore afterwards — no repeated reads per page.
 */
export function useAuthSession() {
  const setSession = useAuthStore((s) => s.setSession)
  const setStatus = useAuthStore((s) => s.setStatus)

  useEffect(() => {
    setStatus('loading')
    const unsubscribe = onAuthChanged(async (user) => {
      if (!user) {
        setSession(null)
        setStatus('ready')
        return
      }
      try {
        const snap = await getDoc(userDocRef(user.uid))
        if (!snap.exists() || !snap.data().active) {
          setSession(null)
          setStatus('ready')
          return
        }
        const data = snap.data()
        setSession({ uid: user.uid, name: data.name, role: data.role })
        setStatus('ready')
      } catch (err) {
        // Most commonly: Firestore rules not deployed yet, so this read is
        // denied. Fail closed (no session) instead of hanging on the spinner
        // forever with an unhandled rejection.
        console.error('Failed to load users/{uid} — check Firestore rules are deployed.', err)
        setSession(null)
        setStatus('ready')
      }
    })
    return unsubscribe
  }, [setSession, setStatus])
}
