import axios from "axios";
import { cp } from "../../../lib";
export const FETCH_CUSTOMER_BEGIN = "FETCH_CUSTOMER_BEGIN";
export const FETCH_CUSTOMER_SUCCESS = "FETCH_CUSTOMER_SUCCESS";
export const FETCH_CUSTOMER_FAILURE = "FETCH_CUSTOMER_FAILURE";
export const SELECT_SETTING = "SELECT_SETTING";
export const UPDATE_SIGNER = "UPDATE_SIGNER";

export const fetchDataBegin = () => ({
  type: FETCH_CUSTOMER_BEGIN
});

export const fetchDataSuccess = (data) => ({
  type: FETCH_CUSTOMER_SUCCESS,
  payload: data
});

export const fetchDataFailure = (error) => ({
  type: FETCH_CUSTOMER_FAILURE,
  payload: { error }
});

export const selectSettingAction = (tab) => ({
  type: SELECT_SETTING,
  payload: tab
});

export const updateAuthorizeSigner = (data) => ({
  type: UPDATE_SIGNER,
  payload: data
});

export const updateSignerAction = (url, accessToken, payload) => (dispatch) =>
  fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then((data) => {
      if (!data.ok) {
        throw new Error();
      }
      const successPayload = {
        payload,
        title: "Success",
        message: cp.settings_customer_edit_details_success_message
      };
      dispatch(updateAuthorizeSigner(successPayload));
    })
    .catch(() => {
      const failurePayload = {
        payload,
        title: "Error",
        message: cp.common_error_message
      };
      dispatch(updateAuthorizeSigner(failurePayload));
    });

export const fetchData = (url, accessToken, userData) => (dispatch) => {
  dispatch(fetchDataBegin());
  axios({
    method: "GET",
    url,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })
    .then((data) => data.data)
    .then((data) => {
      const dataFormatter = (rawData) => {
        const curedData = {};
        curedData.locations = rawData?.locations?.map((loc) => ({
          title: loc.name,
          address: loc.addressLine2,
          addressCode: `${loc?.city} ${loc?.state} ${loc?.zip}`,
          phone: loc.phone,
          phoneHref: `tel:{${loc?.phone}`,
          href: `https://www.google.com/maps/search/${loc?.addressLine2} ${loc?.city},${loc?.state}`
        }));

        curedData.custormerName = rawData?.customerName;
        curedData.customerNumber = rawData?.customerNumber;
        curedData.customerId = rawData?.customerId;
        curedData.userQuantity = rawData?.activeUserCount;
        curedData.deliveries = rawData?.deliveries;
        curedData.customerErpSystem = rawData?.customerErpSystem;
        curedData.onlineAlphaCode = rawData?.onlineAlphaCode;

        if (userData?.settingPages) {
          const enabledTabs = userData?.settingPages.filter(
            (page) => page?.enabled
          );
          curedData.settingsTabs = enabledTabs.map((tab) => ({
            title: tab?.settingPageName,
            selected: false
          }));
        } else {
          curedData.settingsTabs = [
            { title: "Manage Users", selected: false },
            { title: "Manage Notifications", selected: false },
            { title: "My Profile", selected: false }
          ];
        }

        curedData.selectedTab = curedData.settingsTabs.find(
          (tab) => tab?.selected === true
        );
        curedData.authorizedSigners = rawData?.authorizedSigners;
        curedData.authorizeSignersComment = {};
        curedData.locationCode = rawData.locationCode;
        curedData.isShipToRequired = rawData.isShipToRequired;
        return curedData;
      };
      return dataFormatter(data);
    })
    .then((data) => {
      dispatch(fetchDataSuccess(data));
    })
    .catch((err) => dispatch(fetchDataFailure(err)));
};
