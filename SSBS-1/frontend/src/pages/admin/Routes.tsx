import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ConfirmationDialog from '../../components/ui/ConfirmationDialog'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Spinner from '../../components/ui/Spinner'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage, getValidationErrors } from '../../lib/errorMapper'
import {
  createRoute,
  deleteRoute,
  getRoutes,
  getStations,
  updateRoute,
} from '../../services/api'
import type { RouteWindow, Station } from '../../types/api'

const V = {
  white: 'var(--fm-surface)',
  ink: 'var(--fm-ink)',
  mid: 'var(--fm-mid)',
  dim: 'var(--fm-dim)',
  line: 'var(--fm-line)',
  bg: 'var(--fm-bg)',
  blue: 'var(--fm-blue)',
  blueBg: 'var(--fm-blue-bg)',
  blueBdr: 'var(--fm-blue-bdr)',
  red: 'var(--fm-red)',
  redBg: 'var(--fm-red-bg)',
  redBdr: 'var(--fm-red-bdr)',
} as const

const ROUTES_QUERY_KEY = ['routes'] as const
const STATIONS_QUERY_KEY = ['stations'] as const
const WINDOW_OPTIONS: RouteWindow[] = ['peak', 'consolidated']

type RouteFormState = {
  name: string
  window: RouteWindow
  station_ids: string[]
}

const EMPTY_FORM: RouteFormState = {
  name: '',
  window: 'peak',
  station_ids: [],
}

