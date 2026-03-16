import { useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ConfirmationDialog from '../../components/ui/ConfirmationDialog'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import Spinner from '../../components/ui/Spinner'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage, getValidationErrors } from '../../lib/errorMapper'
import {
  createDriver,
  deleteDriver,
  getDrivers,
  updateDriver,
} from '../../services/api'
import type { Driver, DriverStatus } from '../../types/api'

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
} as const

const DRIVERS_QUERY_KEY = ['drivers'] as const
const STATUS_OPTIONS: DriverStatus[] = ['active', 'inactive']

type DriverFormState = {
  name: string
  username: string
  password: string
  status: DriverStatus
}

const EMPTY_CREATE_FORM: DriverFormState = {
  name: '',
  username: '',
  password: '',
  status: 'active',
}

const EMPTY_EDIT_FORM: DriverFormState = {
  name: '',
  username: '',
  password: '',
  status: 'active',
}

export default function Drivers() {
  const qc = useQueryClient()
  const { isStaff } = useAuth()
  const { toast } = useToast()
  const [createForm, setCreateForm] = useState<DriverFormState>(EMPTY_CREATE_FORM)
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingForm, setEditingForm] = useState<DriverFormState>(EMPTY_EDIT_FORM)
  const [editingErrors, setEditingErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [isPhone, setIsPhone] = useState(() => window.innerWidth < 760)

  useEffect(() => {
    const handleResize = () => setIsPhone(window.innerWidth < 760)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const driversQuery = useQuery({
    queryKey: DRIVERS_QUERY_KEY,
    queryFn: getDrivers,
  })

  const drivers = driversQuery.data ?? []

  const createMutation = useMutation({
    mutationFn: createDriver,
    onSuccess: () => {
      setCreateForm(EMPTY_CREATE_FORM)
      setCreateErrors({})
      qc.invalidateQueries({ queryKey: DRIVERS_QUERY_KEY })
      toast('Driver created.')
    },
    onError: (error) => {
      setCreateErrors(flattenErrors(getValidationErrors(error)))
      toast(getErrorMessage(error), 'error')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, string> }) =>
      updateDriver(id, payload),
    onSuccess: () => {
      setEditingId(null)
      setEditingForm(EMPTY_EDIT_FORM)
      setEditingErrors({})
      qc.invalidateQueries({ queryKey: DRIVERS_QUERY_KEY })
      toast('Driver updated.')
    },
    onError: (error) => {
      setEditingErrors(flattenErrors(getValidationErrors(error)))
      toast(getErrorMessage(error), 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDriver,
    onSuccess: () => {
      setDeleteTarget(null)
      qc.invalidateQueries({ queryKey: DRIVERS_QUERY_KEY })
      toast('Driver deleted.')
    },
    onError: async (error) => {
      setDeleteTarget(null)
      await qc.invalidateQueries({ queryKey: DRIVERS_QUERY_KEY })
      toast(getDeleteMessage(error), 'warning')
    },
  })

  if (driversQuery.isLoading) {
    return <Spinner text="Loading drivers…" />
  }

  if (driversQuery.isError) {
    return (
      <ErrorState
        title="Could not load drivers"
        subtitle={getErrorMessage(driversQuery.error)}
        onRetry={() => void driversQuery.refetch()}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: V.ink, margin: 0 }}>Drivers</h2>
          <p style={{ fontSize: 12, color: V.dim, margin: '6px 0 0' }}>
            Only logistics staff can view and manage drivers. Passwords are write-only and can be changed during edits.
          </p>
        </div>
        <span style={{ fontSize: 12, color: V.dim }}>{drivers.length} drivers</span>
      </div>

      {isStaff && (
        <section style={{
          background: V.white,
          border: `1px solid ${V.line}`,
          borderRadius: 12,
          padding: 16,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: V.ink, marginBottom: 12 }}>Create driver</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isPhone ? '1fr' : 'minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 1fr) 150px auto',
            gap: 10,
          }}>
            <input
              value={createForm.name}
              onChange={(event) => {
                setCreateForm((current) => ({ ...current, name: event.target.value }))
                setCreateErrors((current) => ({ ...current, name: '' }))
              }}
              placeholder="Driver name"
              style={inputStyle(!!createErrors.name)}
            />
            <input
              value={createForm.username}
              onChange={(event) => {
                setCreateForm((current) => ({ ...current, username: event.target.value }))
                setCreateErrors((current) => ({ ...current, username: '' }))
              }}
              placeholder="Username"
              style={inputStyle(!!createErrors.username)}
            />
            <input
              type="password"
              value={createForm.password}
              onChange={(event) => {
                setCreateForm((current) => ({ ...current, password: event.target.value }))
                setCreateErrors((current) => ({ ...current, password: '' }))
              }}
              placeholder="Password"
              style={inputStyle(!!createErrors.password)}
            />
            <select
              value={createForm.status}
              onChange={(event) => setCreateForm((current) => ({ ...current, status: event.target.value as DriverStatus }))}
              style={inputStyle(!!createErrors.status)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <button
              onClick={() => {
                const payload = normalizeCreateForm(createForm)
                if (!payload) {
                  setCreateErrors((current) => ({
                    ...current,
                    name: current.name || 'Name is required.',
                    username: current.username || 'Username is required.',
                    password: current.password || 'Password is required.',
                  }))
                  return
                }
                createMutation.mutate(payload)
              }}
              disabled={createMutation.isPending}
              style={primaryButtonStyle()}
            >
              {createMutation.isPending ? 'Adding…' : 'Add Driver'}
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
        {drivers.length === 0 ? (
          <EmptyState
            icon="🚗"
            title="No drivers yet"
            subtitle={isStaff ? 'Create the first driver account for trip assignments.' : 'Drivers will appear here once available.'}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {drivers.map((driver) => {
              const isEditing = editingId === driver.id

              return (
                <div
                  key={driver.id}
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
                          gridTemplateColumns: isPhone ? '1fr' : 'minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 1fr) 150px',
                          gap: 10,
                        }}>
                          <input
                            value={editingForm.name}
                            onChange={(event) => {
                              setEditingForm((current) => ({ ...current, name: event.target.value }))
                              setEditingErrors((current) => ({ ...current, name: '' }))
                            }}
                            placeholder="Driver name"
                            style={inputStyle(!!editingErrors.name)}
                          />
                          <input
                            value={editingForm.username}
                            onChange={(event) => {
                              setEditingForm((current) => ({ ...current, username: event.target.value }))
                              setEditingErrors((current) => ({ ...current, username: '' }))
                            }}
                            placeholder="Username"
                            style={inputStyle(!!editingErrors.username)}
                          />
                          <input
                            type="password"
                            value={editingForm.password}
                            onChange={(event) => {
                              setEditingForm((current) => ({ ...current, password: event.target.value }))
                              setEditingErrors((current) => ({ ...current, password: '' }))
                            }}
                            placeholder="New password (optional)"
                            style={inputStyle(!!editingErrors.password)}
                          />
                          <select
                            value={editingForm.status}
                            onChange={(event) => {
                              setEditingForm((current) => ({ ...current, status: event.target.value as DriverStatus }))
                              setEditingErrors((current) => ({ ...current, status: '' }))
                            }}
                            style={inputStyle(!!editingErrors.status)}
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <div style={{ fontSize: 18, fontWeight: 700, color: V.ink }}>{driver.name}</div>
                            <StatusBadge status={driver.status} />
                          </div>
                          <div style={{ fontSize: 12, color: V.dim, marginTop: 4 }}>
                            {driver.username} · Created {formatDate(driver.created_at)}
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
                                const payload = normalizeUpdateForm(editingForm)
                                if (!payload) {
                                  setEditingErrors((current) => ({
                                    ...current,
                                    name: current.name || 'Name is required.',
                                    username: current.username || 'Username is required.',
                                  }))
                                  return
                                }
                                updateMutation.mutate({ id: driver.id, payload })
                              }}
                              disabled={updateMutation.isPending}
                              style={primaryButtonStyle()}
                            >
                              {updateMutation.isPending ? 'Saving…' : 'Save'}
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null)
                                setEditingForm(EMPTY_EDIT_FORM)
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
                                setEditingId(driver.id)
                                setEditingForm({
                                  name: driver.name,
                                  username: driver.username,
                                  password: '',
                                  status: driver.status,
                                })
                                setEditingErrors({})
                              }}
                              style={secondaryButtonStyle()}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ id: driver.id, name: driver.name })}
                              style={dangerButtonStyle()}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <>
                      <div style={{ fontSize: 12, color: V.dim }}>
                        Leave password blank to keep the current password unchanged.
                      </div>
                      {renderFormErrors(editingErrors)}
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
        title="Delete driver?"
        message={`Delete "${deleteTarget?.name}"? If the driver is already assigned to trips, the backend will keep the record and mark it inactive instead.`}
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

function normalizeCreateForm(form: DriverFormState) {
  const name = form.name.trim()
  const username = form.username.trim()
  const password = form.password.trim()

  if (!name || !username || !password) {
    return null
  }

  return {
    name,
    username,
    password,
    status: form.status,
  }
}

function normalizeUpdateForm(form: DriverFormState) {
  const name = form.name.trim()
  const username = form.username.trim()

  if (!name || !username) {
    return null
  }

  return {
    name,
    username,
    status: form.status,
    ...(form.password.trim() ? { password: form.password.trim() } : {}),
  }
}

function flattenErrors(errors: Record<string, string[]>) {
  return Object.fromEntries(
    Object.entries(errors).map(([key, value]) => [key, value[0] ?? 'Invalid value.']),
  )
}

function getDeleteMessage(error: unknown) {
  const message = getErrorMessage(error)

  if (error instanceof AxiosError && error.response?.status === 400) {
    return message
  }

  return message
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

function StatusBadge({ status }: { status: DriverStatus }) {
  const palette = status === 'active'
    ? { color: V.green, background: V.greenBg, border: V.greenBdr }
    : { color: V.amber, background: V.amberBg, border: V.amberBdr }

  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: '4px 8px',
        borderRadius: 999,
        color: palette.color,
        background: palette.background,
        border: `1px solid ${palette.border}`,
        textTransform: 'capitalize',
      }}
    >
      {status}
    </span>
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString()
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
