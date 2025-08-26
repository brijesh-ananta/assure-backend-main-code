import React, { useState, useEffect } from "react";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import Footer from "../../common/Footer";
import { useAuth } from "../../utils/AuthContext";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import axiosToken from "../../utils/axiosToken";
import { environmentMapping } from "../../utils/constent";
function Cardshippingdetails() {
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

  const [cardType, setCardType] = useState(1);
  const [numTesters, setNumTesters] = useState(1);
  const [numPartners, setNumPartners] = useState(1);
  const [shipTo, setShipTo] = useState("one"); // 'one', 'multiple', 'mobile'
  const [testerDetails, setTesterDetails] = useState([]);
  const [cardDetails, setCardDetails] = useState([]);
  const [issuerOptions, setIssuerOptions] = useState({});
  const [vaultCounts, setVaultCounts] = useState({});
  const [shippingDetails, setShippingDetails] = useState({});

  const [testInfo, setTestInfo] = useState([]);
  const [terminalInfo, setTerminalData] = useState([]);
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

      // check test info
      axiosToken
        .get(`/card-requests/test-info/${cardRequestId}`)
        .then((response) => {
          //  check data have or not
          const testInfo = response.data.testInformation || null;
          if (testInfo && testInfo.length > 0) {
            setTestInfo(testInfo);
          } else {
            setTestInfo(null);
          }
        })
        .catch((error) => {
          console.error("Error fetching test info:", error);
        });

      // check terminal info
      if (terminalType === "Pos") {
        axiosToken
          .get(`/card-requests/terminal-info/${cardRequestId}`)
          .then((response) => {
            //  check data have or not
            const terminalInfo = response.data.terminalInformation || null;
            if (terminalInfo && terminalInfo.length > 0) {
              setTerminalData(terminalInfo);
            } else {
              setTerminalData(null);
            }
          })
          .catch((error) => {
            console.error("Error fetching terminal info:", error);
          });
      }
    }
  }, [cardRequestId]);

  const fetchIssuers = async (
    index,
    specialFeature,
    product,
    domesticGlobal
  ) => {
    if (!product || !environment || !terminalType) return;

    try {
      const response = await axiosToken.get(`/cards/list`, {
        params: {
          binProduct: product,
          feature: specialFeature,
          region: domesticGlobal,
          environment: environment,
          terminalType: terminalType,
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
    

    if (terminalType === "Pos" || terminalType === "Pos") {
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
    } else {
      for (const card of cardDetails) {
        if (!card.product || !card.issuer) {
          alert("Please fill all required fields in the card details.");
          return false;
        }
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
    if (testInfo == null || testInfo == "") {
      alert("Please save test information first.");
      // navigate to test information
      navigate(`/dashboard/test-card-request/test-info/${cardRequestId}`, {
        state: { environment, terminalType, status: tcStatus },
      });
      return;
    }

    if(terminalType === 'Pos' || terminalType === 'Pos') {
      if(terminalInfo == null || terminalInfo == "") {
        alert("Please save terminal information first.");
        // navigate to terminal information
        navigate(`/dashboard/test-card-request/terminal-details/${cardRequestId}`, {
          state: { environment, terminalType, status: tcStatus },
        });
        return;
      }
    }

    if (!validateForm()) return; // Stop if validation fails

    if (reqStatus == "draft") {
      alert("Service request is in draft state.");
      return;
    }

    if (!validateForm()) return; // Stop if validation fails

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
                onClick={handleRequest}
                style={{ cursor: "pointer" }}
              >
                <span className="activebg"></span>Requestor Info
              </li>
              <li
                className="d-flex flex-column justify-content-center align-items-center"
                onClick={handleTestInfo}
                style={{ cursor: "pointer" }}
              >
                <span className="activebg"></span>Test Information
              </li>

              {/* if terminal type is pos then only then it need to activebg class or onclick function need to call  */}

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
                  onClick={handleCardShippingDetails}
                  style={{ cursor: "pointer" }}
                ></span>
                Shipping Details
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
                  style={{
                    pointerEvents: "auto",
                    opacity: "1",
                    cursor: "pointer",
                  }}
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
                <button
                  className="accordion-button"
                  type="button"
                  style={{
                    pointerEvents: "auto",
                    opacity: "1",
                    cursor: "pointer",
                  }}
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
                    pointerEvents: "auto",
                    opacity: "1",
                    cursor: "pointer",
                  }}
                  onClick={handleTerminalDetails}
                >
                  <p className="mb-0 text-center d-block w-100">
                    Terminal Details
                  </p>
                </button>
              </h2>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header">
                <button className="accordion-button" type="button">
                  <p className="mb-0 text-center d-block w-100">
                    Card and Shipping Details
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
                        <div className="col-12 col-lg-3 pe-lg-5">
                          <div className="d-lg-flex align-items-center">
                            <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 flexgrow">
                              Types of Card
                            </label>

                            <select
                              className="form-control formcontrol"
                              value={cardType}
                              name="cardType"
                              onChange={(e) =>
                                setCardType(Number(e.target.value))
                              }
                            >
                              {[1, 2, 3, 4].map((num) => (
                                <option key={num} value={num}>
                                  {num}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="col-12 col-lg-3">
                          <div className="d-lg-flex align-items-center">
                            <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2">
                              Number of Tester/s{" "}
                            </label>
                            <select
                              className="form-control formcontrol"
                              value={numTesters}
                              name="numTesters"
                              onChange={(e) =>
                                setNumTesters(Number(e.target.value))
                              }
                            >
                              {[1, 2, 3, 4].map((num) => (
                                <option key={num} value={num}>
                                  {num}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="table-responsive">
                        <table className="table table-bordered table-hover">
                          <thead className="table-theme theme_noti">
                            <tr>
                              <th scope="col">#Card</th>
                              {terminalType == "pos" ||
                                (terminalType == "Pos" && (
                                  <th scope="col">Special Feature</th>
                                ))}
                              <th scope="col">Product</th>
                              {terminalType == "pos" ||
                                (terminalType == "Pos" && (
                                  <th scope="col">Domestic/Global</th>
                                ))}
                              <th scope="col">Issuer</th>
                              <th scope="col">Quantity</th>
                              <th scope="col">Vault</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cardDetails.map((card, index) => (
                              <tr key={card.id}>
                                <th>Card {card.id}</th>
                                {terminalType == "pos" ||
                                  (terminalType == "Pos" && (
                                    <td>
                                      <select
                                        className="form-control formcontrol"
                                        value={card.specialFeature}
                                        onChange={(e) =>
                                          handleCardChange(
                                            index,
                                            "specialFeature",
                                            e.target.value
                                          )
                                        }
                                      >
                                        <option value="">Select</option>
                                        <option value="transit">Transit</option>
                                        <option value="online_pin">
                                          Online pin
                                        </option>
                                        <option value="transit_online_pin">
                                          Transit online pin
                                        </option>
                                        <option value="generic">Generic</option>
                                      </select>
                                    </td>
                                  ))}
                                <td>
                                  <select
                                    className="form-control formcontrol"
                                    value={card.product}
                                    onChange={(e) =>
                                      handleCardChange(
                                        index,
                                        "product",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="">Select</option>
                                    <option value="Debit">Debit</option>
                                    <option value="Credit">Credit</option>
                                  </select>
                                </td>
                                {terminalType == "pos" ||
                                  (terminalType == "Pos" && (
                                    <td>
                                      <select
                                        className="form-control formcontrol"
                                        value={card.domesticGlobal}
                                        onChange={(e) =>
                                          handleCardChange(
                                            index,
                                            "domesticGlobal",
                                            e.target.value
                                          )
                                        }
                                      >
                                        <option value="">Select</option>
                                        <option value="domestic">
                                          Domestic
                                        </option>
                                        <option value="global">Global</option>
                                      </select>
                                    </td>
                                  ))}
                                <td>
                                  <select
                                    className="form-control formcontrol"
                                    value={card.issuer}
                                    onChange={(e) =>
                                      handleCardChange(
                                        index,
                                        "issuer",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="">Select</option>
                                    {[
                                      ...new Map(
                                        issuerOptions[index]?.map((issuer) => [
                                          issuer.id,
                                          issuer,
                                        ])
                                      ).values(),
                                    ].map((issuer) => (
                                      <option key={issuer.id} value={issuer.id}>
                                        {issuer.name}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    min={1}
                                    className="form-control formcontrol"
                                    value={card.quantity}
                                    onChange={(e) =>
                                      handleCardChange(
                                        index,
                                        "quantity",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  {vaultCounts?.[index] !== undefined
                                    ? vaultCounts[index]
                                    : "Loading..."}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="col-lg-4 mb-4">
                        <div className="d-lg-flex align-items-center">
                          <span className="me-3 font">Ship to</span>
                          <form>
                            <div className="d-lg-flex formcard">
                              {["one", "multiple", "mobile"].map((option) => (
                                <div
                                  key={option}
                                  className="form-check me-3 d-flex gap-2 align-items-center"
                                >
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="shipTo"
                                    value={option}
                                    checked={shipTo === option}
                                    onChange={(e) => setShipTo(e.target.value)}
                                  />
                                  <label className="form-check-label">
                                    {option === "one"
                                      ? "One Address"
                                      : option === "multiple"
                                      ? "Multiple Addresses"
                                      : "Mobile Card Only"}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </form>
                        </div>
                      </div>
                      {shipTo == "one" &&
                        addressDetails.map((address, index) => (
                          <div
                            key={address.id}
                            className="login-page mb-lg-4 mb-2 bg-light p-3"
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
                                    value={address.unit}
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
                                    placeholder="city"
                                    type="text"
                                    name="city"
                                    value={address.city}
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
                                    value={address.state}
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
                                    value={address.country}
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
                        ))}

                      {testerDetails.map((tester, index) => (
                        <div
                          key={tester.id}
                          className="login-page mb-lg-2 mb-2 bg-light p-3"
                        >
                          <div className="col-12 col-lg-12">
                            <div className="d-lg-flex justify-content-start flexform gap-5">
                              <div className="d-lg-flex align-items-center w-100">
                                <label className="form-check-label fw-bold mb-0 me-3">
                                  Tester Name {tester.id}
                                </label>
                                <input
                                  type="text"
                                  placeholder="Enter Name"
                                  className="form-control formcontrol"
                                  value={tester.name}
                                  onChange={(e) =>
                                    handleTesterChange(
                                      index,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                              <div className="d-lg-flex align-items-center w-100">
                                <label className="form-check-label fw-bold mb-0 me-3">
                                  Email:
                                </label>
                                <input
                                  type="email"
                                  placeholder="Enter Email"
                                  className="form-control formcontrol"
                                  value={tester.email}
                                  onChange={(e) =>
                                    handleTesterChange(
                                      index,
                                      "email",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                              <div className="d-lg-flex align-items-center w-100">
                                <label className="form-check-label fw-bold mb-0 me-3">
                                  Card #
                                </label>
                                <select
                                  className="form-control formcontrol w-auto"
                                  value={tester.card}
                                  onChange={(e) =>
                                    handleTesterChange(
                                      index,
                                      "card",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="">Select</option>
                                  {cardDetails.map((card) => (
                                    <option key={card.id} value={card.id}>
                                      Card {card.id}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            {shipTo == "multiple" && (
                              <div
                                key={tester.id}
                                className="login-page mb-lg-4 mb-2 bg-light p-3"
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
                                        placeholder="city"
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
                          </div>
                        </div>
                      ))}

                      <div className="btn-section col-12 d-flex justify-content-end">
                        {tcStatus === "draft" && (
                          <>
                            <a
                              className="btn-add d-flex align-items-center gap-1"
                              style={{ cursor: "pointer" }}
                              onClick={handleSubmit}
                            >
                              Submit Request
                            </a>
                          </>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* if tcStatus != "draft" hide this */}
            {tcStatus != "draft" && tcStatus != "new" && (
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

export default Cardshippingdetails;
