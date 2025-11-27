import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

export type DocumentType =
  | 'PLAN_DRAWING'
  | 'ELEVATION_DRAWING'
  | 'SPECIFICATIONS'
  | 'MATERIAL_LIST'
  | 'PRICING_SHEET'
  | 'OPTION_DETAILS'
  | 'OTHER';

export interface PlanDocument {
  id: string;
  planId: string;
  elevationId: string | null;
  fileName: string;
  fileType: DocumentType;
  filePath: string;
  fileSize: number;
  mimeType: string;
  version: number;
  documentDate: string;
  isArchived: boolean;
  archiveDate: string | null;
  archiveNotes: string | null;
  changeNotes: string | null;
  replacedById: string | null;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: {
    id: string;
    code: string;
    name: string | null;
  };
  elevation?: {
    id: string;
    code: string;
    name: string | null;
  };
  replacedBy?: {
    id: string;
    version: number;
    fileName: string;
    createdAt: string;
  };
}

export interface UploadDocumentInput {
  file: File;
  fileType: DocumentType;
  documentDate: Date;
  elevationId?: string;
  changeNotes?: string;
}

export interface ReplaceDocumentInput {
  file: File;
  documentDate: Date;
  changeNotes?: string;
  archiveNotes?: string;
}

export interface UpdateDocumentInput {
  fileType?: DocumentType;
  documentDate?: Date;
  changeNotes?: string;
}

