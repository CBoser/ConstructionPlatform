import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "./baseQueries";

interface VertexCertificationCreationRequestData {
  projectId: number;
  vertexCertificateId: number;
  vertexEditToken: string;
}

export const vertexApi = createApi({
  reducerPath: "vertexApi",
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    getVertexToken: builder.query<string, void>({
      query: () => ({
        url: `plans-projects/admin/get-vertex-token`,
        method: "GET"
      })
    }),
    saveVertexCertificate: builder.mutation<
      void,
      VertexCertificationCreationRequestData
    >({
      query: (body) => ({
        url: `plans-projects/admin/savevertexcertificate`,
        method: "POST",
        body
      })
    })
  })
});

export const { useGetVertexTokenQuery, useSaveVertexCertificateMutation } =
  vertexApi;
