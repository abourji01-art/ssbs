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
  createTrip,
  deleteTrip,
  getBuses,
  getDrivers,
  getRoutes,
  getTrips,
  updateTrip,
} from '../../services/api'
import type { Trip, TripCreate, TripUpdate } from '../../types/api'

const TESTING_MODE = import.meta.env.VITE_TESTING_MODE === 'true'

type TripStatus = 'scheduled' | 'completed' | 'archived' | 'full'

function getTripStatus(trip: Trip): TripStatus {
  if (trip.archived_at !== null) return 'archived'
  if (new Date(trip.departure_datetime) < new Date()) return 'completed'
  if (trip.seats_left === 0) return 'full'
  return 'scheduled'
}

const STATUS_LABELS: Record<TripStatus, string> = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  archived: 'Archived',
  full: 'Full',
}

const STATUS_STYLES: Record<TripStatus, { color: string; bg: string; border: string }> = {
  scheduled: { color: 'var(--fm-blue)', bg: 'var(--fm-blue-bg)', border: 'var(--fm-blue-bdr)' },
  completed: { color: 'var(--fm-green)', bg: 'var(--fm-green-bg)', border: 'var(--fm-green-bdr)' },
  archived: { color: 'var(--fm-dim)', bg: 'var(--fm-bg)', border: 'var(--fm-line)' },
  full: { color: 'var(--fm-amber)', bg: 'var(--fm-amber-bg)', border: 'var(--fm-amber-bdr)' },
}

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
  green: 'var(--fm-green)',
  greenBg: 'var(--fm-green-bg)',
  greenBdr: 'var(--fm-green-bdr)',
  amber: 'var(--fm-amber)',
  amberBg: 'var(--fm-amber-bg)',
  amberBdr: 'var(--fm-amber-bdr)',
  red: 'var(--fm-red)',
  redBg: 'var(--fm-red-bg)',
  redBdr: 'var(--fm-red-bdr)',
  mono: 'var(--fm-mono)',
} as const

const TRIPS_QUERY_KEY = ['trips'] as const

type TripFormState = {
  route: string
  bus: string
  driver: string
  departure_datetime: string
}

const EMPTY_FORM: TripFormState = {
  route: '',
  bus: '',
  driver: '',
  departure_datetime: '',
}

