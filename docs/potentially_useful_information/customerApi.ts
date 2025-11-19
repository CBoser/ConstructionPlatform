import { createApi } from "@reduxjs/toolkit/query/react";
import { customerSpecificBaseQuery } from "./baseQueries";
import { LineItem } from "../../../types/LineItem";
import { SourceSystem } from "../../../types/SourceSystem";

interface SkuSearchQuery {
  stringToMatch: string;
}

export interface SkuSearchResults {
  skuResult: LineItem[];
  descriptionResult: LineItem[];
  attributeResult: LineItem[];
}

interface T2RecommendedQuantity {
  tallyProduct: string;
  componentProduct: string;
  length: number;
  qtyUsed: number;
  qtyOriginal: number;
  qtyRemaining: number;
}

export interface T2RecommendedQuantityResponse {
  tallyMix: T2RecommendedQuantity[];
}

interface T2RecommendedQuantityRequestBody {
  locationId: string;
  sku: string;
  quantity: number;
  erpSystem: SourceSystem;
}

export interface QuotePackageDownloadRequest {
  quoteIds: number[];
  includeMaterialDetails: boolean;
  combineLikeItems: boolean;
  showQuantity: boolean;
  showPricing: boolean;
  quotePackDownloadAction: number;
  includeMaterialDetailsExcel: boolean;
  notes?: string | null;
}

interface QuotePackDownloadErrorResponse {
  DownloadQuote: string[];
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

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: customerSpecificBaseQuery,
  endpoints: (builder) => ({
    skuSearch: builder.mutation<SkuSearchResults, SkuSearchQuery>({
      query: ({ stringToMatch }) => ({
        // TODO: Change this when we get a cusotmer-level search endpoint
        url: `quote/19922/lookup/sku`,
        method: "POST",
        body: {
          stringToMatch
        }
      })
    }),
    t2RecommendedQuantity: builder.query<
      T2RecommendedQuantityResponse,
      T2RecommendedQuantityRequestBody
    >({
      query: (body) => ({
        url: `quote/tally2mix`,
        method: "POST",
        body
      })
    })
  })
});

export const { useSkuSearchMutation, useT2RecommendedQuantityQuery } =
  customerApi;
