// @ts-nocheck
import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';

// ── Bus Stop Data ──

const BUS_1_STOPS = [
  'OCP Saka', 'OCP 6', 'Nakhil', 'Chaaibat (Lhayat Pharmacy)',
  'Posto Gosto', 'Mesk Lil', 'Jnane Lkhir', 'Lhamriti (Ben Salem)',
  'Al Fadl', 'Kentra', 'Jnane Lkhir', 'Pharmacie Ibn Sina',
  'Al Qods', 'Sissane', 'La Gare', 'Dyour Chouhada',
  'Chtayba', 'Ibn Tofail', 'Green Oil Station',
];

const BUS_2_STOPS = [
  'Coin Bleu', 'BMCE', 'Café Al Mouhajir', 'Café Al Akhawayne',
  'Posto Gosto', 'Chaaibat', 'Café Grind',
];

// Stops that appear in BOTH routes
const SHARED_STOPS = ['Posto Gosto', 'Chaaibat'];

/** All unique stops combined */
export const ALL_STOPS = Array.from(new Set([...BUS_1_STOPS, ...BUS_2_STOPS]));

export type BusAssignment = 'Bus 1' | 'Bus 2';

export interface BusInfo {
  busNumber: BusAssignment;
  busName: string;
  routeName: string;
  stops: string[];
}

export const BUS_INFO: Record<BusAssignment, BusInfo> = {
  'Bus 1': {
    busNumber: 'Bus 1',
    busName: '1337 Night Shuttle — Bus 1',
    routeName: 'Night Shuttle — Route 1',
    stops: BUS_1_STOPS,
  },
  'Bus 2': {
    busNumber: 'Bus 2',
    busName: '1337 Night Shuttle — Bus 2',
    routeName: 'Night Shuttle — Route 2',
    stops: BUS_2_STOPS,
  },
};

/** Determine which bus(es) serve a stop */
export const getBusForStop = (stop: string): BusAssignment[] => {
  const buses: BusAssignment[] = [];
  if (BUS_1_STOPS.includes(stop)) buses.push('Bus 1');
  if (BUS_2_STOPS.includes(stop)) buses.push('Bus 2');
  return buses;
};

export const isSharedStop = (stop: string): boolean => SHARED_STOPS.includes(stop);

// ── Reservation Types ──

export interface NightReservation {
  id: string;
  slotTime: string;        // "22:00" (24h)
  slotLabel: string;       // "10:00 PM"
  homeStop: string;
  busAssignment: BusAssignment;
  status: 'Confirmed' | 'Cancelled';
  createdAt: number;       // timestamp
}

export interface PastNightRecord {
  date: string;            // "Feb 20, 2026"
  reservations: NightReservation[];
}

// ── Student Profile ──

export interface StudentTransport {
  homeStop: string;
  busAssignment: BusAssignment;
  setupComplete: boolean;
}

// ── Context ──

interface ReservationContextValue {
  // Student transport profile
  transport: StudentTransport | null;
  isOnboarded: boolean;
  setHomeStop: (stop: string, bus: BusAssignment) => void;
  changeHomeStop: (stop: string, bus: BusAssignment) => void;

  // Tonight's reservations
  tonightReservations: NightReservation[];
  reservationsUsed: number;
  maxReservations: number;
  canReserve: boolean;

  // Actions
  makeReservation: (slotTime: string, slotLabel: string) => void;
  cancelReservation: (id: string) => void;
  isSlotReserved: (slotTime: string) => boolean;

  // 30-min rule
  isSlotOpen: (slotTime: string) => boolean;
  getTimeUntilOpen: (slotTime: string) => number; // seconds until open, 0 if open

  // Past history
  pastReservations: PastNightRecord[];

  // Bus info helper
  getBusInfo: () => BusInfo | null;
}

const ReservationContext = createContext<ReservationContextValue | null>(null);

const STORAGE_KEY_TRANSPORT = 'fleetmark_student_transport';
const STORAGE_KEY_TONIGHT = 'fleetmark_tonight_reservations';
const STORAGE_KEY_TONIGHT_DATE = 'fleetmark_tonight_date';
const MAX_RESERVATIONS = 3;
const OPEN_WINDOW_MINUTES = 30;

// ── Provider ──

