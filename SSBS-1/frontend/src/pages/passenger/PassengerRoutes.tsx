// @ts-nocheck
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Clock, Users, ChevronDown, ChevronUp, Bus, Ticket } from 'lucide-react';
import { useRoutes, useBuses } from '../../hooks/useApi';
import { SkeletonList } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { SnakeCard } from '../../components/ui/SnakeCard';

const PassengerRoutes = () => {
  const { data: routes = [], isLoading, isError, refetch } = useRoutes();
  const { data: buses = [] } = useBuses();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const getBus = (busId: number) => buses.find((b) => b.id === busId);

  const filtered = useMemo(() => {
    return routes.filter((r) => {
      const bus = getBus(r.bus);
      const matchSearch = r.direction.toLowerCase().includes(search.toLowerCase()) ||
        (bus?.matricule || '').toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [search, routes, buses]);

  if (isLoading) return <SkeletonList items={5} />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (routes.length === 0) return <EmptyState title="No routes available" subtitle="Routes will appear here once created by admin." />;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <SnakeCard index={0}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search routes or stops…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-300 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Search is the only filter now */}
        </div>
      </div>
      </SnakeCard>

      {/* Route cards */}
      <div className="space-y-4">
        {filtered.map((route, i) => {
          const isExpanded = expandedId === route.id;
          const bus = getBus(route.bus);

          return (
            <SnakeCard index={i + 1} key={route.id}>
            <div
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:shadow-primary-100/30 transition-all"
            >
              {/* Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : route.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-primary-900">Route #{route.id} — {route.direction}</h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Bus: {bus?.matricule || '—'} · Capacity: {bus?.capacity || '—'} seats
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                  {/* Info row */}
                  <div className="grid sm:grid-cols-3 gap-4 mb-5">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                      <Clock className="w-4 h-4 text-primary-500" />
                      <div>
                        <p className="text-xs text-slate-400">Direction</p>
                        <p className="text-sm font-semibold text-primary-900">{route.direction}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                      <Users className="w-4 h-4 text-emerald-500" />
                      <div>
                        <p className="text-xs text-slate-400">Bus Capacity</p>
                        <p className="text-sm font-semibold text-primary-900">{bus?.capacity || '—'} seats</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                      <Bus className="w-4 h-4 text-accent-500" />
                      <div>
                        <p className="text-xs text-slate-400">Bus Assigned</p>
                        <p className="text-sm font-semibold text-primary-900">{bus?.matricule || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Reserve button */}
                  <Link
                    to="/student/reserve"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all active:scale-[0.98]"
                  >
                    <Ticket className="w-4 h-4" />
                    Reserve a Seat
                  </Link>
                </div>
              )}
            </div>
            </SnakeCard>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-sm text-slate-400">
            No routes found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default PassengerRoutes;