export interface ListDocumentsQuery {
  planId: string;
  elevationId?: string;
  fileType?: DocumentType;
  includeArchived?: boolean;
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

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Don't set Content-Type for FormData - browser will set it with boundary
  if (options.body instanceof FormData) {
    delete (headers as any)['Content-Type'];
  } else if (!headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

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

export async function uploadDocument(
  planId: string,
  input: UploadDocumentInput
): Promise<PlanDocument> {
  const formData = new FormData();
  formData.append('file', input.file);
  formData.append('fileType', input.fileType);
  formData.append('documentDate', input.documentDate.toISOString());
  if (input.elevationId) formData.append('elevationId', input.elevationId);
  if (input.changeNotes) formData.append('changeNotes', input.changeNotes);

  const response = await apiFetch<{
    success: boolean;
    data: PlanDocument;
    message: string;
  }>(`/api/v1/plans/${planId}/documents`, {
    method: 'POST',
    body: formData,
  });

  return response.data;
}

export async function listDocuments(query: ListDocumentsQuery): Promise<PlanDocument[]> {
  const params = new URLSearchParams();
  if (query.elevationId !== undefined) params.append('elevationId', query.elevationId);
  if (query.fileType) params.append('fileType', query.fileType);
  if (query.includeArchived !== undefined)
    params.append('includeArchived', query.includeArchived.toString());

  const response = await apiFetch<{
    success: boolean;
    data: PlanDocument[];
  }>(`/api/v1/plans/${query.planId}/documents?${params}`);

  return response.data;
}

export async function getDocumentById(
  planId: string,
  documentId: string
): Promise<PlanDocument> {
  const response = await apiFetch<{
    success: boolean;
    data: PlanDocument;
  }>(`/api/v1/plans/${planId}/documents/${documentId}`);

  return response.data;
}

export async function downloadDocument(planId: string, documentId: string): Promise<void> {
  const token = getAuthToken();
  const url = `${API_BASE_URL}/api/v1/plans/${planId}/documents/${documentId}/download`;

  const response = await fetch(url, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    throw new Error('Failed to download document');
  }

  // Get filename from Content-Disposition header or use default
  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = 'download';
  if (contentDisposition) {
    const matches = /filename="(.+)"/.exec(contentDisposition);
    if (matches) filename = matches[1];
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(downloadUrl);
}

export async function updateDocument(
  planId: string,
  documentId: string,
  input: UpdateDocumentInput
): Promise<PlanDocument> {
  const body: any = {};
  if (input.fileType) body.fileType = input.fileType;
  if (input.documentDate) body.documentDate = input.documentDate.toISOString();
  if (input.changeNotes !== undefined) body.changeNotes = input.changeNotes;

  const response = await apiFetch<{
    success: boolean;
    data: PlanDocument;
    message: string;
  }>(`/api/v1/plans/${planId}/documents/${documentId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  return response.data;
}

export async function replaceDocument(
  planId: string,
  documentId: string,
  input: ReplaceDocumentInput
): Promise<PlanDocument> {
  const formData = new FormData();
  formData.append('file', input.file);
  formData.append('documentDate', input.documentDate.toISOString());
  if (input.changeNotes) formData.append('changeNotes', input.changeNotes);
  if (input.archiveNotes) formData.append('archiveNotes', input.archiveNotes);

  const response = await apiFetch<{
    success: boolean;
    data: PlanDocument;
    message: string;
  }>(`/api/v1/plans/${planId}/documents/${documentId}/replace`, {
    method: 'POST',
    body: formData,
  });

  return response.data;
}

export async function archiveDocument(
  planId: string,
  documentId: string,
  archiveNotes?: string
): Promise<PlanDocument> {
  const response = await apiFetch<{
    success: boolean;
    data: PlanDocument;
    message: string;
  }>(`/api/v1/plans/${planId}/documents/${documentId}/archive`, {
    method: 'POST',
    body: JSON.stringify({ archiveNotes }),
  });

  return response.data;
}

export async function deleteDocument(planId: string, documentId: string): Promise<void> {
  await apiFetch<{
    success: boolean;
    message: string;
  }>(`/api/v1/plans/${planId}/documents/${documentId}`, {
    method: 'DELETE',
  });
}

export async function getVersionHistory(
  planId: string,
  elevationId?: string,
  fileType?: DocumentType
): Promise<PlanDocument[]> {
  const params = new URLSearchParams();
  if (elevationId) params.append('elevationId', elevationId);
  if (fileType) params.append('fileType', fileType);

  const response = await apiFetch<{
    success: boolean;
    data: PlanDocument[];
  }>(`/api/v1/plans/${planId}/documents-versions?${params}`);

  return response.data;
}

export async function exportAllPlans(isActive?: boolean): Promise<any[]> {
  const params = new URLSearchParams();
  if (isActive !== undefined) params.append('isActive', isActive.toString());

  const response = await apiFetch<{
    success: boolean;
    data: any[];
    message: string;
  }>(`/api/v1/plans/export-all?${params}`);

  return response.data;
}

// ============================================================================
// React Query Hooks
// ============================================================================

export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (query: ListDocumentsQuery) => [...documentKeys.lists(), query] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (planId: string, documentId: string) =>
    [...documentKeys.details(), planId, documentId] as const,
  versions: (planId: string, elevationId?: string, fileType?: DocumentType) =>
    [...documentKeys.all, 'versions', planId, elevationId, fileType] as const,
};

export function useDocuments(query: ListDocumentsQuery) {
  return useQuery({
    queryKey: documentKeys.list(query),
    queryFn: () => listDocuments(query),
    enabled: !!query.planId,
  });
}

export function useDocument(planId: string, documentId: string) {
  return useQuery({
    queryKey: documentKeys.detail(planId, documentId),
    queryFn: () => getDocumentById(planId, documentId),
    enabled: !!planId && !!documentId,
  });
}

export function useVersionHistory(
  planId: string,
  elevationId?: string,
  fileType?: DocumentType
) {
  return useQuery({
    queryKey: documentKeys.versions(planId, elevationId, fileType),
    queryFn: () => getVersionHistory(planId, elevationId, fileType),
    enabled: !!planId,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, input }: { planId: string; input: UploadDocumentInput }) =>
      uploadDocument(planId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}

export function useReplaceDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      planId,
      documentId,
      input,
    }: {
      planId: string;
      documentId: string;
      input: ReplaceDocumentInput;
    }) => replaceDocument(planId, documentId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: documentKeys.detail(variables.planId, variables.documentId),
      });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      planId,
      documentId,
      input,
    }: {
      planId: string;
      documentId: string;
      input: UpdateDocumentInput;
    }) => updateDocument(planId, documentId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: documentKeys.detail(variables.planId, variables.documentId),
      });
    },
  });
}

export function useArchiveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      planId,
      documentId,
      archiveNotes,
    }: {
      planId: string;
      documentId: string;
      archiveNotes?: string;
    }) => archiveDocument(planId, documentId, archiveNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, documentId }: { planId: string; documentId: string }) =>
      deleteDocument(planId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}
