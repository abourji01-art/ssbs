// @ts-nocheck
import { useState, useMemo } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Clock, Info, Filter, CheckCheck, BellOff } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { getNotifications } from '../../services/api';
import { SkeletonList } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';

const typeConfig: Record<string, { Icon: typeof Info; color: string; bg: string }> = {
  reservation: { Icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  route_change: { Icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
  delay: { Icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
  cancellation: { Icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
  system: { Icon: Info, color: 'text-sky-500', bg: 'bg-sky-50' },
  sent: { Icon: Info, color: 'text-indigo-500', bg: 'bg-indigo-50' },
};

type NotifFilter = 'All' | 'Unread';

const PassengerNotificationsPage = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const { data: notifications = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => getNotifications(userId),
    enabled: !!userId,
  });
  const [filter, setFilter] = useState<NotifFilter>('All');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (filter === 'All') return notifications;
    return notifications.filter((n) => !readIds.has(n.id));
  }, [filter, readIds, notifications]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id) && !n.is_read).length;

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  };

  if (isLoading) return <SkeletonList items={5} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          {(['All', 'Unread'] as NotifFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-primary-300'
              }`}
            >
              {f}
              {f === 'Unread' && unreadCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-[11px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-500 hover:text-accent-600 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<BellOff className="w-8 h-8 text-slate-300" />}
          title="You're all caught up!"
          subtitle="No new notifications."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const config = typeConfig['system'];
            const { Icon, color, bg } = config;
            const isUnread = !readIds.has(n.id) && !n.is_read;

            return (
              <div
                key={n.id}
                onClick={() => {
                  if (isUnread) setReadIds((prev) => new Set([...prev, n.id]));
                }}
                className={`bg-white rounded-2xl border p-4 flex items-start gap-4 transition-all hover:shadow-lg hover:shadow-primary-100/30 cursor-pointer ${
                  isUnread
                    ? 'border-primary-200 bg-primary-50/30'
                    : 'border-slate-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-primary-900">{n.title}</h3>
                    {isUnread && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PassengerNotificationsPage;
