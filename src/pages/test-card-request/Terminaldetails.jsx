import React, { useState, useEffect } from "react";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import Footer from "../../common/Footer";
import { useAuth } from "../../utils/AuthContext";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import axiosToken from "../../utils/axiosToken";
import { environmentMapping } from "../../utils/constent";
function Terminaldetails() {
  const [headerTitle] = useState("Test Card Request");
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const environment = location.state?.environment;
  const terminalType = location.state?.terminalType;
  const reqStatus = location.state?.reqStatus;
  const { cardRequestId } = useParams();
  const status = location.state?.status;
  const [tcStatus, setTcStatus] = useState(status);
  // Persist cardRequestId across sessions

  const handleRequest = () => {
    navigate(`/dashboard/test-card-request/requestor-info/${cardRequestId}`, {
      state: { environment, terminalType, status: tcStatus },
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

  const [terminalData, setTerminalData] = useState({
    request_id: cardRequestId || "",
    terminalType: terminalType || "",
    testingScope: "",
    paymentTechnology: "",
    pinEntryCapability: "",
    routesToDebitNet: "",
    cashbackPIN: "",
    id: "", // To track updates
  });

  // Fetch existing data if available
  useEffect(() => {
    if (cardRequestId) {
      axiosToken
        .get(`/card-requests/terminal-info/${cardRequestId}`)
        .then((response) => {
          let data = response.data;

          // Parse terminalInformation JSON if exists
          if (data.terminalInformation) {
            try {
              const parsedInfo = JSON.parse(data.terminalInformation);
              data = { ...parsedInfo, id: data.id }; // Extract relevant data & ID
            } catch (error) {
              console.error("Error parsing terminalInformation:", error);
            }
          }

          // Update state with fetched data
          setTerminalData({
            request_id: data.request_id || cardRequestId,
            terminalType: data.terminalType || "",
            testingScope: data.testingScope || "",
            paymentTechnology: data.paymentTechnology || "",
            pinEntryCapability: data.pinEntryCapability || "",
            routesToDebitNet: data.routesToDebitNet || "",
            cashbackPIN: data.cashbackPIN || "",
            id: data.id || "",
          });
        })
        .catch((error) => {
          console.error("Error fetching terminal details:", error);
        });
    }
  }, [cardRequestId]);

  const handleChange = (e) => {
    setTerminalData({
      ...terminalData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;

      if (terminalData.id) {
        // Update existing record
        response = await axiosToken.put(
          `/card-requests/terminal-info/${terminalData.id}`,
          terminalData
        );
      } else {
        // Create new record
        response = await axiosToken.post(
          "/card-requests/terminal-info",
          terminalData
        );
      }

      const { id } = response.data;
      setTerminalData((prevData) => ({
        ...prevData,
        id,
      }));

      alert("Terminal details saved successfully!");

      // Navigate to the next step
      navigate(
        `/dashboard/test-card-request/card-shipping-details/${cardRequestId}`,
        {
          state: { environment, terminalType, reqStatus, status: tcStatus },
        }
      );
    } catch (error) {
      console.error("Error saving terminal details:", error);
      alert(error.response?.data?.error || "An error occurred.");
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
              <li
                className="d-flex flex-column justify-content-center align-items-center"
                style={{ cursor: "pointer" }}
                onClick={handleTestInfo}
              >
                <span className="activebg"></span>Test Information
              </li>
              <li
                className="d-flex flex-column justify-content-center align-items-center"
                style={{ cursor: "pointer" }}
                onClick={handleTerminalDetails}
              >
                <span className="activebg"></span>Terminal Details
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
                  onClick={handleRequest}
                  style={{
                    pointerEvents: "auto",
                    opacity: 1,
                  }}
                >
                  <p className="mb-0 text-center d-block w-100">
                    Requestor Information
                  </p>
                </button>
              </h2>
            </div>

            <div className="accordion-item ">
              <h2 className="accordion-header">
                <button
                  className="accordion-button"
                  type="button"
                  onClick={handleTestInfo}
                  style={{
                    pointerEvents: "auto",
                    opacity: 1,
                  }}
                >
                  <p className="mb-0 text-center d-block w-100">
                    Test Information
                  </p>
                </button>
              </h2>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header">
                <button className="accordion-button" type="button">
                  <p className="mb-0 text-center d-block w-100">
                    Terminal Details
                  </p>
                </button>
              </h2>
              <div
                id="collapseOne"
                className="accordion-collapse collapse show"
              >
                <div className="accordion-body">
                  <div className="container-fluid">
                    <form>
                      <div className="form-field-wrapper">
                        <div className="login-page mb-lg-4 mb-2 d-lg-flex align-items-end">
                          <div className="col-12 col-lg-6 d-lg-flex align-items-center justify-content-start">
                            <div className="d-lg-flex ms-lg-5 align-ite">
                              <span className="me-lg-0 font mb-lg-3 flexgrow34 flex-shrink-0">
                                Terminal Type
                              </span>

                              <div className="d-lg-flex formcard gap-5">
                                {[
                                  "Transit",
                                  "AFD",
                                  "ATM",
                                  "Attended POS",
                                  "TOM/SoftPOS",
                                  "Unattended POS",
                                ].map((type) => (
                                  <div
                                    key={type}
                                    className="form-check me-3 d-flex align-items-center flex-column"
                                  >
                                    <input
                                      className="form-check-input ms-0 me-0 mb-2"
                                      type="radio"
                                      name="terminalType"
                                      value={type}
                                      checked={
                                        terminalData.terminalType === type
                                      }
                                      onChange={handleChange}
                                    />
                                    <label className="form-check-label">
                                      {type}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="form-field-wrapper ms-lg-5">
                        <div className="login-page mb-lg-4 mb-2 d-lg-flex align-items-end">
                          <div className="col-12 col-lg-3 d-lg-flex align-items-center justify-content-start">
                            <span className="font f flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 flexgrow34">
                              Testing Scope
                            </span>

                            <div className="d-lg-flex formcard gap-4">
                              {["Contact", "Contactless", "Both"].map(
                                (scope) => (
                                  <div
                                    key={scope}
                                    className="form-check me-3 d-flex gap-4 align-items-center"
                                  >
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name="testingScope"
                                      value={scope}
                                      checked={
                                        terminalData.testingScope === scope
                                      }
                                      onChange={handleChange}
                                    />
                                    <label className="form-check-label">
                                      {scope}
                                    </label>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="login-page mb-lg-4 mb-2 d-lg-flex align-items-end">
                          <div className="col-12 col-lg-3 d-lg-flex align-items-center justify-content-start">
                            <span className="font f flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 flexgrow34">
                              Payment Technology
                            </span>

                            <div className="d-lg-flex formcard flex100 gap-4">
                              {["Spec 1", "Spec 2"].map((spec) => (
                                <div
                                  key={spec}
                                  className="form-check me-3 d-flex gap-4 align-items-center"
                                >
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="paymentTechnology"
                                    value={spec}
                                    checked={
                                      terminalData.paymentTechnology === spec
                                    }
                                    onChange={handleChange}
                                  />
                                  <label className="form-check-label">
                                    {spec}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="login-page mb-lg-4 mb-2 d-lg-flex align-items-end">
                          <div className="col-12 col-lg-3 d-lg-flex align-items-center justify-content-start">
                            <span className="font f flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 flexgrow34">
                              PIN Entry Capability
                            </span>

                            <div className="d-lg-flex formcard flex100 gap-4">
                              {["Yes", "No"].map((option) => (
                                <div
                                  key={option}
                                  className="form-check me-3 d-flex gap-4 align-items-center"
                                >
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="pinEntryCapability"
                                    value={option}
                                    checked={
                                      terminalData.pinEntryCapability === option
                                    }
                                    onChange={handleChange}
                                  />
                                  <label className="form-check-label">
                                    {option}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="login-page mb-lg-4 mb-2 d-lg-flex align-items-end">
                          <div className="col-12 col-lg-3 d-lg-flex align-items-center justify-content-start">
                            <span className="font f flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 flexgrow34">
                              Routes XX-D to Debit Net
                            </span>

                            <div className="d-lg-flex formcard flex100 gap-4">
                              {["Net1", "Other"].map((route) => (
                                <div
                                  key={route}
                                  className="form-check me-3 d-flex gap-4 align-items-center"
                                >
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="routesToDebitNet"
                                    value={route}
                                    checked={
                                      terminalData.routesToDebitNet === route
                                    }
                                    onChange={handleChange}
                                  />
                                  <label className="form-check-label">
                                    {route}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="login-page mb-lg-4 mb-2 d-lg-flex align-items-end">
                          <div className="col-12 col-lg-3 d-lg-flex align-items-center justify-content-start">
                            <span className="font f flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 flexgrow34">
                              Cashback PIN
                            </span>

                            <div className="d-lg-flex formcard flex100 gap-4">
                              {["Yes", "No"].map((option) => (
                                <div
                                  key={option}
                                  className="form-check me-3 d-flex gap-4 align-items-center"
                                >
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="cashbackPIN"
                                    value={option}
                                    checked={
                                      terminalData.cashbackPIN === option
                                    }
                                    onChange={handleChange}
                                  />
                                  <label className="form-check-label">
                                    {option}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="btn-section col-12 d-flex justify-content-end">
                        {tcStatus === "draft" && (
                          <>
                            <a
                              className="btn-add colorgreen"
                              style={{ cursor: "pointer" }}
                              onClick={handleSubmit}
                            >
                              Save Terminal Details
                            </a>
                          </>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="accordion-item"
              style={{
                pointerEvents: "auto",
                opacity: 1,
              }}
            >
              <h2 className="accordion-header">
                <button className="accordion-button" type="button" onClick={handleCardShippingDetails}>
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
                      tcStatus == "assign_card" ||
                      tcStatus == "shipped"
                        ? "auto"
                        : "none",
                    opacity:
                      tcStatus == "assign_card" ||
                      tcStatus == "shipped"
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

export default Terminaldetails;
