import { createApi } from "@reduxjs/toolkit/query/react";
import { ServiceDeliveryResource } from "../../../types/ServiceDeliveryResource";
import { SourceSystem } from "../../../types/SourceSystem";
import { adminBaseQuery } from "./baseQueries";
import { TeamMembersApiResponse } from "./transformers/transformTeamMemberResponse";
import { ViewQuoteDetailsHeaderData } from "../../../types";

export interface TeamMembersRequestParams {
  workflowMarketId: number;
}

interface SortOrderPayload {
  sortOrderSourceName: string;
  sortOrderSourceDetails: { sortOrderSourceId: number; sortOrder: number }[];
}

interface SalesRepresentativeParams {
  workflowMarketId: number;
  serviceRequestId: number;
}

interface SubCategoryMappingPayload {
  workflowMarketId: number;
  payload: any;
}

interface CustomerDetailsResponse {
  customer: {
    account0: {
      accountNumber: string;
      name: string;
      erpSystem: SourceSystem;
      status: string;
      customerType: string;
      portalEnabled: boolean;
    };
  };
}

export interface SavedFilterView {
  density: number;
  groupBy: number;
  includeArhive: boolean;
  isDefaultSavedFilterView: boolean;
  showTask: boolean;
  showQuote?: boolean;
  sortBy: number;
  workflowSavedFilterViewId: number;
  workflowSavedFilterViewName: string;
  marketQueue?: string;
  teamQueue?: string;
  assignment?: string;
  categories?: string;
  categoryStatus?: string;
  quoteStatus?: string;
  following: boolean;
  projectType?: string;
  salesRep?: string;
  customer?: string;
  quoteName?: string;
  jobId?: string;
  projectLabels?: string;
  categorySalesRep?: string;
  dateType?: number;
  startDate?: string;
  endDate?: string;
  daysTillDue?: string;
  smartSearchQuery?: string;
  maxResults?: number;
  resultsPerPage?: number;
  externalTakeoffRequestStatus?: string;
  includeArchived?: boolean;
  searchText?: string;
}

export type IndividualFilterResponse = Array<{
  id: number;
  value: string;
  numberOfResults?: number;
}>;

export interface FiltersResponse {
  additionalSalesRepresentativeUsers: IndividualFilterResponse;
  assignedToServiceDeliveryTeams: IndividualFilterResponse;
  assignedToUsers: IndividualFilterResponse;
  customers: IndividualFilterResponse & { onlineAlphaCode: string };
  projectType: IndividualFilterResponse;
  serviceRequestComponentStatusType: IndividualFilterResponse & {
    isActive: true;
  };
  serviceRequestComponentTypes: IndividualFilterResponse;
  serviceRequestStatusType: IndividualFilterResponse;
  workflowMarkets: IndividualFilterResponse;
  categorySalesRepresentativeUsers: IndividualFilterResponse;
  projectLabels: IndividualFilterResponse;
}

export interface ServiceRequestSearchBody {
  searchText: string;
  workflowMarketIds: number[];
  serviceRequestStatusIds: number[];
  serviceRequestId?: number | null;
  serviceRequestComponentIds: number[];
  serviceRequestComponentStatusIds?: number[];
}

export interface ServiceRequestSearchV4Body {
  marketIds: string;
  teamIds: string;
  assignmentIds: string;
  categoryIds: string;
  categoryStatusIds: string;
  serviceRequestStatusIds: string;
  following: boolean;
  projectTypeIds: string;
  salesRepIds: string;
  customerIds: string;
  quoteName: string;
  jobId: string;
  startDate: string | null;
  endDate: string | null;
  daysTillDue: string | null;
  paradigmEstimateStatusIds: string;
  categorySalesRepIds: string;
  sortBy: number;
  dateType: number;
  searchText: string;
  includeArchived: boolean;
  maxResults: number;
  projectLabels: string | null;
}

export interface MinorItemClass {
  minorId: number;
  minorName: string;
}

export interface MajorCategory {
  majorId: number;
  majorName: string;
  minorItemClasses: MinorItemClass[];
}

