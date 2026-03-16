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
  createBus,
  deleteBus,
  getBuses,
  updateBus,
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

const BUSES_QUERY_KEY = ['buses'] as const

type BusFormState = {
  name: string
  plate: string
  seat_capacity: string
}

const EMPTY_FORM: BusFormState = {
  name: '',
  plate: '',
  seat_capacity: '',
}

export default function Buses() {
  const qc = useQueryClient()
  const { isStaff } = useAuth()
  const { toast } = useToast()
  const [createForm, setCreateForm] = useState<BusFormState>(EMPTY_FORM)
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingForm, setEditingForm] = useState<BusFormState>(EMPTY_FORM)
  const [editingErrors, setEditingErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [isPhone, setIsPhone] = useState(() => window.innerWidth < 760)

  useEffect(() => {
    const handleResize = () => setIsPhone(window.innerWidth < 760)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const busesQuery = useQuery({
    queryKey: BUSES_QUERY_KEY,
    queryFn: getBuses,
  })

  const buses = busesQuery.data ?? []

  const createMutation = useMutation({
    mutationFn: createBus,
    onSuccess: () => {
      setCreateForm(EMPTY_FORM)
      setCreateErrors({})
      qc.invalidateQueries({ queryKey: BUSES_QUERY_KEY })
      toast('Bus created.')
    },
    onError: (error) => {
      setCreateErrors(flattenErrors(getValidationErrors(error)))
      toast(getErrorMessage(error), 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string; plate: string; seat_capacity: number } }) =>
      updateBus(id, payload),
    onSuccess: () => {
      setEditingId(null)
      setEditingForm(EMPTY_FORM)
      setEditingErrors({})
      qc.invalidateQueries({ queryKey: BUSES_QUERY_KEY })
      toast('Bus updated.')
    },
    onError: (error) => {
      setEditingErrors(flattenErrors(getValidationErrors(error)))
      toast(getErrorMessage(error), 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBus,
    onSuccess: () => {
      setDeleteTarget(null)
      qc.invalidateQueries({ queryKey: BUSES_QUERY_KEY })
      toast('Bus deleted.')
    },
    onError: (error) => {
      setDeleteTarget(null)
      toast(getErrorMessage(error), 'error')
    },
  })

  if (busesQuery.isLoading) {
    return <Spinner text="Loading buses…" />
  }

  if (busesQuery.isError) {
    return (
      <ErrorState
        title="Could not load buses"
        subtitle={getErrorMessage(busesQuery.error)}
        onRetry={() => void busesQuery.refetch()}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: V.ink, margin: 0 }}>Buses</h2>
          <p style={{ fontSize: 12, color: V.dim, margin: '6px 0 0' }}>
            Authenticated users can read buses. Only logistics staff can create, update, or delete them.
          </p>
        </div>
        <span style={{ fontSize: 12, color: V.dim }}>{buses.length} buses</span>
      </div>

      {isStaff && (
        <section style={{
          background: V.white,
          border: `1px solid ${V.line}`,
          borderRadius: 12,
          padding: 16,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: V.ink, marginBottom: 12 }}>Create bus</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isPhone ? '1fr' : 'minmax(0, 1.2fr) minmax(0, 1fr) 160px auto',
            gap: 10,
          }}>
            <input
              value={createForm.name}
              onChange={(event) => {
                setCreateForm((current) => ({ ...current, name: event.target.value }))
                setCreateErrors((current) => ({ ...current, name: '' }))
              }}
              placeholder="Bus name"
              style={inputStyle(!!createErrors.name)}
            />
            <input
              value={createForm.plate}
              onChange={(event) => {
                setCreateForm((current) => ({ ...current, plate: event.target.value }))
                setCreateErrors((current) => ({ ...current, plate: '' }))
              }}
              placeholder="Plate"
              style={inputStyle(!!createErrors.plate)}
            />
            <input
              type="number"
              min="1"
              value={createForm.seat_capacity}
              onChange={(event) => {
                setCreateForm((current) => ({ ...current, seat_capacity: event.target.value }))
                setCreateErrors((current) => ({ ...current, seat_capacity: '' }))
              }}
              placeholder="Seats"
              style={inputStyle(!!createErrors.seat_capacity)}
            />
            <button
              onClick={() => {
                const payload = normalizeBusForm(createForm)
                if (!payload) {
                  setCreateErrors((current) => ({
                    ...current,
                    seat_capacity: current.seat_capacity || 'Seat capacity must be a positive number.',
                  }))
                  return
                }
                createMutation.mutate(payload)
              }}
              disabled={createMutation.isPending}
              style={primaryButtonStyle()}
            >
              {createMutation.isPending ? 'Adding…' : 'Add Bus'}
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
        {buses.length === 0 ? (
          <EmptyState
            icon="🚌"
            title="No buses yet"
            subtitle={isStaff ? 'Create the first bus before configuring trips.' : 'Buses will appear here once available.'}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {buses.map((bus) => {
              const isEditing = editingId === bus.id

              return (
                <div
                  key={bus.id}
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
                          gridTemplateColumns: isPhone ? '1fr' : 'minmax(0, 1.2fr) minmax(0, 1fr) 140px',
                          gap: 10,
                        }}>
                          <input
                            value={editingForm.name}
                            onChange={(event) => {
                              setEditingForm((current) => ({ ...current, name: event.target.value }))
                              setEditingErrors((current) => ({ ...current, name: '' }))
                            }}
                            placeholder="Bus name"
                            style={inputStyle(!!editingErrors.name)}
                          />
                          <input
                            value={editingForm.plate}
                            onChange={(event) => {
                              setEditingForm((current) => ({ ...current, plate: event.target.value }))
                              setEditingErrors((current) => ({ ...current, plate: '' }))
                            }}
                            placeholder="Plate"
                            style={inputStyle(!!editingErrors.plate)}
                          />
                          <input
                            type="number"
                            min="1"
                            value={editingForm.seat_capacity}
                            onChange={(event) => {
                              setEditingForm((current) => ({ ...current, seat_capacity: event.target.value }))
                              setEditingErrors((current) => ({ ...current, seat_capacity: '' }))
                            }}
                            placeholder="Seats"
                            style={inputStyle(!!editingErrors.seat_capacity)}
                          />
                        </div>
                      ) : (
                        <>
                          <div style={{ fontSize: 18, fontWeight: 700, color: V.ink }}>{bus.name}</div>
                          <div style={{ fontSize: 12, color: V.dim, marginTop: 4 }}>
                            {bus.plate} · {bus.seat_capacity} seats · Created {formatDate(bus.created_at)}
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
                              onClick={() => {
                                const payload = normalizeBusForm(editingForm)
                                if (!payload) {
                                  setEditingErrors((current) => ({
                                    ...current,
                                    seat_capacity: current.seat_capacity || 'Seat capacity must be a positive number.',
                                  }))
                                  return
                                }
                                updateMutation.mutate({ id: bus.id, payload })
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
                                setEditingId(bus.id)
                                setEditingForm({
                                  name: bus.name,
                                  plate: bus.plate,
                                  seat_capacity: String(bus.seat_capacity),
                                })
                                setEditingErrors({})
                              }}
                              style={secondaryButtonStyle()}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ id: bus.id, name: bus.name })}
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
        title="Delete bus?"
        message={`Delete "${deleteTarget?.name}"? The backend will reject this if the bus is already referenced by a trip.`}
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

function normalizeBusForm(form: BusFormState) {
  const seatCapacity = Number(form.seat_capacity)

  if (!form.name.trim() || !form.plate.trim() || !Number.isFinite(seatCapacity) || seatCapacity <= 0) {
    return null
  }

  return {
    name: form.name.trim(),
    plate: form.plate.trim(),
    seat_capacity: seatCapacity,
  }
}

function flattenErrors(errors: Record<string, string[]>) {
  return Object.fromEntries(
    Object.entries(errors).map(([key, value]) => [key, value[0] ?? 'Invalid value.']),
  )
}

function renderFormErrors(errors: Record<string, string>) {
  const entries = Object.entries(errors).filter(([, value]) => value)

  if (entries.length === 0) {
    return null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
      {entries.map(([field, message]) => (
        <div key={field} style={{ fontSize: 12, color: V.red }}>
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
