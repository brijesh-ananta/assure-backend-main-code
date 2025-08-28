import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
/* eslint-disable react/prop-types */
const VerticalRightSidebar = ({
  activeStep,
  handleStepChange,
  isTestInfoAvailable,
  isPhysicalCard,
  requestInfoData,
  environment,
}) => {
  const navigate = useNavigate();
  const afterSubmitStatus = ["approved", "assign_card", "shipped", "completed"];
  const afterAssigneStatus = ["assign_card", "shipped", "completed"];
  const { user } = useAuth();
  const onTabClick = (index) => {
    handleStepChange(index);

    navigate({
      pathname: window.location.pathname,
      search: `?${new URLSearchParams(`step=${index}`).toString()}`,
    });
  };

  const showShipDetails = useMemo(() => {
    try {
      const testerDetails =
        (requestInfoData?.testerDetails &&
          JSON.parse(requestInfoData?.testerDetails)) ||
        {};

      const shipDetails =
        (requestInfoData?.shipDetails &&
          JSON.parse(requestInfoData?.shipDetails)) ||
        {};

      const exists =
        shipDetails?.shipTo === "multiple"
          ? testerDetails?.testers?.some((t) => t.status === "assigned")
          : false;

      return exists;
    } catch {
      return false;
    }
  }, [requestInfoData]);

  const length = Object.keys(requestInfoData).length;
  console.log(length);

  console.log("request info data---->", requestInfoData);
  console.log(length === 0 && user.role === 1);
  return (
    <div className="sidebar">
      {/* Approval */}

      {requestInfoData.status === "submitted" ? (
        <>
          {!afterSubmitStatus.includes(requestInfoData.status) && (
            <button
              className={`right-sidebar-item ${
                activeStep != 7 && activeStep != 8 && "active"
              }`}
              onClick={() => onTabClick(1)}
            >
              <span className="sidebar-text">Approval</span>
            </button>
          )}{" "}
        </>
      ) : (
        <></>
      )}

      {/* Assign Card */}

      {user.role === 2 || user.role === 3 ? (
        <>
          {requestInfoData.status === "assign_card" ||
          requestInfoData.status === "completed" ? (
            <>
              {" "}
              <button
                className={`right-sidebar-item ${activeStep === 7 && "active"}`}
                onClick={() => onTabClick(7)}
                disabled={!isTestInfoAvailable || Number(environment) === 3}
              >
                <span className="sidebar-text">Assign Card</span>
              </button>
            </>
          ) : (
            <></>
          )}
        </>
      ) : (
        <>
          {afterSubmitStatus.includes(requestInfoData.status) &&
            Number(environment) !== 3 && (
              <button
                className={`right-sidebar-item ${activeStep === 7 && "active"}`}
                onClick={() => onTabClick(7)}
                disabled={!isTestInfoAvailable || environment === 3}
              >
                <span className="sidebar-text">Assign Card</span>
              </button>
            )}
        </>
      )}

      {/* Ship Card */}

      {user.role === 2 || user.role === 3 ? (
        <>
          {requestInfoData.status === "completed" ? (
            <>
              {" "}
              {((isPhysicalCard != "no" &&
                afterAssigneStatus.includes(requestInfoData.status)) ||
                showShipDetails ||
                (environment == 3 && requestInfoData.status == "approved")) && (
                <button
                  className={`right-sidebar-item ${
                    activeStep === 8 && "active"
                  }`}
                  onClick={() => onTabClick(8)}
                >
                  <span className="sidebar-text">Ship Card</span>
                </button>
              )}
            </>
          ) : (
            <></>
          )}
        </>
      ) : (
        <>
          {((isPhysicalCard != "no" &&
            afterAssigneStatus.includes(requestInfoData.status)) ||
            showShipDetails ||
            (environment == 3 && requestInfoData.status == "approved")) && (
            <button
              className={`right-sidebar-item ${activeStep === 8 && "active"}`}
              onClick={() => onTabClick(8)}
            >
              <span className="sidebar-text">Ship Card</span>
            </button>
          )}
        </>
      )}

      {/* Stop fulfillment */}
      {afterSubmitStatus.includes(requestInfoData.status) &&
        user.role === 1 && (
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
    </div>
  );
};

export default VerticalRightSidebar;
