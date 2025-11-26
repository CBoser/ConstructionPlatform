import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Customer,
  CustomerFull,
  CustomerContact,
  CustomerPricingTier,
  CustomerExternalId,
  CreateCustomerInput,
  UpdateCustomerInput,
  CreateCustomerContactInput,
  UpdateCustomerContactInput,
  CreateCustomerPricingTierInput,
  UpdateCustomerPricingTierInput,
  CreateCustomerExternalIdInput,
  UpdateCustomerExternalIdInput,
  ListCustomersQuery,
  ListCustomersResponse,
} from '../../../shared/types/customer';

// ============================================================================
// API Configuration
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// API error class
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

// API fetch wrapper with auth
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
// Customer API Functions
// ============================================================================

// List customers with filtering and pagination
export async function fetchCustomers(
  query: ListCustomersQuery = {}
): Promise<ListCustomersResponse> {
  const params = new URLSearchParams();
  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());
  if (query.search) params.append('search', query.search);
  if (query.customerType) params.append('customerType', query.customerType);
  if (query.isActive !== undefined)
    params.append('isActive', query.isActive.toString());

  const response = await apiFetch<{
    success: boolean;
    data: Customer[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(`/api/v1/customers?${params}`);

  return {
    data: response.data,
    pagination: response.pagination,
  };
}

// Get customer by ID with all relations
export async function fetchCustomerById(id: string): Promise<CustomerFull> {
  const response = await apiFetch<{
    success: boolean;
    data: CustomerFull;
  }>(`/api/v1/customers/${id}`);

  return response.data;
}

// Create new customer
export async function createCustomer(
  data: CreateCustomerInput
): Promise<CustomerFull> {
  const response = await apiFetch<{
    success: boolean;
    data: CustomerFull;
    message: string;
  }>(`/api/v1/customers`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return response.data;
}

// Update customer
export async function updateCustomer(
  id: string,
  data: UpdateCustomerInput
): Promise<CustomerFull> {
  const response = await apiFetch<{
    success: boolean;
    data: CustomerFull;
    message: string;
  }>(`/api/v1/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  return response.data;
}

// Delete customer (soft delete by default)
export async function deleteCustomer(
  id: string,
  hardDelete = false
): Promise<void> {
  await apiFetch<{
    success: boolean;
    message: string;
  }>(`/api/v1/customers/${id}?hard=${hardDelete}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// Contact API Functions
// ============================================================================

// Get all contacts for a customer
export async function fetchCustomerContacts(
  customerId: string
): Promise<CustomerContact[]> {
  const response = await apiFetch<{
    success: boolean;
    data: CustomerContact[];
  }>(`/api/v1/customers/${customerId}/contacts`);

  return response.data;
}

// Add contact to customer
export async function createContact(
  customerId: string,
  data: Omit<CreateCustomerContactInput, 'customerId'>
): Promise<CustomerContact> {
  const response = await apiFetch<{
    success: boolean;
    data: CustomerContact;
    message: string;
  }>(`/api/v1/customers/${customerId}/contacts`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return response.data;
}

// Update contact
export async function updateContact(
  customerId: string,
  contactId: string,
  data: UpdateCustomerContactInput
): Promise<CustomerContact> {
  const response = await apiFetch<{
    success: boolean;
    data: CustomerContact;
    message: string;
  }>(`/api/v1/customers/${customerId}/contacts/${contactId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  return response.data;
}

// Delete contact
export async function deleteContact(
  customerId: string,
  contactId: string
): Promise<void> {
  await apiFetch<{
    success: boolean;
    message: string;
  }>(`/api/v1/customers/${customerId}/contacts/${contactId}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// Pricing Tier API Functions
// ============================================================================

// Get all pricing tiers for a customer
export async function fetchCustomerPricingTiers(
  customerId: string
): Promise<CustomerPricingTier[]> {
  const response = await apiFetch<{
    success: boolean;
    data: CustomerPricingTier[];
  }>(`/api/v1/customers/${customerId}/pricing-tiers`);

  return response.data;
}

// Get current active pricing tier
export async function fetchCurrentPricingTier(
  customerId: string
): Promise<CustomerPricingTier | null> {
  const response = await apiFetch<{
    success: boolean;
    data: CustomerPricingTier | null;
  }>(`/api/v1/customers/${customerId}/current-pricing`);

  return response.data;
}

// Add pricing tier
export async function createPricingTier(
  customerId: string,
  data: Omit<CreateCustomerPricingTierInput, 'customerId'>
): Promise<CustomerPricingTier> {
  const response = await apiFetch<{
    success: boolean;
    data: CustomerPricingTier;
    message: string;
  }>(`/api/v1/customers/${customerId}/pricing-tiers`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return response.data;
}

// Update pricing tier
export async function updatePricingTier(
  customerId: string,
  tierId: string,
  data: UpdateCustomerPricingTierInput
): Promise<CustomerPricingTier> {
  const response = await apiFetch<{
    success: boolean;
    data: CustomerPricingTier;
    message: string;
  }>(`/api/v1/customers/${customerId}/pricing-tiers/${tierId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  return response.data;
}

// Delete pricing tier
export async function deletePricingTier(
  customerId: string,
  tierId: string
): Promise<void> {
  await apiFetch<{
    success: boolean;
    message: string;
  }>(`/api/v1/customers/${customerId}/pricing-tiers/${tierId}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// External ID API Functions
// ============================================================================

// Get all external IDs for a customer
export async function fetchCustomerExternalIds(
  customerId: string
): Promise<CustomerExternalId[]> {
  const response = await apiFetch<{
    success: boolean;
    data: CustomerExternalId[];
  }>(`/api/v1/customers/${customerId}/external-ids`);

  return response.data;
}

// Add external ID mapping
export async function createExternalId(
  customerId: string,
  data: Omit<CreateCustomerExternalIdInput, 'customerId'>
): Promise<CustomerExternalId> {
  const response = await apiFetch<{
    success: boolean;
    data: CustomerExternalId;
    message: string;
  }>(`/api/v1/customers/${customerId}/external-ids`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return response.data;
}

// Update external ID mapping
export async function updateExternalId(
  customerId: string,
  externalIdId: string,
  data: UpdateCustomerExternalIdInput
): Promise<CustomerExternalId> {
  const response = await apiFetch<{
    success: boolean;
    data: CustomerExternalId;
    message: string;
  }>(`/api/v1/customers/${customerId}/external-ids/${externalIdId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  return response.data;
}

// Delete external ID mapping
export async function deleteExternalId(
  customerId: string,
  externalIdId: string
): Promise<void> {
  await apiFetch<{
    success: boolean;
    message: string;
  }>(`/api/v1/customers/${customerId}/external-ids/${externalIdId}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// React Query Hooks
// ============================================================================

// Query Keys
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (query: ListCustomersQuery) =>
    [...customerKeys.lists(), query] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  contacts: (customerId: string) =>
    [...customerKeys.detail(customerId), 'contacts'] as const,
  pricingTiers: (customerId: string) =>
    [...customerKeys.detail(customerId), 'pricing-tiers'] as const,
  currentPricing: (customerId: string) =>
    [...customerKeys.detail(customerId), 'current-pricing'] as const,
  externalIds: (customerId: string) =>
    [...customerKeys.detail(customerId), 'external-ids'] as const,
};

// ============================================================================
// Customer Queries
// ============================================================================

// Hook: List customers with filtering
export function useCustomers(query: ListCustomersQuery = {}) {
  return useQuery({
    queryKey: customerKeys.list(query),
    queryFn: () => fetchCustomers(query),
  });
}

// Hook: Get customer by ID
export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => fetchCustomerById(id),
    enabled: !!id,
  });
}

// Hook: Create customer
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

// Hook: Update customer
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerInput }) =>
      updateCustomer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(variables.id),
      });
    },
  });
}

// Hook: Delete customer
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, hardDelete }: { id: string; hardDelete?: boolean }) =>
      deleteCustomer(id, hardDelete),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

