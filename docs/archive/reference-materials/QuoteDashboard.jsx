import {
  Box,
  GlobalStyles,
  LinearProgress,
  Pagination,
  styled
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BfsMessage,
  ComDocActivityFlyOut,
  DeleteQuoteCategoryWithMesModal,
  DeleteQuoteConfirmationModal,
  FileDeleteModal,
  FileEditModal,
  MuiLoader,
  QuoteGridList,
  SendToParadigmModal,
  SettingsFlyOut
} from "../../components";
import {
  DASHBOARD_DRAWER_WIDTH,
  QuoteDashboardDrawer
} from "../../components/QuoteDashboard/QuoteDashboardDrawer";
import { QuoteDashboardPaginationRow } from "../../components/QuoteDashboard/QuoteDashboardPaginationRow";
import { QuoteDashboardTitleRow } from "../../components/QuoteDashboard/QuoteDashboardTitleRow";
import { QutoeDashboardVersionToggle } from "../../components/QuoteDashboard/QuoteDashboardVersionToggle";
import QuotesFilter, {
  maxResultsOptionsGroupPerPage,
  maxResultsOptionsNoGroupPerPage
} from "../../components/QuotesFilter";
import DeleteSavedViewModal from "../../components/modals/DeleteSavedViewModal";
import ErrorModal from "../../components/modals/ErrorModal";
import SaveViewModal from "../../components/modals/SaveViewModal";
import SaveViewOverwriteModal from "../../components/modals/SaveViewOverwriteModal";
import {
  convertDateTimeOffSetToUSDate,
  CUSTOMER_GROUP_BY_OPTION,
  dateToUSDate,
  DEFAULT_QUOTE_DASHBOARD_VIEW_LABEL,
  DETAILED_OPTION,
  FILE_FOLDER_TYPES,
  generateMessageForDeletedMesJob,
  isNoneGroup,
  LOADER_SIZE,
  MARKET_GROUP_BY_OPTION,
  NONE_GROUP_BY_OPTION,
  QUOTE_FOLDER,
  SALESREP_CATEGORY_GROUP_BY_OPTION,
  SALESREP_SR_GROUP_BY_OPTION,
  SERVER_SIDE_MAX_RESULTS_OPTIONS,
  SORT_BY_NEWEST_TO_OLDEST,
  TEAM_MEMBER_GROUP_BY_OPTION
} from "../../lib";
import {
  getDocumentAttachmentSource,
  getDocumentEntityId
} from "../../lib/fileAttachmentSourceHelpers";
import { getFileUploadFolderOptions } from "../../lib/getFileUploadFolderOptions";
import {
  adminApi,
  useFollowServiceRequestMutation,
  useSavedFilterViewsQuery
} from "../store/API/adminApi";
import {
  useFetchComDocFiles,
  useFetchProjectLookupInfo,
  useFetchQuoteAttachmentTypes,
  useFetchQuoteSettings,
  useFetchShipToAccounts
} from "../store/hooks";
import { useCurrentLoggedInResource } from "../store/hooks/useCurrentLoggedInResource";
import useFetchFileDownload from "../store/hooks/useFetchFileDownload";
import useFetchQuoteRequest from "../store/hooks/useFetchQuoteRequest";
import useFetchSendParadigm from "../store/hooks/useFetchSendParadigm";
import { useFetchServiceRequest } from "../store/hooks/useFetchServiceRequest";
import { useFetchServiceRequestComDocActivity } from "../store/hooks/useFetchServiceRequestComDocActivity";
import { useQuoteDashboardFilters } from "../store/hooks/useQuoteDashboardFilters";
import { useQuoteDashboardServiceRequestList } from "../store/hooks/useQuoteDashboardServiceRequestList";
import { selectIsUsingQuoteDashboardV2 } from "../store/slices/quoteDashboardSlice";

const StQuoteRequestsSection = styled("div")`
  position: relative;
  grid-column: span 12;
  border-radius: 8px;
  top: -10px;
  padding: 10px 20px 1rem;

  div > table > tbody > tr.stServiceRequestRows {
    border: 1px solid #dedede;
    box-shadow: #dedede 0px 2px 8px 0px;
  }

  tr.stCategoryRows {
    background-color: #ededed;
    border-left: 1px solid #dedede;
    border-right: 1px solid #dedede;
  }
`;

const StdPagination = styled("div")`
  display: flex;
  justify-content: center;
`;

const unassignedGroup = "Unassigned";

