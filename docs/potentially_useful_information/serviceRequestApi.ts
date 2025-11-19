import { createApi } from "@reduxjs/toolkit/query/react";
import { customerSpecificBaseQuery } from "./baseQueries";

export interface DataCoreFileDTO {
  dataCoreFileId: string;
  entityType: string;
}

export interface OmniImportRequest {
  quoteId: number;
  serviceRequestNumber: number;
  dataCoreFile: DataCoreFileDTO;
  materialDataImportAction: number;
  grossMargin: string;
  minorCategoryId: string | null;
  minorCategoryDescription: string | null;
  supplier: string | null;
}

export const serviceRequestApi = createApi({
  reducerPath: "serviceRequestApi",
  baseQuery: customerSpecificBaseQuery,
  endpoints: (builder) => ({
    omniImport: builder.mutation<void, OmniImportRequest>({
      query: ({ serviceRequestNumber, ...body }) => ({
        url: `servicerequest/${serviceRequestNumber}/omni-import`,
        method: "POST",
        body
      })
    })
  })
});

export const { useOmniImportMutation } = serviceRequestApi;