// ============================================================================
// Contact Queries
// ============================================================================

// Hook: Get customer contacts
export function useCustomerContacts(customerId: string) {
  return useQuery({
    queryKey: customerKeys.contacts(customerId),
    queryFn: () => fetchCustomerContacts(customerId),
    enabled: !!customerId,
  });
}

// Hook: Create contact
export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      data,
    }: {
      customerId: string;
      data: Omit<CreateCustomerContactInput, 'customerId'>;
    }) => createContact(customerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.contacts(variables.customerId),
      });
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(variables.customerId),
      });
    },
  });
}

// Hook: Update contact
export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      contactId,
      data,
    }: {
      customerId: string;
      contactId: string;
      data: UpdateCustomerContactInput;
    }) => updateContact(customerId, contactId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.contacts(variables.customerId),
      });
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(variables.customerId),
      });
    },
  });
}

// Hook: Delete contact
export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      contactId,
    }: {
      customerId: string;
      contactId: string;
    }) => deleteContact(customerId, contactId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.contacts(variables.customerId),
      });
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(variables.customerId),
      });
    },
  });
}

// ============================================================================
// Pricing Tier Queries
// ============================================================================

// Hook: Get pricing tiers
export function useCustomerPricingTiers(customerId: string) {
  return useQuery({
    queryKey: customerKeys.pricingTiers(customerId),
    queryFn: () => fetchCustomerPricingTiers(customerId),
    enabled: !!customerId,
  });
}

