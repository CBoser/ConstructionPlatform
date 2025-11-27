import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

export type PlanType = 'SINGLE_STORY' | 'TWO_STORY' | 'THREE_STORY' | 'DUPLEX' | 'TOWNHOME';

export interface Plan {
  id: string;
  code: string;
  name: string | null;
  type: PlanType;
  sqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  garage: string | null;
  style: string | null;
  version: number;
  isActive: boolean;
  pdssUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    elevations: number;
    templateItems: number;
    jobs: number;
  };
}

export interface PlanElevation {
  id: string;
  planId: string;
  code: string;
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlanFull extends Plan {
  elevations: PlanElevation[];
}

export interface CreatePlanInput {
  code: string;
  name?: string;
  type: PlanType;
  sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  garage?: string;
  style?: string;
  pdssUrl?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdatePlanInput {
  code?: string;
  name?: string;
  type?: PlanType;
  sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  garage?: string;
  style?: string;
  pdssUrl?: string;
  notes?: string;
  isActive?: boolean;
}

export interface ListPlansQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: PlanType;
  isActive?: boolean;
  sortBy?: 'code' | 'name' | 'sqft' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ListPlansResponse {
  data: Plan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

export async function fetchPlans(query: ListPlansQuery = {}): Promise<ListPlansResponse> {
  const params = new URLSearchParams();
  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());
  if (query.search) params.append('search', query.search);
  if (query.type) params.append('type', query.type);
  if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);

  const response = await apiFetch<{
    success: boolean;
    data: Plan[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(`/api/v1/plans?${params}`);

  return {
    data: response.data,
    pagination: response.pagination,
  };
}

export async function fetchPlanById(id: string): Promise<PlanFull> {
  const response = await apiFetch<{
    success: boolean;
    data: PlanFull;
  }>(`/api/v1/plans/${id}?includeRelations=true`);

  return response.data;
}

export async function fetchPlanByCode(code: string): Promise<PlanFull> {
  const response = await apiFetch<{
    success: boolean;
    data: PlanFull;
  }>(`/api/v1/plans/code/${code}?includeRelations=true`);

  return response.data;
}

export async function createPlan(data: CreatePlanInput): Promise<Plan> {
  const response = await apiFetch<{
    success: boolean;
    data: Plan;
    message: string;
  }>(`/api/v1/plans`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return response.data;
}

export async function updatePlan(id: string, data: UpdatePlanInput): Promise<Plan> {
  const response = await apiFetch<{
    success: boolean;
    data: Plan;
    message: string;
  }>(`/api/v1/plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  return response.data;
}

export async function deletePlan(id: string): Promise<void> {
  await apiFetch<{
    success: boolean;
    message: string;
  }>(`/api/v1/plans/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchPlanStats(): Promise<{
  total: number;
  byType: { type: string; count: number }[];
  activeCount: number;
}> {
  const response = await apiFetch<{
    success: boolean;
    data: {
      total: number;
      byType: { type: string; count: number }[];
      activeCount: number;
    };
  }>(`/api/v1/plans/stats`);

  return response.data;
}

// ============================================================================
// React Query Hooks
// ============================================================================

export const planKeys = {
  all: ['plans'] as const,
  lists: () => [...planKeys.all, 'list'] as const,
  list: (query: ListPlansQuery) => [...planKeys.lists(), query] as const,
  details: () => [...planKeys.all, 'detail'] as const,
  detail: (id: string) => [...planKeys.details(), id] as const,
  stats: () => [...planKeys.all, 'stats'] as const,
};

export function usePlans(query: ListPlansQuery = {}) {
  return useQuery({
    queryKey: planKeys.list(query),
    queryFn: () => fetchPlans(query),
  });
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: planKeys.detail(id),
    queryFn: () => fetchPlanById(id),
    enabled: !!id,
  });
}

export function usePlanStats() {
  return useQuery({
    queryKey: planKeys.stats(),
    queryFn: fetchPlanStats,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.stats() });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanInput }) =>
      updatePlan(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: planKeys.stats() });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.stats() });
    },
  });
}
