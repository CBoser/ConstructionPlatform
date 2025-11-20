# MindFlow Implementation Examples

Based on reference code analysis, here are specific implementation patterns for MindFlow.

---

## 1. BASE QUERY SETUP

### Authentication with Token Refresh

```typescript
// api/baseQueries.ts
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.access_token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

interface BaseQueryMetaInfo {
  startTime: number;
  endTime: number;
  duration: number;
  attempt: number;
}

export const customBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions: any) => {
  const maxRetries = extraOptions?.maxRetries ?? 2;
  let attempt = 1;
  const startTime = performance.now();

  let result = await baseQuery(args, api, extraOptions);

  // Retry logic with exponential backoff
  while (result.error && attempt < maxRetries) {
    // Only retry on 5xx errors
    const status = (result.error.status as number) || 0;
    if (status >= 500 && status < 600) {
      // Exponential backoff: 100ms, 200ms, 400ms, etc.
      const backoffMs = Math.pow(2, attempt) * 100;
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
      attempt++;
      result = await baseQuery(args, api, extraOptions);
    } else {
      break; // Don't retry 4xx errors
    }
  }

  const endTime = performance.now();
  const duration = +((endTime - startTime) / 1000).toFixed(2);

  return {
    ...result,
    meta: {
      ...result.meta,
      startTime,
      endTime,
      duration,
      attempt,
    },
  };
};

// Role-specific base queries
export const adminBaseQuery: BaseQueryFn<...> = async (args, api, extraOptions) => {
  const urlEnd = typeof args === "string" ? args : args.url;
  const adjustedUrl = `/admin/${urlEnd}`;
  const adjustedArgs = typeof args === "string" ? adjustedUrl : { ...args, url: adjustedUrl };
  return customBaseQuery(adjustedArgs, api, extraOptions);
};

export const workspaceBaseQuery: BaseQueryFn<...> = async (args, api, extraOptions) => {
  const state = api.getState() as RootState;
  const workspaceId = state.workspace.currentWorkspaceId;
  
  const urlEnd = typeof args === "string" ? args : args.url;
  const adjustedUrl = `/workspace/${workspaceId}/${urlEnd}`;
  const adjustedArgs = typeof args === "string" ? adjustedUrl : { ...args, url: adjustedUrl };
  return customBaseQuery(adjustedArgs, api, extraOptions);
};
```

---

## 2. API SLICE SETUP

### Projects API with Type Safety

