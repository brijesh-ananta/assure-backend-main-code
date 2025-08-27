/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback, useMemo } from "react";
import axiosToken from "../../../utils/axiosToken";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { toYYYYMMDD } from "../../../utils/date";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { dateToMMDDYYYY } from "../../maintain-card-stock/AddCard";
import PosCard from "../../../components/cards/pos/PosCard";
import EcommCard from "../../../components/cards/ecomm/EcommCard";
import { decryptAesGcm } from "../../../utils/encryptDecrypt";

function CardAssignmentV2({
  requestInfoData,
  cardRequestId,
  terminalType,
  environment,
  fetchData,
  isPhysicalCard,
  isCompleted,
}) {
  const [shippingDetails, setShippingDetails] = useState([]);
  const [globalSystemData, setGlobalSystemData] = useState([]);
  const encryptionKey = import.meta.env.VITE_ENCKEY;
  const [isLoading, setIsLoading] = useState(false);
  const [systemDataRows, setSystemDataRows] = useState({});
  const [individualLimit, setIndividualLimit] = useState(0);
  const [totalLimit, setTotalLimit] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const testInfo = JSON.parse(requestInfoData?.testInfo || "{}");
    setIndividualLimit(testInfo?.individualTransactionLimit ?? 0);
    setTotalLimit(testInfo?.totalTransactionLimit ?? 0);
  }, [requestInfoData?.testInfo]);

  useEffect(() => {
    if (shippingDetails.length > 0) {
      const updatedRows = {};

      for (let i = 0; i < shippingDetails.length; i++) {
        const card = shippingDetails[i];

        const uniqueId = card?.id;

        const offlineDaysValue =
          card?.card?.offlineDays ||
          systemDataRows[uniqueId]?.offline_days ||
          globalSystemData?.offline_days ||
          "";
        const offlineUsageValue =
          card?.card?.onlineUsages ||
          systemDataRows[uniqueId]?.offline_usage ||
          globalSystemData?.offline_usage ||
          "";
        const totalUsageValue =
          card?.card?.totalUsage ||
          systemDataRows[uniqueId]?.total_usage ||
          globalSystemData?.total_usage ||
          "";
        const lastUseDateValue =
          card?.card?.LastUseDate ||
          systemDataRows[uniqueId]?.last_use_date ||
          globalSystemData?.last_use_date ||
          "";

        updatedRows[uniqueId] = {
          offline_days: offlineDaysValue,
          offline_usage: offlineUsageValue,
          total_usage: totalUsageValue,
          last_use_date: lastUseDateValue,
        };
      }

      setSystemDataRows(updatedRows);
    }
  }, [shippingDetails, globalSystemData]);

  const fetchShippingDetails = useCallback(async () => {
    if (cardRequestId) {
      setIsLoading(true);
      try {
        const response = await axiosToken.get(
          `/card-requests/assign-shipping-details/${cardRequestId}?environment=${environment}&terminalType=${terminalType}&flag=true`
        );

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
                issuer_name: row?.issuerDetails?.issuer_name,
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

          const userCiperText = localStorage.getItem("ciperText");

          const decryptedCards = await Promise.all(
            groupedArray.map(async (card) => {
              if (!card.ivKey || !card.cardDetails) return card;
              const decryptedObj = await decryptAesGcm({
                cipherText: card.cardDetails,
                authTagB64: card.authTag,
                ivKey: card.ivKey,
                userKey: userCiperText,
              });

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
  }, [cardRequestId, encryptionKey, environment, terminalType]);

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
  }, [cardRequestId, environment, fetchShippingDetails]);

  const handleInputChange = (field, value, cardId) => {
    const uniqueId = cardId;

    setSystemDataRows((prevRows) => {
      const newRows = { ...prevRows };
      newRows[uniqueId] = {
        ...newRows[uniqueId],
        [field]: value,
      };
      return newRows;
    });
  };

  const handleCardAssign = async (card) => {
    try {
      const { offline_days, offline_usage, total_usage, last_use_date } =
        systemDataRows[card.id];

      const cardPayload = {
        request_id: requestInfoData?.id,
        cardID: card?.id,
        offlineDays: offline_days || null,
        onlineUsages: offline_usage || null,
        totalUsage: total_usage || null,
        LastUseDate: toYYYYMMDD(last_use_date || lastUsedDate) || null,
        testname: card?.tester.name,
        testemail: card?.tester.email,
        userId: card.tester.id,
        individualTransactionLimit: individualLimit || null,
        totalTransactionLimit: totalLimit || null,
      };

      const response = await axiosToken.post(`/user-cards`, cardPayload);

      if (response.status === 200 || response.status === 201) {
        toast.success("Cards successfully assigned!");
        if (
          ((isPhysicalCard == "no" || !isPhysicalCard) &&
            response?.data?.status === "assign_card") ||
          response?.data.status == "completed"
        ) {
          navigate("/dashboard/test-card-fulfilment");
          return;
        }

        if (response?.data?.status === "assign_card") {
          navigate(
            `/dashboard/test-card-request/requestor-info/${requestInfoData.id}/?step=8&reload=true`
          );
        } else {
          await fetchData();
          window.location.reload();
        }
      } else {
        toast.error("Failed to assign cards.");
      }
    } catch (error) {
      console.error("Error assigning card:", error);
      toast.error("An error occurred while assigning the cards.");
    }
  };

  const lastUsedDate = useMemo(() => {
    const testInfo =
      requestInfoData?.testInfo && JSON.parse(requestInfoData?.testInfo);
    return testInfo?.endDate || "";
  }, [requestInfoData?.testInfo]);

  const isObjectEmpty = useCallback((obj) => {
    return Object.keys(obj).length > 0;
  }, []);

  const parseStoredDateForPicker = (value) => {
    if (!value) return null;

    if (value instanceof Date && !isNaN(value)) return value;

    if (typeof value === "string") {
      if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
        const d = new Date(value);
        if (isNaN(d)) return null;

        return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      }

      if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
        const [mm, dd, yyyy] = value.split("-").map(Number);
        return new Date(yyyy, mm - 1, dd);
      }

      const d = new Date(value);
      if (!isNaN(d)) return d;
    }

    return null;
  };

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
            <div className="accordion" id="testerAccordion">
              {(shippingDetails || [])?.map((card, index) => {
                const cardDetails = card?.decryptedCardDetails || {};
                const cardAssigned =
                  card?.tester?.status === "card_assigned" ||
                  card.tester?.status === "assigned";

                return card?.testers?.map((tester, testerIndex) => {
                  const uniqueId = `${index}_${testerIndex}`; // unique ID for each tester

                  return (
                    <div
                      key={uniqueId}
                      className="border accordion-item mt-2 form-field-wrapper"
                    >
                      <h2
                        className="accordion-header"
                        id={`heading${uniqueId}`}
                      >
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#collapse${uniqueId}`}
                          aria-expanded="false"
                          aria-controls={`collapse${uniqueId}`}
                        >
                          <div className="d-flex align-items-center w-100">
                            {cardAssigned ? (
                              <div className="check-circle me-2">
                                <i className="fas fa-check"></i>
                              </div>
                            ) : (
                              <div className="check-circle check-circle-grey me-2">
                                <X />
                              </div>
                            )}
                            <span className="tester-link">
                              Tester_{index + 1}
                            </span>
                            <div className="ms-4 flex-grow-1 row">
                              <div className="col-md-6 d-flex gap-2 align-items-center">
                                <span className="font">Name</span>
                                <input
                                  type="text"
                                  className="form-control formcontrol"
                                  value={tester?.name}
                                  disabled
                                />
                              </div>
                              <div className="col-md-5 d-flex gap-2 align-items-center me-2">
                                <span className="font">Email</span>
                                <input
                                  type="email"
                                  className="form-control formcontrol"
                                  value={tester?.email}
                                  disabled
                                />
                              </div>
                            </div>
                            {!isObjectEmpty(cardDetails) && (
                              <div className="p-3 font text-danger">
                                Card not Available
                              </div>
                            )}
                          </div>
                        </button>
                      </h2>
                      {isObjectEmpty(cardDetails) && (
                        <div
                          id={`collapse${uniqueId}`}
                          className={`accordion-collapse collapse ${
                            index == 0 && "show"
                          }`}
                          aria-labelledby={`heading${uniqueId}`}
                          data-bs-parent="#testerAccordion"
                        >
                          <div className="accordion-body">
                            <div className="row">
                              <div className="col-md-5">
                                {terminalType == "Pos" ? (
                                  <PosCard
                                    data={{ decryptedCardDetails: cardDetails }}
                                  />
                                ) : (
                                  <EcommCard
                                    data={{ decryptedCardDetails: cardDetails }}
                                  />
                                )}
                              </div>
                              <div className="col-md-7">
                                <div className="row mb-3">
                                  <div className="col-md-3">
                                    <label className="form-label font text-muted text-right w-100">
                                      Issuer Name
                                    </label>
                                  </div>
                                  <div className="col-md-8">
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={
                                        card?.issuerDetails?.issuer_name ||
                                        card?.issuerName
                                      }
                                      disabled
                                    />
                                  </div>
                                </div>
                                <div className="row mb-3">
                                  <div className="col-md-3">
                                    <label className="form-label font text-muted text-right w-100">
                                      Product
                                    </label>
                                  </div>
                                  <div className="col-md-8">
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={
                                        cardDetails?.binProduct ||
                                        cardDetails?.bin_product ||
                                        cardDetails?.product ||
                                        ""
                                      }
                                      disabled
                                    />
                                  </div>
                                </div>
                                <div className="row mb-3">
                                  <div className="col-md-3">
                                    <label className="form-label text-muted text-right w-100 font">
                                      Status
                                    </label>
                                  </div>
                                  <div className="col-md-8">
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={card?.status}
                                      disabled
                                    />
                                  </div>
                                </div>
                                <div className="row mb-3">
                                  <div className="col-md-3">
                                    <label className="form-label font text-muted text-right w-100">
                                      Exp. Date
                                    </label>
                                  </div>
                                  <div className="col-md-8">
                                    <input
                                      type="date"
                                      className="form-control h-75"
                                      value={toYYYYMMDD(cardDetails?.expDate)}
                                      disabled
                                    />
                                  </div>
                                </div>
                                {card?.otb ? (
                                  <>
                                    <div className="row mb-3">
                                      <div className="col-md-3">
                                        <label className="form-label text-muted text-right w-100 font">
                                          OTB
                                        </label>
                                      </div>
                                      <div className="col-md-8">
                                        <input
                                          type="text"
                                          className="form-control"
                                          value={card?.otb}
                                          disabled
                                        />
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <></>
                                )}
                              </div>
                            </div>

                            <div className="row">
                              <div className="d-flex col-6 col-md-3 align-items-center gap-1">
                                <label className="font">
                                  {" "}
                                  Individual Txn Limit
                                </label>
                                <input
                                  name="offline_days"
                                  placeholder="2"
                                  disabled={cardAssigned || isCompleted}
                                  type="text"
                                  value={individualLimit || ""}
                                  onChange={(e) =>
                                    setIndividualLimit(e.target.value)
                                  }
                                  className="form-control formcontrol small-input"
                                />
                              </div>
                              <div className="d-flex col-6 col-md-3 align-items-center gap-1">
                                <label className="font">Total Txn Limit</label>
                                <input
                                  name="offline_usage"
                                  placeholder="5"
                                  type="text"
                                  disabled={cardAssigned || isCompleted}
                                  value={totalLimit || ""}
                                  onChange={(e) =>
                                    setTotalLimit(e.target.value)
                                  }
                                  className="form-control formcontrol small-input"
                                />
                              </div>
                              <div className="d-flex col-6 col-md-2 align-items-center gap-1">
                                <label className="font">Total Usage</label>
                                <input
                                  name="total_usage"
                                  placeholder="10"
                                  disabled={cardAssigned || isCompleted}
                                  type="text"
                                  onChange={(e) =>
                                    handleInputChange(
                                      "total_usage",
                                      e.target.value,
                                      card.id,
                                      tester.id
                                    )
                                  }
                                  value={
                                    systemDataRows[card.id]?.total_usage || ""
                                  }
                                  className="form-control formcontrol small-input"
                                />
                              </div>
                              <div className="d-flex col-6 col-md-4 align-items-center gap-1">
                                <label className="font">Last Use Date </label>
                                <DatePicker
                                  selected={
                                    parseStoredDateForPicker(
                                      systemDataRows[card.id]?.last_use_date
                                    ) ||
                                    lastUsedDate ||
                                    ""
                                  }
                                  maxDate={cardDetails?.expDate}
                                  onChange={(date) => {
                                    const formatted = dateToMMDDYYYY(date); // MM-DD-YYYY format

                                    handleInputChange(
                                      "last_use_date",
                                      formatted,
                                      card.id,
                                      tester.id
                                    );
                                  }}
                                  dateFormat="MM-dd-yyyy"
                                  placeholderText="MM-DD-YYYY"
                                  className="form-control formcontrol"
                                  disabled={cardAssigned || isCompleted}
                                />
                              </div>
                            </div>
                            <div className="row mt-5">
                              <div className="d-flex  justify-content-between w-100 text-end gap-3">
                                <button
                                  onClick={() => {
                                    navigate(
                                      `/dashboard/assign-card-manually/${requestInfoData.id}/${card.tester.userId}`
                                    );
                                  }}
                                  className="btn save-btn"
                                  disabled={cardAssigned || isCompleted}
                                >
                                  Assign Card Manually
                                </button>
                                <div className="d-flex align-items-center gap-3">
                                  <button
                                    disabled={cardAssigned || isCompleted}
                                    className="btn cancel-btn"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    className="btn save-btn save-next-btn"
                                    onClick={() => {
                                      handleCardAssign(card);
                                    }}
                                    disabled={cardAssigned || isCompleted}
                                  >
                                    {cardAssigned
                                      ? "Card Assigned"
                                      : "Assign Card"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
              })}
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

export default CardAssignmentV2;
