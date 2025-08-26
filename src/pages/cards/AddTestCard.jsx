import React, { useState, useEffect } from "react";
import Footer from "../../common/Footer";
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import axiosToken from "../../utils/axiosToken";
import { useAuth } from "../../utils/AuthContext";
import AddTestBundle from "./AddTestBundle";
import { Link, useNavigate, useLocation } from "react-router-dom";

function AddTestCard() {
  const [headerTitle, setHeaderTitle] = useState("Add Card"); // Default title
  const navigate = useNavigate();
  const location = useLocation();
  const type = location.state?.type;
  const issuer = location.state?.issuer;
  const panLength = issuer.pan_length;
  const envID = location.state?.environment;
  const { user } = useAuth(); // user now contains profile info
  const userRole = user?.role; // assuming role is stored in user object
  const [environment, setEnvironment] = useState(envID); // Default to Prod ("1")
  const [isLoading, setIsLoading] = useState(false);
  const handleEnvironmentChange = (e) => {
    const newEnv = e.target.value;
    setEnvironment(newEnv);
  };

  // Show confirmation modal
  const handleConfirmationChange = () => {
    //    const cardId = document.getElementById("bin1").value.trim();
    const cardNumber = document.getElementById("cardNumber").value.trim();
    const nameOnCard = document.getElementById("nameOnCard").value.trim();
    const expDate = document.getElementById("expDate")?.value;
    const seqNumber = document.getElementById("seqNumber").value.trim();
    const cvv = document.getElementById("cvv").value.trim();
    const pinNumber =
      type === "Pos" && document.getElementById("pinNumber")
        ? document.getElementById("pinNumber").value.trim()
        : "";
    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();
    const country = document.getElementById("country").value.trim();
    const postalCode = document.getElementById("postalCode").value.trim();
    const featureEl = document.querySelector('input[name="feature"]:checked');
    const regionEl = document.querySelector('input[name="region"]:checked');
    const statusEl = document.querySelector('input[name="status"]:checked');

    // Inline validation for required fields
    let errorMsg = "";
    if (!cardNumber || !/\d+/.test(cardNumber)) {
      errorMsg = "Card Number is required or must be a number.";
    } else if (cardNumber.length !== panLength) {
      errorMsg = `Card Number must be ${panLength} digits.`;
    } else if (!nameOnCard || !/\w+/.test(nameOnCard)) {
      errorMsg = "Name on Card is required or must be a valid name.";
    } else if (!expDate) {
      errorMsg = "Expiration Date is required.";
    } else if (!seqNumber || !/\d+/.test(seqNumber)) {
      errorMsg = "Seq# is required or must be a number.";
    } else if (!cvv || !/\d+/.test(cvv)) {
      errorMsg = "CVV is required or must be a number.";
    } else if (type === "Pos" && !pinNumber) {
      errorMsg = "PIN is required for Pos cards.";
    } else if (!address) {
      errorMsg = "Address is required.";
    } else if (!city) {
      errorMsg = "City is required.";
    } else if (!state) {
      errorMsg = "State is required.";
    } else if (!country) {
      errorMsg = "Country is required.";
    } else if (!postalCode) {
      errorMsg = "Postal Code is required.";
    }
    if (errorMsg) {
      alert(errorMsg);
      return;
    }
    const confirmModalEl = document.getElementById("confirmModal");
    if (confirmModalEl) {
      const confirmModal = new window.bootstrap.Modal(confirmModalEl);
      confirmModal.show();
    }
  };

  // Handle submit: gather values, validate, and post the data
  const handleSubmit = async () => {
    setIsLoading(true);
    // Get field values
    //    const cardId = document.getElementById("bin1").value.trim();
    const cardNumber = document.getElementById("cardNumber").value.trim();
    const nameOnCard = document.getElementById("nameOnCard").value.trim();
    const expDate = document.getElementById("expDate")?.value;
    const seqNumber = document.getElementById("seqNumber").value.trim();
    const cvv = document.getElementById("cvv").value.trim();
    const pinNumber =
      type === "Pos" && document.getElementById("pinNumber")
        ? document.getElementById("pinNumber").value.trim()
        : "";
    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();
    const country = document.getElementById("country").value.trim();
    const postalCode = document.getElementById("postalCode").value.trim();
    const featureEl = document.querySelector('input[name="feature"]:checked');
    const regionEl = document.querySelector('input[name="region"]:checked');
    const statusEl = document.querySelector('input[name="status"]:checked');

    // Build payload
    const payload = {
      cardNumber,
      nameOnCard,
      expDate,
      seqNumber,
      cvv,
      pinNumber,
      address,
      city,
      state,
      country,
      postalCode,
      issuerId: issuer.id, // assuming issuer object has an id property
      bin: issuer.bin,
      binProduct:
        issuer.binProduct.charAt(0).toUpperCase() + issuer.binProduct.slice(1),
      environment,
      cardType: type,
      feature: featureEl ? featureEl.value : "",
      region: regionEl ? regionEl.value : "",
      status: statusEl ? statusEl.value : "",
    };

    try {
      const response = await axiosToken.post("/cards", payload);
      setIsLoading(false);
      alert("Card added successfully!");
      // Hide modal after success
      const confirmModalEl = document.getElementById("confirmModal");
      if (confirmModalEl) {
        const confirmModal = new window.bootstrap.Modal(confirmModalEl);
        confirmModal.hide();
      }
      window.location.href = "/dashboard/manage-cards";
    } catch (error) {
      setIsLoading(false);
      console.error("Error adding card:", error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert(error.message || "An error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Header Section */}
      <Header title={headerTitle} />

      <div className="notification mangeissuer mb-lg-0 mb-3 py-lg-2">
        <div className="container">
          <div className="d-lg-flex align-items-center justify-content-center">
            <span className="me-lg-5 font">Environment</span>

            <div className="d-lg-flex formcard">
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="environment"
                  value={"1"}
                  checked={environment === "1"}
                  onChange={handleEnvironmentChange}
                  id="flexRadioDefault1"
                  disabled
                />
                <label className="form-check-label" htmlFor="flexRadioDefault1">
                  Prod
                </label>
              </div>
              <div className="form-check me-3 d-flex gap-2 align-items-center">
                <input
                  className="form-check-input"
                  type="radio"
                  name="environment"
                  value={"2"}
                  checked={environment === "2"}
                  onChange={handleEnvironmentChange}
                  id="flexRadioDefault2"
                  disabled
                />
                <label className="form-check-label" htmlFor="flexRadioDefault2">
                  QA
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="notification pb-5">
        <div className="container-fluid">
          <form>
            {/* Issuer Info */}
            <div className="login-page d-lg-flex row">
              <div className="col-12 col-lg-3 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <label
                    className="form-check-label fw-bold flex-shrink-1 mb-0 me-3 mb-lg-0 mb-2 flexgrow bg-gray"
                    htmlFor="issuerName"
                  >
                    {issuer.issuer_name}
                  </label>
                </div>
              </div>
              <div className="col-12 col-lg-3 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <label
                    className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 flexgrow2 bg-gray"
                    htmlFor="issuerId"
                  >
                    {issuer.binProduct.charAt(0).toUpperCase() +
                      issuer.binProduct.slice(1)}
                  </label>
                </div>
              </div>
              <div className="col-12 col-lg-3 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <label
                    className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 flexgrow2 bg-gray"
                    htmlFor="issuerId"
                  >
                    Bin : {issuer.bin}
                  </label>
                </div>
              </div>
              <div className="col-12 col-lg-3 pe-lg-5 me-0">
                <div className="d-flex align-items-center mb-lg-4 mb-2">
                  <label className="form-check-label fw-bold flex-shrink-0 mb-0 me-3 mb-lg-0 mb-2 flexgrow2 bg-gray">
                    <div className="form-check me-3 d-flex gap-3 align-items-center formcard">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="card_type"
                        value={"Pos"}
                        checked={type === "Pos"}
                        id="flexRadioDefault1"
                        disabled
                      />
                      <label
                        className="form-check-label"
                        htmlFor="flexRadioDefault1"
                      >
                        Pos
                      </label>

                      <input
                        className="form-check-input ms-3"
                        type="radio"
                        name="card_type"
                        value={"Ecomm"}
                        checked={type === "Ecomm"}
                        id="flexRadioDefault1"
                        disabled
                      />
                      <label
                        className="form-check-label"
                        htmlFor="flexRadioDefault1"
                      >
                        Ecomm
                      </label>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            {/* Card ID */}
            {/* <div className="login-page d-lg-flex row">
              <div className="col-12 col-lg-6 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <label
                    className="form-check-label fw-bold flex-shrink-1 mb-0 me-3 mb-lg-0 mb-2 flexgrow"
                    htmlFor="cardId"
                  >
                    Card ID
                  </label>
                  <input
                    id="bin1"
                    placeholder="Dis_Bank1_Crd_transit"
                    type="text"
                    name="cardId"
                    className="form-control formcontrol"
                  />
                </div>
              </div>
            </div> */}
            {/* Card Number & Name on Card */}
            <div className="login-page d-lg-flex row">
              <div className="col-12 col-lg-6 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <label
                    className="form-check-label fw-bold flex-shrink-1 mb-0 me-3 mb-lg-0 mb-2 flexgrow"
                    htmlFor="cardNumber"
                  >
                    Card Number
                  </label>
                  <input
                    id="cardNumber"
                    placeholder="999999XXXXXXXX99999"
                    type="text"
                    name="cardNumber"
                    // must be number input
                    pattern="[0-9]*"
                    className="form-control formcontrol"
                  />
                </div>
              </div>
              <div className="col-12 col-lg-6 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <label
                    className="form-check-label fw-bold flex-shrink-1 mb-0 me-3 mb-lg-0 mb-2 flexgrow"
                    htmlFor="nameOnCard"
                  >
                    Name on Card
                  </label>
                  <input
                    id="nameOnCard"
                    placeholder="Jane Doe"
                    type="text"
                    name="nameOnCard"
                    className="form-control formcontrol"
                  />
                </div>
              </div>
            </div>
            {/* Card Details: Exp. Date, Seq#, CVV, (and Pin for Pos) */}
            <div className="login-page d-lg-flex row">
              <div className="col-12 col-lg-3 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <label
                    className="form-check-label fw-bold flex-shrink-1 mb-0 me-3 mb-lg-0 mb-2 flexgrow"
                    htmlFor="expDate"
                  >
                    Exp. Date
                  </label>
                  <input
                    id="expDate"
                    placeholder="DD/MM/YY"
                    type="date"
                    name="expDate"
                    className="form-control formcontrol"
                    min={new Date().toISOString().substring(0, 10)}
                  />
                </div>
              </div>
              <div className="col-12 col-lg-3 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <label
                    className="form-check-label fw-bold flex-shrink-1 mb-0 me-3 mb-lg-0 mb-2 flexgrow"
                    htmlFor="seqNumber"
                  >
                    Seq#
                  </label>
                  <input
                    id="seqNumber"
                    placeholder="999"
                    type="text"
                    name="seqNumber"
                    // must be number input
                    pattern="[0-9]*"
                    // max three digits
                    maxLength={3}
                    className="form-control formcontrol"
                  />
                </div>
              </div>
              <div className="col-12 col-lg-3 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <label
                    className="form-check-label fw-bold flex-shrink-1 mb-0 me-3 mb-lg-0 mb-2 flexgrow"
                    htmlFor="cvv"
                  >
                    CVV
                  </label>
                  <input
                    id="cvv"
                    placeholder="xxx"
                    type="text"
                    name="cvv"
                    // must be number input
                    pattern="[0-9]*"
                    // max three digits
                    maxLength={4}
                    className="form-control formcontrol"
                  />
                </div>
              </div>
              {type === "Pos" && (
                <div className="col-12 col-lg-3 pe-lg-5 me-0">
                  <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                    <label
                      className="form-check-label fw-bold flex-shrink-1 mb-0 me-3 mb-lg-0 mb-2 flexgrow"
                      htmlFor="pinNumber"
                    >
                      Pin
                    </label>
                    <input
                      id="pinNumber"
                      placeholder="xxxx"
                      type="text"
                      name="pinNumber"
                      className="form-control formcontrol"
                    />
                  </div>
                </div>
              )}
            </div>
            {/* Address Section */}
            <div className="login-page d-lg-flex row bg-gray">
              <div className="col-12 col-lg-3 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <label
                    className="form-check-label fw-bold flex-shrink-1 mb-0 me-3 mb-lg-0 mb-2 flexgrow"
                    htmlFor="address"
                  >
                    Address
                  </label>
                  <input
                    id="address"
                    placeholder="Unit/Building and Street Name"
                    type="text"
                    name="address"
                    className="form-control formcontrol"
                  />
                </div>
              </div>
              <div className="col-12 col-lg-3 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <input
                    id="city"
                    placeholder="City"
                    type="text"
                    name="city"
                    className="form-control formcontrol"
                  />
                </div>
              </div>
              <div className="col-12 col-lg-2 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <input
                    id="state"
                    placeholder="State"
                    type="text"
                    name="state"
                    className="form-control formcontrol"
                  />
                </div>
              </div>
              <div className="col-12 col-lg-2 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <input
                    id="country"
                    placeholder="Country"
                    type="text"
                    name="country"
                    className="form-control formcontrol"
                  />
                </div>
              </div>
              <div className="col-12 col-lg-2 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <input
                    id="postalCode"
                    placeholder="Postal Code"
                    type="text"
                    name="postalCode"
                    className="form-control formcontrol"
                  />
                </div>
              </div>
            </div>
            {/* Special Feature (for Pos only) */}
            {type === "Pos" && (
              <div className="login-page d-lg-flex row py-3">
                <div className="col-12 col-lg-6 pe-lg-2 me-0">
                  <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                    <label
                      className="form-check-label fw-bold flex-shrink-1 mb-0 me-3 mb-lg-0 mb-2 flexgrow"
                      htmlFor="specialFeature"
                    >
                      Special Features
                    </label>
                    <div className="form-check me-3 d-flex gap-3 align-items-center formcard">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="feature"
                        value={"transit"}
                        id="feature"
                      />
                      <label className="form-check-label" htmlFor="feature">
                        Transit
                      </label>

                      <input
                        className="form-check-input ms-3"
                        type="radio"
                        name="feature"
                        value={"online_pin"}
                        id="feature1"
                      />
                      <label className="form-check-label" htmlFor="feature1">
                        Online Pin
                      </label>
                      <input
                        className="form-check-input ms-3"
                        type="radio"
                        name="feature"
                        value={"transit_online_pin"}
                        id="feature2"
                      />
                      <label className="form-check-label" htmlFor="feature2">
                        Transit and Online Pin
                      </label>
                      <input
                        className="form-check-input ms-3"
                        type="radio"
                        name="feature"
                        value={"generic"}
                        id="feature3"
                      />
                      <label className="form-check-label" htmlFor="feature3">
                        Generic
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Region (for Pos only) */}
            {type === "Pos" && (
              <div className="login-page d-lg-flex row">
                <div className="col-12 col-lg-3 pe-lg-5 me-0">
                  <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                    <label
                      className="form-check-label fw-bold flex-shrink-1 mb-0 me-3 mb-lg-0 mb-2 flexgrow"
                      htmlFor="region"
                    >
                      Region
                    </label>
                    <div className="form-check me-3 d-flex gap-3 align-items-center formcard">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="region"
                        value={"Global"}
                        id="region"
                      />
                      <label className="form-check-label" htmlFor="region">
                        Global
                      </label>

                      <input
                        className="form-check-input ms-3"
                        type="radio"
                        name="region"
                        value={"Domestic"}
                        id="region1"
                      />
                      <label className="form-check-label" htmlFor="region1">
                        Domestic
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Status */}
            <div className="login-page d-lg-flex row py-3">
              <div className="col-12 col-lg-3 pe-lg-5 me-0">
                <div className="d-lg-flex align-items-center mb-lg-4 mb-2">
                  <label
                    className="form-check-label fw-bold flex-shrink-1 mb-0 me-3 mb-lg-0 mb-2 flexgrow"
                    htmlFor="status"
                  >
                    Status
                  </label>
                  <div className="form-check me-3 d-flex gap-3 align-items-center formcard">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="status"
                      value={"pending"}
                      id="statusPending"
                      checked
                    />
                    <label className="form-check-label" htmlFor="statusPending">
                      Pending
                    </label>

                    <input
                      className="form-check-input ms-3"
                      type="radio"
                      name="status"
                      value={"active"}
                      id="statusActive"
                      disabled
                    />
                    <label className="form-check-label" htmlFor="statusActive">
                      Active
                    </label>
                  </div>
                </div>
              </div>
            </div>
            {/* Submit Button */}

            <div className="login-page d-lg-flex row mb-5">
              <div className="col-12 col-lg-6 pe-lg-5 me-0">
                <div className="d-flex justify-content-end mt-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="btn btn-secondary me-3"
                  >
                    Cancel
                  </button>
                  <div className="btn-section text-lg-center">
                    {userRole === 1 && (
                      <button
                        type="button"
                        onClick={handleConfirmationChange}
                        className="btn-add mx-auto"
                      >
                        {isLoading && (
                          <span className="spinner-border spinner-border-sm me-2"></span>
                        )}
                        Add Card
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
      {/* Modal */}
      <div
        className="modal fade"
        id="confirmModal"
        tabIndex="-1"
        aria-labelledby="confirmModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-0 shadow-xl">
            <div className="modal-header header-color rounded-0">
              <h5 className="modal-title text-white" id="confirmModalLabel">
                Confirm Add Card
              </h5>
              <button
                type="button"
                className="btn-close text-white btnclose"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">Are you sure you want to Add Card?</div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary btncolor"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btncolor btnyellow"
                onClick={handleSubmit}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Sidebar */}
      <Sidebar />

      {/* Footer */}
      <Footer />
    </>
  );
}

export default AddTestCard;