export default function Trips() {
  const qc = useQueryClient()
  const { isStaff } = useAuth()
  const { toast } = useToast()
  const [createForm, setCreateForm] = useState<TripFormState>(EMPTY_FORM)
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingForm, setEditingForm] = useState<TripFormState>(EMPTY_FORM)
  const [editingErrors, setEditingErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)
  const [isPhone, setIsPhone] = useState(() => window.innerWidth < 760)
  const [filterStatus, setFilterStatus] = useState<'all' | TripStatus>('all')
  const [filterRoute, setFilterRoute] = useState<string>('all')

  useEffect(() => {
    const handleResize = () => setIsPhone(window.innerWidth < 760)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const tripsQuery = useQuery({ queryKey: TRIPS_QUERY_KEY, queryFn: getTrips })
  const routesQuery = useQuery({ queryKey: ['routes'], queryFn: getRoutes })
  const busesQuery = useQuery({ queryKey: ['buses'], queryFn: getBuses })
  const driversQuery = useQuery({ queryKey: ['drivers'], queryFn: getDrivers })

  const trips = tripsQuery.data ?? []
  const routes = routesQuery.data ?? []
  const buses = busesQuery.data ?? []
  const drivers = driversQuery.data ?? []

  const filteredTrips = trips.filter((trip) => {
    if (filterStatus !== 'all' && getTripStatus(trip) !== filterStatus) return false
    if (filterRoute !== 'all' && trip.route !== filterRoute) return false
    return true
  })

  const createMutation = useMutation({
    mutationFn: (payload: TripCreate) => createTrip(payload),
    onSuccess: () => {
      setCreateForm(EMPTY_FORM)
      setCreateErrors({})
      qc.invalidateQueries({ queryKey: TRIPS_QUERY_KEY })
      toast('Trip created.')
    },
    onError: (error) => {
      setCreateErrors(flattenErrors(getValidationErrors(error)))
      toast(getErrorMessage(error), 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TripUpdate }) => updateTrip(id, payload),
    onSuccess: () => {
      setEditingId(null)
      setEditingForm(EMPTY_FORM)
      setEditingErrors({})
      qc.invalidateQueries({ queryKey: TRIPS_QUERY_KEY })
      toast('Trip updated.')
    },
    onError: (error) => {
      setEditingErrors(flattenErrors(getValidationErrors(error)))
      toast(getErrorMessage(error), 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTrip(id),
    onSuccess: () => {
      setDeleteTarget(null)
      qc.invalidateQueries({ queryKey: TRIPS_QUERY_KEY })
      toast('Trip deleted.')
    },
    onError: (error) => {
      setDeleteTarget(null)
      qc.invalidateQueries({ queryKey: TRIPS_QUERY_KEY })
      toast(getErrorMessage(error), 'error')
    },
  })

  if (tripsQuery.isLoading) {
    return <Spinner text="Loading trips…" />
  }

  if (tripsQuery.isError) {
    return (
      <ErrorState
        title="Could not load trips"
        subtitle={getErrorMessage(tripsQuery.error)}
        onRetry={() => void tripsQuery.refetch()}
      />
    )
  }

  const routeName = (id: string) => routes.find((r) => r.id === id)?.name ?? id.slice(0, 8) + '…'
  const busName = (id: string) => buses.find((b) => b.id === id)?.name ?? id.slice(0, 8) + '…'
  const driverName = (id: string) => drivers.find((d) => d.id === id)?.name ?? id.slice(0, 8) + '…'

  function validateCreate(form: TripFormState): Record<string, string> {
    const errs: Record<string, string> = {}
    if (!form.route) errs.route = 'Route is required.'
    if (!form.bus) errs.bus = 'Bus is required.'
    if (!form.driver) errs.driver = 'Driver is required.'
    if (!form.departure_datetime) errs.departure_datetime = 'Departure date/time is required.'
    return errs
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {TESTING_MODE && (
        <div style={{
          padding: '10px 14px', borderRadius: 8,
          background: V.amberBg, border: `1px solid ${V.amberBdr}`,
          color: V.amber, fontSize: 13, fontWeight: 600,
        }}>
          ⚠ Testing Mode — trips shown at all hours
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: V.ink, margin: 0 }}>Trips</h2>
          <p style={{ fontSize: 12, color: V.dim, margin: '6px 0 0' }}>
            Schedule trips by assigning a route, bus, driver, and departure time.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: V.dim }}>{filteredTrips.length} / {trips.length} trips</span>
          <button
            onClick={() => void tripsQuery.refetch()}
            disabled={tripsQuery.isFetching}
            style={{
              background: 'transparent', border: `1px solid ${V.line}`,
              borderRadius: 8, color: V.mid, cursor: tripsQuery.isFetching ? 'wait' : 'pointer',
              width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}
            aria-label="Refresh"
          >
            {tripsQuery.isFetching ? '…' : '↻'}
          </button>
        </div>
      </div>

      {isStaff && (
        <section style={{
          background: V.white,
          border: `1px solid ${V.line}`,
          borderRadius: 12,
          padding: 16,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: V.ink, marginBottom: 12 }}>Schedule a trip</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isPhone ? '1fr' : 'minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1.3fr) auto',
            gap: 10,
          }}>
            <select
              value={createForm.route}
              onChange={(e) => {
                setCreateForm((f) => ({ ...f, route: e.target.value }))
                setCreateErrors((f) => ({ ...f, route: '' }))
              }}
              style={inputStyle(!!createErrors.route)}
            >
              <option value="">Select route…</option>
              {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>

            <select
              value={createForm.bus}
              onChange={(e) => {
                setCreateForm((f) => ({ ...f, bus: e.target.value }))
                setCreateErrors((f) => ({ ...f, bus: '' }))
              }}
              style={inputStyle(!!createErrors.bus)}
            >
              <option value="">Select bus…</option>
              {buses.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.plate})</option>)}
            </select>

            <select
              value={createForm.driver}
              onChange={(e) => {
                setCreateForm((f) => ({ ...f, driver: e.target.value }))
                setCreateErrors((f) => ({ ...f, driver: '' }))
              }}
              style={inputStyle(!!createErrors.driver)}
            >
              <option value="">Select driver…</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>

            <input
              type="datetime-local"
              value={createForm.departure_datetime}
              onChange={(e) => {
                setCreateForm((f) => ({ ...f, departure_datetime: e.target.value }))
                setCreateErrors((f) => ({ ...f, departure_datetime: '' }))
              }}
              style={inputStyle(!!createErrors.departure_datetime)}
            />

            <button
              onClick={() => {
                const errs = validateCreate(createForm)
                if (Object.keys(errs).length > 0) {
                  setCreateErrors(errs)
                  return
                }
                createMutation.mutate({
                  route: createForm.route,
                  bus: createForm.bus,
                  driver: createForm.driver,
                  departure_datetime: new Date(createForm.departure_datetime).toISOString(),
                })
              }}
              disabled={createMutation.isPending}
              style={primaryButtonStyle()}
            >
              {createMutation.isPending ? 'Adding…' : 'Add Trip'}
            </button>
          </div>
          {renderFormErrors(createErrors)}
        </section>
      )}

      <section style={{
        background: V.white,
        border: `1px solid ${V.line}`,
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {/* Filters row */}
        <div style={{
          padding: '12px 16px', borderBottom: `1px solid ${V.line}`,
          display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {(['all', 'scheduled', 'full', 'completed', 'archived'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                  cursor: 'pointer',
                  border: filterStatus === s ? `1px solid ${V.blue}` : `1px solid ${V.line}`,
                  background: filterStatus === s ? V.blueBg : 'transparent',
                  color: filterStatus === s ? V.blue : V.mid,
                  textTransform: 'capitalize',
                }}
              >
                {s === 'all' ? 'All' : STATUS_LABELS[s as TripStatus]}
              </button>
            ))}
          </div>
          <div style={{ height: 14, width: 1, background: V.line, flexShrink: 0 }} />
          <select
            value={filterRoute}
            onChange={(e) => setFilterRoute(e.target.value)}
            style={{
              padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500,
              border: `1px solid ${V.line}`, background: V.bg, color: V.mid, cursor: 'pointer',
            }}
          >
            <option value="all">All routes</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        {filteredTrips.length === 0 ? (
          <EmptyState
            icon="🕐"
            title={trips.length === 0 ? 'No trips yet' : 'No trips match filters'}
            subtitle={
              trips.length === 0
                ? (isStaff ? 'Schedule the first trip above.' : 'Trips will appear here once scheduled.')
                : 'Try changing the status or route filter.'
            }
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredTrips.map((trip) => {
              const isEditing = editingId === trip.id
              const isArchived = trip.archived_at !== null

              return (
                <div
                  key={trip.id}
                  style={{
                    padding: 16,
                    borderBottom: `1px solid ${V.line}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    opacity: isArchived ? 0.65 : 1,
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
                          gridTemplateColumns: isPhone ? '1fr' : 'minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1.3fr)',
                          gap: 10,
                        }}>
                          <select
                            value={editingForm.route}
                            onChange={(e) => {
                              setEditingForm((f) => ({ ...f, route: e.target.value }))
                              setEditingErrors((f) => ({ ...f, route: '' }))
                            }}
                            style={inputStyle(!!editingErrors.route)}
                          >
                            <option value="">Select route…</option>
                            {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                          </select>

                          <select
                            value={editingForm.bus}
                            onChange={(e) => {
                              setEditingForm((f) => ({ ...f, bus: e.target.value }))
                              setEditingErrors((f) => ({ ...f, bus: '' }))
                            }}
                            style={inputStyle(!!editingErrors.bus)}
                          >
                            <option value="">Select bus…</option>
                            {buses.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.plate})</option>)}
                          </select>

                          <select
                            value={editingForm.driver}
                            onChange={(e) => {
                              setEditingForm((f) => ({ ...f, driver: e.target.value }))
                              setEditingErrors((f) => ({ ...f, driver: '' }))
                            }}
                            style={inputStyle(!!editingErrors.driver)}
                          >
                            <option value="">Select driver…</option>
                            {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>

                          <input
                            type="datetime-local"
                            value={editingForm.departure_datetime}
                            onChange={(e) => {
                              setEditingForm((f) => ({ ...f, departure_datetime: e.target.value }))
                              setEditingErrors((f) => ({ ...f, departure_datetime: '' }))
                            }}
                            style={inputStyle(!!editingErrors.departure_datetime)}
                          />
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: V.ink }}>
                              {routeName(trip.route)}
                            </div>
                            <StatusBadge trip={trip} />
                            <SeatsBadge seats={trip.seats_left} />
                          </div>
                          <div style={{ fontSize: 12, color: V.dim, marginTop: 4 }}>
                            {busName(trip.bus)} · {driverName(trip.driver)} · {formatDatetime(trip.departure_datetime)}
                          </div>
                        </>
                      )}
                    </div>

                    {isStaff && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => {
                                const errs = validateCreate(editingForm)
                                if (Object.keys(errs).length > 0) {
                                  setEditingErrors(errs)
                                  return
                                }
                                updateMutation.mutate({
                                  id: trip.id,
                                  payload: {
                                    route: editingForm.route,
                                    bus: editingForm.bus,
                                    driver: editingForm.driver,
                                    departure_datetime: new Date(editingForm.departure_datetime).toISOString(),
                                  },
                                })
                              }}
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
                                setEditingId(trip.id)
                                setEditingForm({
                                  route: trip.route,
                                  bus: trip.bus,
                                  driver: trip.driver,
                                  departure_datetime: toLocalDatetimeInput(trip.departure_datetime),
                                })
                                setEditingErrors({})
                              }}
                              style={secondaryButtonStyle()}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ id: trip.id, label: `${routeName(trip.route)} · ${formatDatetime(trip.departure_datetime)}` })}
                              style={dangerButtonStyle()}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {isEditing && renderFormErrors(editingErrors)}
                </div>
              )
            })}
          </div>
        )}
      </section>

      <ConfirmationDialog
        open={!!deleteTarget}
        title="Delete trip?"
        message={`Delete "${deleteTarget?.label}"? All reservations for this trip will also be removed.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        busy={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id)
        }}
      />
    </div>
  )
}

function flattenErrors(errors: Record<string, string[]>) {
  return Object.fromEntries(
    Object.entries(errors).map(([key, value]) => [key, value[0] ?? 'Invalid value.']),
  )
}

function renderFormErrors(errors: Record<string, string>) {
  const entries = Object.entries(errors).filter(([, v]) => v)
  if (entries.length === 0) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
      {entries.map(([field, message]) => (
        <div key={field} style={{ fontSize: 12, color: V.red }}>{message}</div>
      ))}
    </div>
  )
}

function formatDatetime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

function toLocalDatetimeInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function StatusBadge({ trip }: { trip: Trip }) {
  const s = getTripStatus(trip)
  const style = STATUS_STYLES[s]
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
      color: style.color, background: style.bg, border: `1px solid ${style.border}`,
    }}>
      {STATUS_LABELS[s]}
    </span>
  )
}

function SeatsBadge({ seats }: { seats: number }) {
  const palette = seats === 0
    ? { color: V.red, background: V.redBg, border: V.redBdr }
    : seats <= 3
      ? { color: V.amber, background: V.amberBg, border: V.amberBdr }
      : { color: V.green, background: V.greenBg, border: V.greenBdr }
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 999,
      color: palette.color, background: palette.background, border: `1px solid ${palette.border}`,
    }}>
      {seats} seats left
    </span>
  )
}

function ArchivedBadge() {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 999,
      color: V.dim, background: V.bg, border: `1px solid ${V.line}`,
    }}>
      Archived
    </span>
  )
}

function inputStyle(hasError: boolean) {
  return {
    padding: '10px 12px',
    borderRadius: 8,
    border: `1px solid ${hasError ? V.red : V.line}`,
    background: V.bg,
    color: V.ink,
    fontSize: 14,
    outline: 'none',
    width: '100%',
    minWidth: 0,
  } as const
}

function primaryButtonStyle() {
  return {
    padding: '10px 16px',
    borderRadius: 8,
    border: 'none',
    background: V.blue,
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  } as const
}

function secondaryButtonStyle() {
  return {
    padding: '9px 14px',
    borderRadius: 8,
    border: `1px solid ${V.line}`,
    background: 'transparent',
    color: V.mid,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  } as const
}

function dangerButtonStyle() {
  return {
    padding: '9px 14px',
    borderRadius: 8,
    border: `1px solid ${V.redBdr}`,
    background: V.redBg,
    color: V.red,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  } as const
}
