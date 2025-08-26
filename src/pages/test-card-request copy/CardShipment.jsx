import React, { useState, useEffect } from "react";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import Footer from "../../common/Footer";
import { useAuth } from "../../utils/AuthContext";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import axiosToken from "../../utils/axiosToken";
import { encryptData, decryptData } from "../../utils/cryptoUtils"; // Adjust the import path as needed

function CardShipment() {
  const [headerTitle] = useState("Test Card Fulfilment");
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const environment = location.state?.environment;
  const terminalType = location.state?.terminalType;
  const reqStatus = location.state?.reqStatus;
  const { cardRequestId } = useParams();
  const status = location.state?.status;
  const [tcStatus, setTcStatus] = useState(status);
  const environmentMapping = { 1: "Prod", 2: "QA", 3: "Test" };

  // Navigation handlers
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
  const handleCardShippingDetails = () => {
    navigate(
      `/dashboard/test-card-request/card-shipping-details/${cardRequestId}`,
      {
        state: { environment, terminalType, status: tcStatus },
      }
    );
  };
  const handleFulfilment = () => {
    navigate(`/dashboard/test-card-request/fulfilment/${cardRequestId}`, {
      state: { environment, terminalType, status: tcStatus },
    });
  };
  const handleAssigned = () => {
    navigate(`/dashboard/test-card-request/assignment/${cardRequestId}`, {
      state: { environment, terminalType, status: tcStatus },
    });
  };

  const [cardType, setCardType] = useState(1);
  const [numTesters, setNumTesters] = useState(1);
  const [numPartners, setNumPartners] = useState(1);
  const [shipTo, setShipTo] = useState("one"); // 'one', 'multiple', 'mobile'
  const [testerDetails, setTesterDetails] = useState([]);
  const [cardDetails, setCardDetails] = useState([]);
  const [issuerOptions, setIssuerOptions] = useState({});
  const [vaultCounts, setVaultCounts] = useState({});
  const [shippingDetails, setShippingDetails] = useState({});

  const [addressDetails, setAddressDetails] = useState([
    { id: 1, unit: "", city: "", state: "", country: "" },
  ]);

  // Update table rows based on selected card type
  useEffect(() => {
    const rows = Array.from({ length: cardType }, (_, index) => ({
      id: index + 1,
      specialFeature: "",
      product: "",
      domesticGlobal: "",
      issuer: "",
      quantity: 1,
      vault: vaultCounts?.[index] !== undefined ? vaultCounts[index] : "0",
    }));
    setCardDetails(rows);
  }, [cardType]);

  // Update tester inputs based on the number of testers selected
  useEffect(() => {
    const testers = Array.from({ length: numTesters }, (_, index) => ({
      id: index + 1,
      name: "",
      email: "",
      card: "",
    }));
    setTesterDetails(testers);
  }, [numTesters]);

  // Update address inputs based on the number of partners selected (for multiple addresses)
  useEffect(() => {
    if (shipTo === "multiple") {
      const addresses = Array.from({ length: numPartners }, (_, index) => ({
        id: index + 1,
        unit: "",
        city: "",
        state: "",
        country: "",
      }));
      setAddressDetails(addresses);
    } else {
      setAddressDetails([
        { id: 1, unit: "", city: "", state: "", country: "" },
      ]);
    }
  }, [numPartners, shipTo]);

  const handleTesterChange = (index, field, value) => {
    const updatedTesters = [...testerDetails];
    updatedTesters[index][field] = value;
    setTesterDetails(updatedTesters);
  };

  const handleAddressChange = (index, field, value) => {
    const updatedAddresses = [...addressDetails];
    updatedAddresses[index][field] = value;
    setAddressDetails(updatedAddresses);
  };

  useEffect(() => {
    if (cardRequestId) {
      axiosToken
        .get(`/card-requests/shipping-details/${cardRequestId}`)
        .then((response) => {
          if (response.data && response.data.shippingDetails) {
            try {
              // Parse the shippingDetails JSON
              const parsedDetails = JSON.parse(response.data.shippingDetails);

              setShippingDetails(response.data || null);
              // Update state with API response data
              setCardType(parsedDetails.cardType || 1);
              setNumTesters(parsedDetails.numTesters || 1);
              setShipTo(parsedDetails.shipTo || "one");
              setCardDetails(parsedDetails.cardDetails || []);
              setTesterDetails(parsedDetails.testerDetails || []);
              setAddressDetails(parsedDetails.addressDetails || []);
            } catch (error) {
              console.error("Error parsing shipping details:", error);
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching shipping details:", error);
        });
    }
  }, [cardRequestId]);

  //   binProduct, feature, region, environment
  const fetchIssuers = async (
    index,
    specialFeature,
    product,
    domesticGlobal
  ) => {
    if (!specialFeature || !product || !domesticGlobal || !environment) return;

    try {
      const response = await axiosToken.get(`/cards/list`, {
        params: {
          binProduct: product,
          feature: specialFeature,
          region: domesticGlobal,
          environment: environment,
        },
      });

      const issuers = response.data.map(({ issuerId, issuerName }) => ({
        id: issuerId,
        name: issuerName,
      }));

      const vaultCount = response.data.length; // Count the number of records

      // Use functional update to ensure correct state updates
      setIssuerOptions((prev) => ({
        ...prev,
        [index]: issuers,
      }));

      setVaultCounts((prev) => ({
        ...prev,
        [index]: vaultCount,
      }));
    } catch (error) {
      console.error("Error fetching issuers:", error);

      setIssuerOptions((prev) => ({
        ...prev,
        [index]: [],
      }));

      setVaultCounts((prev) => ({
        ...prev,
        [index]: 0,
      }));
    }
  };

  const handleCardChange = (index, field, value) => {
    const updatedCards = [...cardDetails];
    updatedCards[index][field] = value;
    setCardDetails(updatedCards);

    if (["specialFeature", "product", "domesticGlobal"].includes(field)) {
      const { specialFeature, product, domesticGlobal } = updatedCards[index];
      fetchIssuers(
        index,
        field === "specialFeature" ? value : specialFeature,
        field === "product" ? value : product,
        field === "domesticGlobal" ? value : domesticGlobal
      );
    }
  };

  const validateForm = () => {
    if (cardDetails.length === 0) {
      alert("At least one card is required.");
      return false;
    }

    for (const card of cardDetails) {
      if (
        !card.specialFeature ||
        !card.product ||
        !card.domesticGlobal ||
        !card.issuer
      ) {
        alert("Please fill all required fields in the card details.");
        return false;
      }
    }

    if (
      shipTo != "mobile" &&
      addressDetails.some(
        (addr) => !addr.unit || !addr.city || !addr.state || !addr.country
      )
    ) {
      alert("Please complete all address fields.");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return; // Stop if validation fails

    if (reqStatus == "draft") {
      alert("Service request is in draft state.");
      return;
    }

    const formData = {
      cardType,
      numTesters,
      request_id: cardRequestId,
      cardDetails,
      testerDetails,
      shipTo,
      addressDetails: shipTo === "mobile" ? [] : addressDetails,
      status: "Submitted", // Set status to "Submitted"
    };

    try {
      let response;
      if (shippingDetails.id) {
        //  put request id in status
        response = await axiosToken.put(
          `/card-requests/shipping-details/${shippingDetails.id}`,
          formData
        );
      } else {
        response = await axiosToken.post(
          `/card-requests/shipping-details/`,
          formData
        );
      }
      const { id } = response.data;
      setShippingDetails({ id, ...formData });
      // put request id in status
      alert("Shipping details submitted successfully!");

      navigate(`/dashboard/request-history`);
    } catch (error) {
      console.error("Error submitting shipping details:", error);
      alert("Failed to submit shipping details.");
    }
  };
  return (
    <>
      <Header headerTitle={headerTitle} />
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
                <span
                  className="activebg"
                  style={{ cursor: "pointer" }}
                  onClick={handleFulfilment}
                ></span>
                Submitted
              </li>
              <li className="d-flex flex-column justify-content-center align-items-center">
                <span
                  className="activebg"
                  style={{ cursor: "pointer" }}
                  onClick={handleFulfilment}
                ></span>
                Approved
              </li>
              <li className="d-flex flex-column justify-content-center align-items-center">
                <span
                  className="activebg"
                  style={{ cursor: "pointer" }}
                  onClick={handleAssigned}
                ></span>
                Assigned
              </li>
              <li className="d-flex flex-column justify-content-center align-items-center">
                <span className="activebg"></span>Shipped
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
                    pointerEvents: tcStatus === "draft" ? "none" : "auto",
                    opacity: tcStatus === "draft" ? "0.5" : "1",
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
                    pointerEvents: tcStatus === "draft" ? "none" : "auto",
                    opacity: tcStatus === "draft" ? "0.5" : "1",
                  }}
                >
                  <p className="mb-0 text-center d-block w-100">
                    Test Information
                  </p>
                </button>
              </h2>
            </div>

            {/* Terminal Details */}
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button"
                  type="button"
                  style={{
                    pointerEvents:
                      (terminalType === "pos" || terminalType === "Pos") &&
                      tcStatus !== "draft"
                        ? "auto"
                        : "none",
                    cursor:
                      (terminalType === "pos" || terminalType === "Pos") &&
                      tcStatus !== "draft"
                        ? "pointer"
                        : "none",
                    opacity:
                      (terminalType === "pos" || terminalType === "Pos") &&
                      tcStatus !== "draft"
                        ? 1
                        : 0.5,
                  }}
                  onClick={
                    (terminalType === "pos" || terminalType === "Pos") &&
                    tcStatus !== "draft"
                      ? handleTerminalDetails
                      : null
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
                pointerEvents: tcStatus === "draft" ? "none" : "auto",
                opacity: tcStatus === "draft" ? "0.5" : "1",
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

            {tcStatus !== "draft" && (
              <>
                {/* Fulfilment */}
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button"
                      type="button"
                      style={{
                        pointerEvents:
                          tcStatus === "submitted" ||
                          tcStatus === "approved" ||
                          tcStatus === "assign_card" ||
                          tcStatus === "shipped"
                            ? "auto"
                            : "none",
                        opacity:
                          tcStatus === "submitted" ||
                          tcStatus === "approved" ||
                          tcStatus === "assign_card" ||
                          tcStatus === "shipped"
                            ? "1"
                            : "0.5",
                      }}
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
                      tcStatus === "approved" ||
                      tcStatus === "assign_card" ||
                      tcStatus === "shipped"
                        ? "auto"
                        : "none",
                    opacity:
                      tcStatus === "approved" ||
                      tcStatus === "assign_card" ||
                      tcStatus === "shipped"
                        ? "1"
                        : "0.5",
                  }}
                >
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button"
                      type="button"
                      onClick={handleAssigned}
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
                      tcStatus === "assign_card" || tcStatus === "shipped"
                        ? "auto"
                        : "none",
                    opacity:
                      tcStatus === "assign_card" || tcStatus === "shipped"
                        ? "1"
                        : "0.5",
                  }}
                >
                  <h2 className="accordion-header">
                    <button className="accordion-button" type="button">
                      <p className="mb-0 text-center d-block w-100">
                        Shipment Tracking
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
                        <form>
                          <div className="login-page mb-lg-4 mb-2 row justify-content-between">
                            <div className="col-12 mb-4">
                              <div className="d-flex justify-content-between align-items-center w-100">
                                <span className="me-3 font">Ship to</span>
                                <div className="d-flex formcard w-75 justify-content-start">
                                  {["one", "multiple", "mobile"].map(
                                    (option) => (
                                      <div
                                        key={option}
                                        className="form-check me-3 d-flex gap-2 align-items-center w-75"
                                      >
                                        <input
                                          className="form-check-input"
                                          type="radio"
                                          name="shipTo"
                                          value={option}
                                          checked={shipTo === option}
                                          onChange={(e) =>
                                            setShipTo(e.target.value)
                                          }
                                          disabled
                                        />
                                        <label className="form-check-label">
                                          {option === "one"
                                            ? "One Address"
                                            : option === "multiple"
                                            ? "Multiple Addresses"
                                            : "Mobile Card Only"}
                                        </label>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="login-page mb-lg-4 mb-2 row justify-content-between w-100">
                            {shipTo == "one" &&
                              addressDetails.map((address, index) => (
                                <div
                                  key={address.id}
                                  className="login-page mb-lg-12 mb-2 bg-light p-3 w-100"
                                >
                                  <div className="w-100 pe-lg-0">
                                    <div className="d-lg-flex justify-content-start flexform gap-5 flexshrinks w-100">
                                      <div className="d-lg-flex align-items-center w-100">
                                        <label className="form-check-label fw-bold mb-0 me-3 mb-lg-0 mb-2">
                                          Address
                                        </label>
                                        <span>{address.unit}</span>
                                      </div>
                                      <div className="d-lg-flex align-items-center w-100">
                                        <label className="form-check-label fw-bold mb-0 me-3 mb-lg-0 mb-2">
                                          City
                                        </label>
                                        <span>{address.city}</span>
                                      </div>
                                      <div className="d-lg-flex align-items-center w-100">
                                        <label className="form-check-label fw-bold mb-0 me-3 mb-lg-0 mb-2">
                                          State
                                        </label>
                                        <span>{address.state}</span>
                                      </div>
                                      <div className="d-lg-flex align-items-center w-100">
                                        <label className="form-check-label fw-bold mb-0 me-3 mb-lg-0 mb-2">
                                          Country
                                        </label>
                                        <span>{address.country}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>

                          <div className="login-page mb-lg-4 mb-2 row justify-content-between w-100">
                            {testerDetails.map((tester, index) => (
                              <>
                                {shipTo === "multiple" && (
                                  <div
                                    key={tester.id}
                                    className="login-page mb-lg-2 mb-2 bg-light p-3"
                                  >
                                    <div className="col-12 col-lg-12 pe-lg-0">
                                      <div className="d-lg-flex justify-content-start flexform gap-5 flexshrinks">
                                        <div className="d-lg-flex align-items-center">
                                          <label className="form-check-label fw-bold mb-0 me-3 mb-lg-0 mb-2">
                                            One Address
                                          </label>
                                          <input
                                            placeholder="Unit/Building and Street Name"
                                            type="text"
                                            name="unit"
                                            value={tester.unit}
                                            onChange={(e) =>
                                              handleAddressChange(
                                                index,
                                                "unit",
                                                e.target.value
                                              )
                                            }
                                            className="form-control formcontrol"
                                          />
                                        </div>
                                        <div className="d-lg-flex align-items-center">
                                          <input
                                            placeholder="City"
                                            type="text"
                                            name="city"
                                            value={tester.city}
                                            onChange={(e) =>
                                              handleAddressChange(
                                                index,
                                                "city",
                                                e.target.value
                                              )
                                            }
                                            className="form-control formcontrol"
                                          />
                                        </div>
                                        <div className="d-lg-flex align-items-center">
                                          <input
                                            placeholder="State"
                                            type="text"
                                            name="state"
                                            value={tester.state}
                                            onChange={(e) =>
                                              handleAddressChange(
                                                index,
                                                "state",
                                                e.target.value
                                              )
                                            }
                                            className="form-control formcontrol"
                                          />
                                        </div>
                                        <div className="d-lg-flex align-items-center">
                                          <input
                                            placeholder="Country"
                                            type="text"
                                            name="country"
                                            value={tester.country}
                                            onChange={(e) =>
                                              handleAddressChange(
                                                index,
                                                "country",
                                                e.target.value
                                              )
                                            }
                                            className="form-control formcontrol"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </>
                            ))}
                          </div>

                          {/* Offline Fields with per-row state */}
                          <div className="login-page mb-lg-4 mb-2 row justify-content-between pt-3 pb-3 w-100" style={{ backgroundColor: "#FEF5EE" }}>

                              <div className="col-12 col-lg-4 me-lg-4 me-0">
                                <div className="d-lg-flex align-items-center">
                                  <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                                    Shipping Date
                                  </label>
                                  <input
                                    name="last_use_date"
                                    placeholder="dd/mm/yyyy"
                                    type="date"
                                    value=""
                                    className="form-control formcontrol"
                                  />
                                </div>
                              </div>
                              <div className="col-12 col-lg-4 me-lg-4 me-0">
                                <div className="d-lg-flex align-items-center">
                                  <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                                    Tracking Number
                                  </label>
                                  <input
                                    name="last_use_date"
                                    placeholder="Tracking Number"
                                    type="text"
                                    value=""
                                    className="form-control formcontrol"
                                  />
                                </div>
                              </div>
                            </div>
                          <div className="btn-section col-12 d-flex justify-content-end">
                            {tcStatus === "assign_card" && (
                              <>
                                <a
                                  className="btn-add d-flex align-items-center gap-1"
                                  style={{ cursor: "pointer" }}
                                  onClick={handleSubmit}
                                >
                                  Save
                                </a>
                              </>
                            )}
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            <div
              className="accordion-item"
              style={{ pointerEvents: "none", opacity: "0.5" }}
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

export default CardShipment;
