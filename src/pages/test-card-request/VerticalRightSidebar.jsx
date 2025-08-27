import { useNavigate } from "react-router-dom";

/* eslint-disable react/prop-types */
const VerticalRightSidebar = ({
  activeStep,
  handleStepChange,
  isTestInfoAvailable,
  isPhysicalCard,
  requestInfoData,
  environment,
  isTestCaseAvailable,
}) => {
  const navigate = useNavigate();
  const afterSubmitStatus = ["approved", "assign_card", "shipped", "completed"];
  const afterAssigneStatus = ["assign_card", "shipped", "completed"];

  const onTabClick = (index) => {
    handleStepChange(index);

    navigate({
      pathname: window.location.pathname,
      search: `?${new URLSearchParams(`step=${index}`).toString()}`,
    });
  };

  return (
    <div className="sidebar">
      {/* Approval */}
      {!afterSubmitStatus.includes(requestInfoData.status) && (
        <button
          className={`right-sidebar-item ${
            activeStep != 7 && activeStep != 8 && "active"
          }`}
          onClick={() => onTabClick(1)}
        >
          <span className="sidebar-text">Approval</span>
        </button>
      )}

      {/* Assign Card */}
      {afterSubmitStatus.includes(requestInfoData.status) &&
        environment != 3 && (
          <button
            className={`right-sidebar-item ${activeStep === 7 && "active"}`}
            onClick={() => onTabClick(7)}
            disabled={!isTestInfoAvailable || environment == 3}
          >
            <span className="sidebar-text">Assign Card</span>
          </button>
        )}

      {/* Ship Card */}
      {((isPhysicalCard != "no" &&
        afterAssigneStatus.includes(requestInfoData.status)) ||
        (environment == 3 && requestInfoData.status == "approved")) && (
        <button
          className={`right-sidebar-item ${activeStep === 8 && "active"}`}
          onClick={() => onTabClick(8)}
        >
          <span className="sidebar-text">Ship Card</span>
        </button>
      )}

      {/* Stop fulfillment */}
      {afterSubmitStatus.includes(requestInfoData.status) && (
        <button
          className={`right-sidebar-item ${activeStep === 9 && "active"}`}
          onClick={() => onTabClick(9)}
          disabled={
            requestInfoData.status == "completed" ||
            requestInfoData.status == "returned"
          }
        >
          <span className="sidebar-text">Stop Fulfillment</span>
        </button>
      )}

      {/* Test Case */}
      <button
        className={`right-sidebar-item ${activeStep === 10 && "active"}`}
        onClick={() => onTabClick(10)}
        disabled={!isTestCaseAvailable}
      >
        <span className="sidebar-text">Test Case</span>
      </button>
    </div>
  );
};

export default VerticalRightSidebar;
