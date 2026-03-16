// @ts-nocheck
// ── React Query hooks for all API resources ──

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ── Services ──
import * as busService from '../services/bus.service';
import * as routeService from '../services/route.service';
import * as tripService from '../services/trip.service';
import * as reservationService from '../services/reservation.service';
import * as userService from '../services/user.service';
import * as orgService from '../services/organization.service';
import * as reportService from '../services/report.service';
import * as notificationService from '../services/notification.service';

// ── Types ──
import type {
  BusCreate, BusUpdate,
  ApiRouteCreate, ApiRouteUpdate,
  TripCreate, TripUpdate,
  ReservationCreate,
  UserCreate, UserUpdate,
  OrganizationCreate,
} from '../types/api';

// ═══════════════════════════════════════
//  Query Keys
// ═══════════════════════════════════════

export const queryKeys = {
  buses: ['buses'] as const,
  bus: (id: number) => ['buses', id] as const,
  routes: ['routes'] as const,
  route: (id: string) => ['routes', id] as const,
  trips: ['trips'] as const,
  trip: (id: string) => ['trips', id] as const,
  reservations: ['reservations'] as const,
  reservation: (id: string) => ['reservations', id] as const,
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  organizations: ['organizations'] as const,
  organization: (id: number) => ['organizations', id] as const,
  reports: ['reports'] as const,
  notifications: ['notifications'] as const,
};

// ═══════════════════════════════════════
//  Buses
// ═══════════════════════════════════════

export function useBuses() {
  return useQuery({ queryKey: queryKeys.buses, queryFn: busService.getBuses });
}

export function useBus(id: number) {
  return useQuery({ queryKey: queryKeys.bus(id), queryFn: () => busService.getBus(id), enabled: !!id });
}

export function useCreateBus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BusCreate) => busService.createBus(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.buses }),
  });
}

export function useUpdateBus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BusUpdate }) => busService.updateBus(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.buses }),
  });
}

export function useDeleteBus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => busService.deleteBus(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.buses }),
  });
}

// ═══════════════════════════════════════
//  Routes
// ═══════════════════════════════════════

export function useRoutes() {
  return useQuery({ queryKey: queryKeys.routes, queryFn: routeService.getRoutes });
}

export function useRoute(id: number) {
  return useQuery({ queryKey: queryKeys.route(id), queryFn: () => routeService.getRoute(id), enabled: !!id });
}

export function useCreateRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApiRouteCreate) => routeService.createRoute(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.routes }),
  });
}

export function useUpdateRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ApiRouteUpdate }) => routeService.updateRoute(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.routes }),
  });
}

export function useDeleteRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => routeService.deleteRoute(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.routes }),
  });
}

// ═══════════════════════════════════════
//  Trips
// ═══════════════════════════════════════

export function useTrips() {
  return useQuery({ queryKey: queryKeys.trips, queryFn: tripService.getTrips });
}

export function useTrip(id: string) {
  return useQuery({ queryKey: queryKeys.trip(id), queryFn: () => tripService.getTrip(id), enabled: !!id });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TripCreate) => tripService.createTrip(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.trips }),
  });
}

export function useUpdateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TripUpdate }) => tripService.updateTrip(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.trips }),
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tripService.deleteTrip(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.trips }),
  });
}

export function useStartTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tripService.updateTrip(id, { status: 'STARTED' } as any),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.trips }),
  });
}

export function useEndTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tripService.updateTrip(id, { status: 'ENDED' } as any),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.trips }),
  });
}

// ═══════════════════════════════════════
//  Reservations
// ═══════════════════════════════════════

export function useReservations() {
  return useQuery({ queryKey: queryKeys.reservations, queryFn: reservationService.getReservations });
}

export function useReservation(id: number) {
  return useQuery({ queryKey: queryKeys.reservation(id), queryFn: () => reservationService.getReservation(id), enabled: !!id });
}

export function useCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReservationCreate) => reservationService.createReservation(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.reservations });
      qc.invalidateQueries({ queryKey: queryKeys.trips }); // seats_left changes
    },
  });
}

export function useCancelReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reservationService.cancelReservation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.reservations });
      qc.invalidateQueries({ queryKey: queryKeys.trips });
    },
  });
}

// ═══════════════════════════════════════
//  Users
// ═══════════════════════════════════════

export function useUsers() {
  return useQuery({ queryKey: queryKeys.users, queryFn: userService.getUsers });
}

export function useUser(id: number) {
  return useQuery({ queryKey: queryKeys.user(id), queryFn: () => userService.getUser(id), enabled: !!id });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserCreate) => userService.createUser(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UserUpdate }) => userService.updateUser(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users }),
  });
}

// ═══════════════════════════════════════
//  Organizations
// ═══════════════════════════════════════

export function useOrganizations() {
  return useQuery({ queryKey: queryKeys.organizations, queryFn: orgService.getOrganizations });
}

export function useOrganization(id: number) {
  return useQuery({ queryKey: queryKeys.organization(id), queryFn: () => orgService.getOrganization(id), enabled: !!id });
}

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: OrganizationCreate) => orgService.createOrganization(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.organizations }),
  });
}

export function useUpdateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<OrganizationCreate> }) =>
      orgService.updateOrganization(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.organizations }),
  });
}

export function useDeleteOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => orgService.deleteOrganization(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.organizations }),
  });
}

// ═══════════════════════════════════════
//  Reports
// ═══════════════════════════════════════

export function useReports() {
  return useQuery({ queryKey: queryKeys.reports, queryFn: reportService.getReports });
}

// ═══════════════════════════════════════
//  Notifications
// ═══════════════════════════════════════

export function useNotifications() {
  return useQuery({ queryKey: queryKeys.notifications, queryFn: notificationService.getNotifications });
}

export function useCreateNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { target: string, title: string, message: string }) => notificationService.createNotification(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}
