import { useEffect, useState } from 'react'
import { getStations } from '../services/api'
import type { Station } from '../types/api'

export function useStations() {
  const [stations, setStations]   = useState<Station[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    getStations()
      .then(setStations)
      .catch(() => setError('Failed to load stations'))
      .finally(() => setIsLoading(false))
  }, [])

  return { stations, isLoading, error }
}
