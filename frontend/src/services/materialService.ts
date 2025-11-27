import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

export type MaterialCategory =
  | 'DIMENSIONAL_LUMBER'
  | 'ENGINEERED_LUMBER'
  | 'SHEATHING'
  | 'PRESSURE_TREATED'
  | 'HARDWARE'
  | 'CONCRETE'
  | 'ROOFING'
  | 'SIDING'
  | 'INSULATION'
  | 'DRYWALL'
  | 'OTHER';

export interface Material {
  id: string;
  sku: string;
  description: string;
  category: MaterialCategory;
  subcategory: string | null;
  dartCategory: number | null;
  dartCategoryName: string | null;
  unitOfMeasure: string;
  vendorCost: number;
  freight: number;
  isRLLinked: boolean;
  rlTag: string | null;
  rlBasePrice: number | null;
  rlLastUpdated: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  vendor?: {
    id: string;
    name: string;
  } | null;
  _count?: {
    templateItems: number;
    pricingHistory: number;
  };
}

export interface CreateMaterialInput {
  sku: string;
  description: string;
  category: MaterialCategory;
  subcategory?: string;
  dartCategory?: number;
  dartCategoryName?: string;
  unitOfMeasure: string;
  vendorCost: number;
  freight?: number;
  isRLLinked?: boolean;
  rlTag?: string;
  isActive?: boolean;
}

export interface UpdateMaterialInput {
  sku?: string;
  description?: string;
  category?: MaterialCategory;
  subcategory?: string;
  dartCategory?: number;
  dartCategoryName?: string;
  unitOfMeasure?: string;
  vendorCost?: number;
  freight?: number;
  isRLLinked?: boolean;
  rlTag?: string;
  isActive?: boolean;
}

export interface ListMaterialsQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: MaterialCategory;
  dartCategory?: number;
  isActive?: boolean;
  isRLLinked?: boolean;
  sortBy?: 'sku' | 'description' | 'category' | 'createdAt' | 'updatedAt' | 'vendorCost';
  sortOrder?: 'asc' | 'desc';
}

export interface ListMaterialsResponse {
  data: Material[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MaterialStats {
  total: number;
  byCategory: { category: string; count: number }[];
  byDartCategory: { dartCategory: number; count: number }[];
  rlLinkedCount: number;
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

export async function fetchMaterials(query: ListMaterialsQuery = {}): Promise<ListMaterialsResponse> {
  const params = new URLSearchParams();
  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());
  if (query.search) params.append('search', query.search);
  if (query.category) params.append('category', query.category);
  if (query.dartCategory !== undefined) params.append('dartCategory', query.dartCategory.toString());
  if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());
  if (query.isRLLinked !== undefined) params.append('isRLLinked', query.isRLLinked.toString());
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);

  const response = await apiFetch<{
    success: boolean;
    data: Material[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(`/api/v1/materials?${params}`);

  return {
    data: response.data,
    pagination: response.pagination,
  };
}

export async function fetchMaterialById(id: string): Promise<Material> {
  const response = await apiFetch<{
    success: boolean;
    data: Material;
  }>(`/api/v1/materials/${id}?includeRelations=true`);

  return response.data;
}

export async function fetchMaterialBySku(sku: string): Promise<Material> {
  const response = await apiFetch<{
    success: boolean;
    data: Material;
  }>(`/api/v1/materials/sku/${encodeURIComponent(sku)}?includeRelations=true`);

  return response.data;
}

export async function createMaterial(data: CreateMaterialInput): Promise<Material> {
  const response = await apiFetch<{
    success: boolean;
    data: Material;
    message: string;
  }>(`/api/v1/materials`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return response.data;
}

export async function updateMaterial(id: string, data: UpdateMaterialInput): Promise<Material> {
  const response = await apiFetch<{
    success: boolean;
    data: Material;
    message: string;
  }>(`/api/v1/materials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  return response.data;
}

export async function deleteMaterial(id: string): Promise<void> {
  await apiFetch<{
    success: boolean;
    message: string;
  }>(`/api/v1/materials/${id}`, {
    method: 'DELETE',
  });
}

export async function deactivateMaterial(id: string): Promise<Material> {
  const response = await apiFetch<{
    success: boolean;
    data: Material;
  }>(`/api/v1/materials/${id}/deactivate`, {
    method: 'POST',
  });

  return response.data;
}

export async function activateMaterial(id: string): Promise<Material> {
  const response = await apiFetch<{
    success: boolean;
    data: Material;
  }>(`/api/v1/materials/${id}/activate`, {
    method: 'POST',
  });

  return response.data;
}

export async function fetchMaterialStats(): Promise<MaterialStats> {
  const response = await apiFetch<{
    success: boolean;
    data: MaterialStats;
  }>(`/api/v1/materials/stats`);

  return response.data;
}

export async function fetchCategories(): Promise<MaterialCategory[]> {
  const response = await apiFetch<{
    success: boolean;
    data: MaterialCategory[];
  }>(`/api/v1/materials/categories`);

  return response.data;
}

export async function fetchRLLinkedMaterials(): Promise<Material[]> {
  const response = await apiFetch<{
    success: boolean;
    data: Material[];
  }>(`/api/v1/materials/rl-linked`);

  return response.data;
}

export async function fetchMaterialsByDartCategory(dartCategory: number): Promise<Material[]> {
  const response = await apiFetch<{
    success: boolean;
    data: Material[];
  }>(`/api/v1/materials/dart-category/${dartCategory}`);

  return response.data;
}

// ============================================================================
// React Query Hooks
// ============================================================================

export const materialKeys = {
  all: ['materials'] as const,
  lists: () => [...materialKeys.all, 'list'] as const,
  list: (query: ListMaterialsQuery) => [...materialKeys.lists(), query] as const,
  details: () => [...materialKeys.all, 'detail'] as const,
  detail: (id: string) => [...materialKeys.details(), id] as const,
  stats: () => [...materialKeys.all, 'stats'] as const,
  categories: () => [...materialKeys.all, 'categories'] as const,
  rlLinked: () => [...materialKeys.all, 'rl-linked'] as const,
  dartCategory: (dartCategory: number) => [...materialKeys.all, 'dart-category', dartCategory] as const,
};

export function useMaterials(query: ListMaterialsQuery = {}) {
  return useQuery({
    queryKey: materialKeys.list(query),
    queryFn: () => fetchMaterials(query),
  });
}

export function useMaterial(id: string) {
  return useQuery({
    queryKey: materialKeys.detail(id),
    queryFn: () => fetchMaterialById(id),
    enabled: !!id,
  });
}

export function useMaterialStats() {
  return useQuery({
    queryKey: materialKeys.stats(),
    queryFn: fetchMaterialStats,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: materialKeys.categories(),
    queryFn: fetchCategories,
  });
}

export function useRLLinkedMaterials() {
  return useQuery({
    queryKey: materialKeys.rlLinked(),
    queryFn: fetchRLLinkedMaterials,
  });
}

export function useMaterialsByDartCategory(dartCategory: number) {
  return useQuery({
    queryKey: materialKeys.dartCategory(dartCategory),
    queryFn: () => fetchMaterialsByDartCategory(dartCategory),
    enabled: dartCategory > 0,
  });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.stats() });
    },
  });
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaterialInput }) =>
      updateMaterial(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: materialKeys.stats() });
    },
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.stats() });
    },
  });
}

export function useDeactivateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.stats() });
    },
  });
}

export function useActivateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.stats() });
    },
  });
}
