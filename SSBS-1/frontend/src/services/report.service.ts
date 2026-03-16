import api from '../lib/axios';

export interface ReportStats {
  totalRides: number;
  averageOccupancy: number;
  mostUsedRoute: string;
  peakHours: string;
}

export interface RidesPerRoute {
  route: string;
  rides: number;
}

export interface WeeklyRidership {
  week: string;
  riders: number;
}

export interface ReportData {
  ridesPerRoute: RidesPerRoute[];
  weeklyRidership: WeeklyRidership[];
  reportStats: ReportStats;
}

export async function getReports(): Promise<ReportData> {
  const { data } = await api.get('/reports/');
  return data;
}
