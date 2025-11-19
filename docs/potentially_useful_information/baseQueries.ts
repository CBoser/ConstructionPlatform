import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta
} from "@reduxjs/toolkit/query";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PAPI_BASE_URL } from "../../../lib/constants";
import { PlansAndProjectsReduxStore } from "../../../types/PlansAndProjectReduxStore";

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
interface BaseQueryMetaTimeInfo {
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

  const typedResult = result as typeof result & {
    meta: FetchBaseQueryMeta & BaseQueryMetaTimeInfo;
  };
  typedResult.meta = {
    request: result.meta?.request!,
    response: result.meta?.response,
    startTime,
    endTime,
    duration,
    attempt
  };
  return typedResult;
};

export const adminBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const urlEnd = typeof args === "string" ? args : args.url;
  const adjustedUrl = `/plans-projects/admin/${urlEnd}`;
  const adjustedArgs =
    typeof args === "string" ? adjustedUrl : { ...args, url: adjustedUrl };

  return customBaseQuery(adjustedArgs, api, extraOptions);
};

export const customerSpecificBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const state = api.getState() as PlansAndProjectsReduxStore;
  const customerNumber = state.user.data.currentCustomerNumber;
  const customerErpSystem = state.user.data.sourceSystem;

  const urlEnd = typeof args === "string" ? args : args.url;

  const searchParamCharacter = urlEnd.includes("?") ? "&" : "?";
  const customerErpSystemQuery = customerErpSystem
    ? `${searchParamCharacter}customerErpSystem=${customerErpSystem}`
    : "";
  const adjustedUrl = `/plans-projects/customer/${customerNumber}/${urlEnd}${customerErpSystemQuery}`;

  const adjustedArgs =
    typeof args === "string" ? adjustedUrl : { ...args, url: adjustedUrl };

  return customBaseQuery(adjustedArgs, api, extraOptions);
};

export const logRTKQueryApiFailure = (action: any) => {
  console.error(
    `API error occurred:\n\tRequest:\n\t\tURL: ${
      action?.meta?.baseQueryMeta?.request?.url ?? "Unknown URL"
    }\n\t\tAttempt Count: ${
      action?.meta?.baseQueryMeta.attempt
    }\n\t\tRequest Length: ${
      action?.meta?.baseQueryMeta.duration
    } seconds\n\t\tMethod: ${(
      action?.meta?.baseQueryMeta?.request?.method ?? "Unknown Method"
    ).toUpperCase()}\n${
      (
        action?.meta?.baseQueryMeta?.request?.method ?? "Unknown Method"
      ).toUpperCase() === "POST" ||
      (
        action?.meta.baseQueryMeta?.request?.method ?? "Unknown Method"
      ).toUpperCase() === "PUT"
        ? `\t\tBody: ${JSON.stringify(
            action?.meta.baseQueryMeta.request.body ?? null
          )}\n`
        : ""
    }${
      action?.meta?.baseQueryMeta?.response
        ? `\tResponse:\n\t\tStatus: ${
            action.meta.baseQueryMeta.response.status ?? "Unknown Status"
          }\n\t\tStatus Text: ${
            action.meta.baseQueryMeta.response.statusText ??
            "Unknown Status Text"
          }\n${
            action.meta.baseQueryMeta.response.data
              ? `\t\tBody: ${JSON.stringify(
                  action.meta.baseQueryMeta.response.data ?? null
                )}\n`
              : ""
          }`
        : ""
    }\tError Message: ${action?.error?.message ?? "Unknown Error Message"}`
  );
};
