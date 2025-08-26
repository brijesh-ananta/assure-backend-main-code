import React, { useState, useEffect } from "react";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import Footer from "../../common/Footer";
import { useAuth } from "../../utils/AuthContext";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import axiosToken from "../../utils/axiosToken";
import { encryptData, decryptData } from "../../utils/cryptoUtils"; // Adjust the import path as needed

function CardAssignment() {
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
  const handleShipment = () => {
    navigate(`/dashboard/test-card-request/shipment/${cardRequestId}`, {
      state: { environment, terminalType, status: tcStatus },
    });
  };

  // State variables for shipping and card details
  const [shippingDetails, setShippingDetails] = useState([]);
  const [cardType, setCardType] = useState(1);
  const [numTesters, setNumTesters] = useState(1);
  const [shipTo, setShipTo] = useState("one");
  const [cardDetails, setCardDetails] = useState([]);
  const [testerDetails, setTesterDetails] = useState([]);
  const [addressDetails, setAddressDetails] = useState([]);
  // cardData will hold card-specific system default values (if provided)
  const [cardData, setCardData] = useState([]);
  const encryptionKey = import.meta.env.VITE_ENCKEY;

  // Global system defaults fetched from API (fallback values)
  const [globalSystemData, setGlobalSystemData] = useState({});

  // Individual row system data to handle separate input values per row
  const [systemDataRows, setSystemDataRows] = useState([]);

  useEffect(() => {
    async function fetchShippingDetails() {
      if (cardRequestId) {
        try {
          const response = await axiosToken.get(
            `/card-requests/assign-shipping-details/${cardRequestId}`
          );

          // If the API returns card data, update cardData; otherwise, leave it as is.
          const cardDataFromApi = response.data.card;
          if (cardDataFromApi && cardDataFromApi.length > 0) {
            setCardData(cardDataFromApi);
          }

          if (
            response.data.shippingDetails &&
            Array.isArray(response.data.shippingDetails) &&
            response.data.shippingDetails.length > 0
          ) {
            // Group rows by cardDetailId and deduplicate tester details
            const groupedCards = {};
            response.data.shippingDetails.forEach((row) => {
              const cardDetailId = row.cardDetailId;
              if (!groupedCards[cardDetailId]) {
                groupedCards[cardDetailId] = { ...row, testers: [] };
              }
              if (
                !groupedCards[cardDetailId].testers.find(
                  (tester) => tester.id === row.tester_id
                )
              ) {
                groupedCards[cardDetailId].testers.push({
                  id: row.tester_id,
                  name: row.tester_name,
                  email: row.tester_email,
                  card: row.tester_card || row.cardDetailId,
                });
              }
            });
            const groupedArray = Object.values(groupedCards);

            // Optionally, parse common shipping details from the first row
            try {
              const parsedDetails = JSON.parse(
                response.data[0].shippingDetails
              );
              setCardType(parsedDetails.cardType || 1);
              setNumTesters(parsedDetails.numTesters || 1);
              setShipTo(parsedDetails.shipTo || "one");
              setCardDetails(parsedDetails.cardDetails || []);
              setTesterDetails(parsedDetails.testerDetails || []);
              setAddressDetails(parsedDetails.addressDetails || []);
            } catch (error) {
              console.error(
                "Error parsing shippingDetails from first row:",
                error
              );
            }

            // Decrypt card details for each grouped record and merge decrypted data
            const decryptedCards = await Promise.all(
              groupedArray.map(async (card) => {
                const sanitizedIV = card.ivKey.replace(/\s+/g, "");
                const sanitizedEncryptedData = card.cardDetails.replace(
                  /\s+/g,
                  ""
                );
                const decryptedText = await decryptData({
                  encryptionKey,
                  encryptedData: sanitizedEncryptedData,
                  iv: sanitizedIV,
                });
                let decryptedObj = {};
                try {
                  decryptedObj = JSON.parse(decryptedText);
                } catch (err) {
                  console.error("Error parsing decryptedText:", err);
                }
                return { ...card, decryptedCardDetails: decryptedObj };
              })
            );

            setShippingDetails(decryptedCards);
            // Optionally, if you want to update cardData from decryptedCards if cardData is not provided by API,
            // you can uncomment the following line:
            // setCardData(decryptedCards);
          }
        } catch (error) {
          console.error("Error fetching shipping details:", error);
        }
      }
    }
    fetchShippingDetails();

    async function fetchSystemDetault() {
      if (environment) {
        try {
          const response = await axiosToken.get(
            `/system-defaults?environment=${environment}`
          );
          if (response.data && response.data.length > 0) {
            setGlobalSystemData(response.data[0]);
          }
        } catch (error) {
          console.error("Error fetching system defaults:", error);
        }
      }
    }
    fetchSystemDetault();
  }, [cardRequestId, environment]);

  // Update or initialize the systemDataRows once shippingDetails, globalSystemData, and cardData are available.
  useEffect(() => {
    if (
      shippingDetails.length > 0 &&
      (Object.keys(globalSystemData).length > 0 ||
        (cardData && cardData.length > 0))
    ) {
      const updatedRows = shippingDetails.map((_, index) => {
        // Determine default values:
        // If cardData exists for this row, use its values; otherwise, use global system defaults.
        let defaultData = globalSystemData;
        if (cardData && cardData[index]) {
          defaultData = {
            offline_days: cardData[index].offlineDays,
            offline_usage: cardData[index].onlineUsages,
            total_usage: cardData[index].totalUsage,
            last_use_date: cardData[index].LastUseDate,
          };
        }
        return {
          offline_days:
            systemDataRows[index]?.offline_days ||
            defaultData.offline_days ||
            "",
          offline_usage:
            systemDataRows[index]?.offline_usage ||
            defaultData.offline_usage ||
            "",
          total_usage:
            systemDataRows[index]?.total_usage || defaultData.total_usage || "",
          last_use_date:
            systemDataRows[index]?.last_use_date ||
            defaultData.last_use_date ||
            "",
        };
      });
      setSystemDataRows(updatedRows);
    }
  }, [shippingDetails, globalSystemData, cardData]);

  const handleAssign = () => {
    async function postUserCards() {
      try {
        const postRequests = [];
        // Loop through each card and use corresponding row data
        for (let i = 0; i < shippingDetails.length; i++) {
          const card = shippingDetails[i];
          const rowData = systemDataRows[i] || {};
          if (card.testers && card.testers.length > 0) {
            for (const tester of card.testers) {
              const payload = {
                request_id: cardRequestId,
                cardID: card.id,
                offlineDays: rowData.offline_days || null,
                onlineUsages: rowData.offline_usage || null,
                totalUsage: rowData.total_usage || null,
                LastUseDate: rowData.last_use_date || null,
                testname: tester.name,
                testemail: tester.email,
              };
              postRequests.push(axiosToken.post(`/user-cards`, payload));
            }
          }
        }
        const results = await Promise.allSettled(postRequests);
        const successes = results.filter(
          (result) => result.status === "fulfilled"
        );
        const errors = results.filter((result) => result.status === "rejected");

        const successMessages = successes
          .map((res) => res.value.data.message)
          .join("\n");

        if (errors.length > 0) {
          const errorMessages = errors
            .map((res) => res.reason.message)
            .join("\n");
          alert("Some user card posts failed:\n" + errorMessages);
          console.error("Some user card posts failed:", errors);
        } else {
          alert("Success:\n" + successMessages);
        }
      } catch (error) {
        alert("Error posting user cards: " + error.message);
        console.error("Error posting user cards:", error);
      }
    }
    postUserCards();
    // Optionally, you may navigate after posting if needed.
    navigate(`/dashboard/test-card-request/shipment/${cardRequestId}`, {
      state: { environment, terminalType, status: "assign_card" },
    });
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
                <span className="activebg" style={{ cursor: "pointer" }} onClick={handleFulfilment}></span>
                Approved
              </li>
              <li className="d-flex flex-column justify-content-center align-items-center">
                <span className="activebg"></span>Assigned
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
                    <button className="accordion-button" type="button">
                      <p className="mb-0 text-center d-block w-100">
                        Card Assignment
                      </p>
                    </button>
                  </h2>
                </div>
                <div
                  id="collapseOne"
                  className="accordion-collapse collapse show"
                  aria-labelledby="headingOne"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    <div className="container-fluid">
                      {/* Assigned Card Details */}
                      <form>
                        {(shippingDetails || []).map((card, cardIndex) => {
                          const decryptedData = card.decryptedCardDetails || {};
                          return (
                            <div key={cardIndex} className="card-record">
                              {card.testers.map((tester, index) => (
                                <div key={index}>
                                  {/* Tester Info */}
                                  <div className="form-field-wrapper">
                                    <div className="login-page mb-lg-4 d-lg-flex align-items-end pb-2">
                                      <div className="col-12 col-lg-4 me-lg-4 me-0">
                                        <div className="d-lg-flex align-items-center">
                                          <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                                            Tester Name
                                          </label>
                                          {tester.name}
                                        </div>
                                      </div>
                                      <div className="col-12 col-lg-4 me-lg-4 me-0">
                                        <div className="d-lg-flex align-items-center">
                                          <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                                            Email
                                          </label>
                                          {tester.email}
                                        </div>
                                      </div>
                                      <div className="col-12 col-lg-4 me-lg-4 me-0">
                                        <div className="d-lg-flex align-items-center">
                                          <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                                            Card#
                                          </label>
                                          Card {tester.card}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Card-Level Info */}
                                  <div className="form-field-wrapper">
                                    <div className="login-page mb-lg-4 d-lg-flex align-items-end pb-2">
                                      <div className="col-12 col-lg-3 me-lg-4 me-0">
                                        <div className="d-lg-flex align-items-center">
                                          <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                                            Issuer Name
                                          </label>
                                          {card.issuer_name}
                                        </div>
                                      </div>
                                      <div className="col-12 col-lg-3 me-lg-4 me-0">
                                        <div className="d-lg-flex align-items-center">
                                          <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                                            Card Type
                                          </label>
                                          {card.product}
                                        </div>
                                      </div>
                                      <div className="col-12 col-lg-3 me-lg-4 me-0">
                                        <div className="d-lg-flex align-items-center">
                                          <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                                            Region
                                          </label>
                                          {card.domesticGlobal}
                                        </div>
                                      </div>
                                      <div className="col-12 col-lg-3 me-lg-4 me-0">
                                        <div className="d-lg-flex align-items-center">
                                          <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                                            Feature
                                          </label>
                                          {card.specialFeature}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Decrypted Card Details */}
                                  <div className="form-field-wrapper">
                                    <div className="login-page mb-lg-4 d-lg-flex align-items-end pb-2">
                                      <div className="col-12 col-lg-6 me-lg-4 me-0">
                                        <div className="d-lg-flex align-items-center">
                                          <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                                            Card Number
                                          </label>
                                          {decryptedData.cardNumber
                                            ? decryptedData.cardNumber.replace(
                                                /^(\d{6})(\d+)(\d{6})$/,
                                                "$1XXXX$3"
                                              )
                                            : "N/A"}
                                        </div>
                                      </div>
                                      <div className="col-12 col-lg-6 me-lg-4 me-0">
                                        <div className="d-lg-flex align-items-center">
                                          <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                                            Exp. Date
                                          </label>
                                          {decryptedData.expDate ||
                                            "MM/DD/YYYY"}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* CVV & PIN */}
                                  <div className="form-field-wrapper">
                                    <div className="login-page mb-lg-4 d-lg-flex align-items-end pb-2">
                                      <div className="col-12 col-lg-6 me-lg-4 me-0">
                                        <div className="d-lg-flex align-items-center">
                                          <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                                            CVV
                                          </label>
                                          {decryptedData.cvv || "XXX"}
                                        </div>
                                      </div>
                                      {/* terminaltype == pos */}
                                      {terminalType === "pos" && (
                                        <div className="col-12 col-lg-6 me-lg-4 me-0">
                                          <div className="d-lg-flex align-items-center">
                                            <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                                              PIN
                                            </label>
                                          {decryptedData.pinNumber || "XXXX"}
                                        </div>
                                      </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Offline Fields with per-row state */}
                                  <div className="form-field-wrapper">
                                    <div
                                      className="login-page mb-lg-4 d-lg-flex align-items-end pb-3 pt-3"
                                      style={{ backgroundColor: "#FEF5EE" }}
                                    >
                                      {/* terminaltype == pos */}
                                      {terminalType === "pos" && (
                                        <>
                                      <div className="col-12 col-lg-2 me-lg-4 me-0">
                                        <div className="d-lg-flex align-items-center">
                                          <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                                            Offline Days
                                          </label>
                                          <input
                                            name="offline_days"
                                            placeholder="2"
                                            type="text"
                                            onChange={(e) => {
                                              const newRows = [
                                                ...systemDataRows,
                                              ];
                                              newRows[cardIndex] = {
                                                ...newRows[cardIndex],
                                                offline_days: e.target.value,
                                              };
                                              setSystemDataRows(newRows);
                                            }}
                                            value={
                                              systemDataRows[cardIndex]
                                                ?.offline_days || ""
                                            }
                                            className="form-control formcontrol"
                                          />
                                        </div>
                                      </div>
                                      <div className="col-12 col-lg-2 me-lg-4 me-0">
                                        <div className="d-lg-flex align-items-center">
                                          <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                                            Online Usage
                                          </label>
                                          <input
                                            name="offline_usage"
                                            placeholder="5"
                                            type="text"
                                            onChange={(e) => {
                                              const newRows = [
                                                ...systemDataRows,
                                              ];
                                              newRows[cardIndex] = {
                                                ...newRows[cardIndex],
                                                offline_usage: e.target.value,
                                              };
                                              setSystemDataRows(newRows);
                                            }}
                                            value={
                                              systemDataRows[cardIndex]
                                                ?.offline_usage || ""
                                            }
                                            className="form-control formcontrol"
                                          />
                                        </div>
                                      </div>
                                      <div className="col-12 col-lg-2 me-lg-4 me-0">
                                        <div className="d-lg-flex align-items-center">
                                          <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                                            Total Usage
                                          </label>
                                          <input
                                            name="total_usage"
                                            placeholder="10"
                                            type="text"
                                            onChange={(e) => {
                                              const newRows = [
                                                ...systemDataRows,
                                              ];
                                              newRows[cardIndex] = {
                                                ...newRows[cardIndex],
                                                total_usage: e.target.value,
                                              };
                                              setSystemDataRows(newRows);
                                            }}
                                            value={
                                              systemDataRows[cardIndex]
                                                ?.total_usage || ""
                                            }
                                            className="form-control formcontrol"
                                          />
                                        </div>
                                      </div>
                                      </>
                                      )}
                                      <div className="col-12 col-lg-4 me-lg-4 me-0">
                                        <div className="d-lg-flex align-items-center">
                                          <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                                            Last Use Date
                                          </label>
                                          <input
                                            name="last_use_date"
                                            placeholder="dd/mm/yyyy"
                                            type="date"
                                            onChange={(e) => {
                                              const newRows = [
                                                ...systemDataRows,
                                              ];
                                              newRows[cardIndex] = {
                                                ...newRows[cardIndex],
                                                last_use_date: e.target.value,
                                              };
                                              setSystemDataRows(newRows);
                                            }}
                                            value={
                                              systemDataRows[cardIndex]
                                                ?.last_use_date
                                                ? new Date(
                                                    systemDataRows[
                                                      cardIndex
                                                    ].last_use_date
                                                  )
                                                    .toISOString()
                                                    .slice(0, 10)
                                                : ""
                                            }
                                            className="form-control formcontrol"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                        <div className="btn-section col-12 d-flex justify-content-end">
                          {tcStatus === "approved" && (
                            <a
                              className="btn-add d-flex align-items-center gap-1"
                              style={{ cursor: "pointer" }}
                              onClick={handleAssign}
                            >
                              Assign Card
                            </a>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
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

export default CardAssignment;
