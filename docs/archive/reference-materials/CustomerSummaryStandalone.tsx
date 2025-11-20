import { FC, memo, useEffect, useState } from "react";
import CustomerSummary from ".";
import { MuiLoader } from "../../../components";
import { useFetchViewQuoteDetails } from "../../store/hooks/useFetchViewQuoteDetails";
import { useQuoteDetails } from "../../store/hooks/useQuoteDetails";

interface Props {
  serviceRequestId: string;
  requiredQuoteId?: string;
}

const CustomerSummaryStandaloneComp: FC<Props> = ({
  serviceRequestId,
  requiredQuoteId
}) => {
  const { pricingAsOfDate } = useQuoteDetails();

  const {
    userData,
    viewQuoteDetailsData,
    fetchSummaryDetails,
    rebuildOptionsList,
    rebuildDetailList,
    clearQuoteDetailsState
  } = useFetchViewQuoteDetails({
    serviceRequestId,
    pricingAsOfDate,
    autoFetch: true
  } as any);

  const [selectedElevation, setSelectedElevationValue] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);

  const changeOptionHandler = (name: any, value: any) => {
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

  const changeAllOptionHandler = (name: any, value: any) => {
    if (value) {
      setSelectedOptions([...selectedOptions, ...name]);
      rebuildDetailList(selectedElevation, [...selectedOptions, ...name]);
    } else {
      setSelectedOptions([]);
      rebuildDetailList(selectedElevation, []);
    }
  };

  const changeElevationHandler = (value: any) => {
    setSelectedElevationValue(value);
    setSelectedOptions([]);
    rebuildOptionsList(value);
    rebuildDetailList(value, []);
  };

  const resetElevationAndOptions = () => {
    setSelectedElevationValue("");
    setSelectedOptions([]);
  };

  useEffect(() => {
    return () => {
      clearQuoteDetailsState();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!viewQuoteDetailsData) {
    return <MuiLoader />;
  }

  return (
    <CustomerSummary
      requiredQuoteId={requiredQuoteId}
      viewQuoteDetailsData={viewQuoteDetailsData}
      fetchSummaryDetails={fetchSummaryDetails}
      userData={userData}
      pricingAsOfDate={pricingAsOfDate}
      changeOptionHandler={changeOptionHandler}
      selectedElevation={selectedElevation}
      changeAllOptionHandler={changeAllOptionHandler}
      changeElevationHandler={changeElevationHandler}
      selectedOptions={selectedOptions}
      excludeStockMargin
      resetElevationAndOptions={resetElevationAndOptions}
      isCustomerSummaryStandalone
    />
  );
};

export const CustomerSummaryStandalone = memo(CustomerSummaryStandaloneComp);
