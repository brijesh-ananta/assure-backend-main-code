/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

const VerticalSidebar = ({
  activeStep,
  handleStepChange,
  requestInfoData,
  environment,
  isTestInfoAvailable,
  isPhysicalCard,
  terminalType,
}) => {
  const navigate = useNavigate();

  const testerDetails =
    (requestInfoData?.testerDetails &&
      JSON.parse(requestInfoData?.testerDetails || {})) ||
    "";
  const testInfo =
    (requestInfoData?.testInfo &&
      JSON.parse(requestInfoData?.testInfo || {})) ||
    "";
  const terminalDetail =
    (requestInfoData?.termInfo &&
      JSON.parse(requestInfoData?.termInfo || {})) ||
    "";

  const isTerminalDisabled = useMemo(
    () => environment == 3 || terminalType !== "Pos",
    [environment, terminalType]
  );

  const isTermInfoActive =
    terminalType == "Ecomm" || environment == 3
      ? true
      : requestInfoData?.testInfo == null
        ? true
        : false;

  const onTabClick = (index) => {
    handleStepChange(index);

    navigate({
      pathname: window.location.pathname,
      search: `?${new URLSearchParams(`step=${index}`).toString()}`,
    });
  };
  return (
    <div className="sidebar">
      {/*  */}
      <button
        className={`sidebar-item ${activeStep === 1 && "active"}`}
        onClick={() => onTabClick(1)}
      >
        <span className="sidebar-text">Requestor Info</span>
      </button>
      {/* Test Information */}
      <button
        className={`sidebar-item ${activeStep === 2 && "active"}`}
        onClick={() => onTabClick(2)}
        disabled={!isTestInfoAvailable}
      >
        <span className="sidebar-text">Test Information</span>
      </button>
      {/* Terminal */}
      <button
        className={`sidebar-item ${activeStep === 3 && "active"}`}
        onClick={() => onTabClick(3)}
        disabled={isTerminalDisabled || isTermInfoActive}
      >
        <span className="sidebar-text">Terminal Details</span>
      </button>
      {/* Tester */}
      <button
        className={`sidebar-item ${activeStep === 4 && "active"}`}
        onClick={() => onTabClick(4)}
        disabled={
          (isTerminalDisabled && !testInfo) ||
          (!isTerminalDisabled && !terminalDetail)
        }
      >
        <span className="sidebar-text">Tester Details</span>
      </button>
      {/* Shipping */}
      {isPhysicalCard === "yes" && (
        <button
          className={`sidebar-item ${activeStep === 5 && "active"}`}
          onClick={() => onTabClick(5)}
          disabled={!testerDetails}
        >
          <span className="sidebar-text">Shipping Details</span>
        </button>
      )}
    </div>
  );
};

export default VerticalSidebar;
