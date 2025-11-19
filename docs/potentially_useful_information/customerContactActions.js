import axios from "axios";
import { cp, numberToUSPhoneNumber } from "../../../lib";

export const FETCH_CUSTOMER_CONTACT_BEGIN = "FETCH_CUSTOMER_CONTACT_BEGIN";
export const FETCH_CUSTOMER_CONTACT_SUCCESS = "FETCH_CUSTOMER_CONTACT_SUCCESS";
export const FETCH_CUSTOMER_CONTACT_FAILURE = "FETCH_CUSTOMER_CONTACT_FAILURE";
export const UPDATE_CONTACT = "UPDATE_CONTACT";

export const fetchDataBegin = () => ({
  type: FETCH_CUSTOMER_CONTACT_BEGIN
});

export const fetchDataSuccess = (data) => ({
  type: FETCH_CUSTOMER_CONTACT_SUCCESS,
  payload: data
});

export const fetchDataFailure = (error) => ({
  type: FETCH_CUSTOMER_CONTACT_FAILURE,
  payload: { error }
});

export const updateContact = (data) => ({
  type: UPDATE_CONTACT,
  payload: data
});

export const updateContactAction =
  (url, accToken, customerDetails) => (dispatch) =>
    fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(customerDetails)
    })
      .then((data) => {
        if (!data.ok) {
          throw new Error();
        }
        const successPayload = {
          ...customerDetails,
          title: "Success",
          message: cp.settings_customer_edit_details_success_message
        };
        return dispatch(updateContact(successPayload));
      })
      .catch(() => {
        const failurePayload = {
          ...customerDetails,
          title: "Error",
          message: cp.common_error_message
        };
        return dispatch(updateContact(failurePayload));
      });

export const fetchData = (url, accessToken) => (dispatch) => {
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
        curedData.customerDetailsContact = {
          statementDelivery: rawData.statementDelivery,
          invoiceDelivery: rawData.invoiceDelivery,
          customerName: rawData.customerName,
          customerNumber: rawData.customerNumber,
          customerId: rawData.customerId,
          email: rawData.email,
          addressLine1: rawData.addressLine1,
          city: rawData.city,
          state: rawData.state,
          zipCode: rawData.zipCode,
          phone1: numberToUSPhoneNumber(rawData.phone1),
          phone2: numberToUSPhoneNumber(rawData.phone2),
          fax: rawData.fax
        };
        curedData.statementDeliveryOptions = [
          {
            disabled: false,
            error: false,
            id: "1",
            label: "Print",
            name: "Statement Delivery",
            value: "print"
          },
          {
            disabled: false,
            error: false,
            id: "2",
            label: "Fax",
            name: "Statement Delivery",
            value: "fax"
          },
          {
            disabled: false,
            error: false,
            id: "3",
            label: "Email",
            name: "Statement Delivery",
            value: "email"
          }
        ];
        curedData.invoiceDeliveryOptions = [
          {
            disabled: false,
            error: false,
            id: "4",
            label: "Print",
            name: "Invoice Delivery",
            value: "print"
          },
          {
            disabled: false,
            error: false,
            id: "5",
            label: "Fax",
            name: "Invoice Delivery",
            value: "fax"
          },
          {
            disabled: false,
            error: false,
            id: "6",
            label: "Email",
            name: "Invoice Delivery",
            value: "email"
          }
        ];
        return curedData;
      };
      return dataFormatter(data);
    })
    .then((data) => {
      dispatch(fetchDataSuccess(data));
    })
    .catch((err) => dispatch(fetchDataFailure(err)));
};
