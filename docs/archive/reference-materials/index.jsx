import { Tooltip, styled } from "@mui/material";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { shallowEqual, useSelector } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import {
  BfsButton,
  BfsLink,
  BfsMessage,
  BfsSelect,
  BfsSelectOption,
  MuiLoader
} from "../../../components";
import QuoteSummaryDetails from "../../../components/QuoteSummaryDetails";
import { CustomerDisplay } from "../../../components/ViewQuoteDetailsTabs/CustomerDisplay";
import { DownloadQuoteModal } from "../../../components/modals/DownloadQuoteModal";
import ExpiryQuoteModal from "../../../components/modals/ExpiryQuoteModal";
import { usePrevious } from "../../../hooks/usePrevious";
import {
  DATE_FORMAT,
  convertDateTimeOffSetToUSDate,
  dateToUSDate,
  isSAPSourceSystem,
  isTrendSourceSystem,
  sendPostMessageToMybldr
} from "../../../lib";
import { getPopulatedQuoteData } from "../../../lib/getPopulatedQuoteDataList";
import { isNullOrUndefined } from "../../../lib/isNullOrUndefined";
import { packTotalAndMarginReducerWithElevationsAndOptions } from "../../../lib/packTotalAndMarginReducer";
import { shouldShowGLCost } from "../../../lib/shouldShowGLCost";
import { useFetchQuote } from "../../store/hooks/useFetchQuote";
import { useFetchViewQuoteDetails } from "../../store/hooks/useFetchViewQuoteDetails";

const StSummaryDetailsButtonContainer = styled("div")`
  background-color: var(--color-quaternary-light, #ebf7ff);
  padding: 0 var(--sp-2xl, 20px);
  min-height: var(--sp-8xl, 50px);
  display: flex;
  justify-content: space-between;
`;

const StSummaryDetailsToolBarLeft = styled("div")`
  align-items: center;
  display: flex;
`;

const StFormPublishQuote = styled("div")`
  padding: var(--sp-2xs, 10px) var(--sp-2xl, 20px);
`;

const StFormPublishQuoteTitle = styled("span")`
  color: var(--color-contrast-high, #a6a6a6);
  margin-left: 10px;
`;

const StPublishContentValue = styled("div")`
  text-align: center;
`;

const StFormPublishQuoteMessage = styled("div")`
  padding-top: var(--sp-1xs, 5px);
  margin-left: 10px;
`;

const StCreateProjectContainer = styled("div")`
  align-items: center;
  display: flex;
  gap: var(--sp-2xs, 10px);
  margin-left: var(--sp-2xs, 10px);
`;

