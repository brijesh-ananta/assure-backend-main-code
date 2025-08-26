import React, { useState, useEffect } from "react";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import Footer from "../../common/Footer";
import { useAuth } from "../../utils/AuthContext";
import Steps from "./Steps";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import axiosToken from "../../utils/axiosToken";

function TCrequest() {
  const [headerTitle] = useState("Test Card Request");
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const environment = location.state?.environment;
  const terminalType = location.state?.terminalType;

  const status = location.state?.status;
  const [tcStatus, setTcStatus] = useState(status);

  const [userData, setUserData] = useState(user);
  const { cardRequestId } = useParams();
  // Persist cardRequestId across sessions

  const environmentMapping = { 1: "Prod", 2: "QA", 3: "Test" };

  const [reqStatus, setReqStatus] = useState("");
  const [requestInfoData, setRequestInfoData] = useState({
    environment: environment,
    terminalType: terminalType,
    requestStatus: "",
    snRequest: "",
    status: "",
    requestForSelf: "",
    email: "",
    requestorName: "",
    snStatusVerify: "",
    partnerName: "",
    partnerContact: "",
    partnerContactEmail: "",
  });

  // Fetch existing RequestorInformation using cardRequestId from the URL
  useEffect(() => {
    if (cardRequestId) {
      const fetchData = async () => {
        try {
          const response = await axiosToken.get(
            `/card-requests/requestor-info/${cardRequestId}`
          );
          let info;
          if (response.data.requestInfoData) {
            if (typeof response.data.requestInfoData === "string") {
              const parsed = JSON.parse(response.data.requestInfoData);
              info = parsed.requestInfoData ? parsed.requestInfoData : parsed;
            } else {
              info = response.data.requestInfoData;
            }
          } else {
            info = response.data;
          }
          info = {
            ...info,
            environment: response.data.environment,
            terminalType: response.data.terminalType || terminalType,
            requestStatus: response.data.requestStatus,
            cardRequestId: response.data.request_id,
            snStatusVerify: response.data.snStatusVerify,
            id: response.data.id,
          };
          setRequestInfoData(info);
          setReqStatus(response.data.requestStatus);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    }
  }, [cardRequestId, environment, terminalType]);

  // Handler for "Requestor for self" radio button change
  const handleRequestForSelfChange = (e) => {
    const value = e.target.value;
    if (value === "approved") {
      setReqStatus("approved");
    } else {
      setReqStatus("draft");
    }
    if (value === "yes") {
      setRequestInfoData({
        ...requestInfoData,
        requestForSelf: "yes",
        email: userData?.email || "",
        requestorName: userData?.name || "",
      });
    } else {
      setRequestInfoData({
        ...requestInfoData,
        requestForSelf: "no",
        email: "",
        requestorName: "",
      });
    }
  };

  // Partner search handler – call partner API to fetch partner details based on partnerName
  const handlePartnerSearch = async () => {
    try {
      // Use the current partnerName from state as the search query
      const query = requestInfoData.partnerName;
      const response = await axiosToken.get(
        `/partners/search/?partnerName=${query}`
      );
      // Assume the response returns an object with a "partner" key containing the partner details.
      setRequestInfoData((prevData) => ({
        ...prevData,
        partnerName: response.data.partner.partner_name || query,
        partnerContactEmail: response.data.partner.email || "",
        partnerContact: response.data.partner.contact_person || "",
      }));
    } catch (error) {
      setRequestInfoData((prevData) => ({
        ...prevData,
        partnerName: "",
        partnerContactEmail: "",
        partnerContact: "",
      }));
      const errorMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        "An error occurred.";
      alert(errorMessage);
      console.error("Error searching for partner:", error);
    }
  };

  // Validate required fields before submitting
  const validateForm = () => {
    if (!requestInfoData.snRequest.trim()) {
      alert("Please enter the SN Request #");
      return false;
    }
    if (!requestInfoData.requestForSelf) {
      alert("Please select whether the request is for self or not");
      return false;
    }
    // When not for self, email and requestor name should be filled manually
    if (requestInfoData.requestForSelf === "no") {
      if (!requestInfoData.email.trim()) {
        alert("Please enter the email address");
        return false;
      }
      if (!requestInfoData.requestorName.trim()) {
        alert("Please enter the requestor name");
        return false;
      }
    }
    if (!requestInfoData.partnerName.trim()) {
      alert("Please enter the partner name");
      return false;
    }
    return true;
  };

  // Submit form data to the server
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      let response;
      if (requestInfoData.id) {
        response = await axiosToken.put(
          `/card-requests/requestor-info/${requestInfoData.id}`,
          requestInfoData
        );
      } else {
        response = await axiosToken.post(
          "/card-requests/requestor-info",
          requestInfoData
        );
      }
      const { cardRequestId, requestorInformationId } = response.data;
      setRequestInfoData((prevData) => ({
        ...prevData,
        cardRequestId: cardRequestId,
        id: requestorInformationId,
      }));
      alert("Requestor Information saved successfully!");
      navigate(`/dashboard/test-card-request/test-info/${cardRequestId}`, {
        state: { environment, terminalType, reqStatus, status: 'draft' },
      });
    } catch (error) {
      //alert error
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert(error.message || "An error occurred.");
      }
      console.error("Error saving Requestor Information:", error);
    }
  };

  //  handleSnStatus
  const handleStatusChange = async (e) => {
    setRequestInfoData({
      ...requestInfoData,
      snStatusVerify: e.target.value,
    });
    // update snStatusVerify
    await axiosToken.put(
      `/card-requests/snStatusVerify/${requestInfoData.id}`,
      { snStatusVerify: e.target.value }
    );

    navigate(`/dashboard/test-card-request/fulfilment/${cardRequestId}`, {
      state: {
        environment,
        terminalType,
        status: tcStatus,
        snVerify: e.target.value,
      },
    });
  };

  const handleTestInfo = () => {
    navigate(`/dashboard/test-card-request/test-info/${cardRequestId}`, {
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

      <Steps requestId={cardRequestId} environment={environment} terminalType={terminalType} />

      <section>
        <div className="notification pb-6 overflow-hidden p-0 accordin-stepform">
          <div className="accordion mb-3" id="accordionExample">
            {/* Requestor Information */}
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingOne">
                <button className="accordion-button" type="button">
                  <p className="mb-0 text-center d-block w-100">
                    Requestor Information
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
                    <form onSubmit={handleSave}>
                      {/* Service Now Request Status */}
                      <div className="form-field-wrapper">
                        <div className="d-lg-flex justify-content-lg-between justify-content-lg-start justify-content-center align-items-center stepform mb-lg-4 mb-3">
                          <span className="d-block text-lg-start text-center">
                            Service Now Request Status
                          </span>
                          {/* if status draft */}
                          {tcStatus != "draft" && (
                            <div className="form-check d-flex align-items-center justify-content-center gap-2 formcard">
                              <label
                                className="form-check-label"
                                htmlFor="flexRadioDefault1"
                              >
                                SN Status verified
                              </label>
                              <input
                                className="form-check-input float-none m-0"
                                type="radio"
                                value={"1"}
                                checked={requestInfoData.snStatusVerify == "1"}
                                onChange={handleStatusChange}
                                name="snStatusVerify"
                                id="snStatusVerify"
                              />
                            </div>
                          )}
                        </div>
                        <div className="login-page mb-lg-4 mb-2 d-lg-flex align-items-end border-bottom pb-4">
                          <div className="col-12 col-lg-3 me-lg-4 me-0">
                            <div className="d-lg-flex align-items-center">
                              <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                                SN Request #
                              </label>
                              <input
                                name="snRequest"
                                placeholder="XYZ1234"
                                type="text"
                                className="form-control formcontrol"
                                value={requestInfoData.snRequest}
                                onChange={(e) =>
                                  setRequestInfoData({
                                    ...requestInfoData,
                                    snRequest: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="col-12 col-lg-6 d-lg-flex align-items-center justify-content-start">
                            <span className="me-lg-5 font">Status</span>
                            <div className="d-lg-flex formcard">
                              <div className="form-check me-3 d-flex gap-4 align-items-center">
                                <input
                                  name="status"
                                  className="form-check-input"
                                  type="radio"
                                  value="approved"
                                  checked={
                                    requestInfoData.status === "approved"
                                  }
                                  onChange={(e) =>
                                    setRequestInfoData({
                                      ...requestInfoData,
                                      status: e.target.value,
                                    })
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="statusApproved"
                                >
                                  Approved
                                </label>
                              </div>
                              <div className="form-check me-3 d-flex gap-4 align-items-center">
                                <input
                                  name="status"
                                  className="form-check-input"
                                  type="radio"
                                  value="draft"
                                  checked={requestInfoData.status === "draft"}
                                  onChange={(e) =>
                                    setRequestInfoData({
                                      ...requestInfoData,
                                      status: e.target.value,
                                    })
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor="statusDraft"
                                >
                                  DRAFT
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Requestor Details */}
                      <div className="form-field-wrapper">
                        <div className="d-lg-flex justify-content-lg-between justify-content-lg-start justify-content-center align-items-center stepform mb-lg-4 mb-3">
                          <span className="d-block text-lg-start text-center">
                            Requestor details
                          </span>
                        </div>
                        <div className="border-bottom pb-4 mb-lg-4 mb-2 ms-lg-5">
                          <div className="login-page mb-lg-4 mb-2 d-lg-flex align-items-end">
                            <div className="col-12 col-lg-3 d-lg-flex align-items-center justify-content-start">
                              <span className="me-lg-5 font">
                                Requestor for self
                              </span>
                              <div className="d-lg-flex formcard">
                                <div className="form-check me-3 d-flex gap-4 align-items-center">
                                  <input
                                    name="requestForSelf"
                                    className="form-check-input"
                                    type="radio"
                                    value="yes"
                                    checked={
                                      requestInfoData.requestForSelf === "yes"
                                    }
                                    onChange={handleRequestForSelfChange}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="requestForSelfYes"
                                  >
                                    Yes
                                  </label>
                                </div>
                                <div className="form-check me-3 d-flex gap-4 align-items-center">
                                  <input
                                    name="requestForSelf"
                                    className="form-check-input"
                                    type="radio"
                                    value="no"
                                    checked={
                                      requestInfoData.requestForSelf === "no"
                                    }
                                    onChange={handleRequestForSelfChange}
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="requestForSelfNo"
                                  >
                                    No
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="col-12 col-lg-3 me-lg-4 me-0">
                              <div className="d-lg-flex align-items-center">
                                <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2">
                                  Email:
                                </label>
                                <div className="position-relative w-100">
                                  <input
                                    name="email"
                                    placeholder="Enter email"
                                    type="email"
                                    className="form-control formcontrol"
                                    value={requestInfoData.email}
                                    onChange={(e) =>
                                      setRequestInfoData({
                                        ...requestInfoData,
                                        email: e.target.value,
                                      })
                                    }
                                    disabled={
                                      requestInfoData.requestForSelf === "yes"
                                    }
                                  />
                                  <img
                                    className="postiop"
                                    src="/images/search.svg"
                                    alt="search icon"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="col-12 col-lg-6 d-lg-flex align-items-center justify-content-start">
                              <span className="me-3 font">Past Requests #</span>
                              <p className="m-0">001</p>
                            </div>
                          </div>
                          <div className="col-12 col-lg-4 me-lg-4 me-0">
                            <div className="d-lg-flex align-items-center gap-5">
                              <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2">
                                Requestor Name
                              </label>
                              <input
                                name="requestorName"
                                placeholder="John Doe"
                                type="text"
                                className="form-control formcontrol flex-grow-1 flex-shrink-0"
                                value={requestInfoData.requestorName}
                                onChange={(e) =>
                                  setRequestInfoData({
                                    ...requestInfoData,
                                    requestorName: e.target.value,
                                  })
                                }
                                disabled={
                                  requestInfoData.requestForSelf === "yes"
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Testing Partner Information */}
                      <div className="form-field-wrapper">
                        <div className="d-lg-flex justify-content-lg-between justify-content-lg-start justify-content-center align-items-center stepform mb-lg-4 mb-3">
                          <span className="d-block text-lg-start text-center">
                            Testing Partner Information
                          </span>
                        </div>
                        <div className="login-page mb-lg-4 mb-2 d-lg-flex align-items-end ms-lg-5">
                          <div className="col-12 col-lg-6 me-lg-4 me-0">
                            <div className="d-lg-flex align-items-center">
                              <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2">
                                Partner Name
                              </label>
                              <div className="position-relative w-100">
                                <input
                                  name="partnerName"
                                  placeholder="Partner Name"
                                  type="text"
                                  className="form-control formcontrol"
                                  value={requestInfoData.partnerName}
                                  onChange={(e) =>
                                    setRequestInfoData({
                                      ...requestInfoData,
                                      partnerName: e.target.value,
                                    })
                                  }
                                />
                                {/* Clicking the search icon triggers partner API search */}
                                <img
                                  className="postiop"
                                  src="/images/search.svg"
                                  alt="search icon"
                                  style={{ cursor: "pointer" }}
                                  onClick={handlePartnerSearch}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-12 col-lg-6 d-lg-flex align-items-center justify-content-start">
                            <span className="me-3 font">Past Requests #</span>
                            <p className="m-0">001</p>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-lg-6 ms-lg-5">
                            <ul className="list-unstyled d-lg-flex justify-content-between font-fw">
                              <li>
                                Partner Contact:{" "}
                                <span>
                                  {requestInfoData.partnerContact || "N/A"}
                                </span>
                              </li>
                              <li>
                                Contact Email:{" "}
                                <span>
                                  {requestInfoData.partnerContactEmail || "N/A"}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="btn-section col-12 d-flex justify-content-end">
                        {/* tc status draft, active, inactive */}
                        {/* tcStatus */}
                        {(tcStatus == "draft" || tcStatus == "new") && (
                          <>
                            <a
                              onClick={handleSave}
                              className="btn-add colorgreen"
                              style={{ cursor: "pointer" }}
                            >
                              Save Requestor
                            </a>
                          </>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            {/* Test details */}
                    {/* if status new disable  */}
            <div
              className="accordion-item"
                        
              style={{
                pointerEvents: tcStatus == "new" ? "none" : "auto",
                opacity: tcStatus == "new" ? "0.5" : "1",
                cursor: tcStatus == "new" ? "not-allowed" : "pointer",
              }}
            >
              <h2 className="accordion-header">
                <button
                  className="accordion-button"
                  type="button"
                  onClick={handleTestInfo}
                >
                  <p className="mb-0 text-center d-block w-100">
                    Test Information
                  </p>
                </button>
              </h2>
            </div>
            {/* terminal details */}
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button"
                  type="button"
                  style={{
                    pointerEvents: tcStatus == "new" ? "none" : "auto",
                    opacity: tcStatus == "new" ? "0.5" : "1",
                    cursor: tcStatus == "new" ? "not-allowed" : "pointer",
                  }}
                  onClick={handleTerminalDetails}
                >
                  <p className="mb-0 text-center d-block w-100">
                    Terminal Details
                  </p>
                </button>
              </h2>
            </div>

            {/* Card and Shipping Details */}
            <div
              className="accordion-item"
              style={{
                pointerEvents: tcStatus == "new" ? "none" : "auto",
                opacity: tcStatus == "new" ? "0.5" : "1",
                cursor: tcStatus == "new" ? "not-allowed" : "pointer",
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
            {tcStatus != "draft" && tcStatus != "new" && (
              <>
                {/* Fulfilment */}
                <div
                  className="accordion-item"
                  style={{
                    pointerEvents:
                      tcStatus == "draft" || tcStatus == "new"
                        ? "none"
                        : "auto",
                    opacity:
                      tcStatus == "draft" || tcStatus == "new" ? "0.5" : "1",
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
                {/* Card Assignment */}
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
                    <button
                      className="accordion-button"
                      type="button"
                      onClick={handleCardAssignment}
                    >
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
                    <button
                      className="accordion-button"
                      type="button"
                      onClick={handleShipment}
                    >
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

export default TCrequest;
