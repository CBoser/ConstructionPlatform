import { mdiPlus, mdiTabSearch } from "@mdi/js";
import Icon from "@mdi/react";
import { IconButton, styled, Tab, Tabs, Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import moment from "moment";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";
import {
  BFSErrorModal,
  BfsIconButton,
  DeleteQuoteCategoryWithMesModal,
  ExternalLink,
  FileDeleteModal,
  FileEditModal,
  MuiLoader,
  SendToParadigmModal
} from "../../components";
import DraggableTabsList from "../../components/DraggableTabsList";
import DeleteErrorModal from "../../components/modals/DeleteErrorModal";
import { DownloadQuoteModal } from "../../components/modals/DownloadQuoteModal";
import EditPublishModal from "../../components/modals/EditPublishModal";
import InactiveCustomerModal from "../../components/modals/InactiveCustomerModal";
import InactiveShipToModal from "../../components/modals/InactiveShipToModal";
import QuoteActionRow from "../../components/QuoteActionRow";
import QuoteDialogDropdown from "../../components/QuoteDialogDropdown";
import { NewQuoteModal } from "../../components/Quotes/NewQuoteModal";
import { QuoteDetailsTab } from "../../components/Quotes/QuoteDetailsTab";
import VersionDrawer from "../../components/VersionDrawer";
import { TabButtonContainer } from "../../components/ViewQuoteDetailsTabs/TabButtonContainer";
import { TabContent } from "../../components/ViewQuoteDetailsTabs/TabContent";
import { useGAEvents, useToggle } from "../../hooks";
import {
  convertDateTimeOffSetToUSDate,
  cp,
  dateToUSDate,
  sendPostMessageToMybldr
} from "../../lib";
import { getAllUnconfirmedAlternates } from "../../lib/alternateItems/getAllUnconfirmedAlternates";
import {
  BROWSER_STORAGE_KEYS,
  COLUMN_VIEWS,
  DataDogCustomAttributes,
  FILE_FOLDER_TYPES,
  LOADER_SIZE,
  PREVENT_CLICKS_CLASS,
  PRICING_METHOD_IDS,
  QUOTE_EDITOR_TABS,
  QUOTE_FOLDER
} from "../../lib/constants";
import {
  getDocumentAttachmentSource,
  getDocumentEntityId
} from "../../lib/fileAttachmentSourceHelpers";
import { getFileUploadFolderOptions } from "../../lib/getFileUploadFolderOptions";
import { getPopulatedQuoteData } from "../../lib/getPopulatedQuoteDataList";
import { packTotalAndMarginReducer } from "../../lib/packTotalAndMarginReducer";
import { shouldShowCostInfo } from "../../lib/shouldShowCostInfo";
import CustomerSummary from "../containers/CustomerSummary";
import ServiceRequests from "../containers/ServiceRequests";
import { resetConsolidatedQuotesState } from "../store/actions/consolidateQuotesActions";
import {
  useFetchComDocFiles,
  useFetchProjectLookupInfo,
  useFetchQuoteAttachmentTypes,
  useFileDownload
} from "../store/hooks";
import { useFetchQuote } from "../store/hooks/useFetchQuote";
import { useFetchQuoteDocument } from "../store/hooks/useFetchQuoteDocument";
import { useFetchServiceRequest } from "../store/hooks/useFetchServiceRequest";
import { useFetchServiceRequestComDocActivity } from "../store/hooks/useFetchServiceRequestComDocActivity";
import { useFetchViewProjectDetails } from "../store/hooks/useFetchViewProjectDetails";
import { useFetchViewQuoteDetails } from "../store/hooks/useFetchViewQuoteDetails";
import { useHealthCheckIssues } from "../store/hooks/useHealthCheckIssues";
import { useQuoteDetails } from "../store/hooks/useQuoteDetails";
import { useQuoteTabsOrder } from "../store/hooks/useQuoteTabsOrder";

const INVISIBLE_CLASS = "plans-and-projects-invisible";

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open, drawerWidth }) => ({
    flexGrow: 1,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    marginRight: -drawerWidth,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      }),
      marginRight: 0
    }),
    position: "relative",
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    boxSizing: "border-box"
  })
);

const StViewQuotePageContainer = styled("div")`
  position: relative;
  height: 100%;
`;

const StQuoteDetailsContainer = styled("div")(
  ({ fetchViewQuoteDetailsLoading }) => `
  grid-column: span 12;
  display: ${`${fetchViewQuoteDetailsLoading ? "none" : "block"}`};
  flex: 1;
`
);

const StAttachmentModalContainer = styled("div")`
  --bfs-modal-width: 768px;
`;

const StQuoteDetailsToolBarRight = styled("div")`
  align-items: center;
  display: flex;
  margin-left: auto;
  gap: var(--sp-2xs);
`;

const StGridBorder = styled("div")`
  .k-grid .k-table-td,
  .k-grid .k-table-th,
  .k-grid td {
    border-right-width: 1px;
  }
`;

const StQuoteTasksContent = styled("div")`
  position: relative;
  grid-column: span 12;
  border-radius: var(--rol-border-radius, 8px);
  padding: var(--sp-2xs, 10px) var(--sp-2xl, 20px);
  --bfs-table-row-content-icon-text-color: var(--color-primary, #0077c7);
  --bfs-table-row-content-icon-text-font-weight: var(
    --rol-primary-text-weight,
    bold
  );
  --bfs-table-row-content-styled-string-font-weight: normal;
  --bfs-table-row-content-styled-string-text-color: var(--color-black, #000000);
  --bfs-table-header-background-color: white;
  --bfs-table-row-content-font-weight: var(--font-weight-light, 300);
  --bfs-table-row-content-font-size: var(--sp-xs, 12px);
  --bfs-table-row-content-line-height: var(--sp-lg, 16px);
  --bfs-modal-width: 768px;
  --bfs-ellipses-actions-container: var(--sp-5xs, 5px);
  --bfs-ellipses-options-container: 0;
  --bfs-row-dropdown-border-color: var(--color-contrast-low, #dedede);
  --bfs-row-dropdown-color: var(--color-black, #000000);

  div > table > tbody > tr.stServiceRequestRows {
    border: var(--sp-9xs, 1px) solid var(--color-contrast-low);
    box-shadow: var(--color-contrast-low) 0px var(--sp-8xs, 2px)
      var(--sp-3xs, 8px) 0px;
  }
  tr.stCategoryRows {
    --row-background-color: var(--color-contrast-lower);
    border-left: var(--sp-9xs, 1px) solid var(--color-contrast-low);
    border-right: var(--sp-9xs, 1px) solid var(--color-contrast-low);
  }
`;

