import React, { useState, useEffect } from "react";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import Footer from "../../common/Footer";
import { useAuth } from "../../utils/AuthContext";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import axiosToken from "../../utils/axiosToken";
import { environmentMapping } from "../../utils/constent";
function Fullfilment() {
  const [headerTitle] = useState("Test Card Fulfilment");
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const environment = location.state?.environment;
  const terminalType = location.state?.terminalType;
  const reqStatus = location.state?.reqStatus;
  const snVerify = location.state?.snVerify;

  const { cardRequestId } = useParams();
  const status = location.state?.status;
  const [tcStatus, setTcStatus] = useState(status);

  const [snStatusVerify, setSnStatusVerify] = useState("");

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

  //handleShipment
  const handleShipment = () => {
    navigate(`/dashboard/test-card-request/shipment/${cardRequestId}`, {
      state: { environment, terminalType, status: tcStatus },
    });
  };

  // handleCardAssignment
  const handleCardAssignment = () => {
    navigate(`/dashboard/test-card-request/assignment/${cardRequestId}`, {
      state: { environment, terminalType, status: tcStatus },
    });
  };

  const [fulfilmentData, setFulfilmentData] = useState({
    tcsmeComments: "",
    status: "",
    id: "", // To track updates
  });

  // Fetch existing data if available
  useEffect(() => {
    if (cardRequestId) {
      const fetchData = async () => {
        try {
          const response = await axiosToken.get(
            `/card-requests/${cardRequestId}`
          );
          setFulfilmentData(response.data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();

      const fetchReqData = async () => {
        try {
          const responseReq = await axiosToken.get(
            `/card-requests/requestor-info/${cardRequestId}`
          );

          const requestInfoData = responseReq.data;
          setSnStatusVerify(requestInfoData.snStatusVerify);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchReqData();
    }
  }, [cardRequestId, environment, terminalType]);

  // Handle input change.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFulfilmentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!fulfilmentData.tcsmeComments) {
      errors.tcsmeComments = "TCSME Comments field is required.";
    }
    // here check status must be returned or approved otherwise error
    if (
      fulfilmentData.status != "returned" &&
      fulfilmentData.status != "approved"
    ) {
      errors.status = "Status field is required.";
    }

    return errors;
  };

  // Handle form submission.

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      // There are errors, construct an alert message
      let errorMessage = "Please correct the following errors:\n";
      Object.entries(errors).forEach(([key, value]) => {
        errorMessage += `${value}\n`;
      });
      alert(errorMessage);
      return;
    }

    if (snStatusVerify != "1") {
      alert("Please verify SN status.");
      return;
    }
    // pass status as approved
    //fulfilmentData.status = "approved";
    fulfilmentData.snStatusVerify = "1";
    try {
      const response = await axiosToken.put(
        `/card-requests/${cardRequestId}`,
        fulfilmentData
      );
      alert(response.data.message);
      setTcStatus(response.data.status);
      if (response.data.status == "approved") {
        navigate(`/dashboard/test-card-request/assignment/${cardRequestId}`, {
          state: { environment, terminalType, status: "approved" },
        });
      } else if (response.data.status == "returned") {
        navigate(`/dashboard/request-history`, {
          state: { environment, terminalType, status: "returned" },
        });
      }
    } catch (error) {
      alert(
        (error.response && error.response.data && error.response.data.error) ||
          error.message ||
          "An error occurred."
      );
      console.error("Error updating data:", error);
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
                onClick={
                  terminalType === "pos" || terminalType === "Pos"
                    ? handleTerminalDetails
                    : ""
                }
                style={{
                  cursor:
                    terminalType === "pos" || terminalType === "Pos"
                      ? "pointer"
                      : "",
                }}
              >
                <span
                  className={
                    terminalType === "pos" || terminalType === "Pos"
                      ? "activebg"
                      : "arrow-blocked"
                  }
                ></span>
                Terminal Details
              </li>
              <li className="d-flex flex-column justify-content-center align-items-center">
                <span
                  className="activebg"
                  style={{ cursor: "pointer" }}
                  onClick={handleCardShippingDetails}
                ></span>
                Shipping Details
              </li>
              <li className="d-flex flex-column justify-content-center align-items-center">
                <span className="activebg"></span>Submitted
              </li>
              <li className="d-flex flex-column justify-content-center align-items-center">
                <span
                  className={
                    tcStatus == "approved" || tcStatus == "assign_card"
                      ? "activebg"
                      : ""
                  }
                ></span>
                Approved
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
                    pointerEvents: tcStatus == "draft" ? "none" : "auto",
                    opacity: tcStatus == "draft" ? "0.5" : "1",
                  }}
                >
                  <p className="mb-0 text-center d-block w-100">
                    Requestor Information
                  </p>
                </button>
              </h2>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button"
                  type="button"
                  onClick={handleTestInfo}
                  style={{
                    pointerEvents: tcStatus == "draft" ? "none" : "auto",
                    opacity: tcStatus == "draft" ? "0.5" : "1",
                  }}
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
                    pointerEvents:
                      (terminalType == "pos" || terminalType == "Pos") &&
                      tcStatus != "draft"
                        ? "auto"
                        : "none",
                    cursor:
                      (terminalType == "pos" || terminalType == "Pos") &&
                      tcStatus != "draft"
                        ? "pointer"
                        : "none",
                    opacity:
                      (terminalType == "pos" || terminalType == "Pos") &&
                      tcStatus != "draft"
                        ? 1
                        : 0.5,
                  }}
                  onClick={
                    (terminalType == "pos" || terminalType == "Pos") &&
                    tcStatus != "draft"
                      ? handleTerminalDetails
                      : null // It's better to use `null` than an empty string for no operation
                  }
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
                pointerEvents: tcStatus == "draft" ? "none" : "auto",
                opacity: tcStatus == "draft" ? "0.5" : "1",
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
            {tcStatus != "draft" && (
              <>
                {/* Fulfilment */}
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button" type="button">
                      <p className="mb-0 text-center d-block w-100">
                        Fulfilment
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
                              <div className="col-12 col-lg-9 me-lg-4 me-0">
                                <div className="d-lg-flex align-items-center">
                                  <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                                    TC SME Comment
                                  </label>
                                  <input
                                    placeholder="TC SME Comment"
                                    type="text"
                                    value={fulfilmentData?.tcsmeComments || ""}
                                    onChange={handleChange}
                                    name="tcsmeComments"
                                    className="form-control formcontrol"
                                    style={{ width: "100%" }}
                                  />
                                </div>
                              </div>
                              <div className="col-12 col-lg-9 me-lg-4 me-0">
                                <div className="d-lg-flex align-items-center formcard">
                                  <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                                    Status
                                  </label>
                                  {/* radio button */}
                                  <div className="form-check form-check-inline">
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name="status"
                                      id="inlineRadio1"
                                      value="approved"
                                      checked={
                                        fulfilmentData.status === "approved" ||
                                        fulfilmentData.status ==
                                          "assign_card" ||
                                        fulfilmentData.status == "shipped"
                                      }
                                      onChange={handleChange}
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor="inlineRadio1"
                                    >
                                      Approved
                                    </label>
                                  </div>
                                  <div className="form-check form-check-inline">
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name="status"
                                      id="inlineRadio2"
                                      value="returned"
                                      checked={
                                        fulfilmentData.status === "returned"
                                      }
                                      onChange={handleChange}
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor="inlineRadio2"
                                    >
                                      Rejected
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="btn-section col-12 d-flex justify-content-end">
                            {tcStatus == "submitted" && (
                              <>
                                <a
                                  className="btn-add d-flex align-items-center gap-1"
                                  style={{ cursor: "pointer" }}
                                  onClick={handleSubmit}
                                >
                                  Submit Status
                                </a>
                              </>
                            )}
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
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

export default Fullfilment;
