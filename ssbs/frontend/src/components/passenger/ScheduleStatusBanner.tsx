import { useState, useEffect } from 'react';
import { Clock, Bus, Pause, Moon, ArrowRight } from 'lucide-react';
import { useSchedule, to12Hour } from '../../context/ScheduleContext';

const ScheduleStatusBanner = () => {
  const { serviceStatus, config } = useSchedule();
  const [, setTick] = useState(0);

  // Re-render every 30 seconds to keep status fresh
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(interval);
  }, []);

  const hours = `${to12Hour(config.operatingHours.startTime)} — ${to12Hour(config.operatingHours.endTime)}`;

  if (serviceStatus.state === 'running') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <Bus className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Buses are running</p>
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Next departure at {serviceStatus.nextDeparture}
              <span className="text-emerald-400 mx-1">·</span>
              {hours}
            </p>
          </div>
        </div>
        <a href="/passenger/reserve" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm">
          Reserve Now
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  if (serviceStatus.state === 'break') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <Pause className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">Service break</p>
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Buses resume at {serviceStatus.resumesAt}
              <span className="text-amber-400 mx-1">·</span>
              {hours}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Break
        </span>
      </div>
    );
  }

  // ended
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
          <Moon className="w-4.5 h-4.5 text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-600">Service offline</p>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Resumes at {serviceStatus.resumesAt}
            <span className="text-slate-300 mx-1">·</span>
            {hours}
          </p>
        </div>
      </div>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
        <span className="w-2 h-2 rounded-full bg-slate-400" />
        Offline
      </span>
    </div>
  );
};

export default ScheduleStatusBanner;
