// @ts-nocheck
import {
  MapPinned,
  Clock,
  Bus,
  Navigation,
  Milestone,
} from 'lucide-react';
import { useRoutes, useTrips, useBuses } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { SnakeCard } from '../../components/ui/SnakeCard';

const MyRoute = () => {
  const { user } = useAuth();
  const { data: routes = [], isLoading: routesLoading, isError: routesError, refetch: refetchRoutes } = useRoutes();
  const { data: trips = [], isLoading: tripsLoading } = useTrips();
  const { data: buses = [] } = useBuses();

  const isLoading = routesLoading || tripsLoading;
  const isError = routesError;

  // Get the first route as the driver's assigned route
  const myRoute = routes[0];
  const myBus = myRoute ? buses.find((b) => b.id === myRoute.bus) : null;
  const myTrips = myRoute ? trips.filter((t) => t.route === myRoute.id) : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={() => refetchRoutes()} />;
  if (!myRoute) return <EmptyState title="No route assigned" subtitle="You don't have an assigned route yet. Contact your administrator." />;
  return (
    <div className="space-y-6">
      {/* Route header */}
      <SnakeCard index={0}>
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center shrink-0">
              <MapPinned className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-900">Route #{myRoute.id} — {myRoute.direction}</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Bus: {myBus?.matricule || '—'} · Capacity: {myBus?.capacity || '—'} seats
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        </div>
      </div>
      </SnakeCard>

      {/* Route details cards */}
      <SnakeCard index={1}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Navigation, label: 'Direction', value: myRoute.direction, color: 'text-primary-600', bg: 'bg-primary-50' },
          { icon: Milestone, label: 'Route ID', value: `#${myRoute.id}`, color: 'text-accent-500', bg: 'bg-sky-50' },
          { icon: Clock, label: 'Trips Today', value: `${myTrips.length} trips`, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { icon: Bus, label: 'Assigned Bus', value: myBus?.matricule || '—', color: 'text-violet-500', bg: 'bg-violet-50' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-primary-100/30 transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-xl font-bold text-primary-900">{card.value}</p>
              <p className="text-xs text-slate-400 mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>
      </SnakeCard>

      {/* Route info */}
      <SnakeCard index={2}>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-primary-900">Route Info</h3>
        </div>
        <div className="px-6 py-8 flex flex-col gap-3 text-sm text-slate-600">
          <p><span className="font-semibold text-primary-900">Direction:</span> {myRoute.direction}</p>
          <p><span className="font-semibold text-primary-900">Bus:</span> {myBus?.matricule || '—'} (Capacity: {myBus?.capacity ?? '—'})</p>
          <p><span className="font-semibold text-primary-900">Trips for this route:</span> {myTrips.length}</p>
        </div>
      </div>
      </SnakeCard>

      {/* Map placeholder */}
      <SnakeCard index={3}>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-primary-900">Route Map</h3>
        </div>
        <div className="relative h-64 sm:h-80 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 800 320" fill="none">
            <path
              d="M60 260 Q150 40, 300 140 T540 100 T740 200"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="8,6"
              className="text-primary-400"
            />
            {[60, 180, 300, 420, 540, 660, 740].map((x, i) => (
              <circle key={i} cx={x} cy={i % 2 === 0 ? 260 - i * 20 : 100 + i * 15} r="6" className="fill-primary-400" />
            ))}
          </svg>
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-3">
              <MapPinned className="w-8 h-8 text-primary-400" />
            </div>
            <p className="text-sm font-medium text-slate-400">Interactive map coming soon</p>
            <p className="text-xs text-slate-300 mt-1">Google Maps / Mapbox integration</p>
          </div>
        </div>
      </div>
      </SnakeCard>

      {/* Today's trips */}
      <SnakeCard index={4}>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-primary-900">Trips</h3>
          <span className="text-xs text-slate-400">{myTrips.length} trips</span>
        </div>
        {myTrips.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No trips scheduled for this route.</div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Departure</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Route</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myTrips.map((trip) => {
                const statusColors: Record<string, string> = {
                  CREATED: 'bg-sky-50 text-sky-600 border-sky-200',
                  STARTED: 'bg-emerald-50 text-emerald-600 border-emerald-200',
                  ENDED: 'bg-slate-50 text-slate-500 border-slate-200',
                };
                return (
                  <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-bold text-primary-900 whitespace-nowrap">{new Date(trip.depart_time).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">Route #{trip.route}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusColors[trip.status] || statusColors['CREATED']}`}>
                        {trip.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>
      </SnakeCard>
    </div>
  );
};

export default MyRoute;
