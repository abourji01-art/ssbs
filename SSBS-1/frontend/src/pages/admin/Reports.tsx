import { useState } from 'react';
import { Download, TrendingUp, MapPin, Clock, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { useReports } from '../../hooks/useApi';
import { SnakeCard } from '../../components/ui/SnakeCard';
import Spinner from '../../components/ui/Spinner';

const Reports = () => {
  const [dateRange, setDateRange] = useState({ from: '2025-02-01', to: '2025-02-28' });
  const { data: reportData, isLoading, refetch } = useReports();

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading || !reportData) {
    return <Spinner />;
  }

  const { ridesPerRoute, weeklyRidership, reportStats } = reportData;

  const statCards = [
    { label: 'Total Rides', value: reportStats.totalRides.toLocaleString(), icon: TrendingUp, color: 'bg-primary-500', lightColor: 'bg-primary-50' },
    { label: 'Avg Occupancy', value: `${reportStats.averageOccupancy}%`, icon: Users, color: 'bg-accent-500', lightColor: 'bg-sky-50' },
    { label: 'Most Used Route', value: reportStats.mostUsedRoute.split(' — ')[0], icon: MapPin, color: 'bg-emerald-500', lightColor: 'bg-emerald-50' },
    { label: 'Peak Hours', value: reportStats.peakHours, icon: Clock, color: 'bg-amber-500', lightColor: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <SnakeCard index={0}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary-900">Reports &amp; Analytics</h2>
          <p className="text-sm text-slate-400 mt-1">Insights across all routes and buses</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:border-primary-300 transition-all"
            style={{ opacity: refreshing ? 0.6 : 1, cursor: refreshing ? 'not-allowed' : 'pointer' }}
          >
            {refreshing ? '↻ …' : '↻ Refresh'}
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
            />
            <span className="text-slate-300">→</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all active:scale-[0.98]">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>
      </SnakeCard>

      {/* Stat cards */}
      <SnakeCard index={1}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-primary-100/30 transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.lightColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${card.color.replace('bg-', '')}`} style={{ color: undefined }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-primary-900">{card.value}</p>
              <p className="text-xs text-slate-400 mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>
      </SnakeCard>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar chart — rides per route */}
        <SnakeCard index={2}>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-primary-900 mb-4">Rides per Route</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ridesPerRoute} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <XAxis dataKey="route" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: 12 }}
                  cursor={{ fill: 'rgba(59,130,246,0.04)' }}
                />
                <Bar dataKey="rides" fill="#3B82F6" radius={[8, 8, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        </SnakeCard>

        {/* Line chart — weekly ridership */}
        <SnakeCard index={3}>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-primary-900 mb-4">Weekly Ridership Trend</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyRidership} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Line type="monotone" dataKey="riders" stroke="#0EA5E9" strokeWidth={2.5} dot={{ r: 4, fill: '#0EA5E9', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        </SnakeCard>
      </div>

      {/* Top routes table */}
      <SnakeCard index={4}>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-primary-900">Top Routes by Ridership</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Route</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Rides</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ridesPerRoute
                .slice()
                .sort((a, b) => b.rides - a.rides)
                .map((r, i) => {
                  const total = ridesPerRoute.reduce((s, x) => s + x.rides, 0);
                  const share = ((r.rides / total) * 100).toFixed(1);
                  return (
                    <tr key={r.route} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-bold text-primary-400">{i + 1}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-primary-900">{r.route}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{r.rides.toLocaleString()}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full bg-primary-500" style={{ width: `${share}%` }} />
                          </div>
                          <span className="text-xs text-slate-500 font-medium">{share}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
      </SnakeCard>
    </div>
  );
};

export default Reports;
