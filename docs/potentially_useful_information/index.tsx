import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  ComDocActivityFlyOut,
  MuiLoader,
  QuoteGridList,
  SettingsFlyOut
} from "../../../components";
import { LOADER_SIZE } from "../../../lib";
import { ViewQuoteDetailsData } from "../../../types";
import { PlansAndProjectsReduxStore } from "../../../types/PlansAndProjectReduxStore";
import { useFollowServiceRequestMutation } from "../../store/API/adminApi";
import useFetchQuoteRequest from "../../store/hooks/useFetchQuoteRequest";
import useFetchServiceRequestComponentStatusTypes from "../../store/hooks/useFetchServiceRequestComponentStatusTypes";
import useFetchServiceRequestStatusTypes from "../../store/hooks/useFetchServiceRequestStatusTypes";
import { useFetchViewQuoteDetails } from "../../store/hooks/useFetchViewQuoteDetails";

interface Props {
  fetchServiceRequestComDocActivity: any;
  serviceRequestComDocActivityData: any;
  fetchServiceRequestComDocActivityLoading: any;
  fetchServiceRequestFollowers: any;
  addComment: any;
  updateComment: any;
  fetchDownloadFiles: any;
  defaultComDocOpen: any;
  isQuoteTaskTab: any;
  takeoffProviderRequestId: any;
  takeoffProviderRequestUrl: any;
  takeoffProviderRequestNumber: any;
  takeoffProviderRequestStatus: any;
  openParadigmModal: any;
  pricingAsOfDate: any;
  serviceRequestId: any;
  onDeleteFileMenuClick: any;
  onEditFileMenuClick: any;
  fetchParadigmUpdate: any;
  setBfsErrorModalContent: any;
  viewQuoteDetailsData: ViewQuoteDetailsData;
  statusListDropdownData: any;
  projectTypeDropdownData: any;
}

