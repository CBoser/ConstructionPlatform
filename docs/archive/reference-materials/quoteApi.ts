import { createApi } from "@reduxjs/toolkit/query/react";
import { SkuReplacementState } from "../../../components/SkuReplacementStepper/SkuReplacementStepper";
import { PRICING_METHOD_IDS } from "../../../lib";
import { MaterialUser, QuotePacksPayload } from "../../../types";
import { customerSpecificBaseQuery } from "./baseQueries";

interface NotifyQuotePublishRequestBody {
  quoteId: number;
  quotePackIds: string[];
}

interface AdjustPriceRequest {
  quoteId: number;
  lineItemIds: number[];
  startingTotal: number;
  adjustedTotal: number;
  startingMargin: number;
  adjustedMargin: number;
}

interface RefreshPricingSuccessResponse {
  quoteId: number;
  lastRefreshedDate: string;
  refreshedGrandTotal: number;
}

export interface RefreshPriceErrorResponse {
  GetManualRefreshPricingInfo: string[];
}

interface ReplaceSkuRequest {
  quoteId: number;
  lineItemsToReplace: SkuReplacementState[];
}

interface ReplaceSkuResponse {
  quoteId: number;
  skusReplaced: number;
  skusDeleted: number;
}

export interface ShareQuotesRequest {
  quoteId: number;
  data: {
    projectId: number;
    quoteIds: number[];
    recipients: Array<{
      email: string;
      inviteToken: string | null;
    }>;
    ccEmail?: string;
    notes: string;
    erpName: string;
  };
}

interface AddNewPackRequest {
  quoteId: number;
  quotePackName: string;
}

interface ManageQuotePacks {
  quoteId: number;
  payload: QuotePacksPayload;
}
interface ConvertToCommentRequest {
  quoteId: number;
  quoteDetailsId: number;
}

interface LocationCodeData {
  locationId: string;
  name: string;
  address: string;
  taxCode: string;
  taxRate: number;
  inActiveCustomer: boolean; // inActive === inactive, not "in active"
}

interface TaxRateResponse {
  taxRate: number | null;
}

export interface UpdateSpecialOrderSettingsRequest {
  quoteId: number;
  quotePackId: number;
  data: {
    quotePackSpecialOrderVendor: string | null;
    specialOrderType: string | null;
    specialOrderNumber: string | null;
    specialOrderShipVia: string | null;
    specialOrderShipWeight: string | null;
    specialOrderFreightCost: number | null;
    specialOrderDueDate: string | null;
    specialOrderComment: string | null;
    specialOrderShipFrom?: string | null;
  };
}

export interface VendorOption {
  specialOrderVendorId: number;
  vendorId: number;
  vendorName: string;
  erp: string;
}

export interface ShipFromOption {
  specialOrderShipFromId: number;
  vendorId?: number;
  vendorName: string;
  shipFromId: number;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  shipVia?: string | null;
  erp: string;
}

export interface ShipViaOption {
  specialOrderShipViaId: number;
  value: string;
  description: string | null;
  erp: string;
}

export interface SpecialOrderSettingsResponse {
  vendorOptions: VendorOption[];
  shipFromOptions: ShipFromOption[];
  shipViaOptions: ShipViaOption[];
}

export interface OmniSupplier {
  omniSupplierId: number;
  name: string;
  erp: string;
}

export const quoteApi = createApi({
  reducerPath: "quoteApi",
  baseQuery: customerSpecificBaseQuery,
  endpoints: (builder) => ({
    publishQuoteNotification: builder.mutation<
      undefined,
      NotifyQuotePublishRequestBody
    >({
      query: (data) => ({
        url: `quote/sendpublishevents`,
        method: "POST",
        body: data
      })
    }),
    adjustPrice: builder.mutation<{ status: boolean }, AdjustPriceRequest>({
      query: ({ quoteId, ...data }) => ({
        url: `quote/${quoteId}/adjustprice`,
        method: "POST",
        body: data
      })
    }),
    refreshPrice: builder.mutation<
      RefreshPricingSuccessResponse | RefreshPriceErrorResponse,
      { quoteId: number; pricingAsOfDate: string }
    >({
      query: ({ quoteId, pricingAsOfDate }) => ({
        url: `quote/${quoteId}/manualrefreshprice`,
        method: "POST",
        body: {
          pricingMethodId: PRICING_METHOD_IDS.manual,
          pricingAsOfDate,
          isManualPriceRefreshed: true
        }
      })
    }),
    replaceSku: builder.mutation<ReplaceSkuResponse, ReplaceSkuRequest>({
      query: ({ quoteId, lineItemsToReplace }) => ({
        url: `quote/${quoteId}/skureplacement`,
        method: "POST",
        body: lineItemsToReplace
      })
    }),
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
    }),
    shareQuotes: builder.mutation<{}, ShareQuotesRequest>({
      query: ({ quoteId, data }) => ({
        url: `quote/${quoteId}/share`,
        method: "POST",
        body: data
      })
    }),
    addNewPack: builder.mutation<{ quotePackId: number }, AddNewPackRequest>({
      query: ({ quoteId, quotePackName }) => ({
        url: `quote/${quoteId}/quotepackadd`,
        method: "POST",
        body: { quotePackName: quotePackName }
      })
    }),
    manageQuotePacks: builder.mutation<{}, ManageQuotePacks>({
      query: ({ quoteId, payload }) => ({
        url: `quote/${quoteId}/quotepacksmanage`,
        method: "PUT",
        body: payload
      })
    }),
    convertToComment: builder.mutation<{}, ConvertToCommentRequest>({
      query: ({ quoteId, quoteDetailsId }) => ({
        url: `quote/${quoteId}/converttocomment/${quoteDetailsId}`,
        method: "POST"
      })
    }),
    locationCodes: builder.query<LocationCodeData[], void>({
      query: () => ({
        url: "quote/locations",
        method: "GET"
      })
    }),
    taxRate: builder.query<TaxRateResponse, { locationCode: string }>({
      query: ({ locationCode }) => ({
        url: `quote/tax-rate?locationCode=${locationCode}`,
        method: "GET"
      })
    }),
    updateSpecialOrderSettings: builder.mutation<
      {},
      UpdateSpecialOrderSettingsRequest
    >({
      query: ({ quoteId, quotePackId, data }) => ({
        url: `quote/${quoteId}/specialorder/${quotePackId}`,
        method: "PUT",
        body: data
      })
    }),
    getSpecialOrderSettings: builder.query<
      SpecialOrderSettingsResponse,
      { quoteId: number }
    >({
      query: ({ quoteId }) => ({
        url: `quote/${quoteId}/specialorder/options`,
        method: "GET"
      })
    }),
    getOmniSuppliers: builder.query<OmniSupplier[], { quoteId: number }>({
      query: ({ quoteId }) => ({
        url: `quote/${quoteId}/omnisuppliers`,
        method: "GET"
      })
    })
  })
});

export const {
  usePublishQuoteNotificationMutation,
  useAdjustPriceMutation,
  useRefreshPriceMutation,
  useReplaceSkuMutation,
  useGetMaterialUsersQuery,
  useShareQuotesMutation,
  useAddNewPackMutation,
  useManageQuotePacksMutation,
  useConvertToCommentMutation,
  useLocationCodesQuery,
  useLazyTaxRateQuery,
  useUpdateSpecialOrderSettingsMutation,
  useGetSpecialOrderSettingsQuery,
  useGetOmniSuppliersQuery
} = quoteApi;
