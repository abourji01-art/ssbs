import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ConfirmationDialog from '../../components/ui/ConfirmationDialog'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Spinner from '../../components/ui/Spinner'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage, getValidationErrors } from '../../lib/errorMapper'
import {
  createStation,
  deleteStation,
  getStations,
  updateStation,
} from '../../services/api'

const V = {
  white: 'var(--fm-surface)',
  ink: 'var(--fm-ink)',
  mid: 'var(--fm-mid)',
  dim: 'var(--fm-dim)',
  line: 'var(--fm-line)',
  bg: 'var(--fm-bg)',
  blue: 'var(--fm-blue)',
  red: 'var(--fm-red)',
  redBg: 'var(--fm-red-bg)',
  redBdr: 'var(--fm-red-bdr)',
} as const

const STATIONS_QUERY_KEY = ['stations'] as const
const SEEDED_STATIONS = [
  'OCP Saka',
  'OCP 6',
  'Nakhil',
  'Chaaibat (Lhayat Pharmacy)',
  'Posto Gosto',
  'Mesk Lil',
  'Jnane Lkhir',
  'Lhamriti (Ben Salem)',
  'Al Fadl',
  'Kentra Jnane Lkhir',
  'Pharmacie Ibn Sina',
  'Al Qods',
  'Sissane',
  'La Gare',
  'Dyour Chouhada',
  'Chtayba',
  'Ibn Tofail',
  'Green Oil Station',
  'Coin Bleu',
  'BMCE',
  'Café Al Mouhajir',
  'Café Al Akhawayne',
  'Chaaibat',
  'Café Grind',
] as const