const CustomerSummary = ({
  requiredQuoteId,
  fetchSummaryDetails,
  userData,
  viewQuoteDetailsData,
  pricingAsOfDate,
  changeOptionHandler,
  changeAllOptionHandler,
  changeElevationHandler,
  selectedOptions,
  selectedElevation,
  excludeStockMargin,
  resetElevationAndOptions,
  isCustomerSummaryStandalone = false
}) => {
  const quotesForDropdown =
    viewQuoteDetailsData?.headerDetails?.quotes?.filter(
      (quote) => quote.hasElevationsOrOptionsWithData
    ) || [];
  const showAverageMargin = shouldShowGLCost(viewQuoteDetailsData);

  const [isLoading, setIsLoading] = useState(true);
  const [downloadQuoteModalOpen, setDownloadQuoteModalOpen] = useState(false);

  const [selectedQuoteId, setSelectedQuoteId] = useState(
    requiredQuoteId ?? quotesForDropdown?.[0]?.quoteId
  );
  const { rebuildDetailList } = useFetchViewQuoteDetails({
    autoFetch: false
  });

  const selectedQuoteDetails =
    viewQuoteDetailsData?.headerDetails?.quotes?.find(
      (quote) => quote.quoteId === selectedQuoteId
    );

  const previousSelectedQuoteDetails = usePrevious(selectedQuoteDetails);
  const previousPricingAsOfDate = usePrevious(pricingAsOfDate);

  const { groupedDetailedQuoteData } = useSelector(
    (state) => ({
      groupedDetailedQuoteData:
        state?.viewQuoteDetails?.groupedDetailedQuoteData?.dataList.get(
          selectedQuoteId
        )
    }),
    shallowEqual
  );

  const quoteMarginInfo = useMemo(() => {
    const { quoteDataList } = getPopulatedQuoteData({
      groupedDetailedQuoteData
    });

    if (excludeStockMargin || !quoteDataList) {
      return 0;
    }

    const marginInfo = packTotalAndMarginReducerWithElevationsAndOptions(
      quoteDataList,
      selectedElevation || viewQuoteDetailsData.selectedElevation,
      selectedOptions
    );

    return marginInfo;
  }, [
    groupedDetailedQuoteData,
    viewQuoteDetailsData.selectedElevation,
    excludeStockMargin,
    selectedElevation,
    selectedOptions
  ]);

  const [expiryQuoteModalIsOpen, setExpiryQuoteModalIsOpen] = useState(
    selectedQuoteDetails?.isQuoteExpired && selectedQuoteDetails?.isPublished
  );

  const [exportNotes, setExportNotes] = useState(
    selectedQuoteDetails?.quote?.exportNotes || ""
  );

  const shouldFetchSummaryDetailsWithQuoteDetails = useMemo(() => {
    return (
      userData.isSales ||
      (!userData.isSales &&
        selectedQuoteDetails?.quotePacks?.some(
          ({ quotePackIsPublished }) => quotePackIsPublished === true
        ))
    );
  }, [userData.isSales, selectedQuoteDetails]);

  const fetchSummaryDetailsAndRebuildSelections = () => {
    fetchSummaryDetails(selectedQuoteId, pricingAsOfDate, true).then(() => {
      setIsLoading(false);
      rebuildDetailList(selectedElevation, selectedOptions);
    });
  };

  const openDownloadModalHandler = () => {
    setDownloadQuoteModalOpen(true);
  };

  const { downloadQuote, downloadQuoteV2 } = useFetchQuote(
    selectedQuoteId,
    undefined,
    false
  );

  const handleQuoteChange = (ev) => {
    resetElevationAndOptions();
    setSelectedQuoteId(ev.target.value);
  };

  useEffect(() => {
    const hasQuoteSelectionOrPublishStatusChanged =
      previousSelectedQuoteDetails?.quoteId !== selectedQuoteDetails?.quoteId ||
      previousSelectedQuoteDetails?.isPublished !==
        selectedQuoteDetails?.isPublished;
    const hasPricingAsOfDateChanged =
      pricingAsOfDate !== previousPricingAsOfDate;

    if (
      shouldFetchSummaryDetailsWithQuoteDetails &&
      (hasQuoteSelectionOrPublishStatusChanged || hasPricingAsOfDateChanged)
    ) {
      fetchSummaryDetailsAndRebuildSelections();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    shouldFetchSummaryDetailsWithQuoteDetails,
    selectedQuoteDetails,
    pricingAsOfDate
  ]);

  const closeExpiryQuoteModalHandler = () => {
    setExpiryQuoteModalIsOpen(false);
  };

  const shouldShowCustomerSummary =
    viewQuoteDetailsData.summaryDetails?.quote &&
    viewQuoteDetailsData.summaryDetails?.quote?.hasQuoteDetails &&
    (userData.isSales || selectedQuoteDetails?.isPublished);

  const downloadQuoteTitle = useMemo(() => {
    return `${viewQuoteDetailsData?.headerDetails.title}_${
      selectedQuoteDetails?.quoteName ||
      `Quote ${selectedQuoteDetails?.quoteId}`
    }`;
  }, [selectedQuoteDetails, viewQuoteDetailsData]);

  const createProjectFromSelectionsHandler = () => {
    const event = {
      type: "open-create-project-modal",
      quoteId: selectedQuoteId,
      elevationName:
        selectedElevation || viewQuoteDetailsData.selectedElevation || "",
      optionNames: selectedOptions,
      projectId: viewQuoteDetailsData?.headerDetails?.projectId
    };

    sendPostMessageToMybldr(event);
  };

  if (isLoading) {
    return <MuiLoader />;
  }

  const marginDisplayValue = showAverageMargin
    ? `${quoteMarginInfo.averageMarginDisplayValue} / ${quoteMarginInfo.replacementMarginDisplayValue}`
    : `${quoteMarginInfo.replacementMarginDisplayValue}`;

  const isTrendQuote = isTrendSourceSystem(userData.sourceSystem);
  const isSAPQuote = isSAPSourceSystem(userData.sourceSystem);
  const isTrendOrSAPQuote = isTrendQuote || isSAPQuote;
  const averageMarginLabel = isTrendQuote ? "GL" : "Avg";
  const replacementMarginLabel = isTrendOrSAPQuote ? "Standard" : "Replacement";

  return (
    <>
      <StSummaryDetailsButtonContainer>
        <StSummaryDetailsToolBarLeft>
          {!requiredQuoteId && (
            <BfsSelect
              label="Quote"
              value={selectedQuoteId}
              onChange={handleQuoteChange}
            >
              {quotesForDropdown.map((quote) => (
                <BfsSelectOption key={quote.quoteId} value={quote.quoteId}>
                  {quote.quoteName || `Quote ${quote.quoteId}`}
                </BfsSelectOption>
              ))}
            </BfsSelect>
          )}
          <>
            {selectedQuoteDetails?.isPublished ? (
              <>
                <StFormPublishQuote>
                  <StFormPublishQuoteTitle>Published</StFormPublishQuoteTitle>
                  <StPublishContentValue>
                    <Tooltip
                      title={`By ${selectedQuoteDetails?.publishedByUserName}`}
                      placement="bottom"
                    >
                      {viewQuoteDetailsData.summaryDetails?.quote?.datePublished
                        ? moment(
                            viewQuoteDetailsData.summaryDetails?.quote
                              ?.datePublished
                          ).format(DATE_FORMAT)
                        : ""}
                    </Tooltip>
                  </StPublishContentValue>
                </StFormPublishQuote>
                <StFormPublishQuote>
                  <StFormPublishQuoteTitle>Expires</StFormPublishQuoteTitle>
                  <StPublishContentValue>
                    {viewQuoteDetailsData.summaryDetails?.quote?.expirationDate
                      ? moment(
                          convertDateTimeOffSetToUSDate(
                            viewQuoteDetailsData.summaryDetails?.quote
                              ?.expirationDate
                          )
                        ).format(DATE_FORMAT)
                      : "-"}
                  </StPublishContentValue>
                </StFormPublishQuote>
              </>
            ) : (
              <>
                {userData.isSales && (
                  <StFormPublishQuoteMessage>
                    <StFormPublishQuoteTitle>
                      This takeoff has not been published and is not visible to
                      customer
                    </StFormPublishQuoteTitle>
                  </StFormPublishQuoteMessage>
                )}
              </>
            )}
            {(userData.isSales ||
              (!userData.isSales && selectedQuoteDetails?.isPublished)) && (
              <>
                <StFormPublishQuote>
                  <StFormPublishQuoteTitle>Tax Rate</StFormPublishQuoteTitle>
                  <StPublishContentValue>
                    {!isNullOrUndefined(
                      viewQuoteDetailsData.summaryDetails?.quote
                        ?.locationTaxRate
                    )
                      ? `${viewQuoteDetailsData.summaryDetails?.quote?.locationTaxRate}%`
                      : "-"}
                  </StPublishContentValue>
                </StFormPublishQuote>
                <StFormPublishQuote>
                  <StFormPublishQuoteTitle>
                    Pricing As Of
                  </StFormPublishQuoteTitle>
                  <StPublishContentValue>
                    {viewQuoteDetailsData.summaryDetails?.quote?.pricingAsOfDate
                      ? convertDateTimeOffSetToUSDate(
                          viewQuoteDetailsData.summaryDetails?.quote
                            ?.pricingAsOfDate
                        )
                      : "-"}
                  </StPublishContentValue>
                </StFormPublishQuote>
              </>
            )}
            {userData.isSales && !excludeStockMargin && (
              <StFormPublishQuote>
                <StFormPublishQuoteTitle>
                  {showAverageMargin
                    ? `${averageMarginLabel} Margin / ${replacementMarginLabel} Margin`
                    : "Margin"}
                </StFormPublishQuoteTitle>
                <StPublishContentValue>
                  {marginDisplayValue}
                </StPublishContentValue>
              </StFormPublishQuote>
            )}
            {Boolean(selectedQuoteDetails?.hasQuoteDetails) &&
              (Boolean(selectedQuoteDetails?.isPublished) ||
                userData.isSales) && (
                <BfsButton
                  label="Download Quote"
                  mode="primaryGhost"
                  onClick={openDownloadModalHandler}
                />
              )}
            {!isCustomerSummaryStandalone && (
              <StCreateProjectContainer>
                <BfsButton
                  label="Create Project from Options"
                  mode="primary"
                  onClick={createProjectFromSelectionsHandler}
                />
              </StCreateProjectContainer>
            )}
          </>
        </StSummaryDetailsToolBarLeft>
      </StSummaryDetailsButtonContainer>
      {shouldShowCustomerSummary ? (
        <>
          {selectedQuoteDetails?.isQuoteExpired &&
            selectedQuoteDetails?.isPublished && (
              <BfsMessage
                mode="warning"
                message="This quote has expired. Please contact your salesperson for updated pricing."
                isTitleHidden
              >
                <BfsLink
                  href={`mailto:${viewQuoteDetailsData.summaryDetails?.quote?.publishedByUserEmail}?subject=Hoping you can help me`}
                >
                  More Info
                </BfsLink>
              </BfsMessage>
            )}
          <QuoteSummaryDetails
            elevationList={viewQuoteDetailsData.elevationList}
            optionsList={viewQuoteDetailsData.optionsList || []}
            detailsList={viewQuoteDetailsData.detailsList || {}}
            showPackName={viewQuoteDetailsData.showPackName || false}
            costCodeSubTotal={viewQuoteDetailsData.costCodeSubTotal}
            costDetails={viewQuoteDetailsData.costDetails}
            selectedElevation={
              selectedElevation || viewQuoteDetailsData.selectedElevation
            }
            selectedOptions={selectedOptions}
            onChangeElevation={changeElevationHandler}
            onChangeOption={changeOptionHandler}
            onChangeAllOption={changeAllOptionHandler}
            emptyRowsCount="8"
            isUserSales={userData.isSales}
            excludeStockMargin={excludeStockMargin}
            groupedDetailedQuoteData={groupedDetailedQuoteData}
            showAverageMargin={showAverageMargin}
          />
        </>
      ) : (
        <CustomerDisplay
          viewQuoteDetailsData={viewQuoteDetailsData}
          userData={userData}
        />
      )}
      {expiryQuoteModalIsOpen && (
        <ExpiryQuoteModal isOpen onClose={closeExpiryQuoteModalHandler} />
      )}
      {downloadQuoteModalOpen && (
        <DownloadQuoteModal
          openModal={downloadQuoteModalOpen}
          close={() => setDownloadQuoteModalOpen(false)}
          quoteTitle={downloadQuoteTitle}
          userData={userData}
          downloadQuote={downloadQuote}
          downloadQuoteV2={downloadQuoteV2}
          exportNotes={exportNotes}
          onSuccessfulQuoteDownload={(notes) => setExportNotes(notes)}
          hasOptions={(viewQuoteDetailsData?.optionsList?.length || 0) > 0}
          selectedElevation={
            selectedElevation || viewQuoteDetailsData?.selectedElevation
          }
          selectedOptions={selectedOptions}
          publishLevelDetailId={selectedQuoteDetails?.publishLevelDetailId}
          priceAsOfDate={
            pricingAsOfDate ? pricingAsOfDate : dateToUSDate(moment())
          }
          publishedPacksCount={
            selectedQuoteDetails?.quotePacks?.filter(
              (pack) => pack.quotePackIsPublished
            ).length || 0
          }
          totalPacksCount={groupedDetailedQuoteData?.length}
          packList={selectedQuoteDetails?.quotePacks}
          hasEstimatorNotes={groupedDetailedQuoteData?.some((groupData) =>
            groupData.quoteDetails?.dataList?.some(
              (detail) => detail.estimatorNotes
            )
          )}
        />
      )}
    </>
  );
};

export default CustomerSummary;
