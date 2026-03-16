// @ts-nocheck
import { useState, useMemo } from 'react';
import { Search, UserPlus, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { useUsers, useCreateUser, useDeleteUser } from '../../hooks/useApi';
import type { User } from '../../types/api';
import Modal from '../../components/admin/Modal';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { parseApiError } from '../../lib/errorMapper';
import { SnakeCard } from '../../components/ui/SnakeCard';

const roleBadge: Record<string, string> = {
  LOGISTICS_STAFF: 'bg-purple-50 text-purple-600 border-purple-200',
  STUDENT: 'bg-sky-50 text-sky-600 border-sky-200',
  DRIVER: 'bg-amber-50 text-amber-600 border-amber-200',
};

const UserManagement = () => {
  const { data: users = [], isLoading, isError, refetch } = useUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', role: 'STUDENT' as string,
  });

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch = (u.login_42 || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'All' || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [search, roleFilter, users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser.mutateAsync({
        login_42: formData.username,
        email: formData.email,
        role: formData.role as 'LOGISTICS_STAFF' | 'DRIVER' | 'STUDENT',
      });
      toast('User created successfully!');
      setModalOpen(false);
      setFormData({ username: '', email: '', password: '', role: 'STUDENT' });
    } catch (err) {
      toast(parseApiError(err).message);
    }
  };

  if (isLoading) return <SkeletonTable rows={6} cols={7} />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <SnakeCard index={0}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary-900">All Users</h2>
          <p className="text-sm text-slate-400 mt-1">{users.length} total users</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4" />
          Create User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-300"
            />
          </div>
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-primary-900 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="LOGISTICS_STAFF">Admin</option>
              <option value="STUDENT">Student</option>
              <option value="DRIVER">Driver</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
      </SnakeCard>

      <SnakeCard index={1}>
      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Email</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Station</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Joined</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(u.login_42 || u.email)}&backgroundColor=e0e7ff&textColor=3730a3`}
                        alt={u.login_42}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm font-semibold text-primary-900 whitespace-nowrap">{u.login_42 || '—'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500 hidden lg:table-cell">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold border ${roleBadge[u.role] || roleBadge['STUDENT']}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500 hidden md:table-cell">{u.station_name || '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                      <span className="text-sm text-slate-600">{u.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-400 hidden sm:table-cell whitespace-nowrap">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 rounded-lg hover:bg-primary-50 text-slate-400 hover:text-primary-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await deleteUser.mutateAsync(u.id);
                            toast('User deleted.');
                          } catch (err) {
                            toast(parseApiError(err).message);
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">No users match your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </SnakeCard>

      {/* Invite User Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create User">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
            <input type="text" placeholder="e.g. john_doe" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input type="email" placeholder="user@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all cursor-pointer">
              <option value="LOGISTICS_STAFF">Admin</option>
              <option value="STUDENT">Student</option>
              <option value="DRIVER">Driver</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all">Create User</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