```typescript
// api/projectsApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { workspaceBaseQuery } from "./baseQueries";

// Request/Response Types
export interface CreateProjectRequest {
  name: string;
  description?: string;
  location: string;
  projectType: ProjectType;
  startDate: string;
  expectedEndDate?: string;
  budget?: number;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description?: string;
  location: string;
  projectType: ProjectType;
  status: ProjectStatus;
  startDate: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  budget?: number;
  spent?: number;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  teamMembers: TeamMember[];
}

export interface BulkUpdateProjectsRequest {
  projectIds: string[];
  updates: {
    status?: ProjectStatus;
    description?: string;
  };
}

export interface BulkUpdateProjectsResponse {
  updated: number;
  failed: number;
  errors: Array<{ projectId: string; error: string }>;
}

// Enums for type safety
export enum ProjectType {
  RESIDENTIAL = "RESIDENTIAL",
  COMMERCIAL = "COMMERCIAL",
  MIXED = "MIXED",
}

export enum ProjectStatus {
  PLANNING = "PLANNING",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED",
}

// Error type guard
export const isBulkUpdateError = (
  response: unknown
): response is { errors: Array<{ projectId: string; error: string }> } => {
  if (typeof response !== "object" || response === null) return false;
  const obj = response as Record<string, unknown>;
  return "errors" in obj && Array.isArray(obj.errors);
};

export const projectsApi = createApi({
  reducerPath: "projectsApi",
  baseQuery: workspaceBaseQuery,
  tagTypes: ["Projects", "ProjectDetails", "ProjectList"],
  endpoints: (builder) => ({
    // Queries
    listProjects: builder.query<ProjectResponse[], void>({
      query: () => ({
        url: "projects",
        method: "GET",
      }),
      providesTags: ["ProjectList"],
    }),

    getProject: builder.query<ProjectResponse, string>({
      query: (projectId) => ({
        url: `projects/${projectId}`,
        method: "GET",
      }),
      providesTags: ["ProjectDetails"],
    }),

    searchProjects: builder.query<
      ProjectResponse[],
      { query: string; type?: ProjectType }
    >({
      query: ({ query, type }) => ({
        url: "projects/search",
        method: "POST",
        body: { query, type },
      }),
      providesTags: ["ProjectList"],
    }),

    // Mutations
    createProject: builder.mutation<ProjectResponse, CreateProjectRequest>({
      query: (data) => ({
        url: "projects",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ProjectList"],
    }),

    updateProject: builder.mutation<
      ProjectResponse,
      { projectId: string; data: Partial<CreateProjectRequest> }
    >({
      query: ({ projectId, data }) => ({
        url: `projects/${projectId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ProjectDetails", "ProjectList"],
    }),

    deleteProject: builder.mutation<void, string>({
      query: (projectId) => ({
        url: `projects/${projectId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProjectList"],
    }),

    // Bulk operations
    bulkUpdateProjects: builder.mutation<
      BulkUpdateProjectsResponse,
      BulkUpdateProjectsRequest
    >({
      query: (data) => ({
        url: "projects/bulk-update",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["ProjectList", "ProjectDetails"],
    }),

    bulkDeleteProjects: builder.mutation<
      { deleted: number; failed: number },
      string[]
    >({
      query: (projectIds) => ({
        url: "projects/bulk-delete",
        method: "DELETE",
        body: { projectIds },
      }),
      invalidatesTags: ["ProjectList"],
    }),
  }),
});

export const {
  useListProjectsQuery,
  useGetProjectQuery,
  useSearchProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useBulkUpdateProjectsMutation,
  useBulkDeleteProjectsMutation,
} = projectsApi;
```

---

## 3. ERROR HANDLING

### Custom Error Handler with Observable Integration

```typescript
// utils/errorHandling.ts
import { isRejectedWithValue } from "@reduxjs/toolkit";
import { datadogLogs } from "@datadog/browser-logs";

export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export const isApiError = (error: unknown): error is ApiErrorResponse => {
  if (typeof error !== "object" || error === null) return false;
  const obj = error as Record<string, unknown>;
  return (
    typeof obj.code === "string" &&
    typeof obj.message === "string" &&
    typeof obj.timestamp === "string"
  );
};

export const errorMiddleware = () => (next: any) => (action: any) => {
  if (isRejectedWithValue(action)) {
    const error = action.payload as any;
    const meta = action.meta;

    const errorContext = {
      url: meta?.baseQueryMeta?.request?.url,
      method: meta?.baseQueryMeta?.request?.method,
      status: meta?.baseQueryMeta?.response?.status,
      duration: meta?.baseQueryMeta?.duration,
      attempt: meta?.baseQueryMeta?.attempt,
      timestamp: new Date().toISOString(),
    };

    if (isApiError(error)) {
      datadogLogs.logger.error("API Error", {
        code: error.code,
        message: error.message,
        ...errorContext,
        details: error.details,
      });
    } else {
      datadogLogs.logger.error("Unknown API Error", {
        error: String(error),
        ...errorContext,
      });
    }
  }

  return next(action);
};

export const getUserFacingErrorMessage = (
  error: unknown
): string => {
  if (!error) return "An unexpected error occurred";

  if (isApiError(error)) {
    // Map known error codes to user messages
    const errorMessages: Record<string, string> = {
      VALIDATION_ERROR: "Please check your input and try again",
      UNAUTHORIZED: "You are not authorized to perform this action",
      RESOURCE_NOT_FOUND: "The requested resource was not found",
      CONFLICT: "This operation conflicts with existing data",
      RATE_LIMIT: "Too many requests. Please try again later",
      INTERNAL_ERROR: "An internal server error occurred. Please try again",
    };

    return errorMessages[error.code] || error.message;
  }

  return "An unexpected error occurred. Please try again";
};
```

### Hook for Error Handling in Components

```typescript
// hooks/useApiError.ts
import { useCallback } from "react";
import { toast } from "react-toastify";
import { getUserFacingErrorMessage, isApiError } from "../utils/errorHandling";

export const useApiError = () => {
  const handleError = useCallback((error: unknown) => {
    const message = getUserFacingErrorMessage(error);
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
    });
  }, []);

  const handleSuccess = useCallback((message: string = "Operation successful") => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
    });
  }, []);

  return { handleError, handleSuccess };
};
```

---

## 4. STATE MANAGEMENT WITH REDUX

### Dashboard Slice (Instead of useState)

```typescript
// store/slices/dashboardSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DashboardState {
  // Pagination
  currentPage: number;
  pageSize: number;
  
  // Filters
  filters: {
    search: string;
    status: string[];
    projectType: string[];
    dateRange: { start: string; end: string } | null;
  };
  
  // Sorting
  sortBy: string;
  sortOrder: "asc" | "desc";
  
  // Grouping
  groupBy: string | null;
  
  // Display
  viewMode: "list" | "grid" | "table";
  isLoading: boolean;
  
  // Saved views
  savedViews: SavedView[];
  currentViewId: string | null;
}

interface SavedView {
  id: string;
  name: string;
  filters: DashboardState["filters"];
  sortBy: string;
  sortOrder: "asc" | "desc";
  groupBy: string | null;
  isDefault: boolean;
}

const initialState: DashboardState = {
  currentPage: 0,
  pageSize: 20,
  filters: {
    search: "",
    status: [],
    projectType: [],
    dateRange: null,
  },
  sortBy: "createdAt",
  sortOrder: "desc",
  groupBy: null,
  viewMode: "table",
  isLoading: false,
  savedViews: [],
  currentViewId: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 0; // Reset to first page
    },
    
    setFilters: (state, action: PayloadAction<Partial<DashboardState["filters"]>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 0; // Reset when filters change
    },
    
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.currentPage = 0;
    },
    
    setSorting: (
      state,
      action: PayloadAction<{ sortBy: string; sortOrder: "asc" | "desc" }>
    ) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    
    setGroupBy: (state, action: PayloadAction<string | null>) => {
      state.groupBy = action.payload;
    },
    
    setViewMode: (
      state,
      action: PayloadAction<"list" | "grid" | "table">
    ) => {
      state.viewMode = action.payload;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    saveView: (state, action: PayloadAction<SavedView>) => {
      const index = state.savedViews.findIndex((v) => v.id === action.payload.id);
      if (index >= 0) {
        state.savedViews[index] = action.payload;
      } else {
        state.savedViews.push(action.payload);
      }
    },
    
    deleteView: (state, action: PayloadAction<string>) => {
      state.savedViews = state.savedViews.filter((v) => v.id !== action.payload);
    },
    
    loadView: (state, action: PayloadAction<string>) => {
      const view = state.savedViews.find((v) => v.id === action.payload);
      if (view) {
        state.filters = view.filters;
        state.sortBy = view.sortBy;
        state.sortOrder = view.sortOrder;
        state.groupBy = view.groupBy;
        state.currentViewId = view.id;
        state.currentPage = 0;
      }
    },
    
    resetDashboard: () => initialState,
  },
});

export const {
  setCurrentPage,
  setPageSize,
  setFilters,
  resetFilters,
  setSorting,
  setGroupBy,
  setViewMode,
  setLoading,
  saveView,
  deleteView,
  loadView,
  resetDashboard,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;

// Selectors
export const selectDashboardState = (state: RootState) => state.dashboard;
export const selectCurrentPage = (state: RootState) => state.dashboard.currentPage;
export const selectPageSize = (state: RootState) => state.dashboard.pageSize;
export const selectFilters = (state: RootState) => state.dashboard.filters;
```

---

## 5. CUSTOM HOOKS FOR COMPLEX LOGIC

### Dashboard Data Fetching Hook

```typescript
// hooks/useDashboardData.ts
import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  useListProjectsQuery,
  useBulkUpdateProjectsMutation,
} from "../api/projectsApi";
import { selectDashboardState } from "../store/slices/dashboardSlice";
import { ProjectResponse } from "../api/projectsApi";

export const useDashboardData = () => {
  const dashboardState = useSelector(selectDashboardState);
  const { data: allProjects = [], isLoading, error } = useListProjectsQuery();
  const [bulkUpdate] = useBulkUpdateProjectsMutation();

  // Filter data based on dashboard state
  const filteredProjects = useMemo(() => {
    let filtered = [...allProjects];

    // Apply search filter
    if (dashboardState.filters.search) {
      const query = dashboardState.filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (dashboardState.filters.status.length > 0) {
      filtered = filtered.filter((p) =>
        dashboardState.filters.status.includes(p.status)
      );
    }

    // Apply date range filter
    if (dashboardState.filters.dateRange) {
      const { start, end } = dashboardState.filters.dateRange;
      filtered = filtered.filter((p) => {
        const projectDate = new Date(p.startDate);
        return (
          projectDate >= new Date(start) &&
          projectDate <= new Date(end)
        );
      });
    }

    return filtered;
  }, [allProjects, dashboardState.filters]);

  // Sort data
  const sortedProjects = useMemo(() => {
    const sorted = [...filteredProjects];
    sorted.sort((a, b) => {
      const aValue = a[dashboardState.sortBy as keyof ProjectResponse];
      const bValue = b[dashboardState.sortBy as keyof ProjectResponse];

      if (aValue < bValue) return dashboardState.sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return dashboardState.sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredProjects, dashboardState.sortBy, dashboardState.sortOrder]);

  // Paginate data
  const paginatedProjects = useMemo(() => {
    const start = dashboardState.currentPage * dashboardState.pageSize;
    const end = start + dashboardState.pageSize;
    return sortedProjects.slice(start, end);
  }, [sortedProjects, dashboardState.currentPage, dashboardState.pageSize]);

  // Group data if needed
  const groupedProjects = useMemo(() => {
    if (!dashboardState.groupBy) return paginatedProjects;

    const groups: Record<string, ProjectResponse[]> = {};
    paginatedProjects.forEach((project) => {
      const groupKey =
        project[dashboardState.groupBy as keyof ProjectResponse] || "Unassigned";
      if (!groups[String(groupKey)]) {
        groups[String(groupKey)] = [];
      }
      groups[String(groupKey)].push(project);
    });
    return groups;
  }, [paginatedProjects, dashboardState.groupBy]);

  const totalPages = Math.ceil(sortedProjects.length / dashboardState.pageSize);

  return {
    data: dashboardState.groupBy ? groupedProjects : paginatedProjects,
    isLoading,
    error,
    totalPages,
    totalResults: sortedProjects.length,
    bulkUpdate,
  };
};
```

---

## 6. COMPONENT USAGE

### Dashboard Component with Hooks and Redux

```typescript
// components/Dashboard.tsx
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  setCurrentPage,
  setPageSize,
  setFilters,
  setSorting,
  setGroupBy,
} from "../store/slices/dashboardSlice";
import { useDashboardData } from "../hooks/useDashboardData";
import { useApiError } from "../hooks/useApiError";
import { selectDashboardState } from "../store/slices/dashboardSlice";
import DashboardFilters from "./DashboardFilters";
import DashboardTable from "./DashboardTable";
import DashboardPagination from "./DashboardPagination";

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const dashboardState = useSelector(selectDashboardState);
  const { data, isLoading, error, totalPages, totalResults, bulkUpdate } =
    useDashboardData();
  const { handleError, handleSuccess } = useApiError();

  const handleFilterChange = useCallback(
    (newFilters: Partial<typeof dashboardState.filters>) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  const handleSort = useCallback(
    (sortBy: string) => {
      const newOrder =
        dashboardState.sortBy === sortBy && dashboardState.sortOrder === "asc"
          ? "desc"
          : "asc";
      dispatch(setSorting({ sortBy, sortOrder: newOrder }));
    },
    [dispatch, dashboardState.sortBy, dashboardState.sortOrder]
  );

  const handleBulkUpdate = useCallback(
    async (projectIds: string[]) => {
      try {
        const result = await bulkUpdate({
          projectIds,
          updates: { status: "ARCHIVED" },
        }).unwrap();

        if (result.failed > 0) {
          toast.warning(
            `Updated ${result.updated} projects. ${result.failed} failed.`
          );
        } else {
          handleSuccess(`Updated ${result.updated} projects`);
        }
      } catch (err) {
        handleError(err);
      }
    },
    [bulkUpdate, handleError, handleSuccess]
  );

  if (error) {
    return <div>Error loading dashboard: {String(error)}</div>;
  }

  return (
    <div>
      <DashboardFilters
        filters={dashboardState.filters}
        onChange={handleFilterChange}
      />

      <DashboardTable
        data={data}
        isLoading={isLoading}
        onSort={handleSort}
        onBulkUpdate={handleBulkUpdate}
        sortBy={dashboardState.sortBy}
        sortOrder={dashboardState.sortOrder}
      />

      <DashboardPagination
        currentPage={dashboardState.currentPage}
        pageSize={dashboardState.pageSize}
        totalPages={totalPages}
        totalResults={totalResults}
        onPageChange={(page) => dispatch(setCurrentPage(page))}
        onPageSizeChange={(size) => dispatch(setPageSize(size))}
      />
    </div>
  );
};

export default Dashboard;
```

---

## 7. CSV EXPORT UTILITY

```typescript
// utils/csvExport.ts
export interface CsvColumn<T> {
  key: keyof T;
  label: string;
  format?: (value: any) => string;
}

export const exportToCsv = <T extends Record<string, any>>(
  data: T[],
  columns: CsvColumn<T>[],
  filename: string
) => {
  // Create CSV header
  const header = columns.map((col) => `"${col.label}"`).join(",");

  // Create CSV rows
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value = item[col.key];
        const formatted = col.format ? col.format(value) : value;
        return `"${formatted ?? ""}"`;
      })
      .join(",")
  );

  const csvContent = [header, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Usage
const columns: CsvColumn<ProjectResponse>[] = [
  { key: "id", label: "Project ID" },
  { key: "name", label: "Project Name" },
  { key: "status", label: "Status" },
  {
    key: "startDate",
    label: "Start Date",
    format: (date) => new Date(date).toLocaleDateString(),
  },
  { key: "budget", label: "Budget", format: (val) => `$${val?.toFixed(2)}` },
];

exportToCsv(projects, columns, "projects");
```

---

## Summary: Recommended Implementation Order

1. **Setup Base Queries** with authentication and retry logic
2. **Create API Slices** with type-safe endpoints
3. **Implement Error Handling** with middleware and hooks
4. **Build Redux State** for dashboard/complex UI
5. **Create Custom Hooks** for data fetching and transformation
6. **Build Components** using hooks and Redux state
7. **Add Export/Utilities** for data handling (CSV, etc.)

This structure keeps concerns separated and maintains type safety throughout the application.

