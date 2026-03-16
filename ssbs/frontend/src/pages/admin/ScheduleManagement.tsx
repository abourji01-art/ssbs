import { useState } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Save,
  Calendar,
  Bus as BusIcon,
  MapPin,
  Moon,
  Sun,
  Pause,
  Play,
  Timer,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import Modal from '../../components/admin/Modal';
import { useSchedule, to12Hour, type StoppedPeriod } from '../../context/ScheduleContext';
import { useToast } from '../../context/ToastContext';
import { SnakeCard } from '../../components/ui/SnakeCard';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FREQUENCY_OPTIONS = [15, 30, 45, 60, 90, 120];

const ScheduleManagement = () => {
  const {
    config,
    updateOperatingHours,
    addStoppedPeriod,
    removeStoppedPeriod,
    updateStoppedPeriod,
    setFrequency,
    generatedSlots,
  } = useSchedule();
  const { toast } = useToast();

  // Local state for new stopped period
  const [newStop, setNewStop] = useState({ startTime: '', endTime: '', reason: '' });
  const [showAddStop, setShowAddStop] = useState(false);

  // Existing modal for weekly slots
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    route: '', bus: '', day: 'Monday', startTime: '', endTime: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Add schedule slot:', formData);
    setModalOpen(false);
    setFormData({ route: '', bus: '', day: 'Monday', startTime: '', endTime: '' });
  };

  const handleSaveOperatingHours = () => {
    toast('Operating hours saved! ✅');
  };

  const handleAddStoppedPeriod = () => {
    if (!newStop.startTime || !newStop.endTime) return;
    addStoppedPeriod(newStop);
    setNewStop({ startTime: '', endTime: '', reason: '' });
    setShowAddStop(false);
    toast('Stopped period added');
  };

  const handleSaveFrequency = () => {
    toast('Trip frequency saved! ✅');
  };

  const totalSlots = generatedSlots.length;
  const activeSlots = generatedSlots.filter((s) => s.status === 'active');
  const stoppedSlots = generatedSlots.filter((s) => s.status === 'stopped');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-primary-900">Schedule Management</h2>
        <p className="text-sm text-slate-400 mt-1">
          Configure operating hours, breaks, and trip frequency for {config.organizationName}
        </p>
      </div>

      <SnakeCard index={0}>
      {/* ── Schedule Settings ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Operating Hours Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary-900">Operating Hours</h3>
              <p className="text-[11px] text-slate-400">{config.organizationName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Start Time</label>
              <input
                type="time"
                value={config.operatingHours.startTime}
                onChange={(e) => updateOperatingHours({ startTime: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">{to12Hour(config.operatingHours.startTime)}</span>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">End Time</label>
              <input
                type="time"
                value={config.operatingHours.endTime}
                onChange={(e) => updateOperatingHours({ endTime: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">{to12Hour(config.operatingHours.endTime)}</span>
            </div>
          </div>

          {/* Overnight badge */}
          {config.operatingHours.overnight && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200">
              <Moon className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-medium text-indigo-700">Runs overnight</span>
            </div>
          )}
          {!config.operatingHours.overnight && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-amber-700">Daytime service</span>
            </div>
          )}

          {/* Active days */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Active Days</label>
            <div className="flex gap-1.5">
              {DAY_LABELS.map((day, i) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    const newDays = [...config.operatingHours.activeDays];
                    newDays[i] = !newDays[i];
                    updateOperatingHours({ activeDays: newDays });
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    config.operatingHours.activeDays[i]
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveOperatingHours}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            Save Hours
          </button>
        </div>

        {/* Stopped Periods Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Pause className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-primary-900">Stopped Periods</h3>
                <p className="text-[11px] text-slate-400">{config.stoppedPeriods.length} break{config.stoppedPeriods.length !== 1 ? 's' : ''} configured</p>
              </div>
            </div>
          </div>

          {/* List of stopped periods */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {config.stoppedPeriods.map((sp) => (
              <div
                key={sp.id}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-50/50 border border-red-100 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-700">
                    {to12Hour(sp.startTime)} → {to12Hour(sp.endTime)}
                  </p>
                  {sp.reason && (
                    <p className="text-[11px] text-red-400 truncate">{sp.reason}</p>
                  )}
                </div>
                <button
                  onClick={() => removeStoppedPeriod(sp.id)}
                  className="p-1.5 rounded-lg text-red-300 hover:text-red-600 hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {config.stoppedPeriods.length === 0 && (
              <p className="text-xs text-slate-300 text-center py-4">No break periods configured</p>
            )}
          </div>

          {/* Add stopped period form */}
          {showAddStop ? (
            <div className="space-y-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">Start</label>
                  <input
                    type="time"
                    value={newStop.startTime}
                    onChange={(e) => setNewStop({ ...newStop, startTime: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 mb-1">End</label>
                  <input
                    type="time"
                    value={newStop.endTime}
                    onChange={(e) => setNewStop({ ...newStop, endTime: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>
              <input
                type="text"
                placeholder="Reason (optional)"
                value={newStop.reason}
                onChange={(e) => setNewStop({ ...newStop, reason: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none placeholder:text-slate-300"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddStoppedPeriod}
                  disabled={!newStop.startTime || !newStop.endTime}
                  className="flex-1 py-2 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors disabled:opacity-40"
                >
                  Add Break
                </button>
                <button
                  onClick={() => { setShowAddStop(false); setNewStop({ startTime: '', endTime: '', reason: '' }); }}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddStop(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-sm font-medium text-slate-400 hover:border-red-300 hover:text-red-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Stopped Period
            </button>
          )}
        </div>

        {/* Trip Frequency Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Timer className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary-900">Trip Frequency</h3>
              <p className="text-[11px] text-slate-400">How often buses depart</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Depart every</label>
            <select
              value={config.frequencyMinutes}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all cursor-pointer"
            >
              {FREQUENCY_OPTIONS.map((min) => (
                <option key={min} value={min}>
                  Every {min} minutes{min >= 60 ? ` (${min / 60}h)` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-center">
              <p className="text-lg font-bold text-emerald-700">{activeSlots.length}</p>
              <p className="text-[10px] text-emerald-500 font-medium">Active Slots</p>
            </div>
            <div className="rounded-xl bg-red-50 p-3 text-center">
              <p className="text-lg font-bold text-red-600">{stoppedSlots.length}</p>
              <p className="text-[10px] text-red-400 font-medium">Stopped Slots</p>
            </div>
          </div>

          {/* Buses */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Assigned Buses</label>
            <div className="space-y-1.5">
              {config.buses.map((bus, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                  <BusIcon className="w-3.5 h-3.5 text-primary-500" />
                  <span className="text-xs font-medium text-slate-700">{bus.name}</span>
                  <span className="ml-auto text-[10px] text-slate-400">{bus.capacity} seats</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSaveFrequency}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            Save Frequency
          </button>
        </div>
      </div>
      </SnakeCard>

      <SnakeCard index={1}>
      {/* ── Timeline Preview ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h3 className="text-sm font-bold text-primary-900">Generated Time Slots Preview</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {to12Hour(config.operatingHours.startTime)} → {to12Hour(config.operatingHours.endTime)}
              {config.operatingHours.overnight ? ' (overnight)' : ''} · Every {config.frequencyMinutes} min
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-500">Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-slate-500">Stopped</span>
            </div>
          </div>
        </div>

        {/* Horizontal timeline */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-end gap-1 min-w-max">
            {generatedSlots.map((slot, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 min-w-[56px]">
                {/* Status icon */}
                {slot.status === 'active' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}

                {/* Dot on timeline bar */}
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    slot.status === 'active'
                      ? 'bg-emerald-500 border-emerald-600'
                      : 'bg-red-400 border-red-500'
                  }`}
                />

                {/* Time label */}
                <span
                  className={`text-[10px] font-semibold whitespace-nowrap ${
                    slot.status === 'active' ? 'text-slate-700' : 'text-red-400'
                  }`}
                >
                  {slot.label}
                </span>

                {/* Availability or stopped reason */}
                <span
                  className={`text-[9px] whitespace-nowrap ${
                    slot.status === 'active' ? 'text-emerald-500' : 'text-red-300'
                  }`}
                >
                  {slot.status === 'active'
                    ? `${slot.availableSeats}/${slot.totalSeats}`
                    : slot.reason || 'Break'}
                </span>
              </div>
            ))}
          </div>

          {/* Horizontal bar connecting dots */}
          <div className="relative mt-[-34px] mx-[28px]">
            <div className="h-0.5 bg-slate-200 w-full" />
            <div className="absolute inset-0 flex">
              {generatedSlots.map((slot, i) => {
                if (i === generatedSlots.length - 1) return null;
                const width = `${100 / (generatedSlots.length - 1)}%`;
                return (
                  <div
                    key={i}
                    className={`h-0.5 ${
                      slot.status === 'active' && generatedSlots[i + 1]?.status === 'active'
                        ? 'bg-emerald-400'
                        : slot.status === 'stopped' || generatedSlots[i + 1]?.status === 'stopped'
                        ? 'bg-red-300'
                        : 'bg-slate-200'
                    }`}
                    style={{ width }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Slot list (compact) */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {generatedSlots.map((slot, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${
                slot.status === 'active'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border-red-200 text-red-500'
              }`}
            >
              {slot.status === 'active' ? (
                <Play className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <Pause className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className="font-semibold text-xs">{slot.label}</span>
            </div>
          ))}
        </div>
      </div>
      </SnakeCard>

      <SnakeCard index={2}>
      {/* ── Weekly Schedule (existing) ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-primary-900">Weekly Schedule</h3>
          <p className="text-sm text-slate-400 mt-1">{totalSlots} active time slots this week</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Time Slot
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* No backend-backed weekly grid yet; reserved for future scheduling API */}
      </div>

      {/* Route Color Legend */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-primary-900 mb-3">Route Legend</h3>
        <div className="flex flex-wrap gap-4">
          {[
            { route: 'Route A', color: 'bg-primary-500' },
            { route: 'Route B', color: 'bg-accent-500' },
            { route: 'Route C', color: 'bg-emerald-500' },
            { route: 'Route D', color: 'bg-amber-500' },
            { route: 'Route E', color: 'bg-rose-500' },
          ].map((item) => (
            <div key={item.route} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-xs font-medium text-slate-600">{item.route}</span>
            </div>
          ))}
        </div>
      </div>
      </SnakeCard>

      {/* Add Slot Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Time Slot">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Route</label>
            <select
              value={formData.route}
              onChange={(e) => setFormData({ ...formData, route: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all cursor-pointer"
            >
              <option value="">Select a route</option>
              <option value="Route A">Route A — Campus Express</option>
              <option value="Route B">Route B — Downtown Loop</option>
              <option value="Route C">Route C — Industrial Zone</option>
              <option value="Route D">Route D — Airport Shuttle</option>
              <option value="Route E">Route E — Medical Campus</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Bus</label>
            <input
              type="text"
              placeholder="e.g. Bus 07"
              value={formData.bus}
              onChange={(e) => setFormData({ ...formData, bus: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Day</label>
            <select
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all cursor-pointer"
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Time</label>
              <input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">End Time</label>
              <input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all">Add Slot</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ScheduleManagement;