export const QuoteDashboard = () => {
  const dispatch = useDispatch();
  const isUsingQuoteDashboardV2 = useSelector(selectIsUsingQuoteDashboardV2);
  // Save view filters - the current state of filters used in the search pop up
  // Search values - filters used for server side searches
  // filter values - used in dashboard v1
  const getFiltersToSave = ({
    saveViewFilters,
    selectedFilterValues,
    searchValues
  }) => {
    if (!isUsingQuoteDashboardV2) {
      return selectedFilterValues;
    }

    if (saveViewFilters) {
      return saveViewFilters;
    }

    return searchValues;
  };

  const { oidcUser } = useSelector((state) => state.user, shallowEqual);
  const quotesInEditMode = useSelector(
    (state) => state.quoteCard.serviceRequestIdsCurrentlyInEditingState
  );
  const [paginationData, setPaginationData] = useState({
    currentPage: 0,
    maxResults: maxResultsOptionsNoGroupPerPage[0]
  });

  const [isComDocActivityPanelOpen, setIsComDocActivityPanelOpen] =
    useState(false);
  const [comDocActivityPanelData, setComDocActivityPanelData] = useState(null);
  const { updateCrumbs } = useSelector((state) => state.env);
  const [paradigmServiceRequestId, setParadigmServiceRequestId] = useState("");
  const [paradigmModalIsOpen, setParadigmModalIsOpen] = useState(false);

  const [searchValues, setSearchValues] = useState({
    marketQueue: [],
    serviceRequestStatusType: [],
    includeArchived: false
  });

  const [saveViewFilters, setSaveViewFilters] = useState(null);

  const [saveViewModalIsOpen, setSaveViewModalIsOpen] = useState(false);
  const [deleteSavedViewModalIsOpen, setDeleteSavedViewModalIsOpen] =
    useState(false);
  const [deleteWorkflowSavedFilterViewId, setDeleteWorkflowSavedFilterViewId] =
    useState(null);
  const [saveViewOverwriteModalIsOpen, setSaveViewOverwriteModalIsOpen] =
    useState(false);
  const [
    overwriteWorkflowSavedFilterViewId,
    setOverwriteWorkflowSavedFilterViewId
  ] = useState(null);
  const [overwriteViewPayload, setOverwriteViewPayload] = useState(null);
  const [searchParams] = useSearchParams();
  const searchParamServiceRequestId = searchParams.get("serviceRequestId");
  const searchParamMarketId = searchParams.get("workflowmarketid");
  const searchParamUnassigned = JSON.parse(
    searchParams.get("unassignedquotes")
  );
  const [previousViewName, setPreviousViewName] = useState("");
  const [marketsData, setMarketsData] = useState([]);
  const [fileDeleteModalIsOpen, setFileDeleteModalIsOpen] = useState(false);
  const [fileDeleteModalBtnLoading, setFileDeleteModalBtnLoading] =
    useState(false);
  const [fileEditModalIsOpen, setFileEditModalIsOpen] = useState(false);
  const [fileErrorMessage, setFileErrorMessage] = useState("");
  const [fileAttachment, setFileAttachment] = useState({});
  const [fileActionServiceRequestId, setFileActionServiceRequestId] =
    useState(null);
  var [visibleItems, setVisibleItems] = useState([]);

  const [deleteMessage, setDeleteMessage] = useState("");
  const [mesSystemName, setMesSystemName] = useState("");
  const [
    openDeleteQuoteCategoryWithMesModal,
    setOpenDeleteQuoteCategoryWithMesModal
  ] = useState(false);
  const [
    deleteQuoteConfirmationModalIsOpen,
    setDeleteQuoteConfirmationModalIsOpen
  ] = useState(false);
  const [deleteQuoteModalBtnLoading, setDeleteQuoteModalBtnLoading] =
    useState(false);
  const [quoteDeleteErrorModalIsOpen, setQuoteDeleteErrorModalIsOpen] =
    useState(false);
  const [quoteDeleteError, setQuoteDeleteError] = useState("");
  const [groupedData, setGroupedData] = useState({});
  const [groupedDataLoading, setGroupedDataLoading] = useState(false);
  const [serviceRequestCategories, setServiceRequestCategories] = useState([]);
  const [isSettingsFlyoutOpen, setIsSettingsFlyoutOpen] = useState(false);
  const [settingsServiceRequestData, setSettingsServiceRequestData] = useState(
    {}
  );

  const defaultSearchQuery = searchParamServiceRequestId
    ? `Quote ID: ${searchParamServiceRequestId}`
    : "";

  useCurrentLoggedInResource();
  useEffect(() => {
    if (updateCrumbs) {
      updateCrumbs({
        crumbs: [{ to: "", label: "Workflow Management" }],
        subText:
          "This is where you can assign service requests to designers and can view their capacity in your selected market"
      });
    }
  }, [updateCrumbs]);

  const {
    serviceRequestFiltersData,
    fetchServiceRequestForSettings,
    serviceRequestData: quoteSettingsData,
    resetSettingsData
  } = useFetchServiceRequest();

  const { data: savedFiltersViews, isLoading: savedFiltersViewsLoading } =
    useSavedFilterViewsQuery();

  const savedViewOptions = useMemo(() => {
    const doAnyDefaultsExist = savedFiltersViews?.some(
      (item) => item.isDefaultSavedFilterView
    );
    return savedFiltersViews?.map((item) => ({
      label: item.workflowSavedFilterViewName,
      value: item.workflowSavedFilterViewName,
      showDeleteIcon:
        item.workflowSavedFilterViewName !== DEFAULT_QUOTE_DASHBOARD_VIEW_LABEL,
      isFavorite:
        item.isDefaultSavedFilterView ||
        (item.workflowSavedFilterViewName ===
          DEFAULT_QUOTE_DASHBOARD_VIEW_LABEL &&
          !doAnyDefaultsExist),
      id: item.workflowSavedFilterViewId
    }));
  }, [savedFiltersViews]);

  const {
    comDocFilesData,
    requestDeleteComDocFiles,
    fetchComDocFiles,
    requestUpdateFileAttachment
  } = useFetchComDocFiles();

  const { requestDeleteQuote } = useFetchQuoteSettings();

  const { fetchShipToAccounts } = useFetchShipToAccounts();

  const { fetchMarkets, updateQuoteRequest } = useFetchQuoteRequest(
    oidcUser?.access_token
  );

  const { fetchAdminParadigmUpdateStatus } = useFetchSendParadigm();

  const { fetchDownloadFiles } = useFetchFileDownload();
  const { fetchDownloadFilesAsBlob } = useFetchFileDownload();
  const [followServiceRequest] = useFollowServiceRequestMutation();

  const {
    fetchServiceRequestComDocActivity,
    serviceRequestComDocActivityData,
    fetchServiceRequestComDocActivityLoading,
    fetchServiceRequestFollowers,
    addComment,
    updateComment
  } = useFetchServiceRequestComDocActivity();

  const { quoteAttachmentTypesData } = useFetchQuoteAttachmentTypes({
    autoFetch: false
  });

  const onFollowHandler = async (serviceRequestId, param) => {
    const activeStatus = param?.isFollowingServiceRequest;
    const followPayload = {
      serviceRequestId,
      isActive: !activeStatus
    };
    followServiceRequest(followPayload);
  };

  const handleSettingsFlyOutClose = () => {
    setSettingsServiceRequestData({});
    setIsSettingsFlyoutOpen(false);
    resetSettingsData();
    refetchServiceRequests();
  };

  const handleComDocFlyOutClose = () => {
    setIsComDocActivityPanelOpen(false);
  };

  const quoteDeleteHandler = (serviceRequestObject) => {
    setSettingsServiceRequestData(serviceRequestObject);
    const hasMesData = serviceRequestObject?.serviceRequestComponents.filter(
      (item) => item.hasOwnProperty("mesServiceRequestJob")
    );
    if (hasMesData.length) {
      let mesJobCode = [];
      let missingComponents = [];
      hasMesData.forEach((item) => {
        const mesCode = item.mesServiceRequestJob.mesCode;
        if (!mesJobCode.includes(mesCode)) {
          mesJobCode.push(mesCode);
        }
        missingComponents.push(
          generateMessageForDeletedMesJob(
            item.serviceRequestComponentTypeName,
            item.mesServiceRequestJob
          )
        );
      });
      setMesSystemName(mesJobCode.join(", "));

      setDeleteMessage(missingComponents.join(", "));
      setOpenDeleteQuoteCategoryWithMesModal(true);
    } else {
      setDeleteQuoteConfirmationModalIsOpen(true);
    }
    setDeleteQuoteModalBtnLoading(false);
  };

  const closeDeleteQuoteConfirmationModalHandler = () => {
    setDeleteQuoteConfirmationModalIsOpen(false);
  };

  const deleteQuoteCategoryWithMesModalCloseHandler = () => {
    setOpenDeleteQuoteCategoryWithMesModal(false);
    setDeleteQuoteConfirmationModalIsOpen(true);
  };

  const closeQuoteDeleteErrorModalHandler = () => {
    setQuoteDeleteErrorModalIsOpen(false);
    setQuoteDeleteError("");
  };

  const onDeleteQuoteHandler = async (deleteEntireQuote) => {
    setQuoteDeleteError("");
    setDeleteQuoteModalBtnLoading(true);
    const deleteQuote = await requestDeleteQuote(
      settingsServiceRequestData?.serviceRequestId,
      deleteEntireQuote
    );
    if (deleteQuote?.payload.title === "Success") {
      setDeleteQuoteConfirmationModalIsOpen(false);
      refetchServiceRequests();
      handleSettingsFlyOutClose();
    } else {
      setQuoteDeleteError(deleteQuote?.payload.message);
      setDeleteQuoteConfirmationModalIsOpen(false);
      setQuoteDeleteErrorModalIsOpen(true);
    }
    setDeleteQuoteModalBtnLoading(false);
  };

  const onEditSaveFileHandler = async () => {
    setFileErrorMessage("");
    setFileDeleteModalBtnLoading(true);
    const toFolderType = Number(
      String(fileAttachment.folderType).split("_")?.[0]
    );
    const editingFileAttachment = comDocFilesData.find(
      (file) => file.dataCoreFileId === fileAttachment.dataCoreFileId
    );
    const hasFolderTypeChanged =
      editingFileAttachment.quoteId !== fileAttachment.quoteId;

    const payload = {
      fileName: fileAttachment.fileName,
      attachmentId: fileAttachment.attachmentId,
      attachmentTypeId: fileAttachment.attachmentTypeId,
      visibleToCustomer: fileAttachment.visibleToCustomer,
      dataCoreFileId: fileAttachment.dataCoreFileId,
      attachmentSourceId: getDocumentEntityId(editingFileAttachment),
      attachmentSource: getDocumentAttachmentSource(editingFileAttachment),
      serviceRequestComponentId: fileAttachment.serviceRequestComponentId,
      quotePackId: fileAttachment.quotePackId,
      toAttachmentSourceId: hasFolderTypeChanged
        ? getDocumentEntityId(fileAttachment)
        : null,
      toAttachmentSource: hasFolderTypeChanged
        ? getDocumentAttachmentSource(fileAttachment)
        : null,
      toFolderType: hasFolderTypeChanged ? toFolderType : null
    };
    const updateFileAttachment = await requestUpdateFileAttachment(
      fileAttachment.fileId,
      payload
    );
    if (updateFileAttachment?.payload.title === "Success") {
      setFileAttachment({});
      setFileEditModalIsOpen(false);
      fetchServiceRequestComDocActivity(fileActionServiceRequestId);
      fetchComDocFiles(fileActionServiceRequestId);
      setFileActionServiceRequestId(null);
    } else if (updateFileAttachment?.payload.title === "Error") {
      setFileErrorMessage(updateFileAttachment?.payload.message);
    }
    setFileDeleteModalBtnLoading(false);
  };

  const onDeleteFileHandler = async () => {
    setFileErrorMessage("");
    setFileDeleteModalBtnLoading(true);
    const deleteFileAttachment = await requestDeleteComDocFiles(
      fileAttachment.fileId,
      fileAttachment.dataCoreFileId,
      getDocumentEntityId(fileAttachment),
      getDocumentAttachmentSource(fileAttachment)
    );
    if (deleteFileAttachment.payload.title === "Success") {
      setFileAttachment({});
      setFileDeleteModalIsOpen(false);
      fetchComDocFiles(fileActionServiceRequestId);
      fetchServiceRequestComDocActivity(fileActionServiceRequestId);
      setFileActionServiceRequestId(null);
    } else if (deleteFileAttachment.payload.title === "Error") {
      setFileErrorMessage(deleteFileAttachment.payload.message);
    }
    setFileDeleteModalBtnLoading(false);
  };

  const onCloseFileDeleteModal = () => {
    setFileDeleteModalIsOpen(false);
    setFileActionServiceRequestId(null);
    setFileDeleteModalBtnLoading(false);
    setFileErrorMessage("");
  };

  const fileAttachmentFormatter = (fileItem) => {
    setFileAttachment({
      fileId: fileItem?.file.fileId,
      fileName: fileItem?.file?.fileName,
      attachmentId: fileItem?.attachmentId,
      attachmentTypeId: fileItem?.attachmentTypeId,
      visibleToCustomer: fileItem?.visibleToCustomer,
      dataCoreFileId: fileItem?.dataCoreFileId,
      folderType:
        fileItem?.dataCoreFolderType === FILE_FOLDER_TYPES[QUOTE_FOLDER]
          ? `${fileItem?.dataCoreFolderType}_${fileItem?.quoteId}`
          : fileItem?.dataCoreFolderType,
      serviceRequestComponentId: fileItem.serviceRequestComponentId
        ? fileItem.serviceRequestComponentId
        : null,
      quotePackId: fileItem?.quotePackId ? fileItem.quotePackId : null,
      serviceRequestId: fileItem?.serviceRequestId ?? null,
      projectId: fileItem?.projectId ?? null,
      quoteId: fileItem?.quoteId ?? null,
      dataCoreFolderType: fileItem?.dataCoreFolderType
    });
  };

  const onEditFileMenuClick = (
    serviceRequestCategoryTagList,
    attachmentItem,
    serviceRequestId
  ) => {
    fileAttachmentFormatter(attachmentItem);
    setServiceRequestCategories(serviceRequestCategoryTagList);
    setFileEditModalIsOpen(true);
    setFileActionServiceRequestId(serviceRequestId);
  };
  const onDeleteFileMenuClick = (file, deleteAttachServiceRequestId) => {
    setFileDeleteModalIsOpen(true);
    setFileActionServiceRequestId(deleteAttachServiceRequestId);
    fileAttachmentFormatter(file);
  };
  const { projectLookupInfoData, fetchProjectLookupInfoData } =
    useFetchProjectLookupInfo(false);

  const updateFileAttachmentData = (fileAttachmentData) => {
    setFileAttachment(fileAttachmentData);
  };

  const onCloseFileEditModal = () => {
    setFileEditModalIsOpen(false);
    setFileActionServiceRequestId(null);
    setFileDeleteModalBtnLoading(false);
    setFileErrorMessage("");
  };
  const onEditQuoteRequestDone = () => {
    refetchServiceRequests();
  };

  const openParadigmModal = useCallback((quoteRequestData) => {
    setParadigmServiceRequestId(quoteRequestData.serviceRequestId);
    setParadigmModalIsOpen(true);
  }, []);

  const onUpdateQuoteRequest = async (_quoteFor, payload, serviceRequestId) => {
    const response = await updateQuoteRequest(payload, serviceRequestId);
    if (response.payload?.title === "Success") {
      updateIndividualServiceRequestData(response.payload);
    }
    dispatch(
      adminApi.util.invalidateTags([
        "QuoteDashboardSearch",
        "QuoteDashboardFilters"
      ])
    );
    return response;
  };

  const closeSendParadigmModalHandler = async () => {
    setParadigmModalIsOpen(false);
    refetchServiceRequests();
  };

  // #region pagination and filters
  const [followingCount, setFollowingCount] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [maxResultsOptionsPerPage, setMaxResultsOptionsPerPage] = useState(
    maxResultsOptionsNoGroupPerPage
  );
  const rowsPerPage = useMemo(() => {
    return paginationData?.maxResults || maxResultsOptionsPerPage[0];
  }, [maxResultsOptionsPerPage, paginationData?.maxResults]);

  const initialFiltersData = {
    marketQueue: [],
    teamQueue: [],
    assignment: [],
    categories: [],
    categoryStatus: [],
    serviceRequestStatusType: [],
    following: false,
    projectType: [],
    salesRep: [],
    customer: [],
    dateType: 1,
    startDate: null,
    endDate: null,
    daysTillDue: "",
    smartSearchQuery: defaultSearchQuery || "",
    searchText: "",
    mySavedView: DEFAULT_QUOTE_DASHBOARD_VIEW_LABEL,
    maxResults: SERVER_SIDE_MAX_RESULTS_OPTIONS[0],
    density: DETAILED_OPTION.value,
    showTasks: true,
    showQuotes: true,
    groupBy: NONE_GROUP_BY_OPTION.value,
    externalTakeoffRequestStatus: [],
    includeArchived: false,
    skipApiCall: true,
    categorySalesRep: [],
    sortBy: SORT_BY_NEWEST_TO_OLDEST
  };

  const [selectedFiltersValues, setSelectedFiltersValues] =
    useState(initialFiltersData);

  const resetFilters = () => {
    setSelectedFiltersValues(initialFiltersData);
    setSearchValues(initialFiltersData);
    setPaginationData({
      currentPage: 0,
      maxResults: maxResultsOptionsNoGroupPerPage[0]
    });
    setVisibleItems([]);
  };

  const {
    unfilteredServiceRequests,
    filteredServiceRequests,
    isFetching: isFetchingServiceRequestList,
    isLoading: isLoadingServiceRequestList,
    refetch: refetchServiceRequests,
    updateIndividualServiceRequestData
  } = useQuoteDashboardServiceRequestList({
    searchValues,
    clientSideFilters: selectedFiltersValues
  });

  const filtersDataOptions = useQuoteDashboardFilters({
    serviceRequestData: unfilteredServiceRequests
  });

  const totalPages = Math.ceil(totalResults / rowsPerPage);

  const handleChangePage = (_, newPage, scrollToTop = false) => {
    setPaginationData((currentState) => ({
      ...currentState,
      currentPage: newPage
    }));
    if (scrollToTop) {
      document.getElementById("workflowContainer")?.scrollIntoView({
        behavior: "smooth"
      });
    }
  };

  const handleChangeRowsPerPage = (event) => {
    const newMaxResults =
      filteredServiceRequests?.length < visibleItems.length
        ? filteredServiceRequests?.length
        : parseInt(event.target.value, 10);

    setPaginationData((currentState) => ({
      ...currentState,
      maxResults: newMaxResults,
      currentPage: 0
    }));

    // Sync to selectedFiltersValues for Dashboard V1 and client-side filtering
    setSelectedFiltersValues((currentState) => ({
      ...currentState,
      resultsPerPage: newMaxResults,
      skipApiCall: true
    }));

    // Sync to searchValues for Dashboard V2
    setSearchValues((currentState) => ({
      ...currentState,
      resultsPerPage: newMaxResults,
      skipApiCall: true
    }));
  };
  // #endregion

  useEffect(() => {
    const currentPage = paginationData?.currentPage || 0;
    setVisibleItems(
      filteredServiceRequests.slice(
        currentPage * rowsPerPage,
        currentPage * rowsPerPage + rowsPerPage
      ) || []
    );
  }, [rowsPerPage, paginationData?.currentPage, filteredServiceRequests]);

  const onGroupByChange = (value) => {
    setGroupedDataLoading(true);
    setPaginationData((currentState) => ({
      ...currentState,
      maxResults: isNoneGroup(value)
        ? maxResultsOptionsNoGroupPerPage[0]
        : maxResultsOptionsGroupPerPage[0],
      currentPage: 0
    }));
  };

  useEffect(() => {
    const groupBy = selectedFiltersValues?.groupBy;
    let groupedDataObj = {};
    if (!isNoneGroup(groupBy)) {
      setGroupedData(groupedDataObj);
      filteredServiceRequests.forEach((item) => {
        const dataObj = item;

        function addToGroup(groupName) {
          if (!groupedDataObj[groupName]) {
            groupedDataObj[groupName] = [];
          }
          if (
            !groupedDataObj[groupName].find(
              (x) => x.serviceRequestId === item.serviceRequestId
            )
          ) {
            groupedDataObj[groupName].push({
              ...item,
              id: `${groupName + "_" + (groupedDataObj[groupName].length + 1)}`
            });
          }
        }

        switch (groupBy) {
          case CUSTOMER_GROUP_BY_OPTION.value:
            if (dataObj.customer) {
              addToGroup(dataObj.customer.customerName);
            } else {
              addToGroup(unassignedGroup);
            }
            break;
          case TEAM_MEMBER_GROUP_BY_OPTION.value:
            if (dataObj.serviceRequestComponents.length) {
              dataObj.serviceRequestComponents.forEach(
                (serviceRequestComponent) => {
                  if (serviceRequestComponent.isFilteredTask) {
                    if (serviceRequestComponent.assignedToUserName) {
                      addToGroup(serviceRequestComponent.assignedToUserName);
                    } else {
                      addToGroup(unassignedGroup);
                    }
                  }
                }
              );
            } else {
              addToGroup(unassignedGroup);
            }
            break;
          case SALESREP_SR_GROUP_BY_OPTION.value:
            if (dataObj.primaryQuoteOwner) {
              addToGroup(
                dataObj.primaryQuoteOwner.serviceDeliveryResourceFullName
              );
            } else {
              addToGroup(unassignedGroup);
            }
            break;
          case SALESREP_CATEGORY_GROUP_BY_OPTION.value:
            if (dataObj.serviceRequestComponents.length) {
              dataObj.serviceRequestComponents.forEach(
                (serviceRequestComponent) => {
                  if (serviceRequestComponent.isFilteredTask) {
                    if (
                      serviceRequestComponent.additionalSalesRepresentativeUserName
                    ) {
                      addToGroup(
                        serviceRequestComponent.additionalSalesRepresentativeUserName
                      );
                    } else {
                      addToGroup(unassignedGroup);
                    }
                  }
                }
              );
            } else {
              addToGroup(unassignedGroup);
            }
            break;
          case MARKET_GROUP_BY_OPTION.value:
            if (dataObj.workflowMarket) {
              addToGroup(dataObj.workflowMarket.workflowMarketName);
            } else {
              addToGroup(unassignedGroup);
            }
            break;
          default:
            break;
        }
      });
      setTotalResults(Object.keys(groupedDataObj).length);
    } else {
      setTotalResults(filteredServiceRequests.length || 0);
    }
    const currentPage = paginationData?.currentPage || 0;
    setGroupedData(
      Object.fromEntries(
        Object.entries(groupedDataObj).slice(
          currentPage * rowsPerPage,
          currentPage * rowsPerPage + rowsPerPage
        )
      )
    );
    setGroupedDataLoading(false);
  }, [
    rowsPerPage,
    selectedFiltersValues?.groupBy,
    paginationData?.currentPage,
    paginationData?.maxResults,
    filteredServiceRequests
  ]);

  useEffect(() => {
    setPaginationData((currentState) => ({
      ...currentState,
      currentPage: 0
    }));
  }, [selectedFiltersValues, searchValues]);

  const handleCommentClick = (id, param) => {
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
    fetchServiceRequestForSettings(param?.serviceRequestId);
    setIsComDocActivityPanelOpen(true);
  };
  const handleDocClick = (id, param) => {
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
    fetchServiceRequestForSettings(param?.serviceRequestId);
    setIsComDocActivityPanelOpen(true);
  };
  const handleSettingsClick = async (id, param) => {
    fetchShipToAccounts(param?.customer?.onlineAlphaCode);
    fetchServiceRequestForSettings(param?.serviceRequestId);
    if (!projectLookupInfoData) {
      fetchProjectLookupInfoData();
    }
    setIsSettingsFlyoutOpen(true);
  };

  useEffect(() => {
    if (filteredServiceRequests) {
      const followingList = filteredServiceRequests.filter(
        (item) => item.isFollowingServiceRequest
      );

      setFollowingCount(followingList.length);
    }
  }, [filteredServiceRequests, projectLookupInfoData]);

  const fetchMarketsData = async () => {
    const result = await fetchMarkets();
    if (result?.title === "Success") {
      const marketOptions = result?.markets.map((market, i) => ({
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
    fetchMarketsData();
  };

  useEffect(() => {
    intitalLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDownloadQuoteDashboard = useCallback(() => {
    const data = [];

    filteredServiceRequests.forEach((serviceRequest) => {
      const addToData = (serviceRequestComponent) => {
        const rowObj = {
          "Customer Name": serviceRequest.customer?.customerName,
          "Customer ID": serviceRequest.customer?.onlineAlphaCode,
          "Quote Name": serviceRequest.serviceRequestName,
          "Quote ID": serviceRequest.serviceRequestId,
          "Paradigm Job ID": serviceRequest.takeoffProviderRequestNumber,
          "Quote Type": serviceRequest.project?.projectType,
          "Addr Ln 1": serviceRequest.project?.projectAddress,
          "Addr Ln 2": serviceRequest.project?.projectCity,
          "Addr Ln 3": serviceRequest.project?.projectState,
          Received: serviceRequest.receivedDate
            ? dateToUSDate(new Date(serviceRequest.receivedDate))
            : "",
          Market: serviceRequest.workflowMarket?.workflowMarketName,
          "Sales Rep":
            serviceRequest.primaryQuoteOwner?.serviceDeliveryResourceFullName,
          "Customer Needed By": serviceRequest.customerRequestedByDate
            ? convertDateTimeOffSetToUSDate(
                serviceRequest.customerRequestedByDate
              )
            : "",
          "Project Status": serviceRequest.serviceRequestStatus,
          Category: serviceRequestComponent?.serviceRequestComponentTypeName,
          "Category Status":
            serviceRequestComponent?.serviceRequestComponentStatusType
              ?.displayText,
          "Sq Footage": serviceRequest.squareFootage,
          "Sales Rep (Category)":
            serviceRequestComponent?.additionalSalesRepresentativeUserName,
          "Team Assignment":
            serviceRequestComponent?.serviceDeliveryTeam
              ?.serviceDeliveryTeamName,
          Assignment: serviceRequestComponent?.assignedToUserName,
          "Due Date": serviceRequestComponent?.estimatedCompletionDate
            ? convertDateTimeOffSetToUSDate(
                serviceRequestComponent?.estimatedCompletionDate
              )
            : "",
          "MES System": serviceRequestComponent?.mesServiceRequestJob?.mesCode,
          "MES Job ID": serviceRequestComponent?.mesServiceRequestJob?.mesJobId,
          "MES System Status":
            serviceRequestComponent?.mesServiceRequestJob?.mesJobStatus,
          "Customer Ref #": serviceRequest.customerReferenceNumber
        };
        data.push(rowObj);
      };

      if (serviceRequest.serviceRequestComponents?.length) {
        serviceRequest.serviceRequestComponents.forEach(
          (serviceRequestComponent) => {
            addToData(serviceRequestComponent);
          }
        );
      } else {
        addToData();
      }
    });
    const csvContent =
      "" +
      Object.keys(data[0])
        .map((key) => key)
        .join(",") +
      "\n" +
      data
        .map((item) =>
          Object.values(item)
            .map((value) => '"' + (value ?? "") + '"')
            .join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const today = dateToUSDate(new Date());
    const filename = `Quote Dashboard - ${today}.csv`;

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filteredServiceRequests]);

  const onOpenSaveViewModal = () => {
    setSaveViewModalIsOpen(true);
  };

  const onCloseSaveViewModal = () => {
    setPreviousViewName("");
    setSaveViewModalIsOpen(false);
    setSaveViewFilters(null);
  };

  const onOpenDeleteSavedViewModal = (viewId) => {
    setDeleteWorkflowSavedFilterViewId(viewId);
    setDeleteSavedViewModalIsOpen(true);
  };

  const onCloseDeleteSavedViewModal = (resStatus = "") => {
    setDeleteWorkflowSavedFilterViewId(null);
    setDeleteSavedViewModalIsOpen(false);
  };

  const onOpenSaveViewOverwriteModal = (viewId, payload) => {
    setOverwriteWorkflowSavedFilterViewId(viewId);
    setOverwriteViewPayload(payload);
    setSaveViewOverwriteModalIsOpen(true);
    onCloseSaveViewModal();
  };

  const onCloseSaveViewOverwriteModal = (closeSaveViewModal) => {
    setOverwriteWorkflowSavedFilterViewId(null);
    setSaveViewOverwriteModalIsOpen(false);
    if (closeSaveViewModal) {
      onCloseSaveViewModal();
    } else {
      setPreviousViewName(
        overwriteViewPayload?.workflowSavedFilterViewName || ""
      );
      onOpenSaveViewModal();
    }
    setOverwriteViewPayload(null);
  };

  const fetchParadigmUpdate = async (serviceRequestId) => {
    const paradigmUpdateStatusResponsePromise =
      fetchAdminParadigmUpdateStatus(serviceRequestId);

    // Ensure that the service requests are refreshed when a Paradigm Estimate
    // project is refreshed. This will keep the "Estimator Notes" up to date.
    await paradigmUpdateStatusResponsePromise;
    await refetchServiceRequests();

    return paradigmUpdateStatusResponsePromise;
  };

  const onFiltersChange = async (newFilters) => {
    setSelectedFiltersValues(newFilters);
  };

  useEffect(() => {
    // Sync search values with selected filters values if not skip API call
    // Since onFiltersChange is called with a callback fn, we have to do this
    // via useEffect
    if (!selectedFiltersValues?.skipApiCall) {
      setSearchValues(selectedFiltersValues);
    }
  }, [selectedFiltersValues]);

  useEffect(() => {
    // Sync resultsPerPage from searchValues to paginationData.maxResults
    if (searchValues?.resultsPerPage) {
      setPaginationData((currentState) => ({
        ...currentState,
        maxResults: searchValues.resultsPerPage,
        currentPage: 0
      }));
    }
  }, [searchValues?.resultsPerPage]);

  const isRefetchingServiceRequests =
    isFetchingServiceRequestList && !isLoadingServiceRequestList;

  return (
    <Box sx={{ width: "100%" }}>
      <GlobalStyles
        styles={`
            #mainNav,
            #stickyHeader,
            #workflowsRemotePage > div:first-of-type,
            #remotePage > div:first-of-type {
              display: none;
            }
          `}
      />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        theme="light"
        style={{
          zIndex: 10000000
        }}
      />
      <QutoeDashboardVersionToggle resetFilters={resetFilters} />
      <Box sx={{ display: "flex", width: "100%", paddingTop: "56px" }}>
        {isUsingQuoteDashboardV2 && (
          <QuoteDashboardDrawer
            setSearchValues={setSearchValues}
            setFilterValues={setSelectedFiltersValues}
            onOpenDeleteSavedViewModal={onOpenDeleteSavedViewModal}
            filterValues={selectedFiltersValues}
            unfilteredServiceRequests={unfilteredServiceRequests}
            initialFiltersData={initialFiltersData}
          />
        )}
        <Box id="workflowContainer" sx={{ width: "100%", marginLeft: "8px" }}>
          <StQuoteRequestsSection>
            {unfilteredServiceRequests?.length === 1000 &&
              !isUsingQuoteDashboardV2 && (
                <BfsMessage
                  mode="info"
                  title="Record Limit Reached"
                  message="The view limit for this page is 1,000 records. Filter to specific Markets, Quote Status or Include Archived to reduce your search results."
                />
              )}
            {!savedFiltersViewsLoading &&
              !isLoadingServiceRequestList &&
              filtersDataOptions &&
              savedViewOptions && (
                <>
                  {saveViewModalIsOpen && (
                    <SaveViewModal
                      isOpen={saveViewModalIsOpen}
                      onClose={onCloseSaveViewModal}
                      selectedFiltersValues={{
                        ...getFiltersToSave({
                          saveViewFilters,
                          selectedFilterValues: selectedFiltersValues,
                          searchValues
                        })
                      }}
                      savedFiltersViews={savedFiltersViews}
                      openSaveViewOverwriteModal={onOpenSaveViewOverwriteModal}
                      previousViewName={previousViewName}
                    />
                  )}
                  {deleteSavedViewModalIsOpen && (
                    <DeleteSavedViewModal
                      isOpen={deleteSavedViewModalIsOpen}
                      onClose={onCloseDeleteSavedViewModal}
                      workflowSavedFilterViewId={
                        deleteWorkflowSavedFilterViewId
                      }
                    />
                  )}
                  {saveViewOverwriteModalIsOpen && (
                    <SaveViewOverwriteModal
                      isOpen={saveViewOverwriteModalIsOpen}
                      onClose={onCloseSaveViewOverwriteModal}
                      workflowSavedFilterViewId={
                        overwriteWorkflowSavedFilterViewId
                      }
                      payload={overwriteViewPayload}
                    />
                  )}
                  {isUsingQuoteDashboardV2 ? (
                    <>
                      <QuoteDashboardTitleRow
                        currentSearchSelections={searchValues}
                        saveSearchSelections={setSearchValues}
                        hasReachedServerSideLimit={
                          unfilteredServiceRequests?.length === 1000
                        }
                        initialFiltersData={initialFiltersData}
                        onOpenSaveViewModal={onOpenSaveViewModal}
                        setSaveViewFilters={setSaveViewFilters}
                      />
                      <QuoteDashboardPaginationRow
                        selectedFilterValues={selectedFiltersValues}
                        searchValues={searchValues}
                        totalResults={totalResults}
                        onServerSideFilterChange={(key, value) => {
                          setSearchValues((currentState) => ({
                            ...currentState,
                            [key]: value,
                            skipApiCall: false
                          }));
                        }}
                        onRefreshData={refetchServiceRequests}
                        paginationData={paginationData}
                        disableRefresh={
                          isComDocActivityPanelOpen ||
                          isSettingsFlyoutOpen ||
                          quotesInEditMode.length !== 0
                        }
                        onDownloadQuoteDashboard={onDownloadQuoteDashboard}
                        handleChangePage={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        maxResultsOptions={maxResultsOptionsPerPage}
                        handleChangeRowsPerPage={handleChangeRowsPerPage}
                        onDensityShowTaskChange={(propertyToUpdate, value) => {
                          setSelectedFiltersValues((currentState) => ({
                            ...currentState,
                            [propertyToUpdate]: value,
                            skipApiCall: true,
                            ...(propertyToUpdate === "density" && {
                              showTasks: value === 1,
                              showQuotes: value === 1
                            })
                          }));
                        }}
                        onGroupByDropdownChange={(propertyToUpdate, value) => {
                          onGroupByChange(value);
                          setSelectedFiltersValues((currentState) => ({
                            ...currentState,
                            [propertyToUpdate]: value,
                            skipApiCall: true
                          }));
                        }}
                      />
                    </>
                  ) : (
                    <QuotesFilter
                      paginationData={paginationData}
                      setPaginationData={setPaginationData}
                      resetFilters={resetFilters}
                      setSelectedFiltersData={onFiltersChange}
                      defaultSearchQuery={defaultSearchQuery}
                      defaultMarketId={searchParamMarketId}
                      isUnassignedFilterOn={searchParamUnassigned}
                      onOpenSaveViewModal={onOpenSaveViewModal}
                      onOpenDeleteSavedViewModal={onOpenDeleteSavedViewModal}
                      savedFiltersViewsRawData={savedFiltersViews}
                      onDownloadQuoteDashboard={onDownloadQuoteDashboard}
                      totalResults={totalResults}
                      rowsPerPage={rowsPerPage}
                      handleChangePage={handleChangePage}
                      handleChangeRowsPerPage={handleChangeRowsPerPage}
                      maxResultsOptions={maxResultsOptionsPerPage}
                      setMaxResultsOptions={setMaxResultsOptionsPerPage}
                      serviceRequests={filteredServiceRequests}
                      onRefreshData={refetchServiceRequests}
                      disableRefresh={
                        isComDocActivityPanelOpen ||
                        isSettingsFlyoutOpen ||
                        quotesInEditMode.length !== 0
                      }
                      onGroupByChange={onGroupByChange}
                      savedViewOptions={savedViewOptions}
                      serviceRequestDataFromApi={unfilteredServiceRequests}
                      filtersDataOptions={filtersDataOptions}
                      filtersValues={selectedFiltersValues}
                      followingCount={followingCount}
                    />
                  )}
                </>
              )}
            {isRefetchingServiceRequests && (
              <LinearProgress
                sx={{
                  position: "fixed",
                  top: "136px",
                  width: `calc(100% - 55px - ${
                    isUsingQuoteDashboardV2 ? DASHBOARD_DRAWER_WIDTH : "0px"
                  })`
                }}
              />
            )}
            {!isLoadingServiceRequestList &&
            filteredServiceRequests != null &&
            !savedFiltersViewsLoading &&
            filtersDataOptions &&
            savedViewOptions ? (
              <>
                <QuoteGridList
                  loading={isLoadingServiceRequestList || groupedDataLoading}
                  data={{
                    ...filteredServiceRequests,
                    rows: visibleItems
                  }}
                  marketsData={marketsData}
                  serviceRequestStatusTypeListOptions={
                    filtersDataOptions.serviceRequestStatusType
                  }
                  onEditQuoteRequestDone={onEditQuoteRequestDone}
                  onUpdateQuoteRequest={onUpdateQuoteRequest}
                  serviceRequestComponentStatusTypeListOptions={
                    filtersDataOptions.serviceRequestComponentStatusType
                  }
                  openParadigmModal={openParadigmModal}
                  selectedFiltersValues={selectedFiltersValues}
                  groupedData={groupedData}
                  fetchParadigmUpdate={fetchParadigmUpdate}
                  handleDocClick={handleDocClick}
                  handleCommentClick={handleCommentClick}
                  handleFollowClick={onFollowHandler}
                  handleSettingsClick={handleSettingsClick}
                />
                <StdPagination>
                  {totalPages > 0 && (
                    <Pagination
                      count={totalPages}
                      page={(paginationData?.currentPage || 0) + 1}
                      onChange={(_, page) =>
                        handleChangePage(_, page - 1, true)
                      }
                    />
                  )}
                </StdPagination>
              </>
            ) : (
              <MuiLoader size={LOADER_SIZE.huge} />
            )}
            <ComDocActivityFlyOut
              externalOpen={isComDocActivityPanelOpen}
              externalClose={handleComDocFlyOutClose}
              closeOnOutsideClick
              data={comDocActivityPanelData}
              fetchServiceRequestComDocActivity={
                fetchServiceRequestComDocActivity
              }
              serviceRequestComDocActivityData={
                serviceRequestComDocActivityData
              }
              fetchServiceRequestComDocActivityLoading={
                fetchServiceRequestComDocActivityLoading
              }
              fetchServiceRequestFollowers={fetchServiceRequestFollowers}
              addComment={addComment}
              updateComment={updateComment}
              fetchDownloadFiles={fetchDownloadFiles}
              fetchDownloadFilesAsBlob={fetchDownloadFilesAsBlob}
              onDeleteFileMenuClick={onDeleteFileMenuClick}
              onEditFileMenuClick={onEditFileMenuClick}
              viewQuoteDetailsData={quoteSettingsData}
            />
            {isSettingsFlyoutOpen && (
              <SettingsFlyOut
                externalOpen={isSettingsFlyoutOpen}
                externalClose={handleSettingsFlyOutClose}
                closeOnEscape
                title="Project Settings"
                quoteDeleteHandler={quoteDeleteHandler}
                viewQuoteDetailsData={quoteSettingsData}
                loading={
                  !quoteSettingsData ||
                  !quoteSettingsData?.headerDetails ||
                  !projectLookupInfoData?.statusListDropdownData ||
                  !projectLookupInfoData?.projectTypeDropdownData
                }
                closeOnOutsideClick
                statusListDropdownData={
                  projectLookupInfoData?.statusListDropdownData
                }
                projectTypeDropdownData={
                  projectLookupInfoData?.projectTypeDropdownData
                }
                closeModalHandler={() => {
                  dispatch(
                    adminApi.util.invalidateTags(["QuoteDashboardSearch"])
                  );
                  refetchServiceRequests();
                }}
              />
            )}
            {deleteQuoteConfirmationModalIsOpen && (
              <DeleteQuoteConfirmationModal
                isModalOpen={deleteQuoteConfirmationModalIsOpen}
                onClose={closeDeleteQuoteConfirmationModalHandler}
                deleteHandler={onDeleteQuoteHandler}
                modalBtnLoading={deleteQuoteModalBtnLoading}
                hasQuoteDetails={
                  settingsServiceRequestData?.quote?.hasQuoteDetails
                }
              />
            )}
            {openDeleteQuoteCategoryWithMesModal && (
              <DeleteQuoteCategoryWithMesModal
                closeModalHandler={deleteQuoteCategoryWithMesModalCloseHandler}
                btn1Handler={deleteQuoteCategoryWithMesModalCloseHandler}
                deleteMessage={deleteMessage}
                mesSystemName={mesSystemName}
              />
            )}
            {quoteDeleteErrorModalIsOpen && (
              <ErrorModal
                isModalOpen={quoteDeleteErrorModalIsOpen}
                onClose={closeQuoteDeleteErrorModalHandler}
                modalTitle="Delete Quote Error"
                btn1Label="okay"
                modalBody={quoteDeleteError}
              />
            )}
            {paradigmModalIsOpen && (
              <SendToParadigmModal
                isOpen
                onClose={closeSendParadigmModalHandler}
                serviceRequestId={paradigmServiceRequestId}
              />
            )}
            <FileEditModal
              isModalOpen={fileEditModalIsOpen}
              onClose={onCloseFileEditModal}
              fileAttachmentData={fileAttachment}
              attachmentTypes={
                fileAttachment.projectId
                  ? projectLookupInfoData?.attachmentTypes
                  : quoteAttachmentTypesData
              }
              updateFileAttachmentData={updateFileAttachmentData}
              saveHandler={onEditSaveFileHandler}
              modalBtnLoading={fileDeleteModalBtnLoading}
              errorMessage={fileErrorMessage}
              isEmployee
              serviceRequestCategories={serviceRequestCategories}
              showCategories={!fileAttachment.projectId}
              folderOptions={getFileUploadFolderOptions(
                quoteSettingsData?.headerDetails
              )}
            />
            <FileDeleteModal
              isModalOpen={fileDeleteModalIsOpen}
              onClose={onCloseFileDeleteModal}
              deleteHandler={onDeleteFileHandler}
              modalBtnLoading={fileDeleteModalBtnLoading}
              errorMessage={fileErrorMessage}
            />
          </StQuoteRequestsSection>
        </Box>
      </Box>
    </Box>
  );
};