// Hook: Get current pricing tier
export function useCurrentPricingTier(customerId: string) {
  return useQuery({
    queryKey: customerKeys.currentPricing(customerId),
    queryFn: () => fetchCurrentPricingTier(customerId),
    enabled: !!customerId,
  });
}

// Hook: Create pricing tier
export function useCreatePricingTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      data,
    }: {
      customerId: string;
      data: Omit<CreateCustomerPricingTierInput, 'customerId'>;
    }) => createPricingTier(customerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.pricingTiers(variables.customerId),
      });
      queryClient.invalidateQueries({
        queryKey: customerKeys.currentPricing(variables.customerId),
      });
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(variables.customerId),
      });
    },
  });
}

// Hook: Update pricing tier
export function useUpdatePricingTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      tierId,
      data,
    }: {
      customerId: string;
      tierId: string;
      data: UpdateCustomerPricingTierInput;
    }) => updatePricingTier(customerId, tierId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.pricingTiers(variables.customerId),
      });
      queryClient.invalidateQueries({
        queryKey: customerKeys.currentPricing(variables.customerId),
      });
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(variables.customerId),
      });
    },
  });
}

// Hook: Delete pricing tier
export function useDeletePricingTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      tierId,
    }: {
      customerId: string;
      tierId: string;
    }) => deletePricingTier(customerId, tierId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.pricingTiers(variables.customerId),
      });
      queryClient.invalidateQueries({
        queryKey: customerKeys.currentPricing(variables.customerId),
      });
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(variables.customerId),
      });
    },
  });
}

// ============================================================================
// External ID Queries
// ============================================================================

// Hook: Get external IDs
export function useCustomerExternalIds(customerId: string) {
  return useQuery({
    queryKey: customerKeys.externalIds(customerId),
    queryFn: () => fetchCustomerExternalIds(customerId),
    enabled: !!customerId,
  });
}

// Hook: Create external ID
export function useCreateExternalId() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      data,
    }: {
      customerId: string;
      data: Omit<CreateCustomerExternalIdInput, 'customerId'>;
    }) => createExternalId(customerId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.externalIds(variables.customerId),
      });
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(variables.customerId),
      });
    },
  });
}

// Hook: Update external ID
export function useUpdateExternalId() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      externalIdId,
      data,
    }: {
      customerId: string;
      externalIdId: string;
      data: UpdateCustomerExternalIdInput;
    }) => updateExternalId(customerId, externalIdId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.externalIds(variables.customerId),
      });
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(variables.customerId),
      });
    },
  });
}

// Hook: Delete external ID
export function useDeleteExternalId() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      externalIdId,
    }: {
      customerId: string;
      externalIdId: string;
    }) => deleteExternalId(customerId, externalIdId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.externalIds(variables.customerId),
      });
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(variables.customerId),
      });
    },
  });
}