export type CategoryOptionsWithoutTargetMargin = MajorCategory[];

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: adminBaseQuery,
  tagTypes: [
    "QuoteDashboardSearch",
    "SavedFilterViews",
    "ServiceDeliveryResources",
    "TeamResources",
    "ResourceDetails",
    "QuoteDashboardFilters"
  ],
  endpoints: (builder) => ({
    teamMembers: builder.query<
      TeamMembersApiResponse,
      TeamMembersRequestParams
    >({
      query: ({ workflowMarketId }) => ({
        url: `user/teamMembers?workflowMarketId=${workflowMarketId}`,
        method: "GET"
      })
    }),
    serviceDeliveryResourcesByMarket: builder.query<
      ServiceDeliveryResource[],
      number | string
    >({
      query: (workflowMarketId) => ({
        url: `servicedeliveryresource/workflowmarket/${workflowMarketId}`,
        method: "GET"
      })
    }),
    fetchSalesRepresentatives: builder.mutation<any, SalesRepresentativeParams>(
      {
        query: ({ workflowMarketId, serviceRequestId }) => ({
          url: "servicerequestcomponenttypedetails",
          method: "GET",
          params: {
            serviceRequestId,
            workflowMarketId
          }
        })
      }
    ),
    sortOrder: builder.mutation<{}, SortOrderPayload>({
      query: (payload) => ({
        url: `sortorder`,
        method: "PUT",
        body: payload
      })
    }),
    deleteDisclaimerSetting: builder.mutation<void, number | string>({
      query: (disclaimerId) => ({
        url: `marketdisclaimer/${disclaimerId}`,
        method: "DELETE"
      })
    }),
    subCategoryMapping: builder.mutation<{}, SubCategoryMappingPayload>({
      query: ({ workflowMarketId, payload }) => ({
        url: `workflowmarket/${workflowMarketId}/subcategory-mappings`,
        method: "PUT",
        body: payload
      })
    }),
    customerDetails: builder.query<
      CustomerDetailsResponse,
      { customerIds: number[]; erpSystem: SourceSystem }
    >({
      query: (body) => ({
        url: "customer-details",
        method: "POST",
        body
      })
    }),
    quoteDashboardFilters: builder.query<FiltersResponse, void>({
      query: () => ({
        url: "serviceRequests/v3/filters",
        method: "GET"
      })
    }),
    quoteDashboardSearch: builder.query<any, ServiceRequestSearchBody>({
      query: (body) => ({
        url: "serviceRequests/v3/search",
        method: "POST",
        body
      }),
      providesTags: ["QuoteDashboardSearch"]
    }),
    followServiceRequest: builder.mutation<
      void,
      { serviceRequestId: number | string; isActive: boolean }
    >({
      query: ({ serviceRequestId, isActive }) => ({
        url: `servicerequest/follow`,
        method: "POST",
        body: { serviceRequestId, isActive }
      }),
      invalidatesTags: ["QuoteDashboardSearch"]
    }),
    markSavedViewAsFavorite: builder.mutation<void, { viewId: number }>({
      query: ({ viewId }) => ({
        url: `WorkflowSavedFilterView/${viewId}/set-default`,
        method: "PUT"
      }),
      invalidatesTags: ["SavedFilterViews"]
    }),
    savedFilterViews: builder.query<SavedFilterView[], void>({
      query: () => ({
        url: "WorkflowSavedFilterView",
        method: "GET"
      }),
      providesTags: ["SavedFilterViews"]
    }),
    deleteSavedFilterView: builder.mutation<void, { viewId: number }>({
      query: ({ viewId }) => ({
        url: `WorkflowSavedFilterView/${viewId}`,
        method: "DELETE"
      }),
      invalidatesTags: ["SavedFilterViews"]
    }),
    saveNewView: builder.mutation<void, { payload: SavedFilterView }>({
      query: ({ payload }) => ({
        url: "WorkflowSavedFilterView",
        method: "POST",
        body: payload
      }),
      invalidatesTags: ["SavedFilterViews"]
    }),
    overwriteSavedFilterView: builder.mutation<
      void,
      { viewId: number; payload: SavedFilterView }
    >({
      query: ({ viewId, payload }) => ({
        url: `WorkflowSavedFilterView/workflowSavedFilterViewId/${viewId}`,
        method: "PUT",
        body: payload
      }),
      invalidatesTags: ["SavedFilterViews"]
    }),
    quoteDashboardFiltersV4: builder.query<
      FiltersResponse,
      { marketIds?: string }
    >({
      query: ({ marketIds }) => ({
        url: `serviceRequests/v4/filters${
          marketIds ? `?marketIds=${marketIds}` : ""
        }`,
        method: "GET"
      }),
      providesTags: ["QuoteDashboardFilters"]
    }),
    quoteDashboardSearchV4: builder.query<
      ViewQuoteDetailsHeaderData[],
      ServiceRequestSearchV4Body
    >({
      query: (body) => ({
        url: "serviceRequests/v4/search",
        method: "POST",
        body
      }),
      providesTags: ["QuoteDashboardSearch"]
    }),

    // Service Delivery Resources endpoints
    serviceDeliveryResources: builder.query<
      any[],
      { includeInActive: boolean }
    >({
      query: ({ includeInActive }) => ({
        url: "servicedeliveryresource",
        method: "GET",
        params: { includeInActive }
      }),
      providesTags: ["ServiceDeliveryResources"]
    }),
    createServiceDeliveryResource: builder.mutation<any, any>({
      query: (data) => ({
        url: "servicedeliveryresource",
        method: "POST",
        body: data,
        suppressErrors: [400]
      }),
      invalidatesTags: ["ServiceDeliveryResources"]
    }),
    updateServiceDeliveryResource: builder.mutation<
      any,
      { id: string; data: any }
    >({
      query: ({ id, data }) => ({
        url: `servicedeliveryresource/${id}`,
        method: "PUT",
        body: data,
        suppressErrors: [400]
      }),
      invalidatesTags: ["ServiceDeliveryResources", "ResourceDetails"]
    }),
    fetchServiceDeliveryResourceByEmail: builder.mutation<any, string>({
      query: (email) => ({
        url: "servicedeliveryresource/email",
        method: "POST",
        body: JSON.stringify(email),
        headers: { "Content-Type": "application/json" },
        suppressErrors: [400]
      })
    }),

    // Team Resources endpoints
    teamResourcesByTeam: builder.query<any[], string>({
      query: (serviceDeliveryTeamId) => ({
        url: `servicedeliveryteamtoservicedeliveryresource/servicedeliveryteam/${serviceDeliveryTeamId}`,
        method: "GET"
      }),
      providesTags: ["TeamResources"]
    }),
    addResourceToTeam: builder.mutation<any, any>({
      query: (data) => ({
        url: "servicedeliveryteamtoservicedeliveryresource",
        method: "POST",
        body: data,
        suppressErrors: [400]
      }),
      invalidatesTags: ["TeamResources"]
    }),
    updateTeamResource: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `servicedeliveryteamtoservicedeliveryresource/${id}`,
        method: "PUT",
        body: data,
        suppressErrors: [400]
      }),
      invalidatesTags: ["TeamResources"]
    }),
    deleteTeamResource: builder.mutation<any, string>({
      query: (id) => ({
        url: `servicedeliveryteamtoservicedeliveryresource/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["TeamResources"]
    }),

    // Resource Details endpoints
    resourceDetails: builder.query<any, string>({
      query: (serviceDeliveryResourceId) => ({
        url: `servicedeliveryresource/${serviceDeliveryResourceId}`,
        method: "GET",
        params: { includInAction: true }
      }),
      providesTags: ["ResourceDetails"]
    }),
    updateResourceServiceProvided: builder.mutation<
      any,
      { id: string; data: any }
    >({
      query: ({ id, data }) => ({
        url: `editservicesprovidedforresourse/${id}`,
        method: "PUT",
        body: data,
        suppressErrors: [400]
      }),
      invalidatesTags: ["ResourceDetails"]
    }),
    categoryOptionsWithoutTargetMargin: builder.query<
      CategoryOptionsWithoutTargetMargin,
      { customerErpSystem?: string; quotePackId?: number | string }
    >({
      query: ({ customerErpSystem = "online", quotePackId }) => ({
        url: "nonstockcategories",
        method: "GET",
        params: {
          customerErpSystem,
          quotePackId
        }
      })
    })
  })
});

export const {
  useTeamMembersQuery,
  useServiceDeliveryResourcesByMarketQuery,
  useSortOrderMutation,
  useDeleteDisclaimerSettingMutation,
  useFetchSalesRepresentativesMutation,
  useSubCategoryMappingMutation,
  useCustomerDetailsQuery,
  useQuoteDashboardFiltersQuery,
  useQuoteDashboardSearchQuery,
  useFollowServiceRequestMutation,
  useSavedFilterViewsQuery,
  useMarkSavedViewAsFavoriteMutation,
  useDeleteSavedFilterViewMutation,
  useSaveNewViewMutation,
  useOverwriteSavedFilterViewMutation,
  useQuoteDashboardFiltersV4Query,
  useQuoteDashboardSearchV4Query,
  // Service Delivery Resources hooks
  useServiceDeliveryResourcesQuery,
  useCreateServiceDeliveryResourceMutation,
  useUpdateServiceDeliveryResourceMutation,
  useFetchServiceDeliveryResourceByEmailMutation,
  // Team Resources hooks
  useTeamResourcesByTeamQuery,
  useAddResourceToTeamMutation,
  useUpdateTeamResourceMutation,
  useDeleteTeamResourceMutation,
  // Resource Details hooks
  useResourceDetailsQuery,
  useLazyResourceDetailsQuery,
  useUpdateResourceServiceProvidedMutation,
  // Category Options hooks
  useLazyCategoryOptionsWithoutTargetMarginQuery,
  useCategoryOptionsWithoutTargetMarginQuery
} = adminApi;