export default function Stations() {
  const qc = useQueryClient()
  const { isStaff } = useAuth()
  const { toast } = useToast()
  const [newName, setNewName] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingError, setEditingError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [isPhone, setIsPhone] = useState(() => window.innerWidth < 700)
  const [isSeeding, setIsSeeding] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsPhone(window.innerWidth < 700)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const stationsQuery = useQuery({
    queryKey: STATIONS_QUERY_KEY,
    queryFn: getStations,
  })

  const stations = stationsQuery.data ?? []

  const createMutation = useMutation({
    mutationFn: createStation,
    onSuccess: () => {
      setNewName('')
      setCreateError(null)
      qc.invalidateQueries({ queryKey: STATIONS_QUERY_KEY })
      toast('Station created.')
    },
    onError: (error) => {
      const validation = getValidationErrors(error)
      setCreateError(validation.name?.[0] ?? getErrorMessage(error))
      toast(getErrorMessage(error), 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateStation(id, { name }),
    onSuccess: () => {
      setEditingId(null)
      setEditingName('')
      setEditingError(null)
      qc.invalidateQueries({ queryKey: STATIONS_QUERY_KEY })
      toast('Station updated.')
    },
    onError: (error) => {
      const validation = getValidationErrors(error)
      setEditingError(validation.name?.[0] ?? getErrorMessage(error))
      toast(getErrorMessage(error), 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteStation,
    onSuccess: () => {
      setDeleteTarget(null)
      if (editingId) {
        setEditingId(null)
        setEditingName('')
        setEditingError(null)
      }
      qc.invalidateQueries({ queryKey: STATIONS_QUERY_KEY })
      toast('Station deleted.')
    },
    onError: (error) => {
      setDeleteTarget(null)
      toast(getErrorMessage(error), 'error')
    },
  })

  if (stationsQuery.isLoading) {
    return <Spinner text="Loading stations…" />
  }

  if (stationsQuery.isError) {
    return (
      <ErrorState
        title="Could not load stations"
        subtitle={getErrorMessage(stationsQuery.error)}
        onRetry={() => void stationsQuery.refetch()}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: V.ink, margin: 0 }}>Stations</h2>
          <p style={{ fontSize: 12, color: V.dim, margin: '6px 0 0' }}>
            Authenticated users can read stations. Only logistics staff can create, update, or delete them.
          </p>
        </div>
        <span style={{ fontSize: 12, color: V.dim }}>{stations.length} stations</span>
      </div>

      {isStaff && (
        <section style={{
          background: V.white,
          border: `1px solid ${V.line}`,
          borderRadius: 12,
          padding: 16,
        }}>
          <div style={{
            display: 'flex',
            alignItems: isPhone ? 'stretch' : 'center',
            justifyContent: 'space-between',
            gap: 10,
            flexDirection: isPhone ? 'column' : 'row',
            marginBottom: 12,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: V.ink }}>Create station</div>
            <button
              onClick={() => void handleSeedStations()}
              disabled={isSeeding || createMutation.isPending}
              style={secondaryButtonStyle()}
            >
              {isSeeding ? 'Seeding…' : 'Seed Data'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10, flexDirection: isPhone ? 'column' : 'row' }}>
            <input
              value={newName}
              onChange={(event) => {
                setNewName(event.target.value)
                setCreateError(null)
              }}
              placeholder="Station name"
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 8,
                border: `1px solid ${createError ? V.red : V.line}`,
                background: V.bg,
                color: V.ink,
                fontSize: 14,
                outline: 'none',
              }}
            />
            <button
              onClick={() => createMutation.mutate({ name: newName.trim() })}
              disabled={!newName.trim() || createMutation.isPending}
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: 'none',
                background: V.blue,
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: !newName.trim() || createMutation.isPending ? 'not-allowed' : 'pointer',
                opacity: !newName.trim() || createMutation.isPending ? 0.6 : 1,
              }}
            >
              {createMutation.isPending ? 'Adding…' : 'Add Station'}
            </button>
          </div>
          {createError && (
            <div style={{ fontSize: 12, color: V.red, marginTop: 8 }}>{createError}</div>
          )}
        </section>
      )}

      <section style={{
        background: V.white,
        border: `1px solid ${V.line}`,
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {stations.length === 0 ? (
          <EmptyState
            icon="📍"
            title="No stations yet"
            subtitle={isStaff ? 'Create the first station to support routes and onboarding.' : 'Stations will appear here once available.'}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {stations.map((station) => {
              const isEditing = editingId === station.id

              return (
                <div
                  key={station.id}
                  style={{
                    padding: 16,
                    borderBottom: `1px solid ${V.line}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: isPhone ? 'stretch' : 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexDirection: isPhone ? 'column' : 'row',
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      {isEditing ? (
                        <input
                          value={editingName}
                          onChange={(event) => {
                            setEditingName(event.target.value)
                            setEditingError(null)
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 8,
                            border: `1px solid ${editingError ? V.red : V.line}`,
                            background: V.bg,
                            color: V.ink,
                            fontSize: 14,
                            outline: 'none',
                          }}
                        />
                      ) : (
                        <>
                          <div style={{ fontSize: 18, fontWeight: 700, color: V.ink }}>{station.name}</div>
                          <div style={{ fontSize: 12, color: V.dim, marginTop: 4 }}>
                            Created {formatDate(station.created_at)}
                          </div>
                        </>
                      )}
                    </div>

                    {isStaff && (
                      <div style={{
                        display: 'flex',
                        gap: 8,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}>
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => updateMutation.mutate({ id: station.id, name: editingName.trim() })}
                              disabled={!editingName.trim() || editingName.trim() === station.name || updateMutation.isPending}
                              style={actionButtonStyle(V.blue, '#fff')}
                            >
                              {updateMutation.isPending ? 'Saving…' : 'Save'}
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null)
                                setEditingName('')
                                setEditingError(null)
                              }}
                              style={secondaryButtonStyle()}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(station.id)
                                setEditingName(station.name)
                                setEditingError(null)
                              }}
                              style={secondaryButtonStyle()}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ id: station.id, name: station.name })}
                              style={dangerButtonStyle()}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {isEditing && editingError && (
                    <div style={{ fontSize: 12, color: V.red }}>{editingError}</div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete station?"
        message={`Delete "${deleteTarget?.name}"? The backend will reject this if the station is referenced by a route.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        busy={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id)
          }
        }}
      />
    </div>
  )

  async function handleSeedStations() {
    setIsSeeding(true)
    setCreateError(null)

    const existingNames = new Set(stations.map((station) => station.name))
    const missingStations = SEEDED_STATIONS.filter((name) => !existingNames.has(name))

    if (missingStations.length === 0) {
      toast('Seed data already exists.', 'warning')
      setIsSeeding(false)
      return
    }

    try {
      for (const name of missingStations) {
        await createStation({ name })
      }

      await qc.invalidateQueries({ queryKey: STATIONS_QUERY_KEY })
      toast(`Seeded ${missingStations.length} stations.`)
    } catch (error) {
      toast(getErrorMessage(error), 'error')
    } finally {
      setIsSeeding(false)
    }
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString()
}

function actionButtonStyle(background: string, color: string) {
  return {
    padding: '9px 14px',
    borderRadius: 8,
    border: 'none',
    background,
    color,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  } as const
}

function secondaryButtonStyle() {
  return {
    padding: '9px 14px',
    borderRadius: 8,
    border: '1px solid var(--fm-line)',
    background: 'transparent',
    color: 'var(--fm-mid)',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  } as const
}

function dangerButtonStyle() {
  return {
    padding: '9px 14px',
    borderRadius: 8,
    border: '1px solid var(--fm-red-bdr)',
    background: 'var(--fm-red-bg)',
    color: 'var(--fm-red)',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  } as const
}
