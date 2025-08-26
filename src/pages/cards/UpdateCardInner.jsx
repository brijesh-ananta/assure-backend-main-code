import React, { useState, useEffect } from "react";
import UpdateCardAssign from "./UpdateCardAssign";
import UpdateCardAuditTrails from "./UpdateCardAuditTrails";
import axiosToken from "../../utils/axiosToken";
import { useAuth } from "../../utils/AuthContext";

function UpdateCardInner({ card }) {
  const [user, setUser] = useState({});
  const [cardStatus, setCardStatus] = useState(card.cardStatus); // Track card status
  const [isDeleted, setIsDeleted] = useState(card.isDeleted); // Track delete status

  // set loading..
  const [loading, setLoading] = useState(false);
  const { userRole } = useAuth();
  useEffect(() => {
    setUser(card);
    setCardStatus(card.cardStatus); // Initialize with card prop
    setIsDeleted(card.isDeleted); // Initialize with card prop
  }, [card]);

  const handleUpdateCard = async () => {
    try {
      setLoading(true);
      const updateData = {
        cardId: card.id,
        cardStatus: cardStatus,
        isDeleted: isDeleted
      };

      // API call - adjust URL and config as per your backend
      const response = await axiosToken.put(`/cards/update-card-status`, updateData, {
        headers: {
          "Content-Type": "application/json",
          // Add any auth headers if needed
        }
      });

      // Optionally update local state or trigger a refresh
      setLoading(false);
      // show success message
      alert("Card status updated successfully");
      // refresh page
      // window.location.reload();
    } catch (error) {
      console.error("Error updating card:", error);
      setLoading(false);

      // Handle error (show message to user, etc.)
      alert("Error updating card");
    }
  };

  const handleUserStatusChange = (statusValue) => {
    setCardStatus(statusValue);
  };

  const handleAccountStatusChange = (deleteValue) => {
    setIsDeleted(deleteValue);
  };

  return (
    // if card.status != active in that case disable according click
    <div
      id={`collapse-${card.id}`}
      className="accordion-collapse collapse"
      aria-labelledby={`heading-${card.id}`}
      data-bs-parent="#accordionExample"
    >
      <div className="accordion-body">
        <div className="accordion" id="accordionCard">
          <div className="accordion-item">
            {/* align end */}

            <h2 className="accordion-header" id="headingOneCard">
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseOneCard"
                aria-expanded="true"
                aria-controls="collapseOneCard"
              >
                <p className="mb-0 text-center fw-bold d-block w-100">
                  Card Details
                </p>
              </button>
            </h2>
            <div
              id="collapseOneCard"
              className="accordion-collapse collapse show"
              aria-labelledby="headingOneCard"
              data-bs-parent="#accordionCard"
            >
              <div className="accordion-body">
                <div className="d-lg-flex mb-lg-3 mb-2 justify-content-end">
                  <div className="d-lg-flex formcard">
                    <div className="form-check me-3 d-flex gap-2 align-items-center">
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`userEnvironment${card.id}`}
                        id={`flexRadioDefault1${card.id}`}
                        value={"1"}
                        checked={card.environment == "1"}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`flexRadioDefault1${card.id}`}
                      >
                        Prod
                      </label>
                    </div>
                    <div className="form-check d-flex gap-2 align-items-center">
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`userEnvironment${card.id}`}
                        value={"2"}
                        checked={card.environment == "2"}
                        id={`flexRadioDefault2${card.id}`}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`flexRadioDefault2${card.id}`}
                      >
                        QA
                      </label>
                    </div>
                  </div>
                </div>
                <div className="d-lg-flex mb-lg-3 mb-2 justify-content-end">
                  <div className="d-lg-flex formcard ">
                    <div className="form-check me-3 d-flex gap-2 align-items-center">
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`CardType${card.id}`}
                        id={`flexRadioDefaultCard1${card.id}`}
                        value={"Pos"}
                        checked={card.cardType == "Pos"}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`flexRadioDefaultCard1${card.id}`}
                      >
                        Pos
                      </label>
                    </div>
                    <div className="form-check d-flex gap-2 align-items-center">
                      <input
                        className="form-check-input"
                        type="radio"
                        name={`CardType${card.id}`}
                        value={"Ecomm"}
                        checked={card.cardType == "Ecomm"}
                        id={`flexRadioDefaultCard2${card.id}`}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`flexRadioDefaultCard2${card.id}`}
                      >
                        Ecomm
                      </label>
                    </div>
                  </div>
                </div>
                <div className="cardbody bg-light-theme">
                    <div className="login-page mb-lg-4 mb-2 row">
                      <div className="col-lg-3 mb-lg-4 mb-2">
                        <label htmlFor="issuer" className="form-label fw-bold">
                          Issuer
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="issuer"
                          value={card.issuerName}
                          readOnly
                        />
                      </div>
                      <div className="col-lg-3 mb-lg-4 mb-2">
                        <label htmlFor="product" className="form-label fw-bold">
                          Product
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="product"
                          readOnly
                          value={card.binProduct}
                        />
                      </div>
                      {/* if card.cardType == Pos */}
                      {card.cardType == "Pos" && (
                        <>
                          <div className="col-lg-3 mb-lg-4 mb-2">
                            <label
                              htmlFor="specialFeature"
                              className="form-label fw-bold"
                            >
                              Special Feature
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="specialFeature"
                              readOnly
                              value={card.feature}
                            />
                          </div>
                          <div className="col-lg-3 mb-lg-4 mb-2">
                            <label
                              htmlFor="region"
                              className="form-label fw-bold"
                            >
                              Region
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="region"
                              readOnly
                              value={card.region}
                            />
                          </div>
                        </>
                      )}
                      <div className="row">
                        <div className="col-lg-3 mb-lg-4 mb-2">
                          <div className="d-lg-flex align-items-center">
                            <label
                              className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                              htmlFor="nameOnCard"
                            >
                              Name On Card
                            </label>
                            <div className="position-relative w-75">
                              <input
                                type="text"
                                className="form-control"
                                id="nameOnCard"
                                value={
                                  card.decryptedCardDetails?.nameOnCard || ""
                                }
                                readOnly
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-3 mb-lg-4 mb-2">
                          <div className="d-lg-flex align-items-center">
                            <label
                              className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                              htmlFor="expryDate"
                            >
                              Expiry Date
                            </label>
                            <div className="position-relative w-75">
                              <input
                                type="date"
                                className="form-control"
                                id="expryDate"
                                value={card.decryptedCardDetails?.expDate}
                                readOnly
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-3 mb-lg-4 mb-2">
                          <div className="d-lg-flex align-items-center">
                            <label
                              className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                              htmlFor="cvv"
                            >
                              CVV
                            </label>
                            <div className="position-relative w-75">
                              <input
                                type="text"
                                className="form-control"
                                id="cvv"
                                value={card.decryptedCardDetails?.cvv}
                                readOnly
                              />
                            </div>
                          </div>
                        </div>
                        {/* if card.cardType == Pos */}
                        {card.cardType == "Pos" && (
                        <div className="col-lg-3 mb-lg-4 mb-2">
                          <div className="d-lg-flex align-items-center">
                            <label
                              className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                              htmlFor="pin"
                            >
                              PIN
                            </label>
                            <div className="position-relative w-75">
                              <input
                                type="text"
                                className="form-control"
                                id="pin"
                                value={card.decryptedCardDetails?.pinNumber}
                                readOnly
                              />
                            </div>
                          </div>
                        </div>
                        )}
                      </div>
                      <div className="col-lg-4 mb-lg-4 mb-2">
                        <div className="d-lg-flex align-items-center">
                          <label
                            className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2"
                            htmlFor="address"
                          >
                            Addresss
                          </label>
                          <div className="position-relative w-75">
                            <input
                              className="form-control"
                              type="text"
                              name="address"
                              id="address"
                              value={card.decryptedCardDetails?.address || ""}
                              placeholder="Unit/Building and Street Name"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-2 mb-lg-4 mb-2">
                        <div className="d-lg-flex align-items-center">
                          <div className="position-relative w-75">
                            <input
                              className="form-control"
                              type="text"
                              name="city"
                              id="city"
                              value={card.decryptedCardDetails?.city || ""}
                              placeholder="City"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-2 mb-lg-4 mb-2">
                        <div className="d-lg-flex align-items-center">
                          <div className="position-relative w-75">
                            <input
                              className="form-control"
                              type="text"
                              name="state"
                              id="state"
                              value={card.decryptedCardDetails?.state || ""}
                              placeholder="State"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-2 mb-lg-4 mb-2">
                        <div className="d-lg-flex align-items-center">
                          <div className="position-relative w-75">
                            <input
                              className="form-control"
                              type="text"
                              name="country"
                              id="country"
                              value={card.decryptedCardDetails?.country || ""}
                              placeholder="Country"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-2 mb-lg-4 mb-2">
                        <div className="d-lg-flex align-items-center">
                          <div className="position-relative w-75">
                            <input
                              className="form-control"
                              type="text"
                              name="PostalCode"
                              id="PostalCode"
                              value={
                                card.decryptedCardDetails?.postalCode || ""
                              }
                              placeholder="Postal Code"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                </div>
                {/* Additional User Settings */}
                <div className="yellowcolor mb-lg-4 mb-2">
                  <div className="d-lg-flex align-items-center justify-content-between mb-3 gap-3">
                    {/* User Status */}
                    <div className="d-flex align-items-center flex-grow-1 bg-light-theme-orange border border-dark">
                      <p className="m-0 me-3 fontuse fontcolor">Status</p>
                      <div className="d-flex formcard">
                        <div className="form-check me-3 d-flex gap-2 align-items-center">
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`userStatus-${card.id}`}
                            id={`status-block-${card.id}`}
                            value="blocked"
                            checked={cardStatus === "blocked"}
                            onChange={() => handleUserStatusChange("blocked")}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`status-block-${card.id}`}
                          >
                            Block
                          </label>
                        </div>
                        <div className="form-check d-flex gap-2 align-items-center">
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`userStatus-${card.id}`}
                            id={`status-active-${card.id}`}
                            value="active"
                            checked={cardStatus === "active"}
                            onChange={() => handleUserStatusChange("active")}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`status-active-${card.id}`}
                          >
                            Active
                          </label>
                        </div>
                      </div>
                    </div>
                    {/* Delete Card */}
                    <div className="d-flex align-items-center flex-grow-1 bg-light-theme-orange border border-dark">
                      <p className="m-0 me-3 fontuse fontcolor">Delete Card</p>
                      <div className="d-flex formcard">
                        <div className="form-check me-3 d-flex gap-2 align-items-center">
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`accountStatus-${card.id}`}
                            id={`acc-locked-${card.id}`}
                            value={1}
                            checked={isDeleted == 1}
                            onChange={() => handleAccountStatusChange(1)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`acc-locked-${card.id}`}
                          >
                            Yes
                          </label>
                        </div>
                        <div className="form-check d-flex gap-2 align-items-center">
                          <input
                            className="form-check-input"
                            type="radio"
                            name={`accountStatus-${card.id}`}
                            id={`acc-unlock-${card.id}`}
                            value={0}
                            checked={isDeleted == 0}
                            onChange={() => handleAccountStatusChange(0)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`acc-unlock-${card.id}`}
                          >
                            No
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-3">
                  {userRole === 1 && (
                  <button
                    className="btn-add py-2"
                    type="button"
                    onClick={handleUpdateCard}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Update Status"}
                  </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <UpdateCardAssign card={card} />
          <UpdateCardAuditTrails tableName="cards" recordId={card.id} />
        </div>
      </div>
    </div>
  );
}

export default UpdateCardInner;