export const ReservationProvider = ({ children }: { children: ReactNode }) => {
  // Load transport profile from localStorage
  const [transport, setTransport] = useState<StudentTransport | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TRANSPORT);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Get "tonight's" date key (service runs 10PM–6AM, so date = the evening date)
  const getTonightKey = useCallback((): string => {
    const now = new Date();
    const h = now.getHours();
    // If it's between midnight and 6AM, "tonight" is actually yesterday's date
    if (h < 6) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    }
    return now.toISOString().split('T')[0];
  }, []);

  // Load tonight's reservations (reset if date changed)
  const [tonightReservations, setTonightReservations] = useState<NightReservation[]>(() => {
    try {
      const storedDate = localStorage.getItem(STORAGE_KEY_TONIGHT_DATE);
      const tonightKey = getTonightKey();
      if (storedDate !== tonightKey) {
        // New night — reset
        localStorage.setItem(STORAGE_KEY_TONIGHT_DATE, tonightKey);
        localStorage.setItem(STORAGE_KEY_TONIGHT, '[]');
        return [];
      }
      const stored = localStorage.getItem(STORAGE_KEY_TONIGHT);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Mock past history
  const [pastReservations] = useState<PastNightRecord[]>([
    {
      date: 'Feb 20, 2026',
      reservations: [
        { id: 'PR-001', slotTime: '22:00', slotLabel: '10:00 PM', homeStop: 'Kentra', busAssignment: 'Bus 1', status: 'Confirmed', createdAt: Date.now() - 86400000 },
        { id: 'PR-002', slotTime: '00:00', slotLabel: '12:00 AM', homeStop: 'Kentra', busAssignment: 'Bus 1', status: 'Confirmed', createdAt: Date.now() - 86400000 },
      ],
    },
    {
      date: 'Feb 19, 2026',
      reservations: [
        { id: 'PR-003', slotTime: '22:00', slotLabel: '10:00 PM', homeStop: 'Kentra', busAssignment: 'Bus 1', status: 'Confirmed', createdAt: Date.now() - 172800000 },
        { id: 'PR-004', slotTime: '23:00', slotLabel: '11:00 PM', homeStop: 'Kentra', busAssignment: 'Bus 1', status: 'Cancelled', createdAt: Date.now() - 172800000 },
        { id: 'PR-005', slotTime: '01:00', slotLabel: '1:00 AM', homeStop: 'Kentra', busAssignment: 'Bus 1', status: 'Confirmed', createdAt: Date.now() - 172800000 },
      ],
    },
    {
      date: 'Feb 18, 2026',
      reservations: [
        { id: 'PR-006', slotTime: '22:00', slotLabel: '10:00 PM', homeStop: 'Kentra', busAssignment: 'Bus 1', status: 'Confirmed', createdAt: Date.now() - 259200000 },
      ],
    },
  ]);

  // Persist transport changes
  useEffect(() => {
    if (transport) {
      localStorage.setItem(STORAGE_KEY_TRANSPORT, JSON.stringify(transport));
    }
  }, [transport]);

  // Persist tonight's reservations
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TONIGHT, JSON.stringify(tonightReservations));
  }, [tonightReservations]);

  const isOnboarded = transport?.setupComplete === true;

  const setHomeStop = useCallback((stop: string, bus: BusAssignment) => {
    setTransport({ homeStop: stop, busAssignment: bus, setupComplete: true });
  }, []);

  const changeHomeStop = useCallback((stop: string, bus: BusAssignment) => {
    setTransport({ homeStop: stop, busAssignment: bus, setupComplete: true });
  }, []);

  const activeReservations = useMemo(
    () => tonightReservations.filter((r) => r.status === 'Confirmed'),
    [tonightReservations]
  );

  const reservationsUsed = activeReservations.length;
  const canReserve = reservationsUsed < MAX_RESERVATIONS;

  const isSlotReserved = useCallback(
    (slotTime: string) => activeReservations.some((r) => r.slotTime === slotTime),
    [activeReservations]
  );

  /** Check if 30-min reservation window is open for a slot */
  const isSlotOpen = useCallback((slotTime: string): boolean => {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const [h, m] = slotTime.split(':').map(Number);
    let slotMins = h * 60 + m;

    // Handle overnight: if slot is after midnight and we're before midnight
    if (slotMins < 6 * 60 && nowMins >= 18 * 60) {
      slotMins += 24 * 60;
    }
    // If we're after midnight and slot is before midnight
    if (nowMins < 6 * 60 && slotMins >= 18 * 60) {
      // Slot already passed (it was yesterday evening)
      return false;
    }
    // Both after midnight
    if (nowMins < 6 * 60 && slotMins < 6 * 60) {
      // normal comparison
    }

    const diff = slotMins - (nowMins < 6 * 60 && slotMins < 6 * 60 ? nowMins : nowMins < 6 * 60 ? nowMins + 24 * 60 : nowMins);

    // Open if within 30 min and not yet passed
    return diff <= OPEN_WINDOW_MINUTES && diff > -30;
  }, []);

  /** Get seconds until a slot opens (0 if already open) */
  const getTimeUntilOpen = useCallback((slotTime: string): number => {
    const now = new Date();
    const nowSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const [h, m] = slotTime.split(':').map(Number);
    let slotSecs = h * 3600 + m * 60;

    // Adjust for overnight
    if (slotSecs < 6 * 3600 && nowSecs >= 18 * 3600) {
      slotSecs += 24 * 3600;
    }

    const openAtSecs = slotSecs - OPEN_WINDOW_MINUTES * 60;
    const diff = openAtSecs - nowSecs;
    return Math.max(0, diff);
  }, []);

  const makeReservation = useCallback(
    (slotTime: string, slotLabel: string) => {
      if (!transport || !canReserve) return;
      const newRes: NightReservation = {
        id: `RES-${Date.now()}`,
        slotTime,
        slotLabel,
        homeStop: transport.homeStop,
        busAssignment: transport.busAssignment,
        status: 'Confirmed',
        createdAt: Date.now(),
      };
      setTonightReservations((prev) => [...prev, newRes]);
    },
    [transport, canReserve]
  );

  const cancelReservation = useCallback((id: string) => {
    setTonightReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Cancelled' as const } : r))
    );
  }, []);

  const getBusInfo = useCallback((): BusInfo | null => {
    if (!transport) return null;
    return BUS_INFO[transport.busAssignment];
  }, [transport]);

  const value: ReservationContextValue = {
    transport,
    isOnboarded,
    setHomeStop,
    changeHomeStop,
    tonightReservations,
    reservationsUsed,
    maxReservations: MAX_RESERVATIONS,
    canReserve,
    makeReservation,
    cancelReservation,
    isSlotReserved,
    isSlotOpen,
    getTimeUntilOpen,
    pastReservations,
    getBusInfo,
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
};

// ── Hook ──

export const useReservation = (): ReservationContextValue => {
  const ctx = useContext(ReservationContext);
  if (!ctx) throw new Error('useReservation must be used within ReservationProvider');
  return ctx;
};
