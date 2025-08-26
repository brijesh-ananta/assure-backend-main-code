import React, { useState, useEffect } from "react";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import Footer from "../../common/Footer";
import { useAuth } from "../../utils/AuthContext";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import axiosToken from "../../utils/axiosToken";
import { environmentMapping } from "../../utils/constent";
function Testinformation() {
  const [headerTitle] = useState("Test Card Request");
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const environment = location.state?.environment;
  const terminalType = location.state?.terminalType;
  const reqStatus = location.state?.reqStatus;
  const status = location.state?.status;
  const [tcStatus, setTcStatus] = useState(status);

  const { cardRequestId } = useParams();

  // Persist cardRequestId across sessions

  const handleRequest = () => {
    navigate(`/dashboard/test-card-request/requestor-info/${cardRequestId}`, {
      state: { environment, terminalType, status: tcStatus },
    });
  };

  const handleTerminalDetails = () => {
    navigate(`/dashboard/test-card-request/terminal-details/${cardRequestId}`, {
      state: { environment, terminalType, status: tcStatus },
    });
  };

  // handle card shipping details
  const handleCardShippingDetails = () => {
    navigate(
      `/dashboard/test-card-request/card-shipping-details/${cardRequestId}`,
      {
        state: { environment, terminalType, status: tcStatus },
      }
    );
  };

  // handleFulfilment
  const handleFulfilment = () => {
    navigate(`/dashboard/test-card-request/fulfilment/${cardRequestId}`, {
      state: { environment, terminalType, status: tcStatus },
    });
  };

    // handleCardAssignment
    const handleCardAssignment = () => {
      navigate(`/dashboard/test-card-request/assignment/${cardRequestId}`, {
        state: { environment, terminalType, status: tcStatus },
      });
    };

    // handleShipment
    const handleShipment = () => {
      navigate(`/dashboard/test-card-request/shipment/${cardRequestId}`, {
        state: { environment, terminalType, status: tcStatus },
      });
    };

  const [disableCountryCodes, setDisableCountryCodes] = useState(false);
  const [testInfo, setTestInfo] = useState({
    request_id: cardRequestId,
    environment: environment, // e.g., "Prod", "QA", "Test"
    terminalType: terminalType, // e.g., "pos", "ecomm"
    testingObjective: "",
    startDate: "",
    endDate: "",
    individualTransactionLimit: "",
    totalTransactionLimit: "",
    mccCodesAll: false, // if true, manual MCC codes are disabled
    mccCodes1: "",
    mccCodes2: "",
    mccCodes3: "",
    mccCodes4: "",
    mccCodes5: "",
    countryCodes: [], // array of selected country codes
    id: "",
  });

  // Fetch request info data based on cardRequestId
  useEffect(() => {
    if (cardRequestId) {
      const fetchData = async () => {
        try {
          const response = await axiosToken.get(
            `/card-requests/test-info/${cardRequestId}`
          );

          let responseData = response.data;
          let info = responseData;
          // Check if testInformation is a JSON string and parse it
          if (info.testInformation) {
            if (typeof info.testInformation === "string") {
              try {
                const parsed = JSON.parse(info.testInformation);
                info = parsed.testInfoData ? parsed.testInfoData : parsed;
              } catch (error) {
                console.error("Error parsing testInformation:", error);
              }
            } else if (info.testInformation.testInfoData) {
              info = info.testInformation.testInfoData;
            }
          }

          // Ensure the structure matches `useState`
          const updatedTestInfo = {
            request_id: info.request_id || cardRequestId,
            environment: info.environment || environment,
            terminalType: terminalType,
            testingObjective: info.testingObjective || "",
            startDate: info.startDate || "",
            endDate: info.endDate || "",
            individualTransactionLimit: info.individualTransactionLimit || "",
            totalTransactionLimit: info.totalTransactionLimit || "",
            mccCodesAll:
              info.mccCodesAll !== undefined ? info.mccCodesAll : false,
            mccCodes1: info.mccCodes1 || "",
            mccCodes2: info.mccCodes2 || "",
            mccCodes3: info.mccCodes3 || "",
            mccCodes4: info.mccCodes4 || "",
            mccCodes5: info.mccCodes5 || "",
            countryCodes: Array.isArray(info.countryCodes)
              ? info.countryCodes
              : [],
            id: responseData.id || "",
          };

          setTestInfo(updatedTestInfo);
        } catch (error) {
          console.error("Error fetching test information:", error);
        }
      };

      fetchData();
    }
  }, [cardRequestId, environment, terminalType]);

  // Handler for changes in standard text/select inputs.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTestInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler for multi-select country codes.
  const handleCountryCodesChange = (e) => {
    const selected = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    if (selected.length > 4) {
      alert("You can only select up to 4 country codes.");
      return;
    }
    setTestInfo((prev) => ({
      ...prev,
      countryCodes: selected,
    }));
  };

  const validateForm = () => {
    if (!testInfo.testingObjective.trim()) {
      alert("Please enter a testing objective.");
      return false;
    }
    if (!testInfo.startDate) {
      alert("Please select a start date.");
      return false;
    }
    if (!testInfo.endDate) {
      alert("Please select an end date.");
      return false;
    }
    if (new Date(testInfo.endDate) < new Date(testInfo.startDate)) {
      alert("End date cannot be before the start date.");
      return false;
    }
    if (!testInfo.individualTransactionLimit.trim()) {
      alert("Please enter an individual transaction limit.");
      return false;
    }
    if (isNaN(Number(testInfo.individualTransactionLimit))) {
      alert("Individual transaction limit must be a valid number.");
      return false;
    }
    if (!testInfo.totalTransactionLimit.trim()) {
      alert("Please enter a total transaction limit.");
      return false;
    }
    if (isNaN(Number(testInfo.totalTransactionLimit))) {
      alert("Total transaction limit must be a valid number.");
      return false;
    }
    // If terminalType is pos and MCC codes are not set to "All", at least one MCC code must be provided.
    // if (testInfo.terminalType === "pos" && !testInfo.mccCodesAll) {
    //   if (
    //     !testInfo.mccCodes1.trim() &&
    //     !testInfo.mccCodes2.trim() &&
    //     !testInfo.mccCodes3.trim() &&
    //     !testInfo.mccCodes4.trim() &&
    //     !testInfo.mccCodes5.trim()
    //   ) {
    //     alert("Please enter at least one MCC code or check 'All'.");
    //     return false;
    //   }
    // }
    // If country codes are enabled, ensure at least one is selected.
    // if (!disableCountryCodes) {
    //   if (!testInfo.countryCodes || testInfo.countryCodes.length === 0) {
    //     alert("Please select at least one country code.");
    //     return false;
    //   }
    // }
    return true;
  };

  // Handle form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      let response;
      if (testInfo.id) {
        response = await axiosToken.put(
          `/card-requests/test-info/${testInfo.id}`,
          testInfo
        );
      } else {
        response = await axiosToken.post("/card-requests/test-info", testInfo);
      }
      const { cardRequestId, testInformationId } = response.data;
      setTestInfo((prevData) => ({
        ...prevData,
        cardRequestId,
        id: testInformationId,
      }));
      alert("Test information saved successfully!");
      if (terminalType === "Pos") {
        navigate(
          `/dashboard/test-card-request/terminal-details/${cardRequestId}`,
          {
            state: { environment, terminalType, reqStatus, status: tcStatus },
          }
        );
      } else if (terminalType === "Ecomm") {
        navigate(
          `/dashboard/test-card-request/card-shipping-details/${cardRequestId}`,
          {
            state: { environment, terminalType, reqStatus, status: tcStatus },
          }
        );
      }
    } catch (error) {
      console.error("Error saving test information:", error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert(error.message || "An error occurred.");
      }
    }
  };


  return (
    <>
      <Header title={headerTitle} />

      <div className="notification mangeissuer mb-lg-0 mb-3 py-lg-3 py-2 borderbottom3">
        <div className="container-fluid">
          <div className="d-lg-flex align-items-center justify-content-between w-100">
            <div className="d-lg-flex formcard">
              <span className="me-3 font">TC Request ID :</span>
              <label className="form-check-label text-danger fw-bold">
                {cardRequestId || "NEW"}
              </label>
            </div>
            <div className="d-lg-flex formcard">
              <span className="me-3 font">Environment : </span>
              <label className="form-check-label">
                {environmentMapping[environment] || environment}
              </label>
            </div>
            <div className="d-lg-flex formcard">
              <span className="me-3 font">Terminal Type : </span>
              <label className="form-check-label">
                {terminalType
                  ? terminalType.charAt(0).toUpperCase() + terminalType.slice(1)
                  : ""}
              </label>
            </div>
          </div>
        </div>
      </div>

      <section>
        <div className="container-fluid py-lg-3 py-2">
          <div className="step-form border-bottom1">
            <ul className="d-flex justify-content-lg-between justify-content-center align-items-center flex-wrap list-unstyled gap-3 mb-lg-4">
              <li
                className="d-flex flex-column justify-content-center align-items-center"
                style={{ cursor: "pointer" }}
                onClick={handleRequest}
              >
                <span className="activebg"></span>Requestor Info
              </li>
              <li className="d-flex flex-column justify-content-center align-items-center">
                <span className="activebg"></span>Test Information
              </li>
              <li className="d-flex flex-column justify-content-center align-items-center">
                <span></span>Terminal Details
              </li>
              <li className="d-flex flex-column justify-content-center align-items-center">
                <span></span>Shipping Details
              </li>
              <li className="d-flex flex-column justify-content-center align-items-center">
                <span></span>Submitted
              </li>
              <li className="d-flex flex-column justify-content-center align-items-center">
                <span></span>Approved
              </li>
              <li className="d-flex flex-column justify-content-center align-items-center">
                <span></span>Assigned
              </li>
              <li className="d-flex flex-column justify-content-center align-items-center">
                <span></span>Shipped
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <div className="notification pb-6 overflow-hidden p-0 accordin-stepform">
          <div className="accordion mb-3" id="accordionExample">
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingOne">
                <button
                  className="accordion-button"
                  type="button"
                  style={{ cursor: "pointer" , pointerEvents: "auto", opacity: "1" }}
                  onClick={handleRequest}
                >
                  <p className="mb-0 text-center d-block w-100">
                    Requestor Information
                  </p>
                </button>
              </h2>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header">
                <button className="accordion-button" type="button">
                  <p className="mb-0 text-center d-block w-100">
                    Test Information
                  </p>
                </button>
              </h2>
              <div
                id="collapseOne"
                className="accordion-collapse collapse show"
                aria-labelledby="headingOne"
                data-bs-parent="#accordionExample"
              >
                <div className="accordion-body">
                  <div className="container-fluid">
                    <form onSubmit={handleSubmit}>
                      {/* Environment & Terminal Type (Display only) */}
                      <div className="form-field-wrapper">
                        <div className="login-page mb-lg-4 mb-2 d-lg-flex align-items-end">
                          <div className="col-12 col-lg-8 d-lg-flex align-items-center justify-content-start">
                            <span className="me-3 font">Environment</span>
                            <div className="d-lg-flex formcard">
                              <div className="form-check me-3 d-flex gap-2 align-items-center">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="environment"
                                  id="envProd"
                                  value="Prod"
                                  checked={testInfo.environment == "1"}
                                  disabled
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="envProd"
                                >
                                  Prod
                                </label>
                              </div>
                              <div className="form-check me-3 d-flex gap-2 align-items-center">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="environment"
                                  id="envQA"
                                  value="QA"
                                  checked={testInfo.environment == "2"}
                                  disabled
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="envQA"
                                >
                                  QA
                                </label>
                              </div>
                              <div className="form-check d-flex gap-2 align-items-center">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="environment"
                                  id="envTest"
                                  value="Test"
                                  checked={testInfo.environment == "3"}
                                  disabled
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="envTest"
                                >
                                  Cert
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="login-page mb-lg-4 mb-2 d-lg-flex align-items-end">
                          <div className="col-12 col-lg-6 d-lg-flex align-items-center justify-content-start">
                            <span className="me-3 font">Terminal Type</span>
                            <div className="d-lg-flex formcard">
                              <div className="form-check me-3 d-flex gap-2 align-items-center">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="terminalType"
                                  id="terminalPos"
                                  value="Pos"
                                  checked={testInfo.terminalType === "Pos"}
                                  disabled
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="terminalPos"
                                >
                                  POS
                                </label>
                              </div>
                              <div className="form-check d-flex gap-2 align-items-center">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="terminalType"
                                  id="terminalEcomm"
                                  value="Ecomm"
                                  checked={testInfo.terminalType === "Ecomm"}
                                  disabled
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="terminalEcomm"
                                >
                                  Ecomm
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Testing Objective */}
                      <div className="form-field-wrapper">
                        <div className="border-bottom pb-4 mb-lg-4 mb-2">
                          <div className="login-page mb-lg-4 mb-2 d-lg-flex align-items-end">
                            <div className="col-12 col-lg-5 me-lg-4 me-0">
                              <div className="d-lg-flex align-items-center">
                                <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2">
                                  Testing Objective
                                </label>
                                <input
                                  type="text"
                                  name="testingObjective"
                                  placeholder="Write short objective"
                                  className="form-control formcontrol"
                                  value={testInfo.testingObjective}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Start Date & End Date */}
                      <div className="form-field-wrapper">
                        <div className="login-page mb-lg-4 mb-2 d-lg-flex align-items-end">
                          <div className="col-12 col-lg-3 me-lg-4 me-0">
                            <div className="d-lg-flex align-items-center">
                              <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2">
                                Start Date
                              </label>
                              <input
                                type="date"
                                name="startDate"
                                className="form-control formcontrol"
                                value={testInfo.startDate}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                          {/* hide if environment is Test */}
                          {testInfo.environment != 3 && (
                          <div className="col-12 col-lg-3 me-lg-4 me-0">
                            <div className="d-lg-flex align-items-center">
                              <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2">
                                End Date
                              </label>
                              <input
                                type="date"
                                name="endDate"
                                className="form-control formcontrol"
                                value={testInfo.endDate}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                          )}
                        </div>
                      </div>

                      {/* Transaction Limits */}
                      <div className="row mb-3">
                        <div className="col-lg-4">
                          <div className="d-lg-flex align-items-center">
                            <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3">
                              Individual Transaction Limit
                            </label>
                            <input
                              type="text"
                              name="individualTransactionLimit"
                              placeholder="$10.00"
                              className="form-control formcontrol"
                              value={testInfo.individualTransactionLimit}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-lg-4">
                          <div className="d-lg-flex align-items-center">
                            <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3">
                              Total Transaction Limit
                            </label>
                            <input
                              type="text"
                              name="totalTransactionLimit"
                              placeholder="$100.00"
                              className="form-control formcontrol"
                              value={testInfo.totalTransactionLimit}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>

                      {/* MCC Codes (only if terminalType is pos) */}
                      {testInfo.terminalType === "pos" && (
                        <div className="form-field-wrapper">
                          <div className="login-page mb-lg-4 mb-2 d-lg-flex align-items-end">
                            <div className="col-12 col-lg-8 d-lg-flex align-items-center justify-content-start">
                              <span className="me-3 font">MCC Codes</span>
                              <div className="d-lg-flex formcard">
                                <div className="form-check me-3 d-flex gap-2 align-items-center">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    name="mccCodesAll"
                                    id="mccCodesAll"
                                    checked={testInfo.mccCodesAll}
                                    onChange={(e) =>
                                      setTestInfo((prev) => ({
                                        ...prev,
                                        mccCodesAll: e.target.checked,
                                      }))
                                    }
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="mccCodesAll"
                                  >
                                    All
                                  </label>
                                </div>
                              </div>
                              <div className="d-lg-flex gap-4">
                                <input
                                  type="text"
                                  name="mccCodes1"
                                  value={testInfo.mccCodes1}
                                  onChange={handleChange}
                                  className="form-control formcontrol"
                                  disabled={testInfo.mccCodesAll}
                                />
                                <input
                                  type="text"
                                  name="mccCodes2"
                                  value={testInfo.mccCodes2}
                                  onChange={handleChange}
                                  className="form-control formcontrol"
                                  disabled={testInfo.mccCodesAll}
                                />
                                <input
                                  type="text"
                                  name="mccCodes3"
                                  value={testInfo.mccCodes3}
                                  onChange={handleChange}
                                  className="form-control formcontrol"
                                  disabled={testInfo.mccCodesAll}
                                />
                                <input
                                  type="text"
                                  name="mccCodes4"
                                  value={testInfo.mccCodes4}
                                  onChange={handleChange}
                                  className="form-control formcontrol"
                                  disabled={testInfo.mccCodesAll}
                                />
                                <input
                                  type="text"
                                  name="mccCodes5"
                                  value={testInfo.mccCodes5}
                                  onChange={handleChange}
                                  className="form-control formcontrol"
                                  disabled={testInfo.mccCodesAll}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="login-page mb-lg-4 mb-2 d-lg-flex flex-column align-items-start fixsize">
                            <div className="col-12 col-lg-6 d-lg-flex align-items-center justify-content-start mb-2">
                              <span className="me-3 font flex-shrink-0 flexgrowlimit">
                                Country Codes
                              </span>
                              <div className="d-lg-flex formcard">
                                <div className="form-check me-3 d-flex gap-2 align-items-center">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    name="disableCountryCodes"
                                    id="disableCountryCodes"
                                    checked={disableCountryCodes}
                                    onChange={() =>
                                      setDisableCountryCodes(
                                        !disableCountryCodes
                                      )
                                    }
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="disableCountryCodes"
                                  >
                                    All
                                  </label>
                                </div>
                              </div>
                              <div className="d-lg-flex gap-4">
                                <select
                                  name="countryCodes"
                                  className="form-control formcontrol"
                                  multiple
                                  size={2}
                                  disabled={disableCountryCodes}
                                  value={testInfo.countryCodes}
                                  onChange={handleCountryCodesChange}
                                >
                                  <option value="IND">India (IND)</option>
                                  <option value="USA">USA (USA)</option>
                                  <option value="UK">UK (UK)</option>
                                  <option value="CAN">Canada (CAN)</option>
                                  <option value="AUS">Australia (AUS)</option>
                                  <option value="SGP">Singapore (SGP)</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="btn-section col-12 d-flex justify-content-end">
                        {tcStatus === "draft" && (
                          <>
                            <a
                              className="btn-add colorgreen"
                              style={{ cursor: "pointer" }}
                              onClick={handleSubmit}
                            >
                              Save Test Information
                            </a>
                          </>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* terminal details */}
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button"
                  type="button"
                  style={{
                    pointerEvents: "auto",
                    cursor: "pointer",
                    opacity: 1,
                  }}
                  onClick={handleTerminalDetails}
                >
                  <p className="mb-0 text-center d-block w-100">
                    Terminal Details
                  </p>
                </button>
              </h2>
            </div>

            <div
              className="accordion-item"
              style={{
                pointerEvents: "auto",
                opacity: 1,
                cursor: "pointer",
              }}
            >
              <h2 className="accordion-header">
                <button
                  className="accordion-button"
                  type="button"
                  onClick={handleCardShippingDetails}
                >
                  <p className="mb-0 text-center d-block w-100">
                    Card and Shipping Details
                  </p>
                </button>
              </h2>
            </div>

            {/* if tcStatus != "draft" hide this */}
            {(tcStatus != "draft" && tcStatus != "new") && (
              <>
                {/* Fulfilment */}
                <div
                  className="accordion-item"
                  style={{
                    pointerEvents: tcStatus == "draft" ? "none" : "auto",
                    opacity: tcStatus == "draft" ? "0.5" : "1",
                  }}
                >
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button"
                      type="button"
                      onClick={handleFulfilment}
                    >
                      <p className="mb-0 text-center d-block w-100">
                        Fulfilment
                      </p>
                    </button>
                  </h2>
                </div>
                {/* card assignment */}
                <div
                  className="accordion-item"
                  style={{
                    pointerEvents:
                      tcStatus == "approved" ||
                      tcStatus == "assign_card" ||
                      tcStatus == "shipped"
                        ? "auto"
                        : "none",
                    opacity:
                      tcStatus == "approved" ||
                      tcStatus == "assign_card" ||
                      tcStatus == "shipped"
                        ? "1"
                        : "0.5",
                  }}
                >
                  <h2 className="accordion-header">
                    <button className="accordion-button" type="button" onClick={handleCardAssignment}>
                      <p className="mb-0 text-center d-block w-100">
                        Card Assignment
                      </p>
                    </button>
                  </h2>
                </div>

                {/* Shipment Tracking */}
                <div
                  className="accordion-item"
                  style={{
                    pointerEvents:
                      tcStatus == "assign_card" || tcStatus == "shipped"
                        ? "auto"
                        : "none",
                    opacity:
                      tcStatus == "assign_card" || tcStatus == "shipped"
                        ? "1"
                        : "0.5",
                  }}
                >
                  <h2 className="accordion-header">
                    <button className="accordion-button" type="button" onClick={handleShipment}>
                      <p className="mb-0 text-center d-block w-100">
                        Shipment Tracking
                      </p>
                    </button>
                  </h2>
                </div>
              </>
            )}
            <div
              className="accordion-item"
              style={{
                pointerEvents: "none",
                opacity: "0.5",
              }}
            >
              <h2 className="accordion-header">
                <button className="accordion-button" type="button">
                  <p className="mb-0 text-center d-block w-100"></p>
                </button>
              </h2>
            </div>
          </div>
        </div>
      </section>

      <Sidebar />
      <Footer />
    </>
  );
}

export default Testinformation;
