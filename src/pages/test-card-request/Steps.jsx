/* eslint-disable react/prop-types */
function Steps({
  environment,
  terminalType,
  requestInfoData,
  isCompleted,
  isPhysicalCard,
}) {
  const shipDetails = JSON.parse(requestInfoData.shipDetails || "{}");
  const afterSubmitStatus = ["approved", "assign_card", "shipped", "completed"];

  return (
    <section className="aqua-border-b">
      <div className="container-fluid">
        <div className="step-form border-bottom1">
          <ul className="d-flex justify-content-lg-between justify-content-center align-items-center flex-wrap list-unstyled gap-3 mb-lg-4">
            <li className="d-flex flex-column justify-content-center align-items-center">
              <span
                className={`${
                  requestInfoData?.reqInfo != null ? "activebg" : ""
                } d-flex align-items-center justify-content-center`}
              >
                {requestInfoData?.reqInfo != null && (
                  <i className="fas fa-check"></i>
                )}
              </span>
              Requestor Info
            </li>

            <li className="d-flex flex-column justify-content-center align-items-center position-relative">
              <span
                className={`${
                  requestInfoData?.testInfo != null ? "activebg" : ""
                } d-flex align-items-center justify-content-center`}
              >
                <div className="step-item"></div>
                {requestInfoData?.testInfo != null && (
                  <i className="fas fa-check"></i>
                )}
              </span>
              Test Information
            </li>
            <li className="d-flex flex-column justify-content-center align-items-center position-relative">
              <span
                className={`${
                  terminalType == "Ecomm" || environment == 3
                    ? "arrow-blocked"
                    : requestInfoData?.termInfo != null
                      ? "activebg"
                      : ""
                }  d-flex align-items-center justify-content-center`}
              >
                {terminalType == "Ecomm" || environment == 3 ? (
                  ""
                ) : requestInfoData?.termInfo != null ? (
                  <>
                    <i className="fas fa-check"></i>
                  </>
                ) : (
                  <div className="step-item"></div>
                )}
              </span>
              Terminal Details
            </li>

            <li className="d-flex flex-column justify-content-center align-items-center position-relative">
              <span
                className={`${
                  requestInfoData?.testerDetails != null ? "activebg" : ""
                }  d-flex align-items-center justify-content-center`}
              >
                <div className="step-item"></div>
                {requestInfoData?.testerDetails != null && (
                  <i className="fas fa-check"></i>
                )}
              </span>
              Tester Details
            </li>

            <li className="d-flex flex-column justify-content-center align-items-center position-relative">
              <span
                className={`${
                  isPhysicalCard == "no" || terminalType == "Ecomm"
                    ? "arrow-blocked"
                    : requestInfoData?.shipDetails != null
                      ? "activebg"
                      : ""
                }  d-flex align-items-center justify-content-center`}
              >
                {isPhysicalCard != "no" && <div className="step-item"></div>}
                {requestInfoData?.shipDetails != null && (
                  <i className="fas fa-check"></i>
                )}
              </span>
              Shipping Details
            </li>
            <li className="d-flex flex-column justify-content-center align-items-center position-relative">
              <span
                className={`${
                  afterSubmitStatus.includes(requestInfoData?.status) ||
                  requestInfoData?.status === "submitted"
                    ? "activebg"
                    : ""
                } d-flex align-items-center justify-content-center`}
              >
                <div className="step-item"></div>
                {(afterSubmitStatus.includes(requestInfoData?.status) ||
                  requestInfoData?.status === "submitted") && (
                  <i className="fas fa-check"></i>
                )}
              </span>
              Submitted
            </li>

            <li className="d-flex flex-column justify-content-center align-items-center position-relative">
              <span
                className={`${
                  afterSubmitStatus.includes(requestInfoData?.status)
                    ? "activebg"
                    : ""
                }  d-flex align-items-center justify-content-center`}
              >
                <div className="step-item"></div>
                {afterSubmitStatus.includes(requestInfoData?.status) && (
                  <i className="fas fa-check"></i>
                )}
              </span>
              Approved
            </li>

            <li className="d-flex flex-column justify-content-center align-items-center position-relatives">
              <span
                className={`${
                  requestInfoData?.status === "shipped" ||
                  requestInfoData?.status === "assign_card" ||
                  (isCompleted && environment != 3)
                    ? "activebg"
                    : environment == 3
                      ? "arrow-blocked"
                      : ""
                }  d-flex align-items-center justify-content-center`}
              >
                <div className="step-item"></div>
                {(requestInfoData?.status === "shipped" ||
                  requestInfoData?.status === "assign_card" ||
                  (isCompleted && environment != 3)) && (
                  <i className="fas fa-check"></i>
                )}
              </span>
              Assigned
            </li>
            <li className="d-flex flex-column justify-content-center align-items-center position-relatives">
              <span
                className={`${
                  terminalType == "Ecomm" ||
                  shipDetails.shipTo === "mobile" ||
                  isPhysicalCard == "no"
                    ? "arrow-blocked"
                    : requestInfoData?.shipmentInfo != null || isCompleted
                      ? "activebg"
                      : ""
                } d-flex align-items-center justify-content-center`}
              >
                {!(
                  terminalType == "Ecomm" || shipDetails.shipTo === "mobile"
                ) &&
                  requestInfoData?.shipmentInfo != null && (
                    <>
                      <div className="step-item"></div>
                    </>
                  )}
                {requestInfoData?.shipmentInfo != null ||
                  (isCompleted && isPhysicalCard == "yes" && (
                    <i className="fas fa-check"></i>
                  ))}
              </span>
              Shipped
            </li>
            <li className="d-flex flex-column justify-content-center align-items-center position-relatives">
              <span
                className={`${
                  isCompleted ? "activebg" : ""
                } d-flex align-items-center justify-content-center`}
              >
                {!(
                  terminalType == "Ecomm" || shipDetails.shipTo === "mobile"
                ) &&
                  requestInfoData?.shipmentInfo != null && (
                    <>
                      <div className="step-item"></div>
                    </>
                  )}
                {isCompleted && <i className="fas fa-check"></i>}
              </span>
              Completed
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Steps;
