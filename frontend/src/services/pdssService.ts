import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

export type PDSSStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETE' | 'ON_HOLD' | 'ARCHIVED';
export type PDSSTakeoffStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETE';
export type PDSSQuoteStatus = 'NOT_STARTED' | 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED';
export type PDSSPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface PDSSPlanStatus {
  id: string;
  planId: string;
  elevationId: string | null;
  planStatus: PDSSStatus;
  takeoffStatus: PDSSTakeoffStatus;
  quoteStatus: PDSSQuoteStatus;
  documentsComplete: boolean;
  documentCount: number;
  assignedToId: string | null;
  priority: PDSSPriority;
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: {
    id: string;
    code: string;
    name: string | null;
    type: string;
    builder?: {
      id: string;
      customerName: string;
    };
  };
  elevation?: {
    id: string;
    code: string;
    name: string | null;
  };
  assignedTo?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
  _count?: {
    documentStatuses: number;
  };
}

export interface PDSSJobStatus {
  id: string;
  jobId: string;
  planStatus: PDSSStatus;
  takeoffStatus: PDSSTakeoffStatus;
  quoteStatus: PDSSQuoteStatus;
  documentsComplete: boolean;
  missingDocuments: string[] | null;
  assignedToId: string | null;
  priority: PDSSPriority;
  dueDate: string | null;
  alertsSent: number;
  lastAlertAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  job?: {
    id: string;
    jobNumber: string;
    status: string;
    startDate: string | null;
    customer?: {
      id: string;
      customerName: string;
    };
    plan?: {
      id: string;
      code: string;
      name: string | null;
    };
    elevation?: {
      id: string;
      code: string;
    };
    community?: {
      id: string;
      name: string;
    };
    lot?: {
      lotNumber: number;
    };
  };
  assignedTo?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export interface PDSSListQuery {
  page?: number;
  limit?: number;
  planStatus?: PDSSStatus;
  takeoffStatus?: PDSSTakeoffStatus;
  priority?: PDSSPriority;
  assignedToId?: string;
  customerId?: string;
  search?: string;
}

export interface PDSSStats {
  total: number;
  byStatus: { status: PDSSStatus; count: number }[];
  byTakeoff?: { status: PDSSTakeoffStatus; count: number }[];
  byPriority: { priority: PDSSPriority; count: number }[];
  needsAttention?: number;
  incompleteDocuments?: number;
}

export interface PDSSDashboard {
  planStats: { status: PDSSStatus; count: number }[];
  jobStats: { status: PDSSStatus; count: number }[];
  myAssignments: {
    plans: number;
    jobs: number;
  };
  criticalItems: PDSSJobStatus[];
  recentActivity: PDSSJobStatus[];
}

// ============================================================================
// API Configuration
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
    throw new Error(errorData.error || `API Error ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// API Functions
// ============================================================================

// Plan Status
export async function fetchPDSSPlans(query: PDSSListQuery = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, String(value));
  });
  const response = await apiFetch<{
    success: boolean;
    data: PDSSPlanStatus[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>(`/api/v1/pdss/plans?${params}`);
  return response;
}

export async function fetchPDSSPlanStats() {
  const response = await apiFetch<{ success: boolean; data: PDSSStats }>('/api/v1/pdss/plans/stats');
  return response.data;
}

export async function fetchPDSSPlan(id: string) {
  const response = await apiFetch<{ success: boolean; data: PDSSPlanStatus }>(`/api/v1/pdss/plans/${id}`);
  return response.data;
}

export async function updatePDSSPlan(id: string, data: Partial<PDSSPlanStatus>) {
  const response = await apiFetch<{ success: boolean; data: PDSSPlanStatus }>(`/api/v1/pdss/plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
}

// Job Status
export async function fetchPDSSJobs(query: PDSSListQuery = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, String(value));
  });
  const response = await apiFetch<{
    success: boolean;
    data: PDSSJobStatus[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>(`/api/v1/pdss/jobs?${params}`);
  return response;
}

export async function fetchPDSSJobStats() {
  const response = await apiFetch<{ success: boolean; data: PDSSStats }>('/api/v1/pdss/jobs/stats');
  return response.data;
}

export async function fetchPDSSJob(jobId: string) {
  const response = await apiFetch<{ success: boolean; data: PDSSJobStatus }>(`/api/v1/pdss/jobs/${jobId}`);
  return response.data;
}

export async function updatePDSSJob(jobId: string, data: Partial<PDSSJobStatus>) {
  const response = await apiFetch<{ success: boolean; data: PDSSJobStatus }>(`/api/v1/pdss/jobs/${jobId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
}

// Dashboard
export async function fetchPDSSDashboard() {
  const response = await apiFetch<{ success: boolean; data: PDSSDashboard }>('/api/v1/pdss/dashboard');
  return response.data;
}

// ============================================================================
// React Query Hooks
// ============================================================================

export const pdssKeys = {
  all: ['pdss'] as const,
  plans: () => [...pdssKeys.all, 'plans'] as const,
  planList: (query: PDSSListQuery) => [...pdssKeys.plans(), 'list', query] as const,
  planStats: () => [...pdssKeys.plans(), 'stats'] as const,
  planDetail: (id: string) => [...pdssKeys.plans(), 'detail', id] as const,
  jobs: () => [...pdssKeys.all, 'jobs'] as const,
  jobList: (query: PDSSListQuery) => [...pdssKeys.jobs(), 'list', query] as const,
  jobStats: () => [...pdssKeys.jobs(), 'stats'] as const,
  jobDetail: (jobId: string) => [...pdssKeys.jobs(), 'detail', jobId] as const,
  dashboard: () => [...pdssKeys.all, 'dashboard'] as const,
};

export function usePDSSPlans(query: PDSSListQuery = {}) {
  return useQuery({
    queryKey: pdssKeys.planList(query),
    queryFn: () => fetchPDSSPlans(query),
  });
}

export function usePDSSPlanStats() {
  return useQuery({
    queryKey: pdssKeys.planStats(),
    queryFn: fetchPDSSPlanStats,
    refetchInterval: 60000,
  });
}

export function usePDSSPlan(id: string) {
  return useQuery({
    queryKey: pdssKeys.planDetail(id),
    queryFn: () => fetchPDSSPlan(id),
    enabled: !!id,
  });
}

export function useUpdatePDSSPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PDSSPlanStatus> }) => updatePDSSPlan(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pdssKeys.plans() });
      queryClient.invalidateQueries({ queryKey: pdssKeys.planDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: pdssKeys.dashboard() });
    },
  });
}

export function usePDSSJobs(query: PDSSListQuery = {}) {
  return useQuery({
    queryKey: pdssKeys.jobList(query),
    queryFn: () => fetchPDSSJobs(query),
  });
}

export function usePDSSJobStats() {
  return useQuery({
    queryKey: pdssKeys.jobStats(),
    queryFn: fetchPDSSJobStats,
    refetchInterval: 60000,
  });
}

export function usePDSSJob(jobId: string) {
  return useQuery({
    queryKey: pdssKeys.jobDetail(jobId),
    queryFn: () => fetchPDSSJob(jobId),
    enabled: !!jobId,
  });
}

export function useUpdatePDSSJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: Partial<PDSSJobStatus> }) => updatePDSSJob(jobId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: pdssKeys.jobs() });
      queryClient.invalidateQueries({ queryKey: pdssKeys.jobDetail(variables.jobId) });
      queryClient.invalidateQueries({ queryKey: pdssKeys.dashboard() });
    },
  });
}

export function usePDSSDashboard() {
  return useQuery({
    queryKey: pdssKeys.dashboard(),
    queryFn: fetchPDSSDashboard,
    refetchInterval: 60000,
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

export const PDSS_STATUS_LABELS: Record<PDSSStatus, string> = {
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  COMPLETE: 'Complete',
  ON_HOLD: 'On Hold',
  ARCHIVED: 'Archived',
};

export const PDSS_TAKEOFF_LABELS: Record<PDSSTakeoffStatus, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  PENDING_REVIEW: 'Pending Review',
  COMPLETE: 'Complete',
};

export const PDSS_QUOTE_LABELS: Record<PDSSQuoteStatus, string> = {
  NOT_STARTED: 'Not Started',
  DRAFT: 'Draft',
  SENT: 'Sent',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const PDSS_PRIORITY_LABELS: Record<PDSSPriority, string> = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export const PDSS_STATUS_COLORS: Record<PDSSStatus, string> = {
  NEW: 'gray',
  IN_PROGRESS: 'blue',
  COMPLETE: 'green',
  ON_HOLD: 'yellow',
  ARCHIVED: 'gray',
};

export const PDSS_PRIORITY_COLORS: Record<PDSSPriority, string> = {
  CRITICAL: 'red',
  HIGH: 'orange',
  MEDIUM: 'yellow',
  LOW: 'gray',
};

export function getStatusBadgeClass(status: PDSSStatus): string {
  const colorMap: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
  };
  return colorMap[PDSS_STATUS_COLORS[status]] || colorMap.gray;
}

export function getPriorityBadgeClass(priority: PDSSPriority): string {
  const colorMap: Record<string, string> = {
    red: 'bg-red-100 text-red-800',
    orange: 'bg-orange-100 text-orange-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-800',
  };
  return colorMap[PDSS_PRIORITY_COLORS[priority]] || colorMap.gray;
}

export function formatAssignee(assignedTo?: { firstName: string | null; lastName: string | null }): string {
  if (!assignedTo) return 'Unassigned';
  const name = [assignedTo.firstName, assignedTo.lastName].filter(Boolean).join(' ');
  return name || 'Unassigned';
}