export default function Routes() {
  const qc = useQueryClient()
  const { isStaff } = useAuth()
  const { toast } = useToast()
  const [createForm, setCreateForm] = useState<RouteFormState>(EMPTY_FORM)
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingForm, setEditingForm] = useState<RouteFormState>(EMPTY_FORM)
  const [editingErrors, setEditingErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [isPhone, setIsPhone] = useState(() => window.innerWidth < 760)

  useEffect(() => {
    const handleResize = () => setIsPhone(window.innerWidth < 760)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const routesQuery = useQuery({
    queryKey: ROUTES_QUERY_KEY,
    queryFn: getRoutes,
  })

  const stationsQuery = useQuery({
    queryKey: STATIONS_QUERY_KEY,
    queryFn: getStations,
  })

  const routes = routesQuery.data ?? []
  const stations = stationsQuery.data ?? []

  const stationNameById = useMemo(
    () => Object.fromEntries(stations.map((station) => [station.id, station.name])),
    [stations],
  )

  const createMutation = useMutation({
    mutationFn: createRoute,
    onSuccess: () => {
      setCreateForm(EMPTY_FORM)
      setCreateErrors({})
      qc.invalidateQueries({ queryKey: ROUTES_QUERY_KEY })
      toast('Route created.')
    },
    onError: (error) => {
      setCreateErrors(normalizeRouteErrors(error))
      toast(getErrorMessage(error), 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RouteFormState }) => updateRoute(id, payload),
    onSuccess: () => {
      setEditingId(null)
      setEditingForm(EMPTY_FORM)
      setEditingErrors({})
      qc.invalidateQueries({ queryKey: ROUTES_QUERY_KEY })
      toast('Route updated.')
    },
    onError: (error) => {
      setEditingErrors(normalizeRouteErrors(error))
      toast(getErrorMessage(error), 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteRoute,
    onSuccess: () => {
      setDeleteTarget(null)
      qc.invalidateQueries({ queryKey: ROUTES_QUERY_KEY })
      toast('Route deleted.')
    },
    onError: (error) => {
      setDeleteTarget(null)
      toast(getErrorMessage(error), 'error')
    },
  })

  if (routesQuery.isLoading || stationsQuery.isLoading) {
    return <Spinner text="Loading routes…" />
  }

  if (routesQuery.isError) {
    return (
      <ErrorState
        title="Could not load routes"
        subtitle={getErrorMessage(routesQuery.error)}
        onRetry={() => void routesQuery.refetch()}
      />
    )
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
          <h2 style={{ fontSize: 20, fontWeight: 700, color: V.ink, margin: 0 }}>Routes</h2>
          <p style={{ fontSize: 12, color: V.dim, margin: '6px 0 0' }}>
            Authenticated users can read routes. Logistics staff create and edit them using ordered station selections.
          </p>
        </div>
        <span style={{ fontSize: 12, color: V.dim }}>{routes.length} routes</span>
      </div>

      {isStaff && (
        <section style={{
          background: V.white,
          border: `1px solid ${V.line}`,
          borderRadius: 12,
          padding: 16,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: V.ink, marginBottom: 12 }}>Create route</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isPhone ? '1fr' : 'minmax(0, 1.2fr) 180px auto',
            gap: 10,
            marginBottom: 12,
          }}>
            <input
              value={createForm.name}
              onChange={(event) => {
                setCreateForm((current) => ({ ...current, name: event.target.value }))
                setCreateErrors((current) => ({ ...current, name: '' }))
              }}
              placeholder="Route name"
              style={inputStyle(!!createErrors.name)}
            />
            <select
              value={createForm.window}
              onChange={(event) => setCreateForm((current) => ({ ...current, window: event.target.value as RouteWindow }))}
              style={inputStyle(!!createErrors.window)}
            >
              {WINDOW_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <button
              onClick={() => createMutation.mutate(createForm)}
              disabled={createMutation.isPending}
              style={primaryButtonStyle()}
            >
              {createMutation.isPending ? 'Adding…' : 'Add Route'}
            </button>
          </div>

          <StationOrderEditor
            stations={stations}
            existingRoutes={routes}
            selectedIds={createForm.station_ids}
            onChange={(station_ids) => {
              setCreateForm((current) => ({ ...current, station_ids }))
              setCreateErrors((current) => ({ ...current, station_ids: '', non_field_errors: '' }))
            }}
          />

          {renderErrors(createErrors)}
        </section>
      )}

      <section style={{
        background: V.white,
        border: `1px solid ${V.line}`,
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {routes.length === 0 ? (
          <EmptyState
            icon="🗺️"
            title="No routes yet"
            subtitle={isStaff ? 'Create the first route after stations are ready.' : 'Routes will appear here once available.'}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {routes.map((route) => {
              const isEditing = editingId === route.id
              const orderedStations = [...route.stations].sort((a, b) => a.order - b.order)

              return (
                <div
                  key={route.id}
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
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: isPhone ? '1fr' : 'minmax(0, 1.2fr) 180px',
                          gap: 10,
                        }}>
                          <input
                            value={editingForm.name}
                            onChange={(event) => {
                              setEditingForm((current) => ({ ...current, name: event.target.value }))
                              setEditingErrors((current) => ({ ...current, name: '' }))
                            }}
                            placeholder="Route name"
                            style={inputStyle(!!editingErrors.name)}
                          />
                          <select
                            value={editingForm.window}
                            onChange={(event) => {
                              setEditingForm((current) => ({ ...current, window: event.target.value as RouteWindow }))
                              setEditingErrors((current) => ({ ...current, window: '' }))
                            }}
                            style={inputStyle(!!editingErrors.window)}
                          >
                            {WINDOW_OPTIONS.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <>
                          <div style={{ fontSize: 18, fontWeight: 700, color: V.ink }}>{route.name}</div>
                          <div style={{ fontSize: 12, color: V.dim, marginTop: 4 }}>
                            {route.window} · {orderedStations.length} stops · Created {formatDate(route.created_at)}
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
                              onClick={() => updateMutation.mutate({ id: route.id, payload: editingForm })}
                              disabled={updateMutation.isPending}
                              style={primaryButtonStyle()}
                            >
                              {updateMutation.isPending ? 'Saving…' : 'Save'}
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null)
                                setEditingForm(EMPTY_FORM)
                                setEditingErrors({})
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
                                setEditingId(route.id)
                                setEditingForm({
                                  name: route.name,
                                  window: route.window,
                                  station_ids: orderedStations.map((item) => item.station.id),
                                })
                                setEditingErrors({})
                              }}
                              style={secondaryButtonStyle()}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ id: route.id, name: route.name })}
                              style={dangerButtonStyle()}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(isEditing ? editingForm.station_ids : orderedStations.map((item) => item.station.id)).map((stationId, index) => (
                      <span
                        key={`${route.id}-${stationId}-${index}`}
                        style={{
                          fontSize: 12,
                          color: V.mid,
                          padding: '6px 10px',
                          borderRadius: 999,
                          background: V.bg,
                          border: `1px solid ${V.line}`,
                        }}
                      >
                        {index + 1}. {stationNameById[stationId] ?? 'Unknown station'}
                      </span>
                    ))}
                  </div>

                  {isEditing && (
                    <>
                      <StationOrderEditor
                        stations={stations}
                        existingRoutes={routes.filter((item) => item.id !== route.id)}
                        selectedIds={editingForm.station_ids}
                        onChange={(station_ids) => {
                          setEditingForm((current) => ({ ...current, station_ids }))
                          setEditingErrors((current) => ({ ...current, station_ids: '', non_field_errors: '' }))
                        }}
                      />
                      {renderErrors(editingErrors)}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete route?"
        message={`Delete "${deleteTarget?.name}"? The backend will reject this if the route is referenced by a trip.`}
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
}

function StationOrderEditor({
  stations,
  existingRoutes,
  selectedIds,
  onChange,
}: {
  stations: Station[]
  existingRoutes: Array<{
    id: string
    name: string
    stations: Array<{ order: number; station: Station }>
  }>
  selectedIds: string[]
  onChange: (stationIds: string[]) => void
}) {
  const availableStations = stations.filter((station) => !selectedIds.includes(station.id))
  const selectedStations = selectedIds
    .map((id) => stations.find((station) => station.id === id))
    .filter((station): station is Station => Boolean(station))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: V.dim, textTransform: 'uppercase' }}>Ordered stations</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
        {existingRoutes.length > 0 && (
          <div style={{
            padding: 12,
            borderRadius: 10,
            border: `1px solid ${V.line}`,
            background: V.bg,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: V.ink, marginBottom: 10 }}>
              Build from existing routes
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {existingRoutes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => onChange(mergeRouteStations(selectedIds, route.stations))}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 999,
                    border: `1px solid ${V.line}`,
                    background: V.white,
                    color: V.mid,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  + {route.name}
                </button>
              ))}
              {selectedIds.length > 0 && (
                <button
                  onClick={() => onChange([])}
                  style={tinyDangerButtonStyle()}
                >
                  Clear all
                </button>
              )}
            </div>
            <div style={{ fontSize: 11, color: V.dim, marginTop: 10 }}>
              Appends stations from the selected route in order and skips duplicates. Use this to build combined routes.
            </div>
          </div>
        )}

        <div style={{
          padding: 12,
          borderRadius: 10,
          border: `1px solid ${V.line}`,
          background: V.bg,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: V.ink, marginBottom: 10 }}>
            Selected order
          </div>
          {selectedStations.length === 0 ? (
            <div style={{ fontSize: 12, color: V.dim }}>
              Add at least one station. Order here becomes the backend `station_ids` order.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedStations.map((station, index) => (
                <div
                  key={station.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: V.white,
                    border: `1px solid ${V.line}`,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: V.ink }}>
                      {index + 1}. {station.name}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => onChange(moveItem(selectedIds, index, index - 1))}
                      disabled={index === 0}
                      style={tinyButtonStyle(index === 0)}
                    >
                      Up
                    </button>
                    <button
                      onClick={() => onChange(moveItem(selectedIds, index, index + 1))}
                      disabled={index === selectedIds.length - 1}
                      style={tinyButtonStyle(index === selectedIds.length - 1)}
                    >
                      Down
                    </button>
                    <button
                      onClick={() => onChange(selectedIds.filter((id) => id !== station.id))}
                      style={tinyDangerButtonStyle()}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          padding: 12,
          borderRadius: 10,
          border: `1px solid ${V.line}`,
          background: V.bg,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: V.ink, marginBottom: 10 }}>
            Available stations
          </div>
          {availableStations.length === 0 ? (
            <div style={{ fontSize: 12, color: V.dim }}>
              All stations are already included in this route.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {availableStations.map((station) => (
                <button
                  key={station.id}
                  onClick={() => onChange([...selectedIds, station.id])}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 999,
                    border: `1px solid ${V.line}`,
                    background: V.white,
                    color: V.mid,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  + {station.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function normalizeRouteErrors(error: unknown) {
  const validation = getValidationErrors(error)
  return {
    name: validation.name?.[0] ?? '',
    window: validation.window?.[0] ?? '',
    station_ids: validation.station_ids?.[0] ?? '',
    non_field_errors: validation.non_field_errors?.[0] ?? '',
  }
}

function renderErrors(errors: Record<string, string>) {
  const entries = Object.values(errors).filter(Boolean)

  if (entries.length === 0) {
    return null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
      {entries.map((message, index) => (
        <div key={`${message}-${index}`} style={{ fontSize: 12, color: V.red }}>
          {message}
        </div>
      ))}
    </div>
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString()
}

function inputStyle(hasError: boolean) {
  return {
    padding: '10px 12px',
    borderRadius: 8,
    border: `1px solid ${hasError ? 'var(--fm-red)' : 'var(--fm-line)'}`,
    background: 'var(--fm-bg)',
    color: 'var(--fm-ink)',
    fontSize: 14,
    outline: 'none',
    width: '100%',
  } as const
}

function primaryButtonStyle() {
  return {
    padding: '10px 16px',
    borderRadius: 8,
    border: 'none',
    background: 'var(--fm-blue)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  } as const
}

function secondaryButtonStyle() {
  return {
    padding: '10px 16px',
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
    padding: '10px 16px',
    borderRadius: 8,
    border: '1px solid var(--fm-red-bdr)',
    background: 'var(--fm-red-bg)',
    color: 'var(--fm-red)',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  } as const
}

function tinyButtonStyle(disabled = false) {
  return {
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid var(--fm-line)',
    background: 'transparent',
    color: 'var(--fm-mid)',
    fontSize: 12,
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  } as const
}

function tinyDangerButtonStyle() {
  return {
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid var(--fm-red-bdr)',
    background: 'var(--fm-red-bg)',
    color: 'var(--fm-red)',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  } as const
}

function moveItem(items: string[], from: number, to: number) {
  if (to < 0 || to >= items.length) {
    return items
  }

  const next = [...items]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

function mergeRouteStations(
  selectedIds: string[],
  routeStations: Array<{ order: number; station: Station }>,
) {
  const merged = [...selectedIds]

  for (const item of [...routeStations].sort((a, b) => a.order - b.order)) {
    if (!merged.includes(item.station.id)) {
      merged.push(item.station.id)
    }
  }

  return merged
}
