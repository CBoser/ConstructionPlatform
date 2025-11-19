import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { COMMON_ERROR_MESSAGE } from "../../../lib";
import {
  deleteAttachment,
  fetchDataBegin,
  fetchDataFailure,
  fetchDataSuccess,
  updateComDocFileAttachment,
  uploadFileComDoc
} from "../actions/comDocFilesActions";
import useAPI from "./useAPI";

export function useFetchComDocFiles(autoFetch = true) {
  const dispatch = useDispatch();
  const API = useAPI();
  const { comDocFilesData, fetchComDocFilesLoading, fetchComDocFilesError } =
    useSelector(
      (state) => ({
        comDocFilesData: state?.comDocFiles?.data,
        fetchComDocFilesLoading: state?.comDocFiles?.loading,
        fetchComDocFilesError: state?.comDocFiles?.error
      }),
      shallowEqual
    );

  const serviceRequestURL = "/plans-projects/admin/servicerequest";

  const fetchComDocFiles = async (serviceRequestId) => {
    dispatch(fetchDataBegin());
    return API.get(`${serviceRequestURL}/${serviceRequestId}/comdocfiles`)
      .then(({ data }) => dispatch(fetchDataSuccess(data)))
      .catch((err) => dispatch(fetchDataFailure));
  };

  const requestDeleteComDocFiles = async (
    fileId,
    dataCoreFileId,
    entityId,
    attachmentSource
  ) => {
    try {
      const { data } = await API.delete(
        `/plans-projects/admin/file/${fileId}/${dataCoreFileId}/${entityId}?attachmentSource=${attachmentSource}`
      );
      return dispatch(
        deleteAttachment({
          ...data,
          title: "Success"
        })
      );
    } catch (err) {
      let errMsg = COMMON_ERROR_MESSAGE;
      if (err.response && err.response.data.DeleteAttachment) {
        const [fileErr] = err.response.data.DeleteAttachment;
        errMsg = fileErr;
      }
      return dispatch(
        deleteAttachment({
          title: "Error",
          message: errMsg
        })
      );
    }
  };

  const requestUpdateFileAttachment = (fileId, payload) => {
    return API.put(
      `/plans-projects/admin/file/${fileId}`,
      {
        data: payload
      },
      { suppressErrors: [400] }
    )
      .then(({ data }) =>
        dispatch(
          updateComDocFileAttachment({
            ...payload,
            ...data,
            title: "Success"
          })
        )
      )
      .catch((err) => {
        let errMsg = COMMON_ERROR_MESSAGE;
        if (err.response && err.response.data.UpdateAttachment) {
          const [fileErr] = err.response.data.UpdateAttachment;
          errMsg = fileErr;
        }
        return dispatch(
          updateComDocFileAttachment({
            ...payload,
            title: "Error",
            message: errMsg
          })
        );
      });
  };

  const requestUploadFileComDoc = (serviceRequestId, payload) => {
    return API.post(
      `/plans-projects/admin/servicerequest/${serviceRequestId}/file`,
      {
        data: payload
      },
      { suppressErrors: [400], preventRetry: true }
    )
      .then(({ data }) =>
        dispatch(
          uploadFileComDoc({
            ...payload,
            data,
            title: "Success"
          })
        )
      )
      .catch((err) => {
        let errMsg = COMMON_ERROR_MESSAGE;
        if (err.response && err.response.data.ServiceRequest) {
          const [fileErr] = err.response.data.ServiceRequest;
          errMsg = fileErr;
        }
        return dispatch(
          uploadFileComDoc({
            ...payload,
            title: "Error",
            message: errMsg
          })
        );
      });
  };

  return {
    comDocFilesData,
    fetchComDocFilesLoading,
    fetchComDocFilesError,
    fetchComDocFiles,
    requestDeleteComDocFiles,
    requestUpdateFileAttachment,
    requestUploadFileComDoc
  };
}
