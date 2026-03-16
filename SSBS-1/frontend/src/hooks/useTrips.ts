import { useEffect, useState } from 'react'
import { getAvailableTrips } from '../services/api'
import type { Trip } from '../types/api'

export function useTrips(stationId: string | null) {
  const [trips, setTrips]         = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    if (!stationId) { setIsLoading(false); return }
    setIsLoading(true)
    getAvailableTrips(stationId)
      .then(setTrips)
      .catch(() => setError('Failed to load trips'))
      .finally(() => setIsLoading(false))
  }, [stationId])

  return { trips, isLoading, error }
}
