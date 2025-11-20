import { createApi } from "@reduxjs/toolkit/query/react";
import { customerSpecificBaseQuery } from "./baseQueries";

export interface BulkActionQuote {
  quoteId: number;
  quoteName: string;
  isLinkedToErp: boolean;
  isSyncedToErp: boolean;
  isUsingAutomaticPricing: boolean;
  hasLineItems: boolean;
  isMasterSet: boolean;
  hasElevationOptionIntersects: boolean;
}

export interface BulkActionProject {
  projectId: number;
  projectAddress?: string;
  projectCity?: string;
  projectState?: string;
  projectZipCode?: string;
  communityName?: string;
  labels: string[];
  projectName: string;
  quotes: BulkActionQuote[];
}

interface Permission {
  tool_name: string;
  permission_name: string;
}

interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export enum BulkActionOrderFilter {
  ONLY_INCLUDE_UNORDERED_QUOTES = 1,
  INCLUDE_UNOREDERED_AND_PARTIALLY_ORDERED_QUOTES = 2,
  INCLUDE_ALL_QUOTES = 3
}

interface BulkActionProjectsRequest {
  orderFilter: BulkActionOrderFilter;
}

export const projectApi = createApi({
  reducerPath: "projectApi",
  baseQuery: customerSpecificBaseQuery,
  endpoints: (builder) => ({
    bulkActionProjects: builder.query<
      BulkActionProject[],
      BulkActionProjectsRequest
    >({
      query: ({ orderFilter }) => ({
        url: `projects/bulkactions?orderFilter=${orderFilter}`,
        method: "GET"
      })
    }),
    roles: builder.query<Role[], { projectId: number }>({
      query: ({ projectId }) => ({
        url: `projects/${projectId}/mybldr-roles`,
        method: "GET"
      })
    })
  })
});

export const { useBulkActionProjectsQuery, useRolesQuery } = projectApi;
