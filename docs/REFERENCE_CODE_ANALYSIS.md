# Reference Code Analysis: Construction Platform Patterns

## Executive Summary
This analysis examines reference code from the existing construction platform to identify proven patterns, best practices, and architectural approaches suitable for adoption in MindFlow. The analysis covers RTK Query API patterns, state management, authentication, error handling, and bulk operations.

---

## 1. RTK QUERY PATTERNS ANALYSIS

### 1.1 BASE QUERY ARCHITECTURE (`baseQueries.ts`)

#### Authentication Handling Pattern
```typescript
const rawBaseQuery = fetchBaseQuery({
  baseUrl: PAPI_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as PlansAndProjectsReduxStore;
    const token = state.user.oidcUser?.access_token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  }
});
```

**Key Strengths:**
- Centralized token extraction from Redux state
- OIDC/OAuth2 Bearer token implementation
- Type-safe state access
- Automatic injection on every request

**Recommendations for MindFlow:**
- Adopt this authentication pattern for consistent token handling
- Consider token refresh logic if needed (current implementation doesn't show refresh)
- Type the Redux state properly to avoid runtime errors

---

#### Custom Base Query with Retry Logic
```typescript
export const customBaseQuery: BaseQueryFn<...> = async (args, api, extraOptions: any) => {
  const maxRetries = extraOptions?.maxRetries || 2;
  let attempt = 1;
  const startTime = performance.now();

  let result: Awaited<ReturnType<typeof rawBaseQuery>>;
  while (true) {
    result = await rawBaseQuery(args, api, extraOptions);
    if (!result.error || attempt >= maxRetries) {
      break;
    }
    attempt++;
  }

  const endTime = performance.now();
  const duration = +((endTime - startTime) / 1000).toFixed(2);
  // ... metadata attachment
};
```

**Pattern Analysis:**
- Simple retry mechanism with configurable max attempts (default 2)
- Performance timing for all requests
- Attempt tracking for debugging
- Request/response metadata preservation

**For MindFlow:**
- **ADOPT:** This basic retry pattern works well for non-idempotent operations
- **ENHANCE:** Consider exponential backoff for better rate limit handling
- **CONSIDER:** Add specific error status code handling (don't retry 4xx errors)

---

#### URL Path Adjustment Patterns

**Admin Base Query:**
```typescript
export const adminBaseQuery: BaseQueryFn<...> = async (args, api, extraOptions) => {
  const urlEnd = typeof args === "string" ? args : args.url;
  const adjustedUrl = `/plans-projects/admin/${urlEnd}`;
  const adjustedArgs = typeof args === "string" ? adjustedUrl : { ...args, url: adjustedUrl };
  return customBaseQuery(adjustedArgs, api, extraOptions);
};
```

**Customer-Specific Base Query:**
```typescript
export const customerSpecificBaseQuery: BaseQueryFn<...> = async (args, api, extraOptions) => {
  const state = api.getState() as PlansAndProjectsReduxStore;
  const customerNumber = state.user.data.currentCustomerNumber;
  const customerErpSystem = state.user.data.sourceSystem;

  const urlEnd = typeof args === "string" ? args : args.url;
  const searchParamCharacter = urlEnd.includes("?") ? "&" : "?";
  const customerErpSystemQuery = customerErpSystem
    ? `${searchParamCharacter}customerErpSystem=${customerErpSystem}`
    : "";
  const adjustedUrl = `/plans-projects/customer/${customerNumber}/${urlEnd}${customerErpSystemQuery}`;

  const adjustedArgs = typeof args === "string" ? adjustedUrl : { ...args, url: adjustedUrl };
  return customBaseQuery(adjustedArgs, api, extraOptions);
};
```

**Pattern Strengths:**
- Decorator pattern for URL manipulation
- State-aware path construction
- Flexible handling of string vs. FetchArgs
- Smart query parameter merging

**For MindFlow:**
- **ADOPT:** This composable approach to base queries is excellent
- Create role-specific queries (user, moderator, admin) using this pattern
- Use for tenant-specific or workspace-specific endpoints

---

### 1.2 ERROR LOGGING PATTERN

```typescript
export const logRTKQueryApiFailure = (action: any) => {
  console.error(`API error occurred:
    Request:
      URL: ${action?.meta?.baseQueryMeta?.request?.url ?? "Unknown URL"}
      Attempt Count: ${action?.meta?.baseQueryMeta.attempt}
      Request Length: ${action?.meta?.baseQueryMeta.duration} seconds
      Method: ${(action?.meta?.baseQueryMeta?.request?.method ?? "Unknown Method").toUpperCase()}
      Body: ${JSON.stringify(action?.meta.baseQueryMeta.request.body ?? null)}
    Response:
      Status: ${action.meta.baseQueryMeta.response.status ?? "Unknown Status"}
      Status Text: ${action.meta.baseQueryMeta.response.statusText ?? "Unknown Status Text"}
      Body: ${JSON.stringify(action.meta.baseQueryMeta.response.data ?? null)}
    Error Message: ${action?.error?.message ?? "Unknown Error Message"}`);
};
```

**Strengths:**
- Comprehensive error context logging
- Safe property access with nullish coalescing
- Request and response capture
- Separates concerns from API definitions

**For MindFlow:**
- **ADOPT:** This pattern with enhancements for Datadog/observability
- Add severity levels (error, warn, info)
- Include user context and environment
- Consider structured logging (JSON format)

---

### 1.3 QUOTE API PATTERNS (`quoteApi.ts`)

#### Mutation Pattern with Type Safety
```typescript
interface AdjustPriceRequest {
  quoteId: number;
  lineItemIds: number[];
  startingTotal: number;
  adjustedTotal: number;
  startingMargin: number;
  adjustedMargin: number;
}

adjustPrice: builder.mutation<{ status: boolean }, AdjustPriceRequest>({
  query: ({ quoteId, ...data }) => ({
    url: `quote/${quoteId}/adjustprice`,
    method: "POST",
    body: data
  })
})
```

**Pattern Benefits:**
- Strict request/response typing
- Payload destructuring for URL construction
- Separation of concerns (URL params vs. body)

**Bulk Operations Pattern:**
```typescript
replaceSku: builder.mutation<ReplaceSkuResponse, ReplaceSkuRequest>({
  query: ({ quoteId, lineItemsToReplace }) => ({
    url: `quote/${quoteId}/skureplacement`,
    method: "POST",
    body: lineItemsToReplace  // Array of items to replace
  })
}),

interface ReplaceSkuRequest {
  quoteId: number;
  lineItemsToReplace: SkuReplacementState[];  // Bulk operation
}
```

**Recommendations:**
- **ADOPT:** This pattern for bulk operations
- Include operation metadata (operation count, validation status)
- Add retry-specific configuration for bulk operations

---

#### Query Pattern with Parameters
```typescript
getMaterialUsers: builder.query<
  MaterialUser[],
  { customerErp: string; customerNumber: string }
>({
  query: ({ customerErp, customerNumber }) => ({
    url: "quote/materials-users",
    method: "GET",
    params: {
      customerErp,
      customerNumber
    }
  })
})
```

**Pattern:**
- Named parameter objects for clarity
- Type-safe parameter handling
- Clear separation of concerns

---

#### Error Type Guards (Advanced Pattern)
```typescript
interface RefreshPriceErrorResponse {
  GetManualRefreshPricingInfo: string[];
}

export const isQuotePackageDownloadErrorResponse = (
  error: unknown
): error is QuotePackDownloadErrorResponse => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const errorObj = error as Record<string, unknown>;
  return "DownloadQuote" in errorObj && Array.isArray(errorObj.DownloadQuote);
};
```

**Strengths:**
- Type guard for runtime safety
- Discriminated unions for error handling
- Safer than string-based error codes

**For MindFlow:**
- **ADOPT:** Use type guards for complex error responses
- Create centralized error response types
- Use discriminated unions for success/error responses

---

### 1.4 CUSTOMER API PATTERNS (`customerApi.ts`)

#### Search Mutation with Type-Safe Results
```typescript
interface SkuSearchQuery {
  stringToMatch: string;
}

export interface SkuSearchResults {
  skuResult: LineItem[];
  descriptionResult: LineItem[];
  attributeResult: LineItem[];
}

skuSearch: builder.mutation<SkuSearchResults, SkuSearchQuery>({
  query: ({ stringToMatch }) => ({
    url: `quote/19922/lookup/sku`,  // TODO: Make this customer-level
    method: "POST",
    body: { stringToMatch }
  })
})
```

**Observations:**
- Multi-faceted search results (SKU, description, attribute)
- Clear typing of result categories
- TODO comment indicates known limitation

**For MindFlow:**
- Use this pattern for multi-category searches
- Implement the TODO: create customer-level endpoints
- Consider caching search results (RTK Query does this automatically)

---

### 1.5 PROJECT API PATTERNS (`projectApi.ts`)

#### Bulk Action Data Structures
```typescript
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
  quotes: BulkActionQuote[];  // Nested structure for bulk ops
}

export enum BulkActionOrderFilter {
  ONLY_INCLUDE_UNORDERED_QUOTES = 1,
  INCLUDE_UNOREDERED_AND_PARTIALLY_ORDERED_QUOTES = 2,
  INCLUDE_ALL_QUOTES = 3
}
```

**Pattern Strengths:**
- Hierarchical data structure for complex relationships
- Enum for filter options (type-safe)
- Multiple status boolean flags for each quote
- Extensible with labels array

**For MindFlow:**
- **ADOPT:** Use enums for all filter/status options
- Include validation flags in bulk operation results
- Group related data hierarchically

---

## 2. STATE MANAGEMENT ANALYSIS

### QuoteDashboard Component State Management Pattern

#### Multiple State Concerns with Clear Separation
```typescript
// Pagination & Display
const [paginationData, setPaginationData] = useState({
  currentPage: 0,
  maxResults: maxResultsOptionsNoGroupPerPage[0]
});

// Filters
const [searchValues, setSearchValues] = useState({
  marketQueue: [],
  serviceRequestStatusType: [],
  includeArchived: false
});

const [selectedFiltersValues, setSelectedFiltersValues] = useState(initialFiltersData);

// Modal States (UI)
const [isComDocActivityPanelOpen, setIsComDocActivityPanelOpen] = useState(false);
const [paradigmModalIsOpen, setParadigmModalIsOpen] = useState(false);

// Data States
const [groupedData, setGroupedData] = useState({});
const [marketsData, setMarketsData] = useState([]);
```

**Analysis:**
- **GOOD:** Clear separation by domain (pagination, filters, modals, data)
- **GOOD:** Meaningful variable names indicating purpose
- **CONCERN:** 20+ separate useState calls in one component
- **CONCERN:** Complex state synchronization logic between different states

#### State Synchronization Pattern
```typescript
useEffect(() => {
  if (!selectedFiltersValues?.skipApiCall) {
    setSearchValues(selectedFiltersValues);  // Sync filters
  }
}, [selectedFiltersValues]);

useEffect(() => {
  if (searchValues?.resultsPerPage) {
    setPaginationData((currentState) => ({
      ...currentState,
      maxResults: searchValues.resultsPerPage,
      currentPage: 0
    }));
  }
}, [searchValues?.resultsPerPage]);
```

**Pattern Issues:**
- Multiple useState calls creating source-of-truth problems
- Complex effect dependencies
- Manual synchronization between related states

**For MindFlow:**
- **AVOID:** This pattern is difficult to maintain
- **RECOMMENDATION:** Use Redux Slice for dashboard state
- Group related state using useReducer or Zustand
- Create custom hooks to encapsulate complex state logic

---

## 3. CACHING STRATEGIES

### RTK Query Caching (Implicit)
```typescript
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
    // ...
    quoteDashboardSearch: builder.query<any, ServiceRequestSearchBody>({
      query: (body) => ({
        url: "serviceRequests/v3/search",
        method: "POST",
        body
      }),
      providesTags: ["QuoteDashboardSearch"]
    }),
    
    followServiceRequest: builder.mutation<void, {...}>({
      query: ({ serviceRequestId, isActive }) => ({
        url: `servicerequest/follow`,
        method: "POST",
        body: { serviceRequestId, isActive }
      }),
      invalidatesTags: ["QuoteDashboardSearch"]  // Invalidate cache after mutation
    })
  })
});
```

**Caching Benefits:**
- Automatic deduplication of identical requests
- Automatic cache expiration with `invalidatesTags`
- Relationship-based invalidation (mutations affect related queries)
- Built-in refetch control

**For MindFlow:**
- **ADOPT:** RTK Query for all API calls
- Define clear tag hierarchies for your domain
- Use `providesTags` to map responses to cache tags
- Use `invalidatesTags` strategically in mutations

---

## 4. ERROR HANDLING STRATEGY

### Request-Level Error Handling
```typescript
const customBaseQuery: BaseQueryFn<...> = async (args, api, extraOptions) => {
  const maxRetries = extraOptions?.maxRetries || 2;
  let attempt = 1;

  let result: Awaited<ReturnType<typeof rawBaseQuery>>;
  while (true) {
    result = await rawBaseQuery(args, api, extraOptions);
    if (!result.error || attempt >= maxRetries) {
      break;
    }
    attempt++;
  }
  // ...
};
```

**Limitations:**
- Simple counter-based retry (no backoff)
- No distinction between retryable (5xx) and non-retryable (4xx) errors
- No circuit breaker pattern

### Response-Level Error Handling
```typescript
const handleCommentClick = (id, param) => {
  setComDocActivityPanelData({
    title: param.serviceRequestName,
    projectId: param.projectId,
    // ...
  });
  fetchServiceRequestForSettings(param?.serviceRequestId);
  setIsComDocActivityPanelOpen(true);
};

const onEditSaveFileHandler = async () => {
  setFileErrorMessage("");
  const updateFileAttachment = await requestUpdateFileAttachment(...);
  if (updateFileAttachment?.payload.title === "Success") {
    // ... success handling
  } else if (updateFileAttachment?.payload.title === "Error") {
    setFileErrorMessage(updateFileAttachment?.payload.message);  // Display to user
  }
};
```

**Pattern:**
- Check response title/status manually
- Display user-facing error messages via state
- Toast notifications for feedback

**For MindFlow:**
- **ADOPT:** Check response status explicitly
- **ADD:** Structured error response types
- **USE:** Toast library (react-toastify) for notifications
- **ENHANCE:** Add error boundaries for component crashes

---

## 5. BULK OPERATIONS PATTERNS

### Bulk Replace SKU Pattern
```typescript
interface SkuReplacementState {
  // Implied from usage: SKU ID, new SKU, quantity, etc.
}

replaceSku: builder.mutation<ReplaceSkuResponse, ReplaceSkuRequest>({
  query: ({ quoteId, lineItemsToReplace }) => ({
    url: `quote/${quoteId}/skureplacement`,
    method: "POST",
    body: lineItemsToReplace  // Send array of changes
  })
}),

interface ReplaceSkuResponse {
  quoteId: number;
  skusReplaced: number;
  skusDeleted: number;
}
```

**Strengths:**
- Single API call for multiple line items
- Summary response showing operation counts
- Type-safe request and response

### Bulk Quote Sharing Pattern
```typescript
export interface ShareQuotesRequest {
  quoteId: number;
  data: {
    projectId: number;
    quoteIds: number[];  // Multiple quotes in single request
    recipients: Array<{
      email: string;
      inviteToken: string | null;
    }>;
    ccEmail?: string;
    notes: string;
    erpName: string;
  };
}
```

**Pattern:**
- Supports sharing multiple quotes in one operation
- Recipient list with token validation
- Metadata (notes, ERP system)

### Bulk Project Query Pattern
```typescript
bulkActionProjects: builder.query<
  BulkActionProject[],
  BulkActionProjectsRequest
>({
  query: ({ orderFilter }) => ({
    url: `projects/bulkactions?orderFilter=${orderFilter}`,
    method: "GET"
  })
}),

export enum BulkActionOrderFilter {
  ONLY_INCLUDE_UNORDERED_QUOTES = 1,
  INCLUDE_UNOREDERED_AND_PARTIALLY_ORDERED_QUOTES = 2,
  INCLUDE_ALL_QUOTES = 3
}
```

**Pattern:**
- Server-side filtering for bulk operations
- Enum-based filter options
- Returns hierarchical data structure

**For MindFlow Bulk Operations:**
1. **Single Endpoint, Array Input:** Send arrays in request body
2. **Summary Response:** Return operation counts and status
3. **Server-Side Filtering:** Use query parameters for filtering before returning
4. **Type-Safe Enums:** Use enums for all filter/action types
5. **Validation Status:** Include validation/error status for each item in response

---

## 6. DASHBOARD COMPONENT PATTERNS

### Data Grouping Pattern
```typescript
useEffect(() => {
  const groupBy = selectedFiltersValues?.groupBy;
  let groupedDataObj = {};
  if (!isNoneGroup(groupBy)) {
    setGroupedData(groupedDataObj);
    filteredServiceRequests.forEach((item) => {
      function addToGroup(groupName) {
        if (!groupedDataObj[groupName]) {
          groupedDataObj[groupName] = [];
        }
        if (!groupedDataObj[groupName].find(x => x.serviceRequestId === item.serviceRequestId)) {
          groupedDataObj[groupName].push({
            ...item,
            id: `${groupName + "_" + (groupedDataObj[groupName].length + 1)}`
          });
        }
      }

      switch (groupBy) {
        case CUSTOMER_GROUP_BY_OPTION.value:
          addToGroup(dataObj.customer?.customerName || unassignedGroup);
          break;
        case TEAM_MEMBER_GROUP_BY_OPTION.value:
          // Handle multi-item grouping...
          break;
        // ... more cases
      }
    });
  }
}, [/* deps */]);
```

**Strengths:**
- Dynamic grouping based on user selection
- Handles "Unassigned" items gracefully
- De-duplication check before adding

**Improvements for MindFlow:**
- **MOVE to Server:** Server-side grouping for better performance
- **USE Memoization:** Memoize grouping logic
- **ADD Sorting:** Sort groups alphabetically

### CSV Export Pattern
```typescript
const onDownloadQuoteDashboard = useCallback(() => {
  const data = [];
  filteredServiceRequests.forEach((serviceRequest) => {
    const addToData = (serviceRequestComponent) => {
      const rowObj = {
        "Customer Name": serviceRequest.customer?.customerName,
        "Customer ID": serviceRequest.customer?.onlineAlphaCode,
        // ... 20+ fields
        "Customer Ref #": serviceRequest.customerReferenceNumber
      };
      data.push(rowObj);
    };

    if (serviceRequest.serviceRequestComponents?.length) {
      serviceRequest.serviceRequestComponents.forEach((component) => {
        addToData(component);
      });
    } else {
      addToData();
    }
  });

  const csvContent = Object.keys(data[0]).join(",") + "\n" +
    data.map((item) =>
      Object.values(item)
        .map((value) => '"' + (value ?? "") + '"')
        .join(",")
    ).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  // ... download via blob URL
}, [filteredServiceRequests]);
```

**Strengths:**
- Handles nested data with multiple rows per parent
- Safe null/undefined handling with nullish coalescing
- Quote-escaped CSV values
- Client-side generation (no server round trip)

**For MindFlow:**
- **USE:** This pattern for CSV exports
- **CONSIDER:** Using a library like papaparse for complex CSV
- **ADD:** Custom field selection before export
- **ADD:** Different export formats (Excel, JSON)

---

## 7. RECOMMENDATIONS SUMMARY

### ADOPT Patterns

1. **RTK Query Base Queries**
   - Token extraction pattern
   - URL path manipulation pattern
   - Retry logic with metadata

2. **Type Safety**
   - Request/response interfaces for all endpoints
   - Type guards for complex error handling
   - Enum-based options (not strings)

3. **Caching Strategy**
   - RTK Query with tag invalidation
   - Relationship-based cache management
   - Deduplication of identical requests

4. **Error Handling**
   - Manual response status checking
   - User-facing error messages via state
   - Toast notifications
   - Structured error types

5. **Bulk Operations**
   - Array inputs in request body
   - Summary responses with counts
   - Server-side filtering
   - Validation status in results

### IMPROVE Patterns

1. **State Management**
   - **AVOID:** Multiple useState for related state
   - **USE:** Redux Slices or Zustand for dashboard
   - **CONSIDER:** useReducer for complex state logic

2. **Retry Logic**
   - Add exponential backoff
   - Distinguish retryable vs. non-retryable errors
   - Consider circuit breaker pattern

3. **Performance**
   - Move grouping to server
   - Implement pagination on server
   - Use virtualization for large lists

4. **Code Organization**
   - Extract custom hooks from components
   - Move state management to separate files
   - Reduce component file size (<200 lines ideal)

### AVOID Patterns

1. Synchronizing multiple state sources manually
2. String-based error codes (use enums/types)
3. Client-side filtering for large datasets
4. Hardcoded API URLs (use environment variables)
5. Untyped API responses

---

## 8. DATA FILES ANALYSIS

### NAHBGenericCostCodes.xlsx
- **Purpose:** Generic cost code reference data
- **Use Case:** Line item categorization, cost rollup
- **For MindFlow:** Create equivalent API endpoint for cost codes

### VendorListImportTemplate.xlsx
- **Purpose:** Template for bulk vendor import
- **Use Case:** Batch vendor onboarding
- **For MindFlow:** Create template download feature, validate import format

### Plan Data Samples (Various XLSX)
- **Purpose:** Reference project/quote data
- **Use Case:** Testing, demo data
- **For MindFlow:** Generate test fixtures from these samples

---

## 9. IMPLEMENTATION PRIORITY FOR MINDFLOW

### Phase 1 (Critical)
- [ ] RTK Query base queries with token authentication
- [ ] Type-safe API endpoints with request/response types
- [ ] Error handling with toast notifications
- [ ] Tag-based cache invalidation

### Phase 2 (High)
- [ ] Redux Slice for dashboard state management
- [ ] Bulk operation endpoints
- [ ] CSV export functionality
- [ ] Search with type-safe results

### Phase 3 (Medium)
- [ ] Advanced retry logic with exponential backoff
- [ ] Server-side grouping and filtering
- [ ] Role-based base queries
- [ ] Custom error recovery strategies

### Phase 4 (Future)
- [ ] Circuit breaker for API resilience
- [ ] Request deduplication
- [ ] Partial cache invalidation
- [ ] Advanced observability

---

## Conclusion

The reference code demonstrates solid RTK Query patterns, particularly in:
- Authentication and authorization handling
- Type-safe API definitions
- Cache management with tags
- Error logging

Key improvements needed for MindFlow:
- Consolidate state management (Redux > useState)
- Enhanced retry/recovery strategies
- Server-side optimization for bulk operations
- Better component organization

These patterns provide a strong foundation for building MindFlow's platform APIs and UI.