const ServiceRequests: React.FC<Props> = ({
  fetchServiceRequestComDocActivity,
  serviceRequestComDocActivityData,
  fetchServiceRequestComDocActivityLoading,
  fetchServiceRequestFollowers,
  addComment,
  updateComment,
  fetchDownloadFiles,
  defaultComDocOpen,
  isQuoteTaskTab = false,
  takeoffProviderRequestId,
  takeoffProviderRequestUrl,
  takeoffProviderRequestNumber,
  takeoffProviderRequestStatus,
  openParadigmModal,
  pricingAsOfDate,
  serviceRequestId,
  onDeleteFileMenuClick,
  onEditFileMenuClick,
  fetchParadigmUpdate,
  setBfsErrorModalContent,
  viewQuoteDetailsData,
  statusListDropdownData,
  projectTypeDropdownData
}) => {
  const [comDocActivityPanelData, setComDocActivityPanelData] = useState({});
  const [isComDocActivityPanelOpen, setIsComDocActivityPanelOpen] =
    useState(false);
  const [
    serviceRequestComponentStatusTypeListOptions,
    setServiceRequestComponentStatusTypeListOptions
  ] = useState([]);
  const [marketsData, setMarketsData] = useState([]);
  const [isSettingsFlyoutOpen, setIsSettingsFlyoutOpen] = useState(false);

  // TODO: Remove this state and just leverage the RTK query state once our fetchViewQuoteDetails stuff is migrated to RTK query
  const [isRefetchingServiceRequestData, setIsRefetchingServiceRequestData] =
    useState(false);

  const serviceRequestData = viewQuoteDetailsData.headerDetails;

  const { oidcUser } = useSelector(
    (state: PlansAndProjectsReduxStore) => state.user
  );

  const { fetchMarkets, requestQuote, updateQuoteRequest } =
    useFetchQuoteRequest(oidcUser?.access_token);

  const {
    fetchServiceRequestComponentStatusType,
    serviceRequestComponentStatusTypeListingData
  } = useFetchServiceRequestComponentStatusTypes();

  const { fetchServiceRequestStatusType, serviceRequestStatusTypeListingData } =
    useFetchServiceRequestStatusTypes();

  const handleCommentClick = useCallback((_id: string, param: any) => {
    setComDocActivityPanelData({
      title: param.serviceRequestName,
      projectId: param.projectId,
      isFollowing: param.isFollowing,
      serviceRequestId: param.serviceRequestId,
      serviceRequestComponentId: param.serviceRequestComponentId,
      serviceRequestComponentTypeId: param.serviceRequestComponentTypeId,
      estimatorNotes: param.estimatorNotes,
      isFilesSelected: false
    });
    setIsComDocActivityPanelOpen(true);
  }, []);
  const handleDocClick = useCallback((_id: string, param: any) => {
    setComDocActivityPanelData({
      title: param.serviceRequestName,
      projectId: param.projectId,
      isFollowing: param.isFollowing,
      serviceRequestId: param.serviceRequestId,
      serviceRequestComponentId: param.serviceRequestComponentId,
      serviceRequestComponentTypeId: param.serviceRequestComponentTypeId,
      estimatorNotes: param.estimatorNotes,
      isFilesSelected: true
    });
    setIsComDocActivityPanelOpen(true);
  }, []);

  const { fetchData } = useFetchViewQuoteDetails({
    serviceRequestId,
    pricingAsOfDate,
    autoFetch: false
  });

  const [followServiceRequest] = useFollowServiceRequestMutation();

  const formattedServiceRequestsForTasks = useMemo(() => {
    return {
      rows: [serviceRequestData]
    };
  }, [serviceRequestData]);

  const onFollowHandler = async (serviceRequestId: string, param: any) => {
    const activeStatus = param?.isFollowingServiceRequest;
    const followPayload = {
      serviceRequestId,
      isActive: !activeStatus
    };
    await followServiceRequest(followPayload);
    onEditQuoteRequestDone();
  };

  const handleSettingsClick = (_id: string, _param: any) => {
    setIsSettingsFlyoutOpen(true);
  };

  useEffect(() => {
    if (serviceRequestComponentStatusTypeListingData) {
      const serviceRequestComponentStatusTypeList =
        serviceRequestComponentStatusTypeListingData
          .map(
            (componentStatus: any, i: number) =>
              componentStatus?.isActive && {
                key: i,
                text: componentStatus?.displayText,
                value: componentStatus?.serviceRequestComponentStatusTypeId
              }
          )
          .filter((item: any) => item);
      setServiceRequestComponentStatusTypeListOptions(
        serviceRequestComponentStatusTypeList
      );
    }
  }, [serviceRequestComponentStatusTypeListingData]);

  const serviceRequestStatusTypeListOptions = useMemo(() => {
    if (serviceRequestStatusTypeListingData) {
      return serviceRequestStatusTypeListingData
        .map((quoteStatus: any, i: number) => {
          if (quoteStatus?.isActive) {
            return {
              key: i,
              text: quoteStatus?.displayText,
              value: quoteStatus?.serviceRequestStatusTypeId
            };
          }
          return null;
        })
        .filter((item: any) => item);
    }
    return [];
  }, [serviceRequestStatusTypeListingData]);

  useEffect(() => {
    if (serviceRequestData) {
      if (defaultComDocOpen && serviceRequestData) {
        const param = {
          serviceRequestName: serviceRequestData.serviceRequestName,
          isFollowing: serviceRequestData.isFollowingServiceRequest,
          serviceRequestId: serviceRequestData.serviceRequestId,
          projectId: serviceRequestData.projectId
        };
        handleCommentClick("", param);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceRequestData, serviceRequestComponentStatusTypeListOptions]);

  const onEditQuoteRequestDone = async () => {
    setIsRefetchingServiceRequestData(true);
    fetchData(true).finally(() => {
      setIsRefetchingServiceRequestData(false);
    });
  };

  const onUpdateQuoteRequest = (
    quoteFor: string,
    payload: any,
    serviceRequestId: any
  ) => {
    if (quoteFor === "Project") {
      return updateQuoteRequest(payload, serviceRequestId);
    } else {
      return requestQuote(payload);
    }
  };

  const fetchMarketsData = async () => {
    const result = await fetchMarkets();
    if (result?.title === "Success") {
      const marketOptions = result?.markets.map((market: any, i: number) => ({
        key: i,
        text: market.workflowMarketName,
        value: market.workflowMarketId
      }));
      setMarketsData(marketOptions);
    } else if (result?.title === "Error") {
      setMarketsData([]);
    }
  };

  const intitalLoad = async () => {
    fetchServiceRequestComponentStatusType();
    fetchServiceRequestStatusType();
    fetchMarketsData();
  };

  useEffect(() => {
    intitalLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSettingsFlyOutClose = () => {
    fetchData(true);
    setIsSettingsFlyoutOpen(false);
  };

  return (
    <>
      {Boolean(serviceRequestData) && !isRefetchingServiceRequestData ? (
        <QuoteGridList
          loading={false}
          data={formattedServiceRequestsForTasks}
          marketsData={marketsData as any}
          serviceRequestStatusTypeListOptions={
            serviceRequestStatusTypeListOptions
          }
          onEditQuoteRequestDone={onEditQuoteRequestDone}
          onUpdateQuoteRequest={onUpdateQuoteRequest}
          serviceRequestComponentStatusTypeListOptions={
            serviceRequestComponentStatusTypeListOptions as any
          }
          takeoffProviderRequestId={takeoffProviderRequestId}
          takeoffProviderRequestUrl={takeoffProviderRequestUrl}
          takeoffProviderRequestNumber={takeoffProviderRequestNumber}
          takeoffProviderRequestStatus={takeoffProviderRequestStatus}
          openParadigmModal={openParadigmModal}
          isQuoteLinkDisabled={true}
          isQuoteTaskTab={isQuoteTaskTab}
          fetchParadigmUpdate={fetchParadigmUpdate}
          handleDocClick={handleDocClick}
          handleCommentClick={handleCommentClick}
          handleSettingsClick={handleSettingsClick}
          handleFollowClick={onFollowHandler}
        />
      ) : (
        <MuiLoader size={LOADER_SIZE.huge} />
      )}
      <ComDocActivityFlyOut
        externalOpen={isComDocActivityPanelOpen}
        externalClose={() => setIsComDocActivityPanelOpen(false)}
        data={comDocActivityPanelData}
        fetchServiceRequestComDocActivity={fetchServiceRequestComDocActivity}
        serviceRequestComDocActivityData={serviceRequestComDocActivityData}
        fetchServiceRequestComDocActivityLoading={
          fetchServiceRequestComDocActivityLoading
        }
        fetchServiceRequestFollowers={fetchServiceRequestFollowers}
        addComment={addComment}
        updateComment={updateComment}
        fetchDownloadFiles={fetchDownloadFiles}
        onDeleteFileMenuClick={onDeleteFileMenuClick}
        onEditFileMenuClick={onEditFileMenuClick}
        viewQuoteDetailsData={viewQuoteDetailsData}
      />
      {isSettingsFlyoutOpen && (
        <SettingsFlyOut
          externalOpen={isSettingsFlyoutOpen}
          externalClose={handleSettingsFlyOutClose}
          closeOnEscape
          title="Project Settings"
          viewQuoteDetailsData={viewQuoteDetailsData}
          loading={
            !viewQuoteDetailsData ||
            !projectTypeDropdownData ||
            !statusListDropdownData
          }
          closeOnOutsideClick
          setBfsErrorModalContent={setBfsErrorModalContent}
          statusListDropdownData={statusListDropdownData}
          projectTypeDropdownData={projectTypeDropdownData}
          closeModalHandler={() => {
            fetchData(true);
          }}
        />
      )}
    </>
  );
};

export default ServiceRequests;
