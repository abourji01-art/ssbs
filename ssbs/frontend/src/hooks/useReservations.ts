import { useEffect, useState } from 'react'
import { getReservations } from '../services/api'
import type { Reservation } from '../types/api'

export function useReservations(userId: string | null) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading]       = useState(true)
  const [error, setError]               = useState<string | null>(null)

  useEffect(() => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    getReservations(userId)
      .then(setReservations)
      .catch(() => setError('Failed to load reservations'))
      .finally(() => setIsLoading(false))
  }, [userId])

  return { reservations, isLoading, error }
}