const StWorkflowContainer = styled("div")`
  grid-column: span 12;
  --color-yellow: #ffea00;
  .stTagString {
    span {
      background-color: var(--color-black, #000000);
    }
  }
`;

const StNewQuoteButton = styled(BfsIconButton)({
  padding: "10px",
  marginTop: "2px"
});

const StFindQuoteButton = styled(IconButton)({
  padding: "10px",
  marginTop: "2px"
});

const StTabsContainer = styled("div")`
  display: flex;
  flex-direction: row;
  align-items: center;
  .MuiTabs-flexContainer {
    align-items: center;
  }
`;

const ViewQuoteDetails = (props) => {
  const [sendToParadigmModalIsOpen, setSendToParadigmModalIsOpen] =
    useState(false);
  const [inActiveCustomerModalIsOpen, setInActiveCustomerModalIsOpen] =
    useState(false);
  const [inActiveShipToModalIsOpen, setInActiveShipToModalIsOpen] =
    useState(false);
  const [quotePublishData, setQuotePublishData] = useState({
    isPublished: false,
    datePublished: "",
    publishedByUserId: 0,
    publishLevelDetailId: 1,
    publishUntilDate: "",
    publishedByWorkflowUserId: null,
    publishedByEmailAddress: ""
  });

  const [selectedElevation, setSelectedElevationValue] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);

  const [quoteDeleteErrorModalIsOpen, setQuoteDeleteErrorModalIsOpen] =
    useState(false);
  const [quoteDeleteError, setQuoteDeleteError] = useState("");

  const [itemCostErrorModalIsOpen, setItemCostErrorModalIsOpen] =
    useState(false);

  const [selectedGridView, setSelectedGridView] = useState(
    COLUMN_VIEWS.compactView
  );

  const [editPublishModalIsOpen, setEditPublishModalIsOpen] = useState(false);
  const [costModalError, setCostModalError] = useState("");
  const [userFilterData, setUserFilterData] = useState({
    filterType: COLUMN_VIEWS.compactView,
    filters: []
  });
  const [isHealthCheckWarningBannerOpen, setIsHealthCheckWarningBannerOpen] =
    useState(true);
  const [isHealthCheckErrorBannerOpen, setIsHealthCheckErrorBannerOpen] =
    useState(true);
  const [
    isLinkedERPQuoteInfoBannerShowing,
    setIsLinkedERPQuoteInfoBannerShowing
  ] = useState(true);
  const [preventDefaultComDocOpen, setPreventDefaultComDocOpen] =
    useState(false);
  const [
    openDeleteQuoteCategoryWithMesModal,
    setOpenDeleteQuoteCategoryWithMesModal
  ] = useState(false);

  const [downloadquoteModalOpen, setDownloadQuoteModalOpen] = useState(false);
  const [exportNotes, setExportNotes] = useState("");
  const [fileEditModalIsOpen, setFileEditModalIsOpen] = useState(false);
  const [fileDeleteModalIsOpen, setFileDeleteModalIsOpen] = useState(false);
  const [fileDeleteModalBtnLoading, setFileDeleteModalBtnLoading] =
    useState(false);
  const [fileErrorMessage, setFileErrorMessage] = useState("");
  const [fileAttachment, setFileAttachment] = useState({});
  const [deleteFileServiceRequestId, setDeleteFileServiceRequestId] =
    useState(null);
  const [bfsErrorModalContent, setBfsErrorModalContent] = useState("");
  const {
    pricingAsOfDate,
    setPricingAsOfDate,
    costType,
    selectedQuoteId,
    selectedQuoteData,
    setSelectedQuoteId,
    uniqueQuotePacks,
    setIsVersionDrawerOpen,
    isVersionDrawerOpen,
    drawerWidth,
    isSpecSheetFlyOutOpen
  } = useQuoteDetails();
  const { isQuoteMissingLocationCode } = useHealthCheckIssues();
  const [isInFullScreenMode, toggleIsInFullScreenMode] = useToggle(false);

  const [serviceRequestCategories, setServiceRequestCategories] = useState([]);
  const [selectedLineItems, setSelectedLineItems] = useState([]);
  const [focusedLineItemId, setFocusedLineItemId] = useState(null);

  const [manageColumnsHeight, setManageColumnsHeight] = useState("450px");
  const gridContainerRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const serviceRequestId =
    props.serviceRequestId || searchParams.get("serviceRequestId");
  const customerNumber = searchParams.get("customerNumber");
  const eventTracker = useGAEvents("Quote Details");
  const { basePathname: basePath } = useSelector(
    (state) => state.env,
    shallowEqual
  );

  const plansDetailsClickHandler = (plan) => {
    window.open(
      `${basePath}/plans-projects/plans-details/${plan?.planId || plan}`,
      "_blank"
    );
  };

  const communityDetailsClickHandler = (community) => {
    window.open(
      `${basePath}/plans-projects/community-details/${
        community?.communityId || community
      }`,
      "_blank"
    );
  };

  const autoFetch = false;

  const {
    userData,
    viewQuoteDetailsData,
    fetchViewQuoteDetailsLoading,
    fetchViewQuoteDetailsError,
    fetchData,
    fetchSummaryDetails,
    updatePackPublish,
    fetchParadigmUpdateStatus,
    rebuildOptionsList,
    rebuildDetailList,
    detailedQuoteData,
    groupedDetailedQuoteDataLoading,
    requestGroupedDetailsData,
    groupedDetailedQuoteData,
    loadGridCustomFilters,
    loadGroupGridCustomFilters,
    requestWorkflowUserSettings,
    loadSelectedView,
    requestCategoryOptionsData,
    categoryOptions,
    fetchQuoteLookupInfo,
    isSuccessFulSuppression,
    clearQuoteDetailsState,
    isProcessingMuiEdit,
    requestReasonCodeOptions
  } = useFetchViewQuoteDetails({
    serviceRequestId,
    plansDetailsClickHandler,
    communityDetailsClickHandler,
    pricingAsOfDate,
    autoFetch
  });

  const fetchParadigmUpdate = () => {
    const paradigmUpdateStatusResponsePromise = fetchParadigmUpdateStatus();
    paradigmUpdateStatusResponsePromise.then(async () => {
      await fetchData(true);
      fetchOnDetailsTabClick();
    });
    return paradigmUpdateStatusResponsePromise;
  };

  const { fileDownload, fileDownloadAsBlob } = useFileDownload(customerNumber);

  const downloadFileHandler = (file) => {
    fileDownload(file);
  };

  const downloadFileHandlerAsBlob = (file) => {
    fileDownloadAsBlob(file);
  };

  const { fetchQuoteDocument } = useFetchQuoteDocument({
    serviceRequestId,
    customerNumber,
    downloadFileHandler,
    autoFetch
  });

  const {
    comDocFilesData,
    requestDeleteComDocFiles,
    fetchComDocFiles,
    requestUpdateFileAttachment
  } = useFetchComDocFiles();

  const projectId = useSelector(
    (state) => state.viewQuoteDetails?.data?.headerDetails?.projectId
  );

  const shouldOpenQuoteTasksAndComments =
    searchParams.get("openQuoteTasksAndComments") === "true" &&
    userData.isSales &&
    projectId;

  const { fetchServiceRequestLoading } = useFetchServiceRequest();

  const { quoteAttachmentTypesData } = useFetchQuoteAttachmentTypes({
    autoFetch,
    customerNumber
  });

  const {
    fetchServiceRequestComDocActivity,
    serviceRequestComDocActivityData,
    fetchServiceRequestComDocActivityLoading,
    fetchServiceRequestFollowers,
    addComment,
    updateComment
  } = useFetchServiceRequestComDocActivity();

  const { downloadQuote, downloadQuoteV2 } = useFetchQuote(
    selectedQuoteId,
    customerNumber,
    autoFetch
  );

  const { quoteDataList } = useMemo(
    () =>
      getPopulatedQuoteData({
        groupedDetailedQuoteData
      }),
    [groupedDetailedQuoteData]
  );

  const unconfirmedAlternates = useMemo(
    () => getAllUnconfirmedAlternates(quoteDataList),
    [quoteDataList]
  );

  const showDownloadQuoteButtonInCustomerSummary =
    !userData.isSales ||
    viewQuoteDetailsData?.headerDetails?.quotes?.some(
      (quote) => quote.hasElevationsOrOptionsWithData
    );

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
      entityId: fileItem?.entityId,
      serviceRequestComponentId: fileItem.serviceRequestComponentId
        ? fileItem.serviceRequestComponentId
        : null,
      quotePackId: fileItem?.quotePackId ? fileItem.quotePackId : null,
      projectId: fileItem?.projectId ?? null,
      quoteId: fileItem?.quoteId ?? null,
      dataCoreFolderType: fileItem?.dataCoreFolderType,
      serviceRequestId
    });
  };

  const onEditFileMenuClick = (
    serviceRequestCategoryTagList,
    attachmentItem
  ) => {
    fileAttachmentFormatter(attachmentItem);
    setServiceRequestCategories(serviceRequestCategoryTagList);
    setFileEditModalIsOpen(true);
  };

  const onCloseFileEditModal = () => {
    setFileEditModalIsOpen(false);
    setFileDeleteModalBtnLoading(false);
    setFileErrorMessage("");
  };

  const updateFileAttachmentData = (fileAttachmentData) => {
    setFileAttachment(fileAttachmentData);
  };

  const { fetchData: refetchProjectDetailsData } = useFetchViewProjectDetails(
    projectId,
    null,
    null,
    null,
    false
  );

  const { projectLookupInfoData, fetchProjectLookupInfoData } =
    useFetchProjectLookupInfo(false);

  const refetchDocumentsList = () => {
    fetchQuoteDocument();
    if (projectId) {
      refetchProjectDetailsData();
    }
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
      attachmentSourceId: getDocumentEntityId(editingFileAttachment),
      attachmentSource: getDocumentAttachmentSource(editingFileAttachment),
      serviceRequestComponentId: fileAttachment.serviceRequestComponentId,
      dataCoreFileId: fileAttachment?.dataCoreFileId,
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
      refetchDocumentsList();
      fetchComDocFiles(serviceRequestId);
      fetchServiceRequestComDocActivity(serviceRequestId);
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
      fetchComDocFiles(deleteFileServiceRequestId);
      fetchServiceRequestComDocActivity(serviceRequestId);
      setDeleteFileServiceRequestId(null);
    } else if (deleteFileAttachment.payload.title === "Error") {
      setFileErrorMessage(deleteFileAttachment.payload.message);
    }
    setFileDeleteModalBtnLoading(false);
  };

  const onCloseFileDeleteModal = () => {
    setFileDeleteModalIsOpen(false);
    setDeleteFileServiceRequestId(null);
    setFileDeleteModalBtnLoading(false);
    setFileErrorMessage("");
  };

  const onDeleteFileMenuClick = (file, deleteAttachServiceRequestId) => {
    setFileDeleteModalIsOpen(true);
    setDeleteFileServiceRequestId(deleteAttachServiceRequestId);
    fileAttachmentFormatter(file);
  };

  const onPricingAsOfDateChange = useCallback(
    (date) => {
      date = date?.format("MM/DD/YYYY") || null;
      if (date && moment(date).isValid()) {
        setPricingAsOfDate(date);
      }
    },
    [setPricingAsOfDate]
  );

  const updateDropdownOnLoad = (value) => {
    setSelectedGridView(value);
    loadSelectedView(value);
  };

  const onDetailsTabDateChange = useCallback(
    (date) => {
      date = date ? moment(date).format("MM/DD/YYYY") : null;
      if (date && moment(date).isValid()) {
        setPricingAsOfDate(date);
        if (selectedQuoteId !== 0) {
          requestGroupedDetailsData(selectedQuoteId, costType, date);
        }
      }
    },
    [setPricingAsOfDate, requestGroupedDetailsData]
  );

  const fetchDetailsData = async (
    { costTypeValue } = { costTypeValue: costType }
  ) => {
    if (
      selectedQuoteData?.locationCode &&
      (!categoryOptions || !categoryOptions.length)
    ) {
      await requestCategoryOptionsData(selectedQuoteId);
    }

    if (selectedQuoteId) {
      await requestGroupedDetailsData(selectedQuoteId, costTypeValue);
    }
  };

  useEffect(() => {
    if (
      viewQuoteDetailsData &&
      viewQuoteDetailsData?.headerDetails !== null &&
      selectedQuoteId === 0
    ) {
      setSelectedElevationValue(
        viewQuoteDetailsData?.elevationList?.[0]?.elevationName
      );
      if (selectedQuoteData?.pricingMethodId === PRICING_METHOD_IDS.manual) {
        onDetailsTabDateChange(
          convertDateTimeOffSetToUSDate(selectedQuoteData?.pricingAsOfDate)
        );
      }
      fetchDetailsData();
    }
  }, [
    viewQuoteDetailsData,
    selectedQuoteId,
    userData,
    detailedQuoteData,
    groupedDetailedQuoteData,
    onDetailsTabDateChange
  ]);

  useEffect(() => {
    if (viewQuoteDetailsData && viewQuoteDetailsData?.headerDetails !== null) {
      setQuotePublishData({
        isPublished: selectedQuoteData?.isPublished,
        datePublished: selectedQuoteData?.datePublished
          ? convertDateTimeOffSetToUSDate(selectedQuoteData?.datePublished)
          : "",
        publishLevelDetailId: selectedQuoteData?.publishLevelDetailId,
        publishUntilDate: selectedQuoteData?.expirationDate
          ? convertDateTimeOffSetToUSDate(selectedQuoteData?.expirationDate)
          : "",
        publishedByWorkflowUserId: userData.workflowUserId || null,
        publishedByEmailAddress: userData.email || ""
      });
      setInActiveCustomerModalIsOpen(
        viewQuoteDetailsData?.headerDetails?.inActiveCustomer
      );
      setInActiveShipToModalIsOpen(
        viewQuoteDetailsData?.headerDetails?.inActiveShipToAccount
      );
      setExportNotes(selectedQuoteData?.exportNotes);
    }
  }, [viewQuoteDetailsData, selectedQuoteData, userData]);

  useEffect(() => {
    if (
      viewQuoteDetailsData &&
      viewQuoteDetailsData?.headerDetails !== null &&
      !!!groupedDetailedQuoteData
    ) {
      async function fetchAllQuoteDetails() {
        for (const quoteId of viewQuoteDetailsData?.headerDetails?.quoteIds) {
          requestGroupedDetailsData(
            quoteId,
            costType,
            pricingAsOfDate,
            [],
            true
          );
        }
      }

      fetchAllQuoteDetails();
    }
  }, [viewQuoteDetailsData?.headerDetails]);

  const fetchQuoteLookupInfoAsync = async () => {
    await fetchQuoteLookupInfo();
  };

  useEffect(() => {
    if (!projectLookupInfoData) {
      fetchProjectLookupInfoData();
    }
    fetchQuoteLookupInfoAsync();
    requestReasonCodeOptions();
  }, []);

  const fetchServiceRequestData = async (fetchSilently = false) => {
    if (userData.isSales) {
      return await fetchData(fetchSilently);
    }

    return await fetchData(fetchSilently, true);
  };

  useEffect(() => {
    fetchServiceRequestData().then((serviceRequestData) => {
      if (serviceRequestData?.headerDetails?.quotes) {
        if (searchParams.get("openTasksTab") === "true") {
          return;
        }

        const quoteIdToDisplay = searchParams.get("quoteId");

        const quoteWithMatchingQuoteId =
          serviceRequestData.headerDetails.quotes.find(
            (quote) => `${quote.quoteId}` === quoteIdToDisplay
          );

        const doesAtLeastOneQuoteHaveDetails =
          serviceRequestData.headerDetails.quotes.some(
            (quote) => quote.hasQuoteDetails
          );

        const previouslySelectedQuoteName = localStorage.getItem(
          BROWSER_STORAGE_KEYS.previouslySelectedQuoteName
        );

        if (
          (!doesAtLeastOneQuoteHaveDetails || !previouslySelectedQuoteName) &&
          !quoteIdToDisplay
        ) {
          return;
        }

        const quoteWithMatchingQuoteNameOrId =
          quoteWithMatchingQuoteId ??
          serviceRequestData.headerDetails.quotes.find(
            (quote) =>
              quote.quoteName.toLowerCase() ===
              previouslySelectedQuoteName?.toLowerCase()
          );

        if (!quoteWithMatchingQuoteNameOrId) {
          return;
        }

        setTabSelection(`quote-${quoteWithMatchingQuoteNameOrId.quoteId}`);
        setSelectedQuoteId(quoteWithMatchingQuoteNameOrId.quoteId);
      }
    });

    requestWorkflowUserSettings(
      "ViewQuoteDetails",
      "%7B%22filterType%22%3A%22Compact%20View%22%2C%22filters%22%3A%5B%5D%7D"
    ).then((res) => {
      const result = JSON.parse(res);
      updateDropdownOnLoad(result.filterType);
      loadGridCustomFilters(result.filters);
      loadGroupGridCustomFilters(result.filters);
      setUserFilterData(result);
    });

    const viewQuoteRequestPage = document.getElementById(
      "viewQuoteRequestPage"
    );
    if (viewQuoteRequestPage) {
      document.body.scrollTop = 0;
      viewQuoteRequestPage.parentElement.parentElement.scrollTop = 0;
    }
  }, []);

  useEffect(() => {
    sendPostMessageToMybldr({ status: "ready" });
  }, []);

  useEffect(() => {
    if (selectedQuoteId && selectedQuoteId !== 0) {
      datadogLogs.setGlobalContextProperty(
        DataDogCustomAttributes.quoteId,
        selectedQuoteId
      );
      datadogRum.setGlobalContextProperty(
        DataDogCustomAttributes.quoteId,
        selectedQuoteId
      );
    }
  }, [selectedQuoteId]);

  useEffect(() => {
    isSuccessFulSuppression && fetchOnDetailsTabClick();
  }, [isSuccessFulSuppression]);

  const excludeStockMargin = useMemo(
    () => !shouldShowCostInfo(viewQuoteDetailsData),
    [viewQuoteDetailsData]
  );

  const { quoteMarginValue, extendedCostTotal } = useMemo(() => {
    const { quoteDataList } = getPopulatedQuoteData({
      groupedDetailedQuoteData
    });

    if (excludeStockMargin || !quoteDataList) {
      return 0;
    }

    const { marginDisplayValue, extendedCostTotal } =
      packTotalAndMarginReducer(quoteDataList);

    return { quoteMarginValue: marginDisplayValue, extendedCostTotal };
  }, [groupedDetailedQuoteData, excludeStockMargin]);

  const [showPublishConfetti, setShowPublishConfetti] = useState(false);
  const [tabSelection, setTabSelection] = useState(
    userData.isSales
      ? QUOTE_EDITOR_TABS.tasks
      : QUOTE_EDITOR_TABS.masterSetQuote
  );
  const [isShowingNewQuoteModal, setIsShowingNewQuoteModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [quoteVersionIdForCopy, setQuoteVersionIdForCopy] = useState(null);

  if (fetchViewQuoteDetailsError) {
    throw new Error(fetchViewQuoteDetailsError);
  }

  const closeInActiveCustomerModalHandler = () => {
    setInActiveCustomerModalIsOpen(false);
  };

  const closeInActiveShipToModalHandler = () => {
    setInActiveShipToModalIsOpen(false);
  };

  const getPackPublishIds = (packsToPublish) =>
    packsToPublish
      ?.filter((item) => item?.quotePackIsPublished)
      .map((item) => item?.quotePackId);

  const [isPublishInProgress, setIsPublishInProgress] = useState(false);

  const isShowingQuoteTab = tabSelection.startsWith("quote");

  const quotePublishHandler = async (publishPriceQuoteId, payload) => {
    setIsPublishInProgress(true);
    const updateQuotePublishData = await updatePackPublish(
      publishPriceQuoteId,
      payload
    );
    setIsPublishInProgress(false);
    const publishedQuotePackIds = getPackPublishIds(payload.quotePackList);
    if (updateQuotePublishData?.payload?.title === "Success") {
      if (publishedQuotePackIds.length === payload.quotePackList.length) {
        setShowPublishConfetti(true);
      }
      eventTracker("Publish Quote", "Button");

      setQuotePublishData((currentState) => ({
        ...currentState,
        ...(currentState?.datePublished === "" &&
          Boolean(publishedQuotePackIds.length > 0) && {
            datePublished: dateToUSDate(new Date())
          }),
        ...(currentState?.datePublished !== "" &&
          Boolean(publishedQuotePackIds.length === 0) && {
            datePublished: ""
          }),
        isPublished: Boolean(publishedQuotePackIds.length > 0)
      }));
    }
  };

  const publishModalOpenHandler = async () => {
    setEditPublishModalIsOpen(true);
    if (selectedQuoteId) {
      requestGroupedDetailsData(selectedQuoteId, costType);
    }
  };

  const changeElevationHandler = (value) => {
    setSelectedElevationValue(value);
    setSelectedOptions([]);
    rebuildOptionsList(value);
    rebuildDetailList(value, []);
  };

  const changeOptionHandler = (name, value) => {
    if (value) {
      setSelectedOptions([...selectedOptions, name]);
      rebuildDetailList(selectedElevation, [...selectedOptions, name]);
    } else {
      setSelectedOptions(selectedOptions.filter((option) => option !== name));
      rebuildDetailList(
        selectedElevation,
        selectedOptions.filter((option) => option !== name)
      );
    }
  };

  const changeAllOptionHandler = (name, value) => {
    if (value) {
      setSelectedOptions([...selectedOptions, ...name]);
      rebuildDetailList(selectedElevation, [...selectedOptions, ...name]);
    } else {
      setSelectedOptions([]);
      rebuildDetailList(selectedElevation, []);
    }
  };

  const openSendToParadigmModal = async () => {
    fetchData(true);
    setSendToParadigmModalIsOpen(true);
  };

  const closeSendParadigmModalHandler = () => {
    fetchData(true);
    setSendToParadigmModalIsOpen(false);
  };

  const closeQuoteDeleteErrorModalHandler = () => {
    setQuoteDeleteErrorModalIsOpen(false);
    setQuoteDeleteError("");
  };

  const [isFetchingCurrentVersion, setIsFetchingCurrentVersion] =
    useState(false);

  const fetchOnDetailsTabClick = (
    { quoteIdToRequest, silentRefresh } = {
      quoteIdToRequest: selectedQuoteId,
      silentRefresh: true
    }
  ) => {
    setTimeout(async () => {
      if (quoteIdToRequest) {
        setIsFetchingCurrentVersion(true);
        await requestGroupedDetailsData(
          quoteIdToRequest,
          costType,
          pricingAsOfDate,
          [],
          silentRefresh
        );
        setIsFetchingCurrentVersion(false);
      }
    });
  };

  const closeItemCostModalHandler = () => {
    setItemCostErrorModalIsOpen(false);
    setCostModalError("");
  };

  const closeEditPublishModalHandler = () => {
    // This is required to ensure the Master Set Quote (when used)
    // has the latest information on which packs have been published.
    fetchServiceRequestData(true);

    if (selectedQuoteId) {
      requestGroupedDetailsData(selectedQuoteId, costType);
    }
    if (projectId) {
      fetchData(true);
    }

    setEditPublishModalIsOpen(false);
  };

  const deleteQuoteCategoryWithMesModalCloseHandler = () => {
    setOpenDeleteQuoteCategoryWithMesModal(false);
  };

  const openDownloadModalHandler = () => {
    setDownloadQuoteModalOpen(true);
  };

  const downloadQuoteTitle = useMemo(() => {
    const selectedQuoteDetails =
      viewQuoteDetailsData?.headerDetails?.quotes?.find(
        (quote) => quote.quoteId === selectedQuoteId
      );
    return `${viewQuoteDetailsData?.headerDetails.title}_${
      selectedQuoteDetails?.quoteName ||
      `Quote ${selectedQuoteDetails?.quoteId}`
    }`;
  }, [selectedQuoteId, viewQuoteDetailsData]);

  const closeDownloadModalHandler = () => {
    setDownloadQuoteModalOpen(false);
  };

  const onSuccessfulQuoteDownload = (notes) => {
    setExportNotes(notes);
  };

  const bfsErrorModalCloseHandler = () => {
    setBfsErrorModalContent("");
  };

  const onTabClick = (_ev, newValue) => {
    setPreventDefaultComDocOpen(true);
    if (newValue.startsWith("quote")) {
      const newQuoteIdSelection = parseInt(newValue.replace("quote-", ""));
      const matchingQuote = viewQuoteDetailsData.headerDetails.quotes.find(
        (quote) => quote.quoteId === newQuoteIdSelection
      );

      if (matchingQuote) {
        localStorage.setItem(
          BROWSER_STORAGE_KEYS.previouslySelectedQuoteName,
          matchingQuote.quoteName
        );
      }

      setSelectedQuoteId(newQuoteIdSelection);
      setSelectedLineItems([]);
      fetchOnDetailsTabClick({
        quoteIdToRequest: newQuoteIdSelection,
        silentRefresh: true
      });
    }

    // Clear the focused line item when switching tabs since it won't exist in other tabs
    setFocusedLineItemId(null);
    setTabSelection(newValue);
    // reset the quoteId from url
    setSearchParams((prevParams) => {
      prevParams.delete("quoteId");
      prevParams.delete("openTasksTab");
      return prevParams;
    });
  };

  useEffect(() => {
    setTimeout(() => {
      if (gridContainerRef.current) {
        const gridElDistancetoTop =
          window.scrollY + gridContainerRef.current.getBoundingClientRect().top;

        gridContainerRef.current.style.height = `calc(100vh - ${
          gridElDistancetoTop + 30
        }px)`;

        setManageColumnsHeight(`calc(100vh - ${gridElDistancetoTop + 150}px)`);
      }
    }, 50);
  });

  useEffect(() => {
    const moduleFederationWrapperElement = document.getElementById(
      "module-federation-wrapper"
    );

    if (moduleFederationWrapperElement) {
      moduleFederationWrapperElement.style.overflowY = isShowingQuoteTab
        ? "hidden"
        : "auto";
    }
  }, [isShowingQuoteTab]);

  useEffect(() => {
    const quoteEditorContainer = document.getElementById(
      "viewQuoteRequestPages"
    )?.parentElement;
    const moduleFederationWrapper = document.getElementById(
      "module-federation-wrapper"
    );

    if (quoteEditorContainer) {
      if (isInFullScreenMode) {
        quoteEditorContainer.style.marginTop = 0;
        quoteEditorContainer.style.zIndex = 100;
      } else {
        quoteEditorContainer.style.marginTop = "";
        quoteEditorContainer.style.zIndex = "";
      }
    }

    if (moduleFederationWrapper) {
      moduleFederationWrapper.style.marginTop = isInFullScreenMode
        ? "-60px"
        : "";
    }

    return () => {
      const quoteEditorContainer = document.getElementById(
        "viewQuoteRequestPage"
      )?.parentElement;

      if (quoteEditorContainer) {
        quoteEditorContainer.style.marginTop = "";
        quoteEditorContainer.style.zIndex = "";
      }
    };
  }, [isInFullScreenMode]);

  useEffect(() => {
    return () => {
      clearQuoteDetailsState();
      datadogLogs.removeGlobalContextProperty(DataDogCustomAttributes.quoteId);
      datadogRum.removeGlobalContextProperty(DataDogCustomAttributes.quoteId);
    };
  }, []);

  const {
    setTabs,
    hideSelectedQuoteTabIndicator,
    onDragEnd,
    onDragStart,
    tabs
  } = useQuoteTabsOrder(serviceRequestId, onTabClick);

  useEffect(() => {
    const quoteTabs =
      (userData.isSales &&
        viewQuoteDetailsData?.headerDetails?.quotes
          .sort((x, y) => x.quoteSortOrder - y.quoteSortOrder)
          .map((quote) => ({
            id: quote.quoteId,
            label: quote.quoteName || `Quote ${quote.quoteId}`,
            value: `quote-${quote.quoteId}`,
            isLinkedQuote: quote.isLinkedQuote,
            quoteData: quote
          }))) ||
      [];
    setTabs([...(quoteTabs.length ? quoteTabs : [])]);
  }, [setTabs, userData.isSales, viewQuoteDetailsData?.headerDetails?.quotes]);

  const totalQuotePacks = useMemo(
    () =>
      viewQuoteDetailsData?.headerDetails?.quotes?.flatMap((item) => [
        ...(item?.quotePacks || [])
      ]).length || 0,
    [viewQuoteDetailsData?.headerDetails?.quotes]
  );

  const resetElevationAndOptions = () => {
    setSelectedElevationValue("");
    setSelectedOptions([]);
  };

  const handleDrawerOpen = () => {
    setIsVersionDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsVersionDrawerOpen(false);
    fetchOnDetailsTabClick({
      quoteIdToRequest: selectedQuoteId,
      silentRefresh: true
    });
  };

  const openNewQuoteModal = (quoteVersionId) => {
    setQuoteVersionIdForCopy(quoteVersionId);
    setIsShowingNewQuoteModal(true);
  };

  const newQuoteModalSaveHandler = async () => {
    setQuoteVersionIdForCopy(null);
    await fetchServiceRequestData(true);
  };

  const dispatch = useDispatch();

  const newQuoteModalCloseHandler = () => {
    dispatch(resetConsolidatedQuotesState());
    setQuoteVersionIdForCopy(null);
    setIsShowingNewQuoteModal(false);
  };

  return (
    <StViewQuotePageContainer id="viewQuoteRequestPage">
      <Box sx={{ display: "flex", height: "100%" }}>
        <Main open={isVersionDrawerOpen} drawerWidth={drawerWidth}>
          <>
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
            {fetchViewQuoteDetailsLoading && (
              <Box
                sx={{
                  display: "flex",
                  height: "100px",
                  padding: "10px",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <MuiLoader size={LOADER_SIZE.large} />
              </Box>
            )}
            <div className={isProcessingMuiEdit ? PREVENT_CLICKS_CLASS : ""}>
              {!fetchViewQuoteDetailsLoading && (
                <QuoteActionRow
                  className={isInFullScreenMode ? INVISIBLE_CLASS : undefined}
                  isUserSales={userData.isSales}
                  showParadigmEstimate={!groupedDetailedQuoteDataLoading}
                  viewQuoteDetailsData={viewQuoteDetailsData}
                  publishLabel={"Manage Publishing"}
                  publishBtnDisabled={
                    totalQuotePacks === 0 || isQuoteMissingLocationCode
                  }
                  publishModalOpenHandler={publishModalOpenHandler}
                  openParadigmModal={openSendToParadigmModal}
                  fetchParadigmUpdate={fetchParadigmUpdate}
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
                  fetchDownloadFiles={downloadFileHandler}
                  fetchDownloadFilesAsBlob={downloadFileHandlerAsBlob}
                  onDeleteFileMenuClick={onDeleteFileMenuClick}
                  onEditFileMenuClick={onEditFileMenuClick}
                />
              )}
              {sendToParadigmModalIsOpen && (
                <TabContent>
                  <SendToParadigmModal
                    isOpen={sendToParadigmModalIsOpen}
                    onClose={closeSendParadigmModalHandler}
                    serviceRequestId={serviceRequestId}
                  />
                </TabContent>
              )}
              {downloadquoteModalOpen && (
                <DownloadQuoteModal
                  openModal={downloadquoteModalOpen}
                  close={closeDownloadModalHandler}
                  quoteTitle={downloadQuoteTitle}
                  userData={userData}
                  downloadQuote={downloadQuote}
                  downloadQuoteV2={downloadQuoteV2}
                  exportNotes={exportNotes}
                  onSuccessfulQuoteDownload={onSuccessfulQuoteDownload}
                  hasOptions={Boolean(
                    selectedQuoteData?.hasElevationsOrOptionsWithData
                  )}
                  selectedElevation={
                    selectedElevation || viewQuoteDetailsData?.selectedElevation
                  }
                  selectedOptions={selectedOptions}
                  publishLevelDetailId={selectedQuoteData?.publishLevelDetailId}
                  priceAsOfDate={
                    pricingAsOfDate ? pricingAsOfDate : dateToUSDate(moment())
                  }
                  publishedPacksCount={
                    groupedDetailedQuoteData
                      ?.map(
                        (packGroup) =>
                          packGroup?.quotePack?.quotePackIsPublished
                      )
                      .filter(Boolean).length
                  }
                  totalPacksCount={groupedDetailedQuoteData?.length}
                  packList={uniqueQuotePacks}
                  hasEstimatorNotes={groupedDetailedQuoteData?.some(
                    (groupData) =>
                      groupData.quoteDetails?.dataList?.some(
                        (detail) => detail.estimatorNotes
                      )
                  )}
                />
              )}
              {bfsErrorModalContent && (
                <BFSErrorModal
                  isOpen={!!bfsErrorModalContent}
                  onClose={bfsErrorModalCloseHandler}
                  content={bfsErrorModalContent}
                />
              )}
              {quoteDeleteErrorModalIsOpen && (
                <DeleteErrorModal
                  isOpen={quoteDeleteErrorModalIsOpen}
                  onClose={closeQuoteDeleteErrorModalHandler}
                  errorTitle="Delete Quote Error"
                  errorMessage={quoteDeleteError}
                />
              )}
              {openDeleteQuoteCategoryWithMesModal && (
                <DeleteQuoteCategoryWithMesModal
                  closeModalHandler={
                    deleteQuoteCategoryWithMesModalCloseHandler
                  }
                  btn1Handler={deleteQuoteCategoryWithMesModalCloseHandler}
                />
              )}
              {itemCostErrorModalIsOpen && (
                <DeleteErrorModal
                  isOpen={itemCostErrorModalIsOpen}
                  onClose={closeItemCostModalHandler}
                  errorTitle="Error / Warning"
                  errorMessage={costModalError}
                />
              )}
              {editPublishModalIsOpen && (
                <EditPublishModal
                  isOpen
                  onClose={closeEditPublishModalHandler}
                  title="MANAGE PUBLISHING"
                  subTitle={cp.edit_publish_note_message}
                  savePublishHandler={quotePublishHandler}
                  isPublishInProgress={isPublishInProgress}
                  fetchServiceRequestData={fetchServiceRequestData}
                />
              )}
              {isShowingNewQuoteModal && (
                <NewQuoteModal
                  projectId={projectId}
                  serviceRequestId={serviceRequestId}
                  onSave={newQuoteModalSaveHandler}
                  onClose={newQuoteModalCloseHandler}
                  quoteVersionId={quoteVersionIdForCopy}
                  switchToTab={onTabClick}
                />
              )}
              {inActiveCustomerModalIsOpen && (
                <InactiveCustomerModal
                  isOpen={inActiveCustomerModalIsOpen}
                  onClose={closeInActiveCustomerModalHandler}
                />
              )}
              {inActiveShipToModalIsOpen && (
                <InactiveShipToModal
                  isOpen={inActiveShipToModalIsOpen}
                  onClose={closeInActiveShipToModalHandler}
                />
              )}
              <StAttachmentModalContainer>
                <FileDeleteModal
                  isModalOpen={fileDeleteModalIsOpen}
                  onClose={onCloseFileDeleteModal}
                  deleteHandler={onDeleteFileHandler}
                  modalBtnLoading={fileDeleteModalBtnLoading}
                  errorMessage={fileErrorMessage}
                />
              </StAttachmentModalContainer>{" "}
              <StAttachmentModalContainer>
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
                  isEmployee={userData.isSales}
                  serviceRequestCategories={serviceRequestCategories}
                  showCategories={!fileAttachment.projectId}
                  folderOptions={getFileUploadFolderOptions(
                    viewQuoteDetailsData?.headerDetails
                  )}
                />
              </StAttachmentModalContainer>
            </div>
            <StQuoteDetailsContainer
              fetchViewQuoteDetailsLoading={fetchViewQuoteDetailsLoading}
            >
              <StTabsContainer>
                <Tabs
                  value={
                    Object.values(QUOTE_EDITOR_TABS).includes(tabSelection)
                      ? tabSelection
                      : false
                  }
                  className={isProcessingMuiEdit ? PREVENT_CLICKS_CLASS : ""}
                  onChange={onTabClick}
                  variant="scrollable"
                  allowScrollButtonsMobile
                  scrollButtons="auto"
                >
                  {userData.isSales && (
                    <Tab
                      label="Tasks"
                      value={QUOTE_EDITOR_TABS.tasks}
                      disabled={isVersionDrawerOpen || isSpecSheetFlyOutOpen}
                    />
                  )}

                  {showDownloadQuoteButtonInCustomerSummary && (
                    <Tab
                      label="Master Set Quote"
                      value={QUOTE_EDITOR_TABS.masterSetQuote}
                      disabled={isVersionDrawerOpen || isSpecSheetFlyOutOpen}
                    />
                  )}

                  <DraggableTabsList
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    tabs={tabs}
                    className={isProcessingMuiEdit ? PREVENT_CLICKS_CLASS : ""}
                    tabSelection={tabSelection}
                    onChange={onTabClick}
                    hideSelectedQuoteTabIndicator={
                      hideSelectedQuoteTabIndicator
                    }
                    handleDrawerOpen={handleDrawerOpen}
                    fetchServiceRequestData={fetchServiceRequestData}
                  />
                </Tabs>
                {tabs && tabs.length > 1 && (
                  <div>
                    <StFindQuoteButton
                      onClick={(event) => {
                        setAnchorEl(event.currentTarget);
                      }}
                    >
                      <Tooltip title="Find a Quote" placement="top">
                        <Icon path={mdiTabSearch} size={0.8} />
                      </Tooltip>
                    </StFindQuoteButton>
                    <QuoteDialogDropdown
                      anchorEl={anchorEl}
                      open={!!anchorEl}
                      onClose={() => setAnchorEl(null)}
                      tabs={tabs}
                      onSelectItem={(quote) => {
                        onTabClick(null, quote.value);
                      }}
                      selectedQuoteId={selectedQuoteId}
                    />
                  </div>
                )}
                {userData.isSales && (
                  <Tooltip title="Add Quote" placement="top">
                    <span>
                      <StNewQuoteButton
                        mode="no-bg"
                        onClick={() => setIsShowingNewQuoteModal(true)}
                        disabled={
                          fetchViewQuoteDetailsLoading ||
                          isVersionDrawerOpen ||
                          isSpecSheetFlyOutOpen
                        }
                      >
                        <Icon path={mdiPlus} size={0.8} />
                      </StNewQuoteButton>
                    </span>
                  </Tooltip>
                )}
              </StTabsContainer>

              {tabSelection === QUOTE_EDITOR_TABS.tasks && (
                <TabContent>
                  {Boolean(viewQuoteDetailsData?.headerDetails) && (
                    <>
                      {!fetchServiceRequestLoading && (
                        <TabButtonContainer>
                          <StQuoteDetailsToolBarRight>
                            <ExternalLink mode="primary" href="/bfs/bids">
                              Open Quote Dashboard
                            </ExternalLink>
                          </StQuoteDetailsToolBarRight>
                        </TabButtonContainer>
                      )}
                      <StGridBorder>
                        <StWorkflowContainer>
                          <StQuoteTasksContent>
                            <ServiceRequests
                              fetchServiceRequestComDocActivity={
                                fetchServiceRequestComDocActivity
                              }
                              serviceRequestComDocActivityData={
                                serviceRequestComDocActivityData
                              }
                              fetchServiceRequestComDocActivityLoading={
                                fetchServiceRequestComDocActivityLoading
                              }
                              fetchServiceRequestFollowers={
                                fetchServiceRequestFollowers
                              }
                              addComment={addComment}
                              updateComment={updateComment}
                              fetchDownloadFiles={downloadFileHandler}
                              defaultComDocOpen={
                                shouldOpenQuoteTasksAndComments &&
                                !preventDefaultComDocOpen
                              }
                              isQuoteTaskTab
                              takeoffProviderRequestId={
                                viewQuoteDetailsData?.headerDetails
                                  ?.takeoffProviderRequestId
                              }
                              takeoffProviderRequestUrl={
                                viewQuoteDetailsData?.headerDetails
                                  ?.takeoffProviderRequestUrl
                              }
                              takeoffProviderRequestNumber={
                                viewQuoteDetailsData?.headerDetails
                                  ?.takeoffProviderRequestNumber
                              }
                              takeoffProviderRequestStatus={
                                viewQuoteDetailsData?.headerDetails
                                  ?.takeoffProviderRequestStatus
                              }
                              pricingAsOfDate={pricingAsOfDate}
                              serviceRequestId={serviceRequestId}
                              onDeleteFileMenuClick={onDeleteFileMenuClick}
                              onEditFileMenuClick={onEditFileMenuClick}
                              openParadigmModal={openSendToParadigmModal}
                              fetchParadigmUpdate={fetchParadigmUpdate}
                              setBfsErrorModalContent={setBfsErrorModalContent}
                              viewQuoteDetailsData={viewQuoteDetailsData}
                              statusListDropdownData={
                                projectLookupInfoData?.statusListDropdownData
                              }
                              projectTypeDropdownData={
                                projectLookupInfoData?.projectTypeDropdownData
                              }
                            />
                          </StQuoteTasksContent>
                        </StWorkflowContainer>
                      </StGridBorder>
                    </>
                  )}
                </TabContent>
              )}

              {tabSelection === QUOTE_EDITOR_TABS.masterSetQuote && (
                <TabContent>
                  {viewQuoteDetailsData?.headerDetails ? (
                    <CustomerSummary
                      fetchSummaryDetails={fetchSummaryDetails}
                      userData={userData}
                      viewQuoteDetailsData={viewQuoteDetailsData}
                      onDateChange={onPricingAsOfDateChange}
                      pricingAsOfDate={pricingAsOfDate}
                      changeOptionHandler={changeOptionHandler}
                      changeAllOptionHandler={changeAllOptionHandler}
                      changeElevationHandler={changeElevationHandler}
                      selectedOptions={selectedOptions}
                      selectedElevation={selectedElevation}
                      fetchQuoteDocument={fetchQuoteDocument}
                      openDownloadModalHandler={openDownloadModalHandler}
                      excludeStockMargin={excludeStockMargin}
                      groupedDetailedQuoteData={groupedDetailedQuoteData}
                      resetElevationAndOptions={resetElevationAndOptions}
                    />
                  ) : null}
                </TabContent>
              )}

              {isShowingQuoteTab && (
                <QuoteDetailsTab
                  projectId={projectId}
                  serviceRequestId={serviceRequestId}
                  quotePublishData={quotePublishData}
                  unconfirmedAlternates={unconfirmedAlternates}
                  isInFullScreenMode={isInFullScreenMode}
                  selectedGridView={selectedGridView}
                  userFilterData={userFilterData}
                  excludeStockMargin={excludeStockMargin}
                  showPublishConfetti={showPublishConfetti}
                  isEditPublishModalOpen={editPublishModalIsOpen}
                  quoteMarginValue={quoteMarginValue}
                  extendedCostTotal={extendedCostTotal}
                  gridContainerRef={gridContainerRef}
                  manageColumnsHeight={manageColumnsHeight}
                  fetchOnDetailsTabClick={fetchOnDetailsTabClick}
                  toggleIsInFullScreenMode={toggleIsInFullScreenMode}
                  setSelectedGridView={setSelectedGridView}
                  setUserFilterData={setUserFilterData}
                  setSelectedElevationValue={setSelectedElevationValue}
                  setShowPublishConfetti={setShowPublishConfetti}
                  onDetailsTabDateChange={onDetailsTabDateChange}
                  setTabSelection={setTabSelection}
                  setBfsErrorModalContent={setBfsErrorModalContent}
                  fetchServiceRequestDataHandler={() =>
                    fetchServiceRequestData(true)
                  }
                  setSelectedLineItems={setSelectedLineItems}
                  selectedLineItems={selectedLineItems}
                  openDownloadModalHandler={openDownloadModalHandler}
                  setIsLinkedERPQuoteInfoBannerShowing={
                    setIsLinkedERPQuoteInfoBannerShowing
                  }
                  isLinkedERPQuoteInfoBannerShowing={
                    isLinkedERPQuoteInfoBannerShowing
                  }
                  setIsHealthCheckWarningBannerOpen={
                    setIsHealthCheckWarningBannerOpen
                  }
                  isHealthCheckWarningBannerOpen={
                    isHealthCheckWarningBannerOpen
                  }
                  isHealthCheckErrorBannerOpen={isHealthCheckErrorBannerOpen}
                  setIsHealthCheckErrorBannerOpen={
                    setIsHealthCheckErrorBannerOpen
                  }
                  focusedLineItemId={focusedLineItemId}
                  setFocusedLineItemId={setFocusedLineItemId}
                />
              )}
            </StQuoteDetailsContainer>
          </>
        </Main>
        <VersionDrawer
          quoteDetails={selectedQuoteData}
          open={isVersionDrawerOpen}
          handleDrawerClose={handleDrawerClose}
          handleDrawerOpen={handleDrawerOpen}
          drawerWidth={drawerWidth}
          fetchOnDetailsTabClick={fetchOnDetailsTabClick}
          fetchData={fetchData}
          openNewQuoteModal={openNewQuoteModal}
          isFetchingCurrentVersion={isFetchingCurrentVersion}
        />
      </Box>
    </StViewQuotePageContainer>
  );
};

export default ViewQuoteDetails;
