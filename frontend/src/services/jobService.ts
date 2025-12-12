import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

export type JobStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Job {
  id: string;
  jobNumber: string;
  customerId: string;
  planId: string;
  elevationId: string | null;
  communityId: string | null;
  lotId: string | null;
  status: JobStatus;
  estimatedCost: number | null;
  actualCost: number | null;
  margin: number | null;
  createdById: string;
  approvedById: string | null;
  approvedAt: string | null;
  startDate: string | null;
  completionDate: string | null;
  notes: string | null;
  folderPath: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    customerName: string;
    customerCode?: string;
  };
  plan?: {
    id: string;
    code: string;
    name: string | null;
    type?: string;
  };
  elevation?: {
    id: string;
    code: string;
    name: string | null;
  };
  community?: {
    id: string;
    name: string;
    code?: string;
  };
  lot?: {
    id: string;
    lotNumber: string;
    address: string | null;
  };
  createdBy?: {
    id: string;
    name: string;
  };
  _count?: {
    purchaseOrders: number;
    jobOptions: number;
  };
}

export interface JobFull extends Job {
  approvedBy?: {
    id: string;
    name: string;
    email: string;
  };
  jobOptions: {
    id: string;
    option: {
      id: string;
      name: string;
      category: string;
    };
  }[];
  purchaseOrders: {
    id: string;
    poNumber: string;
    status: string;
    totalAmount: number;
  }[];
  takeoff?: {
    id: string;
    status: string;
  };
}

export interface CreateJobInput {
  jobNumber?: string;
  customerId: string;
  planId: string;
  elevationId?: string;
  communityId?: string;
  lotId?: string;
  status?: JobStatus;
  estimatedCost?: number;
  startDate?: string;
  completionDate?: string;
  notes?: string;
}

export interface UpdateJobInput extends Partial<CreateJobInput> {
  actualCost?: number;
  margin?: number;
}

export interface ListJobsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: JobStatus;
  customerId?: string;
  communityId?: string;
  startDateFrom?: string;
  startDateTo?: string;
  sortBy?: 'jobNumber' | 'createdAt' | 'startDate' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface ListJobsResponse {
  data: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface JobStats {
  total: number;
  byStatus: { status: JobStatus; count: number }[];
  upcomingStarts: number;
  recentlyCompleted: number;
  activeCount: number;
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

export async function fetchJobs(query: ListJobsQuery = {}): Promise<ListJobsResponse> {
  const params = new URLSearchParams();
  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());
  if (query.search) params.append('search', query.search);
  if (query.status) params.append('status', query.status);
  if (query.customerId) params.append('customerId', query.customerId);
  if (query.communityId) params.append('communityId', query.communityId);
  if (query.startDateFrom) params.append('startDateFrom', query.startDateFrom);
  if (query.startDateTo) params.append('startDateTo', query.startDateTo);
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);

  const response = await apiFetch<{
    success: boolean;
    data: Job[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(`/api/v1/jobs?${params}`);

  return {
    data: response.data,
    pagination: response.pagination,
  };
}

export async function fetchJobById(id: string): Promise<JobFull> {
  const response = await apiFetch<{
    success: boolean;
    data: JobFull;
  }>(`/api/v1/jobs/${id}`);

  return response.data;
}

export async function fetchJobStats(): Promise<JobStats> {
  const response = await apiFetch<{
    success: boolean;
    data: JobStats;
  }>(`/api/v1/jobs/stats`);

  return response.data;
}

export async function fetchUpcomingJobs(days?: number): Promise<Job[]> {
  const params = days ? `?days=${days}` : '';
  const response = await apiFetch<{
    success: boolean;
    data: Job[];
  }>(`/api/v1/jobs/upcoming${params}`);

  return response.data;
}

export async function createJob(data: CreateJobInput): Promise<Job> {
  const response = await apiFetch<{
    success: boolean;
    data: Job;
    message: string;
  }>(`/api/v1/jobs`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return response.data;
}

export async function updateJob(id: string, data: UpdateJobInput): Promise<Job> {
  const response = await apiFetch<{
    success: boolean;
    data: Job;
    message: string;
  }>(`/api/v1/jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  return response.data;
}

export async function updateJobStatus(id: string, status: JobStatus): Promise<Job> {
  const response = await apiFetch<{
    success: boolean;
    data: Job;
    message: string;
  }>(`/api/v1/jobs/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

  return response.data;
}

export async function deleteJob(id: string, hard?: boolean): Promise<void> {
  const params = hard ? '?hard=true' : '';
  await apiFetch<{
    success: boolean;
    message: string;
  }>(`/api/v1/jobs/${id}${params}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// React Query Hooks
// ============================================================================

export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (query: ListJobsQuery) => [...jobKeys.lists(), query] as const,
  details: () => [...jobKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobKeys.details(), id] as const,
  stats: () => [...jobKeys.all, 'stats'] as const,
  upcoming: (days?: number) => [...jobKeys.all, 'upcoming', days] as const,
};

export function useJobs(query: ListJobsQuery = {}) {
  return useQuery({
    queryKey: jobKeys.list(query),
    queryFn: () => fetchJobs(query),
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: () => fetchJobById(id),
    enabled: !!id,
  });
}

export function useJobStats() {
  return useQuery({
    queryKey: jobKeys.stats(),
    queryFn: fetchJobStats,
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useUpcomingJobs(days?: number) {
  return useQuery({
    queryKey: jobKeys.upcoming(days),
    queryFn: () => fetchUpcomingJobs(days),
    refetchInterval: 300000, // Refresh every 5 minutes
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats() });
      queryClient.invalidateQueries({ queryKey: jobKeys.upcoming() });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobInput }) =>
      updateJob(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats() });
    },
  });
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobStatus }) =>
      updateJobStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats() });
      queryClient.invalidateQueries({ queryKey: jobKeys.upcoming() });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, hard }: { id: string; hard?: boolean }) =>
      deleteJob(id, hard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.stats() });
      queryClient.invalidateQueries({ queryKey: jobKeys.upcoming() });
    },
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  DRAFT: 'gray',
  PENDING_APPROVAL: 'yellow',
  APPROVED: 'blue',
  IN_PROGRESS: 'indigo',
  ON_HOLD: 'orange',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

export function getStatusBadgeClass(status: JobStatus): string {
  const colorMap: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    orange: 'bg-orange-100 text-orange-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
  };
  return colorMap[JOB_STATUS_COLORS[status]] || colorMap.gray;
}

export function formatJobDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getDaysUntilStart(startDate: string | null): number | null {
  if (!startDate) return null;
  const start = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  return Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
