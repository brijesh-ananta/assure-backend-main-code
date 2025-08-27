import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosToken from "../../utils/axiosToken";
import { useAuth } from "../../utils/AuthContext";

function UpdateCardAssign({ card, handleSaveUser }) {
  const allCountryCodes = ["IND", "USA", "UK", "CAN", "AUS", "SGP"];
  const parsedTestInfo = JSON.parse(card.testInfoData || "{}");
  const [testInfoData, setTestInfoData] = useState(parsedTestInfo);
  const [cardData, setCardData] = useState({
    totalUsage: card.totalUsage || "",
    lastUseDate: card.LastUseDate
      ? new Date(card.LastUseDate).toISOString().substring(0, 10)
      : "",
    offlineDays: card.offlineDays || "",
    offlineUsage: card.onlineUsages || "",
  });
  const [disableCountryCodes, setDisableCountryCodes] = useState(
    parsedTestInfo.countryCodes?.length === allCountryCodes.length
  );
  const [isLoading, setIsLoading] = useState(false);
  const { userRole } = useAuth();
  // Sync disableCountryCodes with countryCodes
  useEffect(() => {
    setDisableCountryCodes(
      testInfoData.countryCodes?.length === allCountryCodes.length
    );
  }, [testInfoData.countryCodes]);

  const handleAllCountryCodesChange = (e) => {
    const isChecked = e.target.checked;
    setDisableCountryCodes(isChecked);
    setTestInfoData((prev) => ({
      ...prev,
      countryCodes: isChecked ? [...allCountryCodes] : [],
    }));
  };

  const handleCountryCodesChange = (e) => {
    const selected = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    if (selected.length > 4) {
      toast.error("You can only select up to 4 country codes.");
      return;
    }
    setTestInfoData((prev) => ({
      ...prev,
      countryCodes: selected,
    }));
  };

  const handleMccCodesAllChange = (e) => {
    const isChecked = e.target.checked;
    setTestInfoData((prev) => ({
      ...prev,
      mccCodesAll: isChecked,
      mccCodes1: isChecked ? "" : prev.mccCodes1,
      mccCodes2: isChecked ? "" : prev.mccCodes2,
      mccCodes3: isChecked ? "" : prev.mccCodes3,
      mccCodes4: isChecked ? "" : prev.mccCodes4,
      mccCodes5: isChecked ? "" : prev.mccCodes5,
    }));
  };

  const handleTestInfoChange = (e) => {
    const { name, value } = e.target;
    setTestInfoData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCardDataChange = (e) => {
    const { name, value } = e.target;
    setCardData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total Usage
    if (!cardData.totalUsage) {
      toast.error("Total Allowed Usage is required.");
      return false;
    }
    const totalUsageNum = Number(cardData.totalUsage);
    if (
      isNaN(totalUsageNum) ||
      totalUsageNum <= 0 ||
      !Number.isInteger(totalUsageNum)
    ) {
      toast.error("Total Allowed Usage must be a positive integer.");
      return false;
    }

    // Last Use Date
    if (!cardData.lastUseDate) {
      toast.error("Last Use Date is required.");
      return false;
    }
    const lastUseDate = new Date(cardData.lastUseDate);
    if (isNaN(lastUseDate.getTime())) {
      toast.error("Last Use Date is invalid.");
      return false;
    }
    lastUseDate.setHours(0, 0, 0, 0);
    if (lastUseDate < today) {
      toast.error("Last Use Date cannot be a past date.");
      return false;
    }

    // Offline Days
    if (!cardData.offlineDays) {
      toast.error("Offline Days is required.");
      return false;
    }
    const offlineDaysNum = Number(cardData.offlineDays);
    if (
      isNaN(offlineDaysNum) ||
      offlineDaysNum <= 0 ||
      !Number.isInteger(offlineDaysNum)
    ) {
      toast.error("Offline Days must be a positive integer.");
      return false;
    }

    // Offline Usage
    if (!cardData.offlineUsage) {
      toast.error("Offline Usage is required.");
      return false;
    }
    const offlineUsageNum = Number(cardData.offlineUsage);
    if (
      isNaN(offlineUsageNum) ||
      offlineUsageNum <= 0 ||
      !Number.isInteger(offlineUsageNum)
    ) {
      toast.error("Offline Usage must be a positive integer.");
      return false;
    }

    // Total Transaction Limit
    if (
      !testInfoData.totalTransactionLimit ||
      testInfoData.totalTransactionLimit.trim() === ""
    ) {
      toast.error("Total Transaction Limit is required.");
      return false;
    }
    const totalTransactionLimitNum = Number(testInfoData.totalTransactionLimit);
    if (isNaN(totalTransactionLimitNum) || totalTransactionLimitNum < 0) {
      toast.error("Total Transaction Limit must be a non-negative number.");
      return false;
    }

    // Individual Transaction Limit
    if (
      !testInfoData.individualTransactionLimit ||
      testInfoData.individualTransactionLimit.trim() === ""
    ) {
      toast.error("Transaction Limit is required.");
      return false;
    }
    const individualTransactionLimitNum = Number(
      testInfoData.individualTransactionLimit
    );
    if (
      isNaN(individualTransactionLimitNum) ||
      individualTransactionLimitNum < 0
    ) {
      toast.error("Transaction Limit must be a non-negative number.");
      return false;
    }

    // Pos-specific validations
    if (testInfoData.terminalType === "Pos") {
      if (!testInfoData.mccCodesAll) {
        const mccCodes = [
          testInfoData.mccCodes1,
          testInfoData.mccCodes2,
          testInfoData.mccCodes3,
          testInfoData.mccCodes4,
          testInfoData.mccCodes5,
        ].filter(Boolean);
        if (mccCodes.length === 0) {
          toast.error(
            "At least one MCC code is required if 'All' is not selected."
          );
          return false;
        }
        for (const code of mccCodes) {
          if (!/^\d{4}$/.test(code)) {
            toast.error("MCC codes must be 4-digit numbers.");
            return false;
          }
        }
      }
      if (
        !testInfoData.countryCodes ||
        testInfoData.countryCodes.length === 0
      ) {
        toast.error("At least one country code is required.");
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (isLoading) return;
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const payload = {
        cardId: card.id || "",
        userName: card.userName || "",
        userEmail: card.userEmail || "",
        userCardId: card.userCardId || "",
        userId: card.userId || "",
        requestid: card.requestId || "",
        totalUsage: cardData.totalUsage,
        lastUseDate: cardData.lastUseDate,
        offlineDays: cardData.offlineDays,
        offlineUsage: cardData.offlineUsage,
        totalTransactionLimit: testInfoData.totalTransactionLimit,
        individualTransactionLimit: testInfoData.individualTransactionLimit,
        mccCodesAll: testInfoData.mccCodesAll || false,
        mccCodes1: testInfoData.mccCodes1 || "",
        mccCodes2: testInfoData.mccCodes2 || "",
        mccCodes3: testInfoData.mccCodes3 || "",
        mccCodes4: testInfoData.mccCodes4 || "",
        mccCodes5: testInfoData.mccCodes5 || "",
        countryCodes: testInfoData.countryCodes || [],
        terminalType: testInfoData.terminalType || "",
      };

      await axiosToken.put("/cards/update-card-data", payload);
      toast.success("Card details updated successfully!");
      handleSaveUser({ ...card, testInfoData: JSON.stringify(testInfoData) });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update card details.";
      //toast.error(errorMessage);
      console.error("API error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
      <div className="accordion-item">
        <h2 className="accordion-header" id="headingTwoCard">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseTwoCard"
            aria-expanded="false"
            aria-controls="collapseTwoCard"
            disabled={card.status === "unassigned"}
            style={{
              opacity: card.status === "unassigned" ? 0.5 : 1,
              pointerEvents: card.status === "unassigned" ? "none" : "auto",
            }}
          >
            <p className="mb-0 text-center fw-bold d-block w-100">
              Assigned Card Details
            </p>
          </button>
        </h2>
        <div
          id="collapseTwoCard"
          className="accordion-collapse collapse"
          aria-labelledby="headingTwoCard"
          data-bs-parent="#accordionCard"
        >
          <div className="accordion-body">
            <div className="cardbody bg-light-theme">
              <form>
                <div className="login-page mb-lg-4 mb-2 row">
                  <div className="col-lg-6 mb-lg-4 mb-2">
                    <div className="d-lg-flex align-items-center">
                      <label
                        className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                        htmlFor="assignedTo"
                      >
                        Assigned to
                      </label>
                      <div className="position-relative w-75">
                        <input
                          className="form-control"
                          type="text"
                          name="assignedTo"
                          id="assignedTo"
                          value={card.userName || ""}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 mb-lg-4 mb-2">
                    <div className="d-lg-flex align-items-center">
                      <label
                        className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                        htmlFor="email"
                      >
                        Email
                      </label>
                      <div className="position-relative w-75">
                        <input
                          className="form-control"
                          type="text"
                          name="email"
                          id="email"
                          value={card.userEmail || ""}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12 mb-lg-4 mb-2">
                    <hr style={{ border: "1px solid #dee2e6" }} />
                  </div>
                  <div className="col-lg-6 mb-lg-4 mb-2">
                    <div className="d-lg-flex align-items-center">
                      <label
                        className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                        htmlFor="number"
                      >
                        Total Allowed Usage #
                      </label>
                      <div className="position-relative w-75">
                        <input
                          className="form-control"
                          type="number"
                          name="totalUsage"
                          id="number"
                          value={cardData.totalUsage}
                          onChange={handleCardDataChange}
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 mb-lg-4 mb-2">
                    <div className="d-lg-flex align-items-center">
                      <label
                        className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                        htmlFor="lastDate"
                      >
                        Last Use Date
                      </label>
                      <div className="position-relative w-75">
                        <input
                          className="form-control"
                          type="date"
                          name="lastUseDate"
                          id="lastDate"
                          value={cardData.lastUseDate}
                          onChange={handleCardDataChange}
                          min={new Date().toISOString().slice(0, 10)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 mb-lg-4 mb-2">
                    <div className="d-lg-flex align-items-center">
                      <label
                        className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                        htmlFor="cardUsed"
                      >
                        Card Used #
                      </label>
                      <div className="position-relative w-75">
                        {card.cardUsed || 5}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 mb-lg-4 mb-2">
                    <div className="d-lg-flex align-items-center">
                      <label
                        className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                        htmlFor="remainingUsage"
                      >
                        Remaining Usage #
                      </label>
                      <div className="position-relative w-75">
                        {card.totalUsage - (card.cardUsed || 5)}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 mb-lg-4 mb-2">
                    <div className="d-lg-flex align-items-center">
                      <label
                        className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                        htmlFor="offlineDays"
                      >
                        Offline Days #
                      </label>
                      <div className="position-relative w-75">
                        <input
                          className="form-control"
                          type="number"
                          name="offlineDays"
                          id="offlineDays"
                          value={cardData.offlineDays}
                          onChange={handleCardDataChange}
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 mb-lg-4 mb-2">
                    <div className="d-lg-flex align-items-center">
                      <label
                        className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                        htmlFor="offlineUsage"
                      >
                        Offline Usage #
                      </label>
                      <div className="position-relative w-75">
                        <input
                          className="form-control"
                          type="number"
                          name="offlineUsage"
                          id="offlineUsage"
                          value={cardData.offlineUsage}
                          onChange={handleCardDataChange}
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12 mb-lg-4 mb-2">
                    <div className="d-lg-flex align-items-center">
                      <label
                        className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                        htmlFor="totalLimit"
                      >
                        Total Limit
                      </label>
                      <div className="position-relative w-75">
                        <input
                          className="form-control"
                          type="number"
                          name="totalTransactionLimit"
                          id="totalLimit"
                          value={testInfoData.totalTransactionLimit || ""}
                          onChange={handleTestInfoChange}
                          min="0"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12 mb-lg-4 mb-2">
                    <div className="d-lg-flex align-items-center">
                      <label
                        className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                        htmlFor="transactionLimit"
                      >
                        Transaction Limit
                      </label>
                      <div className="position-relative w-75">
                        <input
                          className="form-control"
                          type="number"
                          name="individualTransactionLimit"
                          id="transactionLimit"
                          value={testInfoData.individualTransactionLimit || ""}
                          onChange={handleTestInfoChange}
                          min="0"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 mb-lg-4 mb-2">
                    <div className="d-lg-flex align-items-center">
                      <label
                        className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                        htmlFor="amountUsed"
                      >
                        Amount Used
                      </label>
                      <div className="position-relative w-75">
                        {card.amountUsed || 80}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 mb-lg-4 mb-2">
                    <div className="d-lg-flex align-items-center">
                      <label
                        className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                        htmlFor="remainingBalance"
                      >
                        Remaining Balance
                      </label>
                      <div className="position-relative w-75">
                        {(testInfoData.totalTransactionLimit || 0) -
                          (card.amountUsed || 80)}
                      </div>
                    </div>
                  </div>
                  {testInfoData.terminalType === "Pos" && (
                    <div className="form-field-wrapper">
                      <div className="login-page mb-lg-4 mb-2 d-lg-flex align-items-center">
                        <div className="col-12 col-lg-12">
                          <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2">
                            MCC Codes
                          </label>
                          <div className="d-flex align-items-center flex-wrap gap-3">
                            <div className="form-check d-flex gap-2 align-items-center">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                name="mccCodesAll"
                                id="mccCodesAll"
                                checked={testInfoData.mccCodesAll}
                                onChange={handleMccCodesAllChange}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="mccCodesAll"
                              >
                                All
                              </label>
                            </div>
                            <input
                              type="text"
                              name="mccCodes1"
                              value={testInfoData.mccCodes1}
                              onChange={handleTestInfoChange}
                              className="form-control formcontrol"
                              style={{ width: "100px" }}
                              placeholder="e.g., 5812"
                              disabled={testInfoData.mccCodesAll}
                              maxLength="4"
                            />
                            <input
                              type="text"
                              name="mccCodes2"
                              value={testInfoData.mccCodes2}
                              onChange={handleTestInfoChange}
                              className="form-control formcontrol"
                              style={{ width: "100px" }}
                              placeholder="e.g., 5812"
                              disabled={testInfoData.mccCodesAll}
                              maxLength="4"
                            />
                            <input
                              type="text"
                              name="mccCodes3"
                              value={testInfoData.mccCodes3}
                              onChange={handleTestInfoChange}
                              className="form-control formcontrol"
                              style={{ width: "100px" }}
                              placeholder="e.g., 5812"
                              disabled={testInfoData.mccCodesAll}
                              maxLength="4"
                            />
                            <input
                              type="text"
                              name="mccCodes4"
                              value={testInfoData.mccCodes4}
                              onChange={handleTestInfoChange}
                              className="form-control formcontrol"
                              style={{ width: "100px" }}
                              placeholder="e.g., 5812"
                              disabled={testInfoData.mccCodesAll}
                              maxLength="4"
                            />
                            <input
                              type="text"
                              name="mccCodes5"
                              value={testInfoData.mccCodes5}
                              onChange={handleTestInfoChange}
                              className="form-control formcontrol"
                              style={{ width: "100px" }}
                              placeholder="e.g., 5812"
                              disabled={testInfoData.mccCodesAll}
                              maxLength="4"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="login-page mb-lg-4 mb-2 d-lg-flex align-items-center">
                        <div className="col-12 col-lg-12">
                          <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2">
                            Country Codes
                          </label>
                          <div className="d-flex align-items-center gap-3">
                            <div className="form-check d-flex gap-2 align-items-center">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                name="disableCountryCodes"
                                id="disableCountryCodes"
                                checked={disableCountryCodes}
                                onChange={handleAllCountryCodesChange}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="disableCountryCodes"
                              >
                                All
                              </label>
                            </div>
                            <select
                              name="countryCodes"
                              className="form-control formcontrol"
                              multiple
                              size="6"
                              disabled={disableCountryCodes}
                              value={testInfoData.countryCodes}
                              onChange={handleCountryCodesChange}
                              style={{ width: "200px" }}
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
                </div>
              </form>
            </div>
            <div className="text-end mt-3" style={{ marginBottom: "10px" }}>
              {/* userRole must be 1 */}
              {userRole === 1 && (
                <button
                  className={`btn-add mb-3 ${isLoading ? "disabled" : ""}`}
                  type="button"
                  onClick={handleSave}
                  disabled={isLoading}
                  style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UpdateCardAssign;
