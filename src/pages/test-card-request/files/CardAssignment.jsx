import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axiosToken from "../../../utils/axiosToken";
import { useLocation, useNavigate } from "react-router-dom";
import { encryptData, decryptData } from "../../../utils/cryptoUtils";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { useAuth } from "../../../utils/AuthContext";

function CardAssignment({
  requestInfoData,
  handleAccordionExpand,
  handleShipmentAvailability,
  cardRequestId,
  terminalType,
  environment,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const status = location.state?.status;
  const [shippingDetails, setShippingDetails] = useState([]);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [globalSystemData, setGlobalSystemData] = useState([]);
  const [systemDataRows, setSystemDataRows] = useState([]);
  const [cardData, setCardData] = useState([]);
  const encryptionKey = import.meta.env.VITE_ENCKEY;
  const [cardType, setCardType] = useState(1);
  const [numTesters, setNumTesters] = useState(1);
  const [shipTo, setShipTo] = useState("one");
  const [cardDetails, setCardDetails] = useState([]);
  const [testerDetails, setTesterDetails] = useState([]);
  const [addressDetails, setAddressDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { userRole } = useAuth();
  async function fetchShippingDetails() {
    if (cardRequestId) {
      setIsLoading(true);
      try {
        const response = await axiosToken.get(
          `/card-requests/assign-shipping-details/${cardRequestId}?environment=${environment}&terminalType=${terminalType}`
        );

        const cardDataFromApi = response.data.card;
        if (cardDataFromApi && cardDataFromApi.length > 0) {
          setCardData(cardDataFromApi);
        }

        if (
          response.data.shippingData &&
          Array.isArray(response.data.shippingData) &&
          response.data.shippingData.length > 0
        ) {
          const groupedCards = {};
          response.data.shippingData.forEach((row) => {
            const cardDetailId = row.id;
            if (!groupedCards[cardDetailId]) {
              groupedCards[cardDetailId] = {
                ...row,
                testers: [],
                address: row.address,
                issuer_name: row.issuerDetails.issuer_name,
              };
            }
            if (
              !groupedCards[cardDetailId].testers.find(
                (tester) => tester.id === row.tester.id
              )
            ) {
              groupedCards[cardDetailId].testers.push({
                id: row.tester.id,
                name: row.tester.name,
                email: row.tester.email,
                card: row.tester.card || row.id,
              });
            }
          });
          const groupedArray = Object.values(groupedCards);

          try {
            const parsedDetails = JSON.parse(
              response.data.shippingData[0].shipDetails
            );
            setCardType(parsedDetails.cardType || 1);
            setNumTesters(parsedDetails.numTesters || 1);
            setShipTo(parsedDetails.shipTo || "one");
            setCardDetails(parsedDetails.cardDetails || []);
            setTesterDetails(parsedDetails.testerDetails || []);
            setAddressDetails(parsedDetails.addressDetails || []);
          } catch (error) {
            console.error("Error parsing shipDetails from first row:", error);
          }

          const decryptedCards = await Promise.all(
            groupedArray.map(async (card) => {
              if (!card.ivKey || !card.cardDetails) return card;
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
        }
      } catch (error) {
        console.error("Error fetching shipping details:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
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

  useEffect(() => {
    if (shippingDetails.length > 0 && cardData && cardData.length > 0) {
      const updatedRows = {};

      const testerEmailMap = {};
      shippingDetails.forEach((card) => {
        card.testers.forEach((tester) => {
          testerEmailMap[tester.email.toLowerCase()] = {
            cardId: card.id,
            testerId: tester.id,
          };
        });
      });

      const allTesterEmails = [];
      shippingDetails.forEach((card) => {
        card.testers.forEach((tester) => {
          allTesterEmails.push(tester.email.toLowerCase());
        });
      });

      shippingDetails.forEach((card) => {
        card.testers.forEach((tester) => {
          const uniqueId = `${card.id}_${tester.id}`;

          let matchingCardData = null;
          const testerIndex = allTesterEmails.indexOf(
            tester.email.toLowerCase()
          );
          if (testerIndex !== -1 && cardData[testerIndex]) {
            matchingCardData = cardData[testerIndex];
          }

          if (matchingCardData) {
            updatedRows[uniqueId] = {
              offline_days: matchingCardData.offlineDays || "",
              offline_usage: matchingCardData.onlineUsages || "",
              total_usage: matchingCardData.totalUsage || "",
              last_use_date: matchingCardData.LastUseDate || "",
            };
          } else {
            updatedRows[uniqueId] = {
              offline_days: globalSystemData.offline_days || "",
              offline_usage: globalSystemData.offline_usage || "",
              total_usage: globalSystemData.total_usage || "",
              last_use_date: globalSystemData.last_use_date || "",
            };
          }
        });
      });

      setSystemDataRows(updatedRows);
    } else if (shippingDetails.length > 0 && globalSystemData) {
      const updatedRows = {};

      shippingDetails.forEach((card) => {
        card.testers.forEach((tester) => {
          const uniqueId = `${card.id}_${tester.id}`;
          updatedRows[uniqueId] = {
            offline_days: globalSystemData.offline_days || "",
            offline_usage: globalSystemData.offline_usage || "",
            total_usage: globalSystemData.total_usage || "",
            last_use_date: globalSystemData.last_use_date || "",
          };
        });
      });
      setSystemDataRows(updatedRows);
    }
  }, [shippingDetails, globalSystemData, cardData]);

  const handleAssign = async () => {
    setIsLoading(true);
    let isError = false;
    async function postUserCards() {
      try {
        const postRequests = [];
        shippingDetails.forEach((card) => {
          if (card.testers && card.testers.length > 0) {
            card.testers.forEach((tester) => {
              const uniqueId = `${card.id}_${tester.id}`;
              const rowData = systemDataRows[uniqueId] || {};
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
            });
          }
        });

        const results = await Promise.allSettled(postRequests);
        const successes = results.filter(
          (result) => result.status === "fulfilled"
        );
        const errors = results.filter((result) => result.status === "rejected");

        const successMessages = successes
          .map((res) => res.value.data.message)
          .join("\n");

        if (errors.length > 0) {
          setIsLoading(false);
          const errorMessages = errors
            .map((res) => res.reason.message)
            .join("\n");
          toast.error("Some user card posts failed:\n" + errorMessages);
          console.error("Some user card posts failed:", errors);
          isError = true;
        } else {
          toast.success("Success:\n" + successMessages);
          isError = false;
        }
      } catch (error) {
        toast.error("Error posting user cards: " + error.message);
        console.error("Error posting user cards:", error);
        isError = true;
      }
    }
    await postUserCards();
    const shipDetails = JSON.parse(requestInfoData.shipDetails || "{}");

    //set time out to navigate
    setTimeout(() => {
      // dismiss toast
      toast.dismiss();
      if (isError === false) {
        if (terminalType == "Ecomm" || shipDetails.shipTo === "mobile") {
          navigate(`/dashboard/test-card-fulfilment`);
        } else {
          handleShipmentAvailability(true);
          handleAccordionExpand("collapseSeven");
          navigate(`/dashboard/test-card-request/requestor-info/${cardRequestId}`, {
            state: { environment, terminalType, status: "assign_card" },
          });
        }
      } else {
        fetchShippingDetails();
      }

      setIsLoading(false);
    }, 2000);

    // if (terminalType == "Ecomm" || shipDetails.shipTo === "mobile") {
    //   if (isError === false) {
    //     navigate(`/dashboard/test-card-fulfilment`);
    //   }
    // } else {
    //   if (isError === false) {
    //     handleShipmentAvailability(true);
    //     handleAccordionExpand("collapseSeven");
    //     navigate(`/dashboard/test-card-request/requestor-info/${cardRequestId}`, {
    //       state: { environment, terminalType, status: "assign_card" },
    //     });
    //   } else {
    //     await fetchShippingDetails();
    //   }
    // }
  };

  const handleViewCard = (cardId) => {};

  return (
    <>
      <div className="container-fluid">
        {isLoading ? (
          <div className="loading-container text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading card details...</p>
          </div>
        ) : (
          <form>
            {(shippingDetails || []).map((card, cardIndex) => {
              const decryptedData = card.decryptedCardDetails || {};
              return (
                <div key={card.id} className="card-record">
                  {card.testers.map((tester, index) => (
                    <div key={tester.id}>
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
                              {card.binProduct}
                            </div>
                          </div>
                          {terminalType === "Pos" && (
                            <>
                              <div className="col-12 col-lg-3 me-lg-4 me-0">
                                <div className="d-lg-flex align-items-center">
                                  <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                                    Region
                                  </label>
                                  {card.region}
                                </div>
                              </div>
                              <div className="col-12 col-lg-3 me-lg-4 me-0">
                                <div className="d-lg-flex align-items-center">
                                  <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                                    Feature
                                  </label>
                                  {card.feature}
                                </div>
                              </div>
                            </>
                          )}
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
                              <div className="d-flex align-items-center">
                                {decryptedData.cardNumber ? (
                                  <>
                                    <span className="me-2 d-flex align-items-center gap-2">
                                      {showCardNumber
                                        ? decryptedData.cardNumber
                                        : decryptedData.cardNumber.replace(
                                            /^(\d{6})(\d+)(\d{6})$/,
                                            "$1XXXX$3"
                                          )}
                                      <a
                                        className="p-0 text-dark ms-2 cursor-pointer d-inline-block"
                                        onClick={() =>
                                          setShowCardNumber(!showCardNumber)
                                        }
                                        title={
                                          showCardNumber
                                            ? "Hide card number"
                                            : "Show card number"
                                        }
                                      >
                                        {showCardNumber ? (
                                          <FaEyeSlash />
                                        ) : (
                                          <FaEye />
                                        )}
                                      </a>
                                    </span>
                                  </>
                                ) : (
                                  "N/A"
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="col-12 col-lg-6 me-lg-4 me-0">
                            <div className="d-lg-flex align-items-center">
                              <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 ms-lg-5">
                                Exp. Date
                              </label>
                              {decryptedData.expDate || "MM/DD/YYYY"}
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
                          {(terminalType === "Pos" || terminalType === "pos") && (
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

                      {/* Offline Fields */}
                      <div className="form-field-wrapper">
                        <div
                          className="login-page mb-lg-4 d-lg-flex align-items-end pb-3 pt-3"
                          style={{ backgroundColor: "#FEF5EE" }}
                        >
                          {(terminalType === "Pos" || terminalType === "pos") && (
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
                                      const uniqueId = `${card.id}_${tester.id}`;
                                      setSystemDataRows((prevRows) => {
                                        const newRows = { ...prevRows };
                                        newRows[uniqueId] = {
                                          ...newRows[uniqueId],
                                          offline_days: e.target.value,
                                        };
                                        return newRows;
                                      });
                                    }}
                                    value={
                                      systemDataRows[`${card.id}_${tester.id}`]
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
                                      const uniqueId = `${card.id}_${tester.id}`;
                                      setSystemDataRows((prevRows) => {
                                        const newRows = { ...prevRows };
                                        newRows[uniqueId] = {
                                          ...newRows[uniqueId],
                                          offline_usage: e.target.value,
                                        };
                                        return newRows;
                                      });
                                    }}
                                    value={
                                      systemDataRows[`${card.id}_${tester.id}`]
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
                                      const uniqueId = `${card.id}_${tester.id}`;
                                      setSystemDataRows((prevRows) => {
                                        const newRows = { ...prevRows };
                                        newRows[uniqueId] = {
                                          ...newRows[uniqueId],
                                          total_usage: e.target.value,
                                        };
                                        return newRows;
                                      });
                                    }}
                                    value={
                                      systemDataRows[`${card.id}_${tester.id}`]
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
                                  const uniqueId = `${card.id}_${tester.id}`;
                                  setSystemDataRows((prevRows) => {
                                    const newRows = { ...prevRows };
                                    newRows[uniqueId] = {
                                      ...newRows[uniqueId],
                                      last_use_date: e.target.value,
                                    };
                                    return newRows;
                                  });
                                }}
                                value={
                                  systemDataRows[`${card.id}_${tester.id}`]
                                    ?.last_use_date
                                    ? new Date(
                                        new Date(
                                          systemDataRows[
                                            `${card.id}_${tester.id}`
                                          ].last_use_date
                                        ).getTime() -
                                          new Date(
                                            systemDataRows[
                                              `${card.id}_${tester.id}`
                                            ].last_use_date
                                          ).getTimezoneOffset() *
                                            60000
                                      )
                                        .toISOString()
                                        .slice(0, 10)
                                    : ""
                                }
                                min={new Date().toISOString().slice(0, 10)}
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
              {userRole === 1 && (requestInfoData.status == "approved" || status == "approved") && (
                <a
                  className="btn-add d-flex align-items-center gap-1"
                  style={{ cursor: "pointer" }}
                  onClick={handleAssign}
                >
                  {isLoading ? "Assigning..." : "Assign Card"}
                </a>
              )}
            </div>
          </form>
        )}
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={1800}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
      />
    </>
  );
}

export default CardAssignment;