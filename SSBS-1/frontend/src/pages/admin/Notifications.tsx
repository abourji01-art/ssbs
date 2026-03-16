// @ts-nocheck
import { useState, useMemo } from 'react';
import { Send, Info, CheckCircle, AlertTriangle, AlertCircle, Filter, BellOff } from 'lucide-react';
import { useNotifications, useCreateNotification } from '../../hooks/useApi';
import Modal from '../../components/admin/Modal';
import { SkeletonList } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { SnakeCard } from '../../components/ui/SnakeCard';

const iconMap = {
  info: { Icon: Info, color: 'text-sky-500', bg: 'bg-sky-50' },
  success: { Icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  warning: { Icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
  alert: { Icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
} as const;

type FilterType = 'All' | 'Unread' | 'Sent';

interface FormErrors { [key: string]: string; }

const Notifications = () => {
  const { data: notifications = [], isLoading, isError, refetch } = useNotifications();
  const createNotification = useCreateNotification();
  const { toast } = useToast();
  const [filter, setFilter] = useState<FilterType>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ target: 'All Users', title: '', message: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formTouched, setFormTouched] = useState<Record<string, boolean>>({});

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    if (filter === 'All') return notifications;
    if (filter === 'Unread') return notifications.filter((n) => !n.is_read);
    // "Sent" → broadcast (no specific target_role)
    return notifications.filter((n) => n.target_role === null);
  }, [filter, notifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const validateField = (key: string, value: string): string => {
    switch (key) {
      case 'title': return !value.trim() ? 'Title is required' : '';
      case 'message':
        if (!value.trim()) return 'Message is required';
        if (value.trim().length < 10) return 'Message must be at least 10 characters';
        return '';
      default: return '';
    }
  };

  const handleFieldBlur = (key: string) => {
    setFormTouched((p) => ({ ...p, [key]: true }));
    setFormErrors((p) => ({ ...p, [key]: validateField(key, (formData as Record<string, string>)[key]) }));
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
    if (formTouched[key]) setFormErrors((p) => ({ ...p, [key]: validateField(key, value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: FormErrors = {};
    errors.title = validateField('title', formData.title);
    errors.message = validateField('message', formData.message);
    setFormErrors(errors);
    setFormTouched({ title: true, message: true });
    if (errors.title || errors.message) return;

    try {
      await createNotification.mutateAsync({
        title: formData.title,
        message: formData.message,
        target_role:
          formData.target === 'Students Only'
            ? 'STUDENT'
            : formData.target === 'Drivers Only'
            ? 'DRIVER'
            : formData.target === 'Admins Only'
            ? 'LOGISTICS_STAFF'
            : null,
      });
      toast('Notification sent!');
      setModalOpen(false);
      setFormData({ target: 'All Users', title: '', message: '' });
      setFormErrors({});
      setFormTouched({});
    } catch {
      toast('Failed to send notification');
    }
  };

  if (isLoading) return <SkeletonList items={5} />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <SnakeCard index={0}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary-900">Notifications</h2>
          <p className="text-sm text-slate-400 mt-1">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:border-primary-300 transition-all"
            style={{ opacity: refreshing ? 0.6 : 1, cursor: refreshing ? 'not-allowed' : 'pointer' }}
          >
            {refreshing ? '↻ …' : '↻ Refresh'}
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            Send Notification
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        {(['All', 'Unread', 'Sent'] as FilterType[]).map((f) => (
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
      </SnakeCard>

      {/* Notification list */}
      <SnakeCard index={1}>
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<BellOff className="w-8 h-8 text-slate-300" />}
            title="No notifications to show"
            subtitle="All clear — nothing to display right now."
          />
        ) : (
          filtered.map((n) => {
            const iconKey =
              n.target_role === 'LOGISTICS_STAFF'
                ? 'info'
                : n.target_role === 'DRIVER'
                ? 'warning'
                : n.target_role === 'STUDENT'
                ? 'success'
                : 'alert';
            const { Icon, color, bg } = iconMap[iconKey];
            return (
              <div
                key={n.id}
                className={`bg-white rounded-2xl border p-4 flex items-start gap-4 transition-all hover:shadow-lg hover:shadow-primary-100/30 ${
                  !n.is_read ? 'border-primary-200 bg-primary-50/30' : 'border-slate-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-primary-900">{n.title}</h3>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                    )}
                    {n.target_role === null && (
                      <span className="px-2 py-0.5 rounded-md bg-primary-50 text-primary-600 text-[10px] font-bold uppercase tracking-wider">Sent</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
            );
          })
        )}
      </div>
      </SnakeCard>

      {/* Send Notification Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setFormErrors({}); setFormTouched({}); }} title="Send Notification">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Audience</label>
            <select
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all cursor-pointer"
            >
              <option>All Users</option>
              <option>Students Only</option>
              <option>Drivers Only</option>
              <option>Admins Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
            <input
              type="text"
              placeholder="Notification title"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              onBlur={() => handleFieldBlur('title')}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 outline-none transition-all placeholder:text-slate-300 ${
                formTouched.title && formErrors.title
                  ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                  : 'border-slate-200 focus:ring-primary-500/20 focus:border-primary-500'
              }`}
            />
            {formTouched.title && formErrors.title && (
              <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.title}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
            <textarea
              placeholder="Write your notification message…"
              value={formData.message}
              onChange={(e) => handleFieldChange('message', e.target.value)}
              onBlur={() => handleFieldBlur('message')}
              rows={4}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 outline-none transition-all placeholder:text-slate-300 resize-none ${
                formTouched.message && formErrors.message
                  ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                  : 'border-slate-200 focus:ring-primary-500/20 focus:border-primary-500'
              }`}
            />
            {formTouched.message && formErrors.message && (
              <p className="mt-1 text-xs text-red-500 font-medium">{formErrors.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all">Send</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Notifications;
