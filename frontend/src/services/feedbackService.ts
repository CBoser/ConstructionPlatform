/**
 * Feedback Service
 *
 * React Query hooks and API functions for the feedback and learning system.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// =============================================================================
// TYPES
// =============================================================================

export type FeedbackType =
  | 'VARIANCE_REPORT'
  | 'QUALITY_ISSUE'
  | 'PROCESS_FAILURE'
  | 'SUGGESTION'
  | 'CORRECTION'
  | 'THUMBS_UP'
  | 'THUMBS_DOWN';

export type FeedbackCategory =
  | 'MATERIAL'
  | 'TIMING'
  | 'DOCUMENT'
  | 'ESTIMATE'
  | 'IMPORT'
  | 'AGENT'
  | 'UI_UX'
  | 'OTHER';

export type FeedbackStatus =
  | 'NEW'
  | 'REVIEWED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'DISMISSED'
  | 'DEFERRED';

export interface FeedbackUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email?: string;
}

export interface FeedbackResponse {
  id: string;
  feedbackId: string;
  responderId: string;
  responder: FeedbackUser;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

export interface FeedbackPattern {
  id: string;
  patternType: string;
  patternName: string;
  description: string | null;
  entityType: string | null;
  entityId: string | null;
  entityName: string | null;
  occurrenceCount: number;
  avgVariance: number | null;
  avgVariancePct: number | null;
  totalImpact: number | null;
  confidence: number | null;
  sampleSize: number;
  recommendation: string | null;
  adjustmentFactor: number | null;
  isActive: boolean;
  isApplied: boolean;
}

export interface Feedback {
  id: string;
  feedbackType: FeedbackType;
  category: FeedbackCategory;
  entityType: string;
  entityId: string;
  entityName: string | null;
  rating: number | null;
  estimatedValue: number | null;
  actualValue: number | null;
  varianceAmount: number | null;
  variancePercent: number | null;
  title: string | null;
  description: string | null;
  notes: string | null;
  context: Record<string, any> | null;
  tags: string[];
  source: string | null;
  submittedById: string | null;
  submittedBy: FeedbackUser | null;
  status: FeedbackStatus;
  resolvedById: string | null;
  resolvedBy: FeedbackUser | null;
  resolvedAt: string | null;
  actionTaken: string | null;
  createdAt: string;
  updatedAt: string;
  responses?: FeedbackResponse[];
  patterns?: FeedbackPattern[];
  _count?: { responses: number };
}

export interface FeedbackDashboard {
  summary: {
    total: number;
    new: number;
    inProgress: number;
    resolved: number;
    dismissed: number;
  };
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  variance: {
    avgVariancePercent: string | null;
    reportCount: number;
  };
  satisfaction: {
    thumbsUp: number;
    thumbsDown: number;
    ratio: number | null;
  };
  recentFeedback: Feedback[];
  topPatterns: FeedbackPattern[];
}

export interface VarianceSummary {
  id: string;
  periodType: string;
  periodStart: string;
  periodEnd: string;
  entityType: string;
  entityId: string | null;
  entityName: string | null;
  totalEstimated: number;
  totalActual: number;
  totalVariance: number;
  variancePercent: number;
  jobCount: number;
  overEstimates: number;
  underEstimates: number;
  onTarget: number;
  avgVariance: number | null;
  medianVariance: number | null;
}

export interface FeedbackListParams {
  feedbackType?: FeedbackType;
  category?: FeedbackCategory;
  status?: FeedbackStatus;
  entityType?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'rating' | 'variancePercent';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateFeedbackInput {
  feedbackType: FeedbackType;
  category?: FeedbackCategory;
  entityType: string;
  entityId: string;
  entityName?: string;
  rating?: number;
  estimatedValue?: number;
  actualValue?: number;
  title?: string;
  description?: string;
  notes?: string;
  context?: Record<string, any>;
  tags?: string[];
  source?: string;
}

export interface QuickFeedbackInput {
  entityType: string;
  entityId: string;
  entityName?: string;
  isPositive: boolean;
  category?: FeedbackCategory;
  notes?: string;
}

export interface VarianceReportInput {
  entityType: string;
  entityId: string;
  entityName?: string;
  category?: FeedbackCategory;
  estimatedValue: number;
  actualValue: number;
  title?: string;
  description?: string;
  context?: Record<string, any>;
  tags?: string[];
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

export async function getFeedbackDashboard(): Promise<FeedbackDashboard> {
  const response = await api.get('/feedback/dashboard');
  return response.data;
}

export async function getFeedbackList(
  params: FeedbackListParams = {}
): Promise<{ items: Feedback[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const response = await api.get('/feedback', { params });
  return response.data;
}

export async function getFeedback(id: string): Promise<Feedback> {
  const response = await api.get(`/feedback/${id}`);
  return response.data;
}

export async function getFeedbackPatterns(params?: {
  entityType?: string;
  isActive?: boolean;
}): Promise<FeedbackPattern[]> {
  const response = await api.get('/feedback/patterns', { params });
  return response.data;
}

export async function getVarianceSummaries(params?: {
  periodType?: string;
  entityType?: string;
  limit?: number;
}): Promise<VarianceSummary[]> {
  const response = await api.get('/feedback/variance', { params });
  return response.data;
}

export async function createFeedback(input: CreateFeedbackInput): Promise<Feedback> {
  const response = await api.post('/feedback', input);
  return response.data;
}

export async function submitQuickFeedback(input: QuickFeedbackInput): Promise<Feedback> {
  const response = await api.post('/feedback/quick', input);
  return response.data;
}

export async function submitVarianceReport(input: VarianceReportInput): Promise<Feedback> {
  const response = await api.post('/feedback/variance', input);
  return response.data;
}

export async function updateFeedback(
  id: string,
  data: Partial<Pick<Feedback, 'category' | 'title' | 'description' | 'notes' | 'tags' | 'status'>>
): Promise<Feedback> {
  const response = await api.put(`/feedback/${id}`, data);
  return response.data;
}

export async function resolveFeedback(
  id: string,
  data: { status: 'RESOLVED' | 'DISMISSED' | 'DEFERRED'; actionTaken?: string }
): Promise<Feedback> {
  const response = await api.put(`/feedback/${id}/resolve`, data);
  return response.data;
}

export async function addFeedbackResponse(
  feedbackId: string,
  data: { message: string; isInternal?: boolean }
): Promise<FeedbackResponse> {
  const response = await api.post(`/feedback/${feedbackId}/respond`, data);
  return response.data;
}

export async function deleteFeedback(id: string): Promise<void> {
  await api.delete(`/feedback/${id}`);
}

// =============================================================================
// REACT QUERY HOOKS
// =============================================================================

export function useFeedbackDashboard() {
  return useQuery({
    queryKey: ['feedback', 'dashboard'],
    queryFn: getFeedbackDashboard,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useFeedbackList(params: FeedbackListParams = {}) {
  return useQuery({
    queryKey: ['feedback', 'list', params],
    queryFn: () => getFeedbackList(params),
    staleTime: 30 * 1000,
  });
}

export function useFeedback(id: string | undefined) {
  return useQuery({
    queryKey: ['feedback', 'detail', id],
    queryFn: () => getFeedback(id!),
    enabled: !!id,
  });
}

export function useFeedbackPatterns(params?: { entityType?: string; isActive?: boolean }) {
  return useQuery({
    queryKey: ['feedback', 'patterns', params],
    queryFn: () => getFeedbackPatterns(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useVarianceSummaries(params?: { periodType?: string; entityType?: string; limit?: number }) {
  return useQuery({
    queryKey: ['feedback', 'variance', params],
    queryFn: () => getVarianceSummaries(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
}

export function useQuickFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitQuickFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
}

export function useVarianceReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitVarianceReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
}

export function useUpdateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateFeedback>[1] }) =>
      updateFeedback(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['feedback', 'detail', id] });
    },
  });
}

export function useResolveFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof resolveFeedback>[1] }) =>
      resolveFeedback(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['feedback', 'detail', id] });
    },
  });
}

export function useAddFeedbackResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ feedbackId, data }: { feedbackId: string; data: Parameters<typeof addFeedbackResponse>[1] }) =>
      addFeedbackResponse(feedbackId, data),
    onSuccess: (_, { feedbackId }) => {
      queryClient.invalidateQueries({ queryKey: ['feedback', 'detail', feedbackId] });
    },
  });
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  VARIANCE_REPORT: 'Variance Report',
  QUALITY_ISSUE: 'Quality Issue',
  PROCESS_FAILURE: 'Process Failure',
  SUGGESTION: 'Suggestion',
  CORRECTION: 'Correction',
  THUMBS_UP: 'Positive',
  THUMBS_DOWN: 'Negative',
};

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  MATERIAL: 'Material',
  TIMING: 'Timing',
  DOCUMENT: 'Document',
  ESTIMATE: 'Estimate',
  IMPORT: 'Import',
  AGENT: 'Agent',
  UI_UX: 'UI/UX',
  OTHER: 'Other',
};

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  NEW: 'New',
  REVIEWED: 'Reviewed',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  DISMISSED: 'Dismissed',
  DEFERRED: 'Deferred',
};

export function getStatusColor(status: FeedbackStatus): string {
  const colors: Record<FeedbackStatus, string> = {
    NEW: '#3498db',
    REVIEWED: '#9b59b6',
    IN_PROGRESS: '#f39c12',
    RESOLVED: '#27ae60',
    DISMISSED: '#95a5a6',
    DEFERRED: '#7f8c8d',
  };
  return colors[status];
}

export function getTypeColor(type: FeedbackType): string {
  const colors: Record<FeedbackType, string> = {
    VARIANCE_REPORT: '#e74c3c',
    QUALITY_ISSUE: '#e67e22',
    PROCESS_FAILURE: '#c0392b',
    SUGGESTION: '#3498db',
    CORRECTION: '#9b59b6',
    THUMBS_UP: '#27ae60',
    THUMBS_DOWN: '#e74c3c',
  };
  return colors[type];
}

export function getVarianceColor(percent: number): string {
  const absPercent = Math.abs(percent);
  if (absPercent <= 5) return '#27ae60'; // Green - on target
  if (absPercent <= 10) return '#f39c12'; // Yellow - slight variance
  if (absPercent <= 20) return '#e67e22'; // Orange - moderate variance
  return '#e74c3c'; // Red - significant variance
}

export function formatVariance(amount: number, percent: number): string {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${sign}${percent.toFixed(1)}%)`;
}

export function formatUserName(user: FeedbackUser | null): string {
  if (!user) return 'Unknown';
  if (user.firstName || user.lastName) {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }
  return user.email || 'Unknown';
}
