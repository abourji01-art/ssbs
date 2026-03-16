// @ts-nocheck
import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

// ── Types ──

export interface StoppedPeriod {
  id: string;
  startTime: string;   // "02:00" (24h format)
  endTime: string;      // "03:00"
  reason: string;
}

export interface ScheduleConfig {
  id: string;
  organizationName: string;
  operatingHours: {
    startTime: string;  // "22:00" (24h format)
    endTime: string;    // "06:00"
    overnight: boolean; // auto-detected: end < start
    activeDays: boolean[]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  };
  stoppedPeriods: StoppedPeriod[];
  frequencyMinutes: number; // 15 | 30 | 45 | 60 | 90 | 120
  buses: { name: string; capacity: number }[];
}

export interface GeneratedSlot {
  time: string;       // "22:00"
  label: string;      // "10:00 PM"
  status: 'active' | 'stopped';
  reason?: string;    // reason if stopped
  availableSeats: number;
  totalSeats: number;
}

export type ServiceStatus =
  | { state: 'running'; nextDeparture: string }
  | { state: 'break'; resumesAt: string }
  | { state: 'ended'; resumesAt: string };

// ── Time utilities ──

/** Parse "22:00" → minutes since midnight: 1320 */
export const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

/** Minutes since midnight → "22:00" */
export const minutesToTime = (mins: number): string => {
  const normalised = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(normalised / 60);
  const m = normalised % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

/** "22:00" → "10:00 PM" */
export const to12Hour = (time24: string): string => {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
};

/** Check if a minute value falls within a stopped period (supports overnight) */
const isInStoppedPeriod = (
  minutesSinceMidnight: number,
  stoppedPeriods: StoppedPeriod[]
): StoppedPeriod | null => {
  for (const sp of stoppedPeriods) {
    const start = timeToMinutes(sp.startTime);
    const end = timeToMinutes(sp.endTime);
    if (start < end) {
      // same-day: e.g. 02:00 → 03:00
      if (minutesSinceMidnight >= start && minutesSinceMidnight < end) return sp;
    } else {
      // overnight stop: e.g. 23:00 → 01:00
      if (minutesSinceMidnight >= start || minutesSinceMidnight < end) return sp;
    }
  }
  return null;
};

/** Generate all time slots based on schedule config */
export const generateTimeSlots = (config: ScheduleConfig): GeneratedSlot[] => {
  const slots: GeneratedSlot[] = [];
  const startMins = timeToMinutes(config.operatingHours.startTime);
  const endMins = timeToMinutes(config.operatingHours.endTime);
  const freq = config.frequencyMinutes;
  const totalBusSeats = config.buses.reduce((sum, b) => sum + b.capacity, 0);

  // Calculate total operating minutes
  let totalMinutes: number;
  if (config.operatingHours.overnight || endMins <= startMins) {
    totalMinutes = (1440 - startMins) + endMins;
  } else {
    totalMinutes = endMins - startMins;
  }

  for (let offset = 0; offset <= totalMinutes; offset += freq) {
    const currentMins = (startMins + offset) % 1440;
    const time24 = minutesToTime(currentMins);
    const label = to12Hour(time24);

    const stoppedPeriod = isInStoppedPeriod(currentMins, config.stoppedPeriods);

    if (stoppedPeriod) {
      slots.push({
        time: time24,
        label,
        status: 'stopped',
        reason: stoppedPeriod.reason || 'Break time',
        availableSeats: 0,
        totalSeats: totalBusSeats,
      });
    } else {
      // Mock: random seat availability
      const available = Math.floor(Math.random() * totalBusSeats * 0.7) + Math.floor(totalBusSeats * 0.1);
      slots.push({
        time: time24,
        label,
        status: 'active',
        availableSeats: Math.min(available, totalBusSeats),
        totalSeats: totalBusSeats,
      });
    }
  }

  return slots;
};

/** Get current service status based on config and current time */
export const getServiceStatus = (config: ScheduleConfig, now: Date = new Date()): ServiceStatus => {
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const startMins = timeToMinutes(config.operatingHours.startTime);
  const endMins = timeToMinutes(config.operatingHours.endTime);
  const overnight = config.operatingHours.overnight || endMins <= startMins;

  // Check if within operating hours
  let isOperating: boolean;
  if (overnight) {
    isOperating = currentMins >= startMins || currentMins <= endMins;
  } else {
    isOperating = currentMins >= startMins && currentMins <= endMins;
  }

  if (!isOperating) {
    return { state: 'ended', resumesAt: to12Hour(config.operatingHours.startTime) };
  }

  // Check if in a stopped period
  const stoppedPeriod = isInStoppedPeriod(currentMins, config.stoppedPeriods);
  if (stoppedPeriod) {
    return { state: 'break', resumesAt: to12Hour(stoppedPeriod.endTime) };
  }

  // Find next departure slot
  const slots = generateTimeSlots(config);
  const activeSlots = slots.filter((s) => s.status === 'active');
  const nextSlot = activeSlots.find((s) => timeToMinutes(s.time) > currentMins)
    || (overnight ? activeSlots.find((s) => timeToMinutes(s.time) < startMins) : null);

  return {
    state: 'running',
    nextDeparture: nextSlot?.label || activeSlots[0]?.label || to12Hour(config.operatingHours.startTime),
  };
};

// ── 1337 School Default Preset ──

const DEFAULT_1337_CONFIG: ScheduleConfig = {
  id: 'org-1337',
  organizationName: '1337 School',
  operatingHours: {
    startTime: '22:00',
    endTime: '06:00',
    overnight: true,
    activeDays: [true, true, true, true, true, false, false], // Mon–Fri (Sun–Thu mapped)
  },
  stoppedPeriods: [
    { id: 'sp-1', startTime: '02:00', endTime: '03:00', reason: 'Low demand break' },
  ],
  frequencyMinutes: 60,
  buses: [
    { name: '1337 Express A', capacity: 50 },
    { name: '1337 Express B', capacity: 50 },
  ],
};

// ── Context ──

interface ScheduleContextType {
  config: ScheduleConfig;
  updateConfig: (updates: Partial<ScheduleConfig>) => void;
  updateOperatingHours: (hours: Partial<ScheduleConfig['operatingHours']>) => void;
  addStoppedPeriod: (period: Omit<StoppedPeriod, 'id'>) => void;
  removeStoppedPeriod: (id: string) => void;
  updateStoppedPeriod: (id: string, updates: Partial<StoppedPeriod>) => void;
  setFrequency: (minutes: number) => void;
  generatedSlots: GeneratedSlot[];
  serviceStatus: ServiceStatus;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<ScheduleConfig>(() => {
    const stored = localStorage.getItem('fleetmark_schedule_config');
    return stored ? JSON.parse(stored) : DEFAULT_1337_CONFIG;
  });

  const persist = useCallback((newConfig: ScheduleConfig) => {
    setConfig(newConfig);
    localStorage.setItem('fleetmark_schedule_config', JSON.stringify(newConfig));
  }, []);

  const updateConfig = useCallback((updates: Partial<ScheduleConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('fleetmark_schedule_config', JSON.stringify(next));
      return next;
    });
  }, []);

  const updateOperatingHours = useCallback((hours: Partial<ScheduleConfig['operatingHours']>) => {
    setConfig((prev) => {
      const newHours = { ...prev.operatingHours, ...hours };
      // Auto-detect overnight
      const start = timeToMinutes(newHours.startTime);
      const end = timeToMinutes(newHours.endTime);
      newHours.overnight = end <= start;
      const next = { ...prev, operatingHours: newHours };
      localStorage.setItem('fleetmark_schedule_config', JSON.stringify(next));
      return next;
    });
  }, []);

  const addStoppedPeriod = useCallback((period: Omit<StoppedPeriod, 'id'>) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        stoppedPeriods: [...prev.stoppedPeriods, { ...period, id: `sp-${Date.now()}` }],
      };
      localStorage.setItem('fleetmark_schedule_config', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeStoppedPeriod = useCallback((id: string) => {
    setConfig((prev) => {
      const next = { ...prev, stoppedPeriods: prev.stoppedPeriods.filter((p) => p.id !== id) };
      localStorage.setItem('fleetmark_schedule_config', JSON.stringify(next));
      return next;
    });
  }, []);

  const updateStoppedPeriod = useCallback((id: string, updates: Partial<StoppedPeriod>) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        stoppedPeriods: prev.stoppedPeriods.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      };
      localStorage.setItem('fleetmark_schedule_config', JSON.stringify(next));
      return next;
    });
  }, []);

  const setFrequency = useCallback((minutes: number) => {
    setConfig((prev) => {
      const next = { ...prev, frequencyMinutes: minutes };
      localStorage.setItem('fleetmark_schedule_config', JSON.stringify(next));
      return next;
    });
  }, [persist]);

  const generatedSlots = useMemo(() => generateTimeSlots(config), [config]);

  const serviceStatus = useMemo(() => getServiceStatus(config), [config]);

  return (
    <ScheduleContext.Provider
      value={{
        config,
        updateConfig,
        updateOperatingHours,
        addStoppedPeriod,
        removeStoppedPeriod,
        updateStoppedPeriod,
        setFrequency,
        generatedSlots,
        serviceStatus,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = (): ScheduleContextType => {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider');
  return ctx;
};
