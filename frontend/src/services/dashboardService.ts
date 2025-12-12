import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

export interface DashboardStats {
  activeJobs: {
    value: number;
    trend: string;
    trendUp: boolean;
  };
  materialOrders: {
    value: number;
    formatted: string;
    trend: string;
    trendUp: boolean;
  };
  pendingApprovals: {
    value: number;
  };
  onTimeDelivery: {
    value: number;
    trend: string;
    trendUp: boolean;
  };
}

export interface DashboardAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  icon: string;
  title: string;
  message: string;
  details?: Record<string, unknown>;
  time: string;
  createdAt: string;
  actionUrl?: string;
  customer?: string;
  community?: string;
  isRead: boolean;
}

export interface ActivityItem {
  id: string;
  type: string;
  icon: string;
  title: string;
  detail?: string;
  amount?: number;
  time: string;
  createdAt: string;
  customer?: string;
  user?: string;
}

export interface DeliveryItem {
  id: string;
  time: string;
  scheduledTime: string;
  title: string;
  location?: string;
  status: string;
  portal?: string;
}

export interface TrendData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
  summary: {
    totalAmount: number;
    orderCount: number;
    period: string;
  };
}

export interface DashboardSummary {
  stats: DashboardStats;
  alerts: DashboardAlert[];
  activities: ActivityItem[];
  deliveries: DeliveryItem[];
}

// ============================================================================
// API Configuration
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, response.statusText, errorData);
  }

  return response.json();
}

// ============================================================================
// API Functions
// ============================================================================

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>('/api/v1/dashboard/summary');
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>('/api/v1/dashboard/stats');
}

export async function fetchDashboardAlerts(limit?: number): Promise<DashboardAlert[]> {
  const params = limit ? `?limit=${limit}` : '';
  return apiFetch<DashboardAlert[]>(`/api/v1/dashboard/alerts${params}`);
}

export async function fetchDashboardActivity(limit?: number): Promise<ActivityItem[]> {
  const params = limit ? `?limit=${limit}` : '';
  return apiFetch<ActivityItem[]>(`/api/v1/dashboard/activity${params}`);
}

export async function fetchDashboardDeliveries(): Promise<DeliveryItem[]> {
  return apiFetch<DeliveryItem[]>('/api/v1/dashboard/deliveries');
}

export async function fetchDashboardTrends(period?: 'day' | 'week' | 'month'): Promise<TrendData> {
  const params = period ? `?period=${period}` : '';
  return apiFetch<TrendData>(`/api/v1/dashboard/trends${params}`);
}

export async function dismissAlert(alertId: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/api/v1/dashboard/alerts/${alertId}/dismiss`, {
    method: 'PATCH',
  });
}

export async function markAlertRead(alertId: string): Promise<void> {
  await apiFetch<{ success: boolean }>(`/api/v1/dashboard/alerts/${alertId}/read`, {
    method: 'PATCH',
  });
}

// ============================================================================
// React Query Hooks
// ============================================================================

export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  alerts: (limit?: number) => [...dashboardKeys.all, 'alerts', limit] as const,
  activity: (limit?: number) => [...dashboardKeys.all, 'activity', limit] as const,
  deliveries: () => [...dashboardKeys.all, 'deliveries'] as const,
  trends: (period?: string) => [...dashboardKeys.all, 'trends', period] as const,
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: fetchDashboardSummary,
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: fetchDashboardStats,
    refetchInterval: 60000,
  });
}

export function useDashboardAlerts(limit?: number) {
  return useQuery({
    queryKey: dashboardKeys.alerts(limit),
    queryFn: () => fetchDashboardAlerts(limit),
    refetchInterval: 30000, // Refresh every 30 seconds for alerts
  });
}

export function useDashboardActivity(limit?: number) {
  return useQuery({
    queryKey: dashboardKeys.activity(limit),
    queryFn: () => fetchDashboardActivity(limit),
    refetchInterval: 60000,
  });
}

export function useDashboardDeliveries() {
  return useQuery({
    queryKey: dashboardKeys.deliveries(),
    queryFn: fetchDashboardDeliveries,
    refetchInterval: 300000, // Refresh every 5 minutes
  });
}

export function useDashboardTrends(period?: 'day' | 'week' | 'month') {
  return useQuery({
    queryKey: dashboardKeys.trends(period),
    queryFn: () => fetchDashboardTrends(period),
    refetchInterval: 300000,
  });
}

export function useDismissAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dismissAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.alerts() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.summary() });
    },
  });
}

export function useMarkAlertRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAlertRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.alerts() });
    },
  });
}
